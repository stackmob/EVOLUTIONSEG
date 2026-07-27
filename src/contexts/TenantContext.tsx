import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, SaasPlan, SaasInvoice } from '../types';
import toast from 'react-hot-toast';

interface TenantContextType {
  currentTenant: Tenant | null;
  tenantsList: Tenant[];
  hasRealTenant: boolean;
  switchTenant: (tenantId: string) => void;
  updatePlan: (newPlan: SaasPlan, billingCycle: 'mensal' | 'anual') => void;
  invoices: SaasInvoice[];
  registerNewTenant: (name: string, cnpj: string, ownerName: string, ownerEmail: string, plan: SaasPlan) => void;
}

const INITIAL_INVOICES: SaasInvoice[] = [];

// Known mock tenant IDs from older builds that must be purged
const MOCK_TENANT_IDS = ['tnt-1', 'tnt-2', 'tnt-3', 'tnt-default'];

function loadCleanTenantsList(): Tenant[] {
  try {
    const saved = localStorage.getItem('saas_tenants_list');
    if (!saved) return [];
    const parsed: Tenant[] = JSON.parse(saved);
    // Filter out any leftover mock/demo tenants from previous builds
    const real = parsed.filter(t => !MOCK_TENANT_IDS.includes(t.id));
    return real;
  } catch {
    return [];
  }
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantsList, setTenantsList] = useState<Tenant[]>(() => {
    const clean = loadCleanTenantsList();
    // If mock data was purged, also clear the stale current-tenant pointer
    const savedList = localStorage.getItem('saas_tenants_list');
    if (savedList) {
      const parsed: Tenant[] = JSON.parse(savedList);
      const hadMocks = parsed.some(t => MOCK_TENANT_IDS.includes(t.id));
      if (hadMocks) {
        localStorage.removeItem('saas_current_tenant_id');
        localStorage.removeItem('saas_invoices');
      }
    }
    return clean;
  });

  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(() => {
    const savedId = localStorage.getItem('saas_current_tenant_id');
    const initialList = loadCleanTenantsList();
    const found = initialList.find(t => t.id === savedId);
    return found || initialList[0] || null;
  });

  const [invoices, setInvoices] = useState<SaasInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('saas_invoices');
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  useEffect(() => {
    localStorage.setItem('saas_tenants_list', JSON.stringify(tenantsList));
  }, [tenantsList]);

  useEffect(() => {
    if (currentTenant) {
      localStorage.setItem('saas_current_tenant_id', currentTenant.id);
    }
  }, [currentTenant]);

  useEffect(() => {
    localStorage.setItem('saas_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const hasRealTenant = tenantsList.length > 0;

  const switchTenant = (tenantId: string) => {
    const target = tenantsList.find(t => t.id === tenantId);
    if (target) {
      setCurrentTenant(target);
      toast.success(`Contexto alternado para: ${target.name}`);
    }
  };

  const updatePlan = (newPlan: SaasPlan, billingCycle: 'mensal' | 'anual') => {
    if (!currentTenant) {
      toast.error('Nenhuma empresa ativa. Cadastre sua empresa primeiro.');
      return;
    }
    let maxEmployees = 10;
    let maxClients = 3;
    let maxAssets = 15;

    if (newPlan === 'Pro') {
      maxEmployees = 50;
      maxClients = 15;
      maxAssets = 60;
    } else if (newPlan === 'Enterprise') {
      maxEmployees = 250;
      maxClients = 100;
      maxAssets = 500;
    }

    const updatedTenant: Tenant = {
      ...currentTenant,
      plan: newPlan,
      billingCycle,
      maxEmployees,
      maxClients,
      maxAssets,
    };

    setCurrentTenant(updatedTenant);

    setTenantsList(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));

    // Generate new invoice record
    const planPrice = newPlan === 'Starter' ? 290 : newPlan === 'Pro' ? 690 : 1290;
    const finalAmount = billingCycle === 'anual' ? planPrice * 10 : planPrice; // 2 months free on annual

    const newInvoice: SaasInvoice = {
      id: `inv-${Date.now()}`,
      tenantId: updatedTenant.id,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      amount: finalAmount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pendente',
    };

    setInvoices(prev => [newInvoice, ...prev]);
    toast.success(`Plano do Tenant atualizado com sucesso para ${newPlan} (${billingCycle})!`);
  };

  const registerNewTenant = (
    name: string, 
    cnpj: string, 
    ownerName: string, 
    ownerEmail: string, 
    plan: SaasPlan
  ) => {
    let maxEmployees = 10;
    let maxClients = 3;
    let maxAssets = 15;

    if (plan === 'Pro') {
      maxEmployees = 50;
      maxClients = 15;
      maxAssets = 60;
    } else if (plan === 'Enterprise') {
      maxEmployees = 250;
      maxClients = 100;
      maxAssets = 500;
    }

    const newTenant: Tenant = {
      id: `tnt-${Date.now()}`,
      name,
      cnpj,
      subdomain: name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15),
      plan,
      billingCycle: 'mensal',
      status: 'Ativo',
      maxEmployees,
      maxClients,
      maxAssets,
      createdAt: new Date().toISOString().split('T')[0],
      renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ownerName,
      ownerEmail,
    };

    setTenantsList(prev => [...prev, newTenant]);
    setCurrentTenant(newTenant);
    toast.success(`Nova empresa SaaS "${name}" criada e ativada!`);
  };

  return (
    <TenantContext.Provider value={{
      currentTenant,
      tenantsList,
      hasRealTenant,
      switchTenant,
      updatePlan,
      invoices,
      registerNewTenant
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
