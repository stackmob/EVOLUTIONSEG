-- =========================================================================
-- EVOLUTIONSEG — SCRIPT MULTI-TENANT DE CRIAÇÃO E MIGRAÇÃO COMPLETA SUPABASE
-- Execute este script no Painel do Supabase (SQL Editor -> New Query -> Run)
-- =========================================================================

-- 0. Tabela de Empresas Contratantes (tenants)
CREATE TABLE IF NOT EXISTS public.tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  subdomain TEXT,
  plan TEXT NOT NULL DEFAULT 'Pro',
  status TEXT NOT NULL DEFAULT 'Ativo',
  created_at TEXT NOT NULL
);

-- Inserir empresa padrão de demonstração
INSERT INTO public.tenants (id, name, cnpj, plan, status, created_at)
VALUES 
  ('tenant-demo-1', 'EVOLUTIONSEG Grupo Demonstração', '12.345.678/0001-90', 'Pro', 'Ativo', now()::text),
  ('tenant-demo-2', 'Empresa de Segurança Beta LTDA', '98.765.432/0001-10', 'Enterprise', 'Ativo', now()::text)
ON CONFLICT (id) DO NOTHING;

-- 1. Tabela de Usuários (users)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tenant-demo-1' REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  company_id TEXT,
  created_at TEXT NOT NULL
);

-- 2. Tabela de Funcionários / Vigilantes (employees)
CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tenant-demo-1' REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  rg TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  gender TEXT NOT NULL,
  civil_status TEXT NOT NULL,
  photo_url TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  cep TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  admission_date TEXT NOT NULL,
  role TEXT NOT NULL,
  function TEXT NOT NULL,
  supervisor_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
  scale_type TEXT NOT NULL,
  shift TEXT NOT NULL,
  situation TEXT NOT NULL,
  salary DOUBLE PRECISION NOT NULL,
  bank_name TEXT NOT NULL,
  bank_agency TEXT NOT NULL,
  bank_account TEXT NOT NULL,
  pix_key TEXT NOT NULL,
  cnh_url TEXT,
  vigilante_course_url TEXT,
  recycling_url TEXT,
  aso_url TEXT,
  certificates_urls JSONB DEFAULT '[]'::jsonb,
  created_at TEXT NOT NULL
);

-- 3. Tabela de Clientes (clients)
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tenant-demo-1' REFERENCES public.tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  trade_name TEXT,
  document TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  responsible_name TEXT NOT NULL,
  responsible_phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  cep TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- 4. Tabela de Contratos (contracts)
CREATE TABLE IF NOT EXISTS public.contracts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tenant-demo-1' REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT,
  contract_number TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  monthly_value DOUBLE PRECISION NOT NULL,
  post_count INTEGER NOT NULL,
  security_guard_count INTEGER NOT NULL,
  contract_type TEXT NOT NULL,
  situation TEXT NOT NULL,
  notes TEXT,
  pdf_url TEXT,
  created_at TEXT NOT NULL
);

-- 5. Tabela de Alocação de Escalas (scale_allocations)
CREATE TABLE IF NOT EXISTS public.scale_allocations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tenant-demo-1' REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT,
  client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT,
  contract_id TEXT NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  contract_number TEXT,
  post_name TEXT NOT NULL,
  shift TEXT NOT NULL,
  scale_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- 6. Tabela de Fornecedores (providers)
CREATE TABLE IF NOT EXISTS public.providers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tenant-demo-1' REFERENCES public.tenants(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  trade_name TEXT,
  cnpj TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  address TEXT NOT NULL,
  supplied_products TEXT NOT NULL,
  rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  created_at TEXT NOT NULL
);

-- 7. Tabela de Patrimônios e Equipamentos (assets)
CREATE TABLE IF NOT EXISTS public.assets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tenant-demo-1' REFERENCES public.tenants(id) ON DELETE CASCADE,
  asset_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  provider_id TEXT REFERENCES public.providers(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- 8. Tabela de Alocações de Patrimônio (asset_allocations)
CREATE TABLE IF NOT EXISTS public.asset_allocations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tenant-demo-1' REFERENCES public.tenants(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  allocation_date TEXT NOT NULL,
  return_date TEXT,
  term_pdf_url TEXT,
  created_at TEXT NOT NULL
);

-- 9. Tabela de Manutenções de Patrimônio (maintenances)
CREATE TABLE IF NOT EXISTS public.maintenances (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tenant-demo-1' REFERENCES public.tenants(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  provider_id TEXT REFERENCES public.providers(id) ON DELETE SET NULL,
  entry_date TEXT NOT NULL,
  exit_date TEXT,
  cost DOUBLE PRECISION NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- 10. Tabela de Logs de Auditoria (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tenant-demo-1' REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  before_state TEXT,
  after_state TEXT,
  created_at TEXT NOT NULL
);

-- 11. Tabela de Ocorrências dos Funcionários (employee_occurrences)
CREATE TABLE IF NOT EXISTS public.employee_occurrences (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tenant-demo-1' REFERENCES public.tenants(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  endDate TEXT,
  reason TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  attachment_url TEXT,
  new_role TEXT,
  new_salary DOUBLE PRECISION,
  dismissal_type TEXT,
  absence_type TEXT,
  cid TEXT,
  supervisor_id TEXT,
  applied_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);

-- 12. Tabela de Notificações do App (app_notifications)
CREATE TABLE IF NOT EXISTS public.app_notifications (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL DEFAULT 'tenant-demo-1' REFERENCES public.tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TEXT NOT NULL
);

-- HABILITAR ROW LEVEL SECURITY (RLS) PARA ISOLAMENTO MULTI-TENANT POR EMPRESA
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scale_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS DE RLS REUTILIZÁVEIS (Acesso permitido apenas se tenant_id for igual ao claim do JWT ou usuário anonimizado/demo)
CREATE POLICY IF NOT EXISTS "Multi-tenant Isolation: Employees" ON public.employees FOR ALL USING (tenant_id = coalesce(current_setting('app.current_tenant_id', true), tenant_id));
CREATE POLICY IF NOT EXISTS "Multi-tenant Isolation: Clients" ON public.clients FOR ALL USING (tenant_id = coalesce(current_setting('app.current_tenant_id', true), tenant_id));
CREATE POLICY IF NOT EXISTS "Multi-tenant Isolation: Contracts" ON public.contracts FOR ALL USING (tenant_id = coalesce(current_setting('app.current_tenant_id', true), tenant_id));
CREATE POLICY IF NOT EXISTS "Multi-tenant Isolation: Assets" ON public.assets FOR ALL USING (tenant_id = coalesce(current_setting('app.current_tenant_id', true), tenant_id));
