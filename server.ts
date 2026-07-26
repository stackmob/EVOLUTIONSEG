import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { eq } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import { seedDatabase } from './src/db/seed.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { validateEnvironmentSecrets } from './src/lib/env.ts';
import { 
  users, employees, clients, contracts, scaleAllocations, 
  providers, assets, assetAllocations, maintenances, 
  auditLogs, employeeOccurrences, appNotifications 
} from './src/db/schema.ts';

// In-Memory Rate Limiting for API routes
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120;     // 120 requests per minute

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = rateLimitMap.get(clientIp);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Muitas requisições. Por favor, aguarde alguns instantes antes de tentar novamente (Rate limit excedido).',
    });
  }

  record.count += 1;
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Desabilitar identificação do servidor para evitar fingerprints
  app.disable('x-powered-by');

  // 2. Middleware de Cabeçalhos de Segurança (Security Headers)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // 3. Auditoria de Segredos e Variáveis de Ambiente no Boot
  const envCheck = validateEnvironmentSecrets();
  if (envCheck.warnings.length > 0) {
    envCheck.warnings.forEach(w => console.warn(`🔒 [Segurança]: ${w}`));
  }
  if (envCheck.errors.length > 0) {
    envCheck.errors.forEach(e => console.error(`❌ [Erro de Segurança]: ${e}`));
  }

  // Support JSON bodies up to 10MB
  app.use(express.json({ limit: '10mb' }));

  // Aplicar Rate Limiter em todos os endpoints de API
  app.use('/api', rateLimiter);

  // Seed the database
  await seedDatabase();

  // API - Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API - Bootstrap (Fetch multi-tenant data for the logged-in tenant)
  app.get('/api/bootstrap', requireAuth, async (req: AuthRequest, res) => {
    try {
      const currentTenantId = req.user?.tenantId || 'tenant-demo-1';

      if (req.user) {
        // Register/Upsert user profile in database with tenantId
        await db.insert(users)
          .values({
            id: req.user.uid,
            tenantId: currentTenantId,
            email: req.user.email || '',
            name: req.user.name || req.user.email?.split('@')[0] || 'Usuário',
            role: 'Administrador',
            createdAt: new Date().toISOString(),
          })
          .onConflictDoUpdate({
            target: users.id,
            set: {
              email: req.user.email || '',
              name: req.user.name || req.user.email?.split('@')[0] || 'Usuário',
              tenantId: currentTenantId,
            }
          });
      }

      const [
        allEmployees,
        allClients,
        allContracts,
        allScales,
        allProviders,
        allAssets,
        allAllocations,
        allMaintenances,
        allAuditLogs,
        allNotifications,
        allOccurrences
      ] = await Promise.all([
        db.select().from(employees).where(eq(employees.tenantId, currentTenantId)),
        db.select().from(clients).where(eq(clients.tenantId, currentTenantId)),
        db.select().from(contracts).where(eq(contracts.tenantId, currentTenantId)),
        db.select().from(scaleAllocations).where(eq(scaleAllocations.tenantId, currentTenantId)),
        db.select().from(providers).where(eq(providers.tenantId, currentTenantId)),
        db.select().from(assets).where(eq(assets.tenantId, currentTenantId)),
        db.select().from(assetAllocations).where(eq(assetAllocations.tenantId, currentTenantId)),
        db.select().from(maintenances).where(eq(maintenances.tenantId, currentTenantId)),
        db.select().from(auditLogs).where(eq(auditLogs.tenantId, currentTenantId)),
        db.select().from(appNotifications).where(eq(appNotifications.tenantId, currentTenantId)),
        db.select().from(employeeOccurrences).where(eq(employeeOccurrences.tenantId, currentTenantId))
      ]);

      res.json({
        tenantId: currentTenantId,
        employees: allEmployees,
        clients: allClients,
        contracts: allContracts,
        scales: allScales,
        providers: allProviders,
        assets: allAssets,
        allocations: allAllocations,
        maintenances: allMaintenances,
        auditLogs: allAuditLogs,
        notifications: allNotifications,
        occurrences: allOccurrences,
      });
    } catch (error: any) {
      console.error('Error bootstrapping multi-tenant data:', error);
      res.status(500).json({ error: 'Failed to bootstrap data', details: error.message });
    }
  });

  // Generic Multi-Tenant Sync helper to replace table records strictly scoped to current tenant
  const handleSync = async (table: any, req: AuthRequest, res: any, name: string) => {
    try {
      const currentTenantId = req.user?.tenantId || 'tenant-demo-1';
      const data = req.body;
      if (!Array.isArray(data)) {
        return res.status(400).json({ error: 'Body must be an array' });
      }

      const scopedData = data.map((item: any) => ({
        ...item,
        tenantId: currentTenantId,
      }));

      await db.transaction(async (tx) => {
        await tx.delete(table).where(eq(table.tenantId, currentTenantId));
        if (scopedData.length > 0) {
          await tx.insert(table).values(scopedData);
        }
      });

      res.json({ success: true, message: `${name} synchronized successfully for tenant ${currentTenantId}` });
    } catch (error: any) {
      console.error(`Error syncing ${name} for tenant:`, error);
      res.status(500).json({ error: `Failed to sync ${name}`, details: error.message });
    }
  };

  // Sync API Endpoints
  app.post('/api/employees', requireAuth, (req, res) => handleSync(employees, req, res, 'employees'));
  app.post('/api/clients', requireAuth, (req, res) => handleSync(clients, req, res, 'clients'));
  app.post('/api/contracts', requireAuth, (req, res) => handleSync(contracts, req, res, 'contracts'));
  app.post('/api/scales', requireAuth, (req, res) => handleSync(scaleAllocations, req, res, 'scales'));
  app.post('/api/providers', requireAuth, (req, res) => handleSync(providers, req, res, 'providers'));
  app.post('/api/assets', requireAuth, (req, res) => handleSync(assets, req, res, 'assets'));
  app.post('/api/allocations', requireAuth, (req, res) => handleSync(assetAllocations, req, res, 'allocations'));
  app.post('/api/maintenances', requireAuth, (req, res) => handleSync(maintenances, req, res, 'maintenances'));
  app.post('/api/audit-logs', requireAuth, (req, res) => handleSync(auditLogs, req, res, 'audit logs'));
  app.post('/api/notifications', requireAuth, (req, res) => handleSync(appNotifications, req, res, 'notifications'));
  app.post('/api/occurrences', requireAuth, (req, res) => handleSync(employeeOccurrences, req, res, 'occurrences'));

  // Integrate Vite for dev, or static asset serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Multi-tenant SaaS Server running on http://localhost:${PORT}`);
  });
}

startServer();
