import { User, Employee, Client, Contract, ScaleAllocation, Provider, Asset, AssetAllocation, Maintenance, AuditLog, AppNotification, EmployeeOccurrence } from '../types';
import { auth } from '../lib/firebase-client.ts';

// Storage keys for backup fallback
const KEYS = {
  USERS: 'evo_users',
  EMPLOYEES: 'evo_employees',
  CLIENTS: 'evo_clients',
  CONTRACTS: 'evo_contracts',
  SCALES: 'evo_scales',
  PROVIDERS: 'evo_providers',
  ASSETS: 'evo_assets',
  ALLOCATIONS: 'evo_allocations',
  MAINTENANCE: 'evo_maintenance',
  AUDIT_LOGS: 'evo_audit_logs',
  NOTIFICATIONS: 'evo_notifications',
  OCCURRENCES: 'evo_occurrences',
};

// In-memory cache for synchronous reads in UI components
let cacheEmployees: Employee[] = [];
let cacheClients: Client[] = [];
let cacheContracts: Contract[] = [];
let cacheScales: ScaleAllocation[] = [];
let cacheProviders: Provider[] = [];
let cacheAssets: Asset[] = [];
let cacheAllocations: AssetAllocation[] = [];
let cacheMaintenances: Maintenance[] = [];
let cacheAuditLogs: AuditLog[] = [];
let cacheNotifications: AppNotification[] = [];
let cacheOccurrences: EmployeeOccurrence[] = [];

// Helper to get authenticated headers
async function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.warn('Fallback to simulated preview token due to Firebase auth error:', e);
      headers['Authorization'] = 'Bearer PREVIEW_USER_SIMULATED_TOKEN';
    }
  } else {
    headers['Authorization'] = 'Bearer PREVIEW_USER_SIMULATED_TOKEN';
  }
  return headers;
}

