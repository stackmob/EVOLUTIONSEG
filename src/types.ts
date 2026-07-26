import { DocumentMetadata } from './services/storage';

export type UserRole = 'Administrador' | 'Supervisor' | 'Operador' | 'RH' | 'Financeiro' | 'Cliente';

export type SaasPlan = 'Starter' | 'Pro' | 'Enterprise';

export interface Tenant {
  id: string;
  name: string;
  cnpj: string;
  subdomain: string;
  plan: SaasPlan;
  billingCycle: 'mensal' | 'anual';
  status: 'Ativo' | 'Pendente' | 'Cancelado' | 'Degradado';
  maxEmployees: number;
  maxClients: number;
  maxAssets: number;
  createdAt: string;
  renewsAt: string;
  ownerName: string;
  ownerEmail: string;
}

export interface SaasInvoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'Pago' | 'Pendente' | 'Atrasado';
  downloadUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  companyId?: string; // For clients, points to Client ID
  tenantId?: string; // Multi-tenant SaaS tenant identifier
  status: 'Ativo' | 'Inativo' | 'Bloqueado';
  createdAt: string;
  lastLogin?: string;
  passwordHash?: string;
  accessLevel?: 'Total (Admin)' | 'Gerencial' | 'Operacional' | 'Somente Leitura';
}

export interface Permission {
  module: 'employees' | 'clients' | 'contracts' | 'scales' | 'assets' | 'maintenance' | 'providers' | 'audit' | 'reports';
  actions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
  };
}

export interface Employee {
  id: string;
  tenantId?: string;
  // Personal Data
  name: string;
  cpf: string;
  rg: string;
  birthDate: string;
  gender: string;
  civilStatus: string;
  photoUrl?: string;
  // Address
  address: string;
  city: string;
  state: string;
  cep: string;
  phone: string;
  whatsapp: string;
  email: string;
  // Professional Data
  admissionDate: string;
  role: string; // e.g. Vigilante, Supervisor, Operador, RH
  function: string;
  supervisorId?: string;
  scaleType: string; // e.g. 12x36, 5x2, 6x1
  shift: 'Matutino' | 'Vespertino' | 'Noturno' | 'Diurno';
  situation: 'A Definir' | 'Ativo' | 'Em Treinamento' | 'Em Férias' | 'Afastado' | 'Licença Médica' | 'Licença Maternidade' | 'Suspenso' | 'Desligado' | 'Aposentado' | 'Falecido';
  salary: number;
  // Bank Data
  bankName: string;
  bankAgency: string;
  bankAccount: string;
  pixKey: string;
  // Documents (URLs / presence verification)
  cnhUrl?: string;
  vigilanteCourseUrl?: string;
  recyclingUrl?: string;
  asoUrl?: string;
  certificatesUrls?: string[];
  createdAt: string;
}

export interface Client {
  id: string;
  tenantId?: string;
  type: 'PF' | 'PJ';
  name: string; // Razão Social or Nome Completo
  tradeName?: string; // Nome Fantasia (for PJ)
  document: string; // CPF or CNPJ
  contactPhone: string;
  contactEmail: string;
  responsibleName: string;
  responsiblePhone?: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  notes?: string;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
}

export interface Contract {
  id: string;
  tenantId?: string;
  clientId: string;
  clientName?: string; // Joined field
  contractNumber: string;
  startDate: string;
  endDate: string;
  monthlyValue: number;
  postCount: number;
  securityGuardCount: number;
  contractType: string; // e.g. Vigilância Armada, Escolta, Portaria
  situation: 'Ativo' | 'Vencido' | 'Suspenso' | 'Cancelado';
  notes?: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface ScaleAllocation {
  id: string;
  tenantId?: string;
  employeeId: string;
  employeeName?: string; // Joined field
  clientId: string;
  clientName?: string; // Joined field
  contractId: string;
  contractNumber?: string; // Joined field
  postName: string;
  shift: 'Matutino' | 'Vespertino' | 'Noturno' | 'Diurno';
  scaleType: string; // e.g. 12x36, 5x2, 6x1
  isOffDay: boolean;
  startDate: string; // ISO date-time or date
  endDate: string;
  overtimeHours: number;
  notes?: string;
  createdAt: string;
}

export interface Provider {
  id: string;
  tenantId?: string;
  cnpj: string;
  companyName: string; // Razão Social
  tradeName?: string; // Nome Fantasia
  contactName?: string;
  phone?: string;
  email?: string;
  suppliedProducts?: string; // List of products/services
  notes?: string;
  createdAt: string;

