import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken & {
    uid: string;
    email?: string;
    name?: string;
    tenantId?: string;
    companyId?: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const headerTenantId = req.headers['x-tenant-id'] as string | undefined;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  // Allow development/preview sandbox fallback token for seamless testing
  if (token === 'PREVIEW_USER_SIMULATED_TOKEN') {
    req.user = {
      uid: 'usr-1',
      email: 'elmaneko3d@gmail.com',
      name: 'Elmaneko Admin',
      tenantId: headerTenantId || 'tenant-demo-1',
    } as any;
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      ...decodedToken,
      uid: decodedToken.uid,
      tenantId: headerTenantId || (decodedToken as any).tenantId || 'tenant-demo-1',
    };
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
