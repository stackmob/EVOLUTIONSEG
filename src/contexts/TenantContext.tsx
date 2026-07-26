import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, SaasPlan, SaasInvoice } from '../types';
import toast from 'react-hot-toast';

interface TenantContextType {
  currentTenant: Tenant;
  tenantsList: Tenant[];
  switchTenant: (tenantId: string) => void;
  updatePlan: (newPlan: SaasPlan, billingCycle: 'mensal' | 'anual') => void;
  invoices: SaasInvoice[];
  registerNewTenant: (name: string, cnpj: string, ownerName: string, ownerEmail: string, plan: SaasPlan) => void;
}

const DEFAULT_TENANTS: Tenant[] = [
  {
    id: 'tnt-1',
    name: 'EvolutionSeg SP (Matriz)',
    cnpj: '45.892.102/0001-88',
    subdomain: 'sp-matriz',
    plan: 'Enterprise',
    billingCycle: 'mensal',
    status: 'Ativo',
    maxEmployees: 100,
    maxClients: 50,
    maxAssets: 200,
    createdAt: '2025-01-10',
    renewsAt: '2026-08-10',
    ownerName: 'Elmaneko Admin',
    ownerEmail: 'elmaneko3d@gmail.com',
  },
  {
    id: 'tnt-2',
    name: 'GuardSec Sul Ltda',
    cnpj: '12.345.678/0001-99',
    subdomain: 'guardsec-sul',
    plan: 'Pro',
    billingCycle: 'mensal',
    status: 'Ativo',
    maxEmployees: 50,
    maxClients: 15,
    maxAssets: 60,
    createdAt: '2025-03-15',
    renewsAt: '2026-08-15',
    ownerName: 'Roberto Alencar',
    ownerEmail: 'roberto@guardsec.com.br',
  },
  {
    id: 'tnt-3',
    name: 'Bravos Portaria & Vigilância',
    cnpj: '98.765.432/0001-11',
    subdomain: 'bravos-seg',
    plan: 'Starter',
    billingCycle: 'anual',
    status: 'Ativo',
    maxEmployees: 10,
    maxClients: 3,
    maxAssets: 15,
    createdAt: '2025-05-20',
    renewsAt: '2027-05-20',
    ownerName: 'Carlos Bravos',
    ownerEmail: 'contato@bravos.com.br',
  }
];

const INITIAL_INVOICES: SaasInvoice[] = [
  {
    id: 'inv-101',
    tenantId: 'tnt-1',
    invoiceNumber: 'INV-2026-007',
    amount: 1290.00,
    dueDate: '2026-07-10',
    paidDate: '2026-07-08',
    status: 'Pago',
  },
  {
    id: 'inv-100',
    tenantId: 'tnt-1',
    invoiceNumber: 'INV-2026-006',
    amount: 1290.00,
    dueDate: '2026-06-10',
    paidDate: '2026-06-09',
    status: 'Pago',
  },
  {
    id: 'inv-099',
    tenantId: 'tnt-1',
    invoiceNumber: 'INV-2026-005',
    amount: 1290.00,
    dueDate: '2026-05-10',
    paidDate: '2026-05-10',
    status: 'Pago',
  },
];

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantsList, setTenantsList] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('saas_tenants_list');
    return saved ? JSON.parse(saved) : DEFAULT_TENANTS;
  });

  const [currentTenant, setCurrentTenant] = useState<Tenant>(() => {
    const savedId = localStorage.getItem('saas_current_tenant_id');
    const found = tenantsList.find(t => t.id === savedId);
    return found || tenantsList[0];
  });

  const [invoices, setInvoices] = useState<SaasInvoice[]>(() => {
    const saved = localStorage.getItem('saas_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
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

  const switchTenant = (tenantId: string) => {
    const target = tenantsList.find(t => t.id === tenantId);
    if (target) {
      setCurrentTenant(target);
      toast.success(`Contexto SaaS alternado para: ${target.name}`);
    }
  };

  const updatePlan = (newPlan: SaasPlan, billingCycle: 'mensal' | 'anual') => {
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