  // Alternative property naming for seamless compatibility
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  serviceProvided?: string;
}

export interface Asset {
  id: string;
  tenantId?: string;
  assetNumber: string; // Número patrimônio
  serialNumber: string;
  category: 'Celulares' | 'Carros' | 'Motos' | 'Notebook' | 'Computador' | 'Tablet' | 'Colete' | 'Arma' | 'Rádio Comunicador' | 'Lanterna' | 'Uniformes' | 'Equipamentos' | 'Outros';
  brand: string;
  model: string;
  providerId: string;
  providerName?: string; // Joined field
  purchaseDate: string;
  purchaseValue: number;
  warrantyEndDate: string;
  situation: 'Disponível' | 'Emprestado' | 'Manutenção' | 'Baixado';
  photoUrl?: string;
  notes?: string;
  qrCodeUrl?: string;
  barcodeValue: string;
  createdAt: string;
}

export interface AssetAllocation {
  id: string;
  tenantId?: string;
  assetId: string;
  assetNumber?: string; // Joined field
  assetName?: string; // Joined field (Brand + Model)
  targetType: 'Funcionário' | 'Cliente' | 'Contrato';
  targetId: string; // Employee ID, Client ID, or Contract ID
  targetName?: string; // Joined target name
  allocationDate: string;
  returnDate?: string;
  expectedReturnDate?: string;
  registeredBy: string; // Logged user ID or Name
  equipmentCondition: string; // e.g. Excelente, Regular, Com avaria
  digitalSignature?: string; // Textual name representation or data-url SVG
  historyNotes?: string;
  createdAt: string;
}

export interface Maintenance {
  id: string;
  tenantId?: string;
  assetId: string;
  assetNumber?: string; // Joined field
  assetName?: string; // Joined field
  entryDate: string;
  issueDescription: string;
  providerId: string; // Repair shop / Provider
  providerName?: string; // Joined field
  cost: number;
  exitDate?: string;
  warrantyEndDate?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'Cadastrar' | 'Editar' | 'Excluir' | 'Visualizar' | 'Exportar' | 'Login' | 'Recuperar Senha';
  module: string;
  details: string;
  ipAddress: string;
  beforeState?: string; // JSON string
  afterState?: string;  // JSON string
  createdAt: string;
}

export interface AppNotification {
  id: string;
  tenantId?: string;
  type: 'DocumentoVencendo' | 'ContratoVencendo' | 'Manutencao' | 'ConflitoEscala' | 'DevolucaoPatrimonio';
  title: string;
  message: string;
  referenceId: string; // Points to relevant ID (Contract ID, Employee ID, etc.)
  read: boolean;
  createdAt: string;
}

export interface EmployeeOccurrence {
  id: string;
  tenantId?: string;
  employeeId: string;
  type: 'Admissão' | 'Afastamento' | 'Demissão' | 'Transferência' | 'Promoção' | 'Advertência' | 'Suspensão' | 'Retorno ao Trabalho';
  date: string; // Event primary date
  endDate?: string; // For Afastamento and Suspensão
  notes?: string;
  attachmentUrl?: string;
  attachmentMeta?: DocumentMetadata;
  registeredBy: string; // User name/role who registered it
  createdAt: string; // Registration timestamp (date and time)
  version: number; // Versioning for corrections (defaults to 1, increments on edit)
  
  // Admissão
  admissionDate?: string;
  role?: string;
  department?: string;
  unit?: string;
  supervisorId?: string;
  
  // Afastamento
  absenceType?: 'Auxílio Doença' | 'Acidente de Trabalho' | 'Licença Médica' | 'Licença Maternidade' | 'Licença Paternidade' | 'Licença Não Remunerada' | 'Férias' | 'Suspensão' | 'Treinamento' | 'Outros';
  cid?: string;
  
  // Demissão
  dismissalDate?: string;
  dismissalType?: 'Pedido de Demissão' | 'Sem Justa Causa' | 'Justa Causa' | 'Término de Contrato' | 'Aposentadoria' | 'Falecimento' | 'Outros';
  motive?: string;
  
  // Transferência
  company?: string;
  clientId?: string;
  clientName?: string;
  postName?: string;
  
  // Promoção
  previousRole?: string;
  newRole?: string;
  previousSalary?: number;
  newSalary?: number;
  
  // Advertência
  warningType?: string;
  description?: string;
  signedDocumentUrl?: string;
  
  // Suspensão / Retorno ao Trabalho
  returnDate?: string;
}