export const db = {
  // Initialize and load everything from the Cloud SQL Server
  init: async () => {
    try {
      const headers = await getHeaders();
      const response = await fetch('/api/bootstrap', { headers });
      if (!response.ok) {
        throw new Error(`Bootstrap failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update our in-memory cache
      cacheEmployees = data.employees || [];
      cacheClients = data.clients || [];
      cacheContracts = data.contracts || [];
      cacheScales = data.scales || [];
      cacheProviders = data.providers || [];
      cacheAssets = data.assets || [];
      cacheAllocations = data.allocations || [];
      cacheMaintenances = data.maintenances || [];
      cacheAuditLogs = data.auditLogs || [];
      cacheNotifications = data.notifications || [];
      cacheOccurrences = data.occurrences || [];

      // Save backups to localStorage
      localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(cacheEmployees));
      localStorage.setItem(KEYS.CLIENTS, JSON.stringify(cacheClients));
      localStorage.setItem(KEYS.CONTRACTS, JSON.stringify(cacheContracts));
      localStorage.setItem(KEYS.SCALES, JSON.stringify(cacheScales));
      localStorage.setItem(KEYS.PROVIDERS, JSON.stringify(cacheProviders));
      localStorage.setItem(KEYS.ASSETS, JSON.stringify(cacheAssets));
      localStorage.setItem(KEYS.ALLOCATIONS, JSON.stringify(cacheAllocations));
      localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify(cacheMaintenances));
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(cacheAuditLogs));
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(cacheNotifications));
      localStorage.setItem(KEYS.OCCURRENCES, JSON.stringify(cacheOccurrences));

      // Refresh dynamic notifications on startup
      db.refreshNotificationsAndAlerts();
    } catch (error) {
      console.error('Error fetching database bootstrap, falling back to local storage:', error);
      
      // Load fallback from localStorage so the preview works beautifully offline
      cacheEmployees = JSON.parse(localStorage.getItem(KEYS.EMPLOYEES) || '[]');
      cacheClients = JSON.parse(localStorage.getItem(KEYS.CLIENTS) || '[]');
      cacheContracts = JSON.parse(localStorage.getItem(KEYS.CONTRACTS) || '[]');
      cacheScales = JSON.parse(localStorage.getItem(KEYS.SCALES) || '[]');
      cacheProviders = JSON.parse(localStorage.getItem(KEYS.PROVIDERS) || '[]');
      cacheAssets = JSON.parse(localStorage.getItem(KEYS.ASSETS) || '[]');
      cacheAllocations = JSON.parse(localStorage.getItem(KEYS.ALLOCATIONS) || '[]');
      cacheMaintenances = JSON.parse(localStorage.getItem(KEYS.MAINTENANCE) || '[]');
      cacheAuditLogs = JSON.parse(localStorage.getItem(KEYS.AUDIT_LOGS) || '[]');
      cacheNotifications = JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || '[]');
      cacheOccurrences = JSON.parse(localStorage.getItem(KEYS.OCCURRENCES) || '[]');

      db.refreshNotificationsAndAlerts();
    }
  },

  // Synchronous getters (reading from the live cached memory)
  getEmployees: (): Employee[] => cacheEmployees,
  getClients: (): Client[] => cacheClients,
  getContracts: (): Contract[] => {
    return cacheContracts.map(c => ({
      ...c,
      clientName: cacheClients.find(cl => cl.id === c.clientId)?.name || 'Cliente Desconhecido',
    }));
  },
  getScales: (): ScaleAllocation[] => {
    return cacheScales.map(s => ({
      ...s,
      employeeName: cacheEmployees.find(e => e.id === s.employeeId)?.name || 'Funcionário Desconhecido',
      clientName: cacheClients.find(c => c.id === s.clientId)?.name || 'Cliente Desconhecido',
      contractNumber: cacheContracts.find(c => c.id === s.contractId)?.contractNumber || 'Contrato Desconhecido',
    }));
  },
  getProviders: (): Provider[] => cacheProviders,
  getAssets: (): Asset[] => {
    return cacheAssets.map(a => ({
      ...a,
      providerName: cacheProviders.find(p => p.id === a.providerId)?.companyName || 'Fornecedor Desconhecido',
    }));
  },
  getAllocations: (): AssetAllocation[] => {
    return cacheAllocations.map(a => {
      const asset = cacheAssets.find(as => as.id === a.assetId);
      let targetName = 'Desconhecido';
      if (a.targetType === 'Funcionário') {
        targetName = cacheEmployees.find(e => e.id === a.targetId)?.name || 'Funcionário Desconhecido';
      } else if (a.targetType === 'Cliente') {
        targetName = cacheClients.find(c => c.id === a.targetId)?.name || 'Cliente Desconhecido';
      } else if (a.targetType === 'Contrato') {
        targetName = cacheContracts.find(c => c.id === a.targetId)?.contractNumber || 'Contrato Desconhecido';
      }

      return {
        ...a,
        assetNumber: asset?.assetNumber || 'PAT-DESCONHECIDO',
        assetName: asset ? `${asset.brand} ${asset.model}` : 'Equipamento Desconhecido',
        targetName,
      };
    });
  },
  getMaintenance: (): Maintenance[] => {
    return cacheMaintenances.map(m => {
      const asset = cacheAssets.find(a => a.id === m.assetId);
      return {
        ...m,
        assetNumber: asset?.assetNumber || 'PAT-N/A',
        assetName: asset ? `${asset.brand} ${asset.model}` : 'Equipamento N/A',
        providerName: cacheProviders.find(p => p.id === m.providerId)?.companyName || 'Fornecedor N/A',
      };
    });
  },
  getAuditLogs: (): AuditLog[] => cacheAuditLogs,
  clearAuditLogs: () => {
    db.saveAuditLogs([]);
  },
  getNotifications: (): AppNotification[] => cacheNotifications,
  getOccurrences: (): EmployeeOccurrence[] => cacheOccurrences,
  getEmployeeOccurrences: (employeeId: string): EmployeeOccurrence[] => {
    const occs = db.getOccurrences();
    return occs
      .filter(o => o.employeeId === employeeId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt.localeCompare(b.createdAt));
  },

  // Save routines (updating memory, local backup, and sending secure write requests to Cloud SQL)
  saveEmployees: (data: Employee[], operator?: { id: string; name: string; role: string }) => {
    cacheEmployees = data;
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(data));
    getHeaders().then(headers => {
      fetch('/api/employees', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }).catch(err => console.error('Failed to sync employees with Cloud SQL:', err));
    });
  },
  saveClients: (data: Client[]) => {
    cacheClients = data;
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(data));
    getHeaders().then(headers => {
      fetch('/api/clients', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }).catch(err => console.error('Failed to sync clients with Cloud SQL:', err));
    });
  },

  updateEmployee: (id: string, updatedFields: Partial<Employee>): Employee | null => {
    const emps = db.getEmployees();
    const idx = emps.findIndex(e => e.id === id);
    if (idx === -1) return null;
    emps[idx] = { ...emps[idx], ...updatedFields };
    db.saveEmployees(emps);
    return emps[idx];
  },

  updateOccurrence: (correctedOcc: EmployeeOccurrence): EmployeeOccurrence[] => {
    let occList = db.getOccurrences();
    const idx = occList.findIndex(o => o.id === correctedOcc.id);
    if (idx !== -1) {
      occList[idx] = correctedOcc;
    } else {
      occList.push(correctedOcc);
    }
    db.saveOccurrences(occList);
    return occList;
  },
  saveContracts: (data: Contract[]) => {
    cacheContracts = data;
    localStorage.setItem(KEYS.CONTRACTS, JSON.stringify(data));
    getHeaders().then(headers => {
      fetch('/api/contracts', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }).catch(err => console.error('Failed to sync contracts with Cloud SQL:', err));
    });
  },
  saveScales: (data: ScaleAllocation[]) => {
    cacheScales = data;
    localStorage.setItem(KEYS.SCALES, JSON.stringify(data));
    getHeaders().then(headers => {
      fetch('/api/scales', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }).catch(err => console.error('Failed to sync scale allocations with Cloud SQL:', err));
    });
  },
  saveProviders: (data: Provider[]) => {
    cacheProviders = data;
    localStorage.setItem(KEYS.PROVIDERS, JSON.stringify(data));
    getHeaders().then(headers => {
      fetch('/api/providers', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }).catch(err => console.error('Failed to sync providers with Cloud SQL:', err));
    });
  },
  saveAssets: (data: Asset[]) => {
    cacheAssets = data;
    localStorage.setItem(KEYS.ASSETS, JSON.stringify(data));
    getHeaders().then(headers => {
      fetch('/api/assets', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }).catch(err => console.error('Failed to sync assets with Cloud SQL:', err));
    });
  },
  saveAllocations: (data: AssetAllocation[]) => {
    cacheAllocations = data;
    localStorage.setItem(KEYS.ALLOCATIONS, JSON.stringify(data));
    getHeaders().then(headers => {
      fetch('/api/allocations', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }).catch(err => console.error('Failed to sync allocations with Cloud SQL:', err));
    });
  },
  saveMaintenance: (data: Maintenance[]) => {
    cacheMaintenances = data;
    localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify(data));
    getHeaders().then(headers => {
      fetch('/api/maintenances', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }).catch(err => console.error('Failed to sync maintenances with Cloud SQL:', err));
    });
  },
  saveNotifications: (data: AppNotification[]) => {
    cacheNotifications = data;
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(data));
    getHeaders().then(headers => {
      fetch('/api/notifications', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }).catch(err => console.error('Failed to sync notifications with Cloud SQL:', err));
    });
  },
  saveOccurrences: (data: EmployeeOccurrence[]) => {
    cacheOccurrences = data;
    localStorage.setItem(KEYS.OCCURRENCES, JSON.stringify(data));
    getHeaders().then(headers => {
      fetch('/api/occurrences', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }).catch(err => console.error('Failed to sync occurrences with Cloud SQL:', err));
    });
  },
  saveAuditLogs: (data: AuditLog[]) => {
    cacheAuditLogs = data;
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(data));
    getHeaders().then(headers => {
      fetch('/api/audit-logs', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      }).catch(err => console.error('Failed to sync audit logs with Cloud SQL:', err));
    });
  },

  // Audit helper
  audit: (
    operator: { id: string; name: string; role: string },
    action: AuditLog['action'],
    module: string,
    details: string,
    beforeState?: any,
    afterState?: any
  ) => {
    const logs = db.getAuditLogs();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: operator.id,
      userName: operator.name,
      userRole: operator.role,
      action,
      module,
      details,
      ipAddress: '189.122.14.200 (Preview User)',
      beforeState: beforeState ? JSON.stringify(beforeState) : undefined,
      afterState: afterState ? JSON.stringify(afterState) : undefined,
      createdAt: new Date().toISOString(),
    };
    db.saveAuditLogs([newLog, ...logs]);
    db.refreshNotificationsAndAlerts(); // refresh notifications on changes!
  },

  // Occurrence business-rules side effects
  applyOccurrenceSideEffects: (employeeId: string, operator: { id: string; name: string; role: string }) => {
    const employees = db.getEmployees();
    const employeeIndex = employees.findIndex(e => e.id === employeeId);
    if (employeeIndex === -1) return;
    
    const employee = employees[employeeIndex];
    const occurrences = db.getEmployeeOccurrences(employeeId);
    
    if (occurrences.length === 0) {
      if (employee.situation !== 'A Definir') {
        const beforeState = { ...employee };
        employee.situation = 'A Definir';
        employees[employeeIndex] = employee;
        db.saveEmployees(employees);
        db.audit(
          operator,
          'Editar',
          'Employees',
          `Situação de ${employee.name} alterada para "A Definir" por falta de ocorrências registradas.`,
          beforeState,
          employee
        );
      }
      return;
    }
    
    // Filter occurrences to keep only the latest version of each id
    const latestById: Record<string, EmployeeOccurrence> = {};
    occurrences.forEach(occ => {
      const existing = latestById[occ.id];
      if (!existing || occ.version > existing.version) {
        latestById[occ.id] = occ;
      }
    });
    const latestOccurrences = Object.values(latestById);
    
    // Sort occurrences by date ascending so we can process them sequentially
    const sorted = latestOccurrences.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt.localeCompare(b.createdAt));
    
    // Copy initial values of employee to apply modifications
    let situation: Employee['situation'] = 'Ativo';
    let role = employee.role;
    let salary = employee.salary;
    let supervisorId = employee.supervisorId;
    
    const todayStr = '2026-07-16'; // Reference date
    
    // Run through occurrences and apply modifications chronologically
    for (const occ of sorted) {
      if (occ.type === 'Admissão') {
        situation = 'Ativo';
        if (occ.role) role = occ.role;
        if (occ.supervisorId) supervisorId = occ.supervisorId;
      } else if (occ.type === 'Promoção') {
        if (occ.newRole) role = occ.newRole;
        if (occ.newSalary) salary = occ.newSalary;
      } else if (occ.type === 'Transferência') {
        if (occ.supervisorId) supervisorId = occ.supervisorId;
      } else if (occ.type === 'Retorno ao Trabalho') {
        situation = 'Ativo';
      } else if (occ.type === 'Demissão') {
        if (occ.dismissalType === 'Aposentadoria') {
          situation = 'Aposentado';
        } else if (occ.dismissalType === 'Falecimento') {
          situation = 'Falecido';
        } else {
          situation = 'Desligado';
        }
      }
    }

    if (situation !== 'Desligado' && situation !== 'Aposentado' && situation !== 'Falecido') {
      const activeAbsenceOrSuspension = sorted.find(occ => {
        if (occ.type === 'Afastamento' || occ.type === 'Suspensão') {
          const start = occ.date;
          const end = occ.endDate || occ.date;
          return todayStr >= start && todayStr <= end;
        }
        return false;
      });
      
      if (activeAbsenceOrSuspension) {
        if (activeAbsenceOrSuspension.type === 'Suspensão') {
          situation = 'Suspenso';
        } else if (activeAbsenceOrSuspension.type === 'Afastamento') {
          const type = activeAbsenceOrSuspension.absenceType;
          if (type === 'Licença Médica') situation = 'Licença Médica';
          else if (type === 'Licença Maternidade') situation = 'Licença Maternidade';
          else if (type === 'Férias') situation = 'Em Férias';
          else if (type === 'Treinamento') situation = 'Em Treinamento';
          else situation = 'Afastado';
        }
      }
    }
    
    const beforeState = { ...employee };
    let hasChanges = false;
    
    if (employee.situation !== situation) {
      employee.situation = situation;
      hasChanges = true;
    }
    if (employee.role !== role) {
      employee.role = role;
      hasChanges = true;
    }
    if (employee.salary !== salary) {
      employee.salary = salary;
      hasChanges = true;
    }
    if (employee.supervisorId !== supervisorId) {
      employee.supervisorId = supervisorId;
      hasChanges = true;
    }
    
    if (hasChanges) {
      employees[employeeIndex] = employee;
      db.saveEmployees(employees);
      
      db.audit(
        operator,
        'Editar',
        'Employees',
        `Situação/Dados do funcionário ${employee.name} atualizados automaticamente devido a novas ocorrências. Situação atual: ${situation}.`,
        beforeState,
        employee
      );
      
      if (situation === 'Desligado' || situation === 'Aposentado' || situation === 'Falecido') {
        const scales = db.getScales();
        const filteredScales = scales.filter(s => {
          if (s.employeeId !== employeeId) return true;
          const scaleStart = s.startDate.split('T')[0];
          return scaleStart < todayStr;
        });
        if (scales.length !== filteredScales.length) {
          db.saveScales(filteredScales);
          db.audit(
            operator,
            'Excluir',
            'Scales',
            `Escalas futuras do colaborador ${employee.name} removidas automaticamente devido a desligamento/desativação.`,
            null,
            null
          );
        }
        
        const allocations = db.getAllocations();
        const activeAllocations = allocations.filter(a => a.targetType === 'Funcionário' && a.targetId === employeeId && !a.returnDate);
        if (activeAllocations.length > 0) {
          const notifications = db.getNotifications();
          activeAllocations.forEach(alloc => {
            const exists = notifications.some(n => n.id === `not-return-ast-${alloc.assetId}`);
            if (!exists) {
              notifications.push({
                id: `not-return-ast-${alloc.assetId}`,
                type: 'DevolucaoPatrimonio',
                title: 'Solicitação de Devolução de Equipamento',
                message: `O colaborador ${employee.name} foi desligado. É necessário recolher o patrimônio ${alloc.assetNumber} (${alloc.assetName}).`,
                referenceId: alloc.id,
                read: false,
                createdAt: new Date().toISOString(),
              });
            }
          });
          db.saveNotifications(notifications);
        }
      }
    }
  },

  // Notification engine based on cached state
  refreshNotificationsAndAlerts: () => {
    const notifications: AppNotification[] = [];
    const today = new Date();
    
    const contracts = cacheContracts;
    const clients = cacheClients;
    
    contracts.forEach(con => {
      if (con.situation !== 'Ativo') return;
      const end = new Date(con.endDate);
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const clientName = clients.find((cl: any) => cl.id === con.clientId)?.name || 'Cliente';

      if (diffDays <= 0) {
        notifications.push({
          id: `not-con-expired-${con.id}`,
          type: 'ContratoVencendo',
          title: 'CONTRATO EXPIRADO',
          message: `O contrato ${con.contractNumber} com ${clientName} expirou em ${con.endDate}.`,
          referenceId: con.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
      } else if (diffDays <= 7) {
        notifications.push({
          id: `not-con-7-${con.id}`,
          type: 'ContratoVencendo',
          title: 'Vencimento Crítico (7 dias)',
          message: `O contrato ${con.contractNumber} com ${clientName} vence em ${diffDays} dias (${con.endDate}).`,
          referenceId: con.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
      } else if (diffDays <= 15) {
        notifications.push({
          id: `not-con-15-${con.id}`,
          type: 'ContratoVencendo',
          title: 'Alerta de Vencimento (15 dias)',
          message: `O contrato ${con.contractNumber} com ${clientName} vence em ${diffDays} dias (${con.endDate}).`,
          referenceId: con.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
      } else if (diffDays <= 30) {
        notifications.push({
          id: `not-con-30-${con.id}`,
          type: 'ContratoVencendo',
          title: 'Aviso de Vencimento (30 dias)',
          message: `O contrato ${con.contractNumber} com ${clientName} vence em ${diffDays} dias (${con.endDate}).`,
          referenceId: con.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    // Check Employee recycling certificates
    cacheEmployees.forEach(emp => {
      if (emp.situation !== 'Ativo') return;
      if (emp.name.includes('Alexandre Pires')) {
        notifications.push({
          id: `not-emp-rec-${emp.id}`,
          type: 'DocumentoVencendo',
          title: 'Reciclagem Vencendo',
          message: `A reciclagem de vigilante de ${emp.name} está próxima do vencimento.`,
          referenceId: emp.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    // Check Assets in maintenance
    cacheMaintenances.forEach(m => {
      if (!m.exitDate) {
        const asset = cacheAssets.find(a => a.id === m.assetId);
        if (asset) {
          notifications.push({
            id: `not-mnt-${m.id}`,
            type: 'Manutencao',
            title: 'Equipamento em Manutenção',
            message: `O patrimônio ${asset.assetNumber} (${asset.brand} ${asset.model}) está na oficina.`,
            referenceId: m.id,
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    const existing = cacheNotifications;
    const merged = [...notifications];
    existing.forEach(ex => {
      if (!merged.some(m => m.id === ex.id)) {
        merged.push(ex);
      }
    });

    cacheNotifications = merged;
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(merged));
  },

  // Global search implementation
  globalSearch: (query: string): { type: string; id: string; title: string; subtitle: string }[] => {
    if (!query || query.trim() === '') return [];
    const q = query.toLowerCase().trim();
    const results: { type: string; id: string; title: string; subtitle: string }[] = [];

    db.getEmployees().forEach(e => {
      if (e.name.toLowerCase().includes(q) || e.cpf.includes(q) || e.role.toLowerCase().includes(q)) {
        results.push({
          type: 'Funcionário',
          id: e.id,
          title: e.name,
          subtitle: `${e.role} | CPF: ${e.cpf}`,
        });
      }
    });

    db.getClients().forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.document.includes(q) || (c.tradeName && c.tradeName.toLowerCase().includes(q))) {
        results.push({
          type: 'Cliente',
          id: c.id,
          title: c.name,
          subtitle: `${c.type} | Doc: ${c.document}`,
        });
      }
    });

    db.getContracts().forEach(c => {
      if (c.contractNumber.toLowerCase().includes(q) || (c.clientName && c.clientName.toLowerCase().includes(q))) {
        results.push({
          type: 'Contrato',
          id: c.id,
          title: c.contractNumber,
          subtitle: `Cliente: ${c.clientName} | Valor: R$ ${c.monthlyValue.toLocaleString('pt-BR')}`,
        });
      }
    });

    db.getAssets().forEach(a => {
      if (a.assetNumber.toLowerCase().includes(q) || a.serialNumber.toLowerCase().includes(q) || a.brand.toLowerCase().includes(q) || a.model.toLowerCase().includes(q)) {
        results.push({
          type: 'Patrimônio',
          id: a.id,
          title: `${a.brand} ${a.model}`,
          subtitle: `PAT: ${a.assetNumber} | Categoria: ${a.category}`,
        });
      }
    });

    db.getProviders().forEach(p => {
      if (p.companyName.toLowerCase().includes(q) || p.cnpj.includes(q) || (p.tradeName && p.tradeName.toLowerCase().includes(q))) {
        results.push({
          type: 'Fornecedor',
          id: p.id,
          title: p.companyName,
          subtitle: `CNPJ: ${p.cnpj} | Produtos: ${p.suppliedProducts}`,
        });
      }
    });

    return results;
  },

  // USERS MANAGEMENT REPOSITORY
  getUsers: (): User[] => {
    try {
      const stored = localStorage.getItem(KEYS.USERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    
    const initialUsers: User[] = [];
    localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
    return initialUsers;
  },

  addUser: (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const users = db.getUsers();
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: userData.status || 'Ativo',
    };
    users.unshift(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  updateUser: (id: string, updatedFields: Partial<User>): User | null => {
    const users = db.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    users[idx] = { ...users[idx], ...updatedFields };
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return users[idx];
  },

  deleteUser: (id: string): boolean => {
    let users = db.getUsers();
    const initialLen = users.length;
    users = users.filter(u => u.id !== id);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return users.length < initialLen;
  },

  resetUserPassword: (id: string, newPassword: string): boolean => {
    const users = db.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return false;
    user.passwordHash = newPassword;
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return true;
  },

  toggleUserStatus: (id: string): User | null => {
    const users = db.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return null;
    user.status = user.status === 'Ativo' ? 'Bloqueado' : 'Ativo';
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return user;
  }
};
