import { pgTable, text, integer, doublePrecision, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// 0. Tenants Table (Multi-tenant SaaS Companies)
export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  cnpj: text('cnpj').notNull(),
  subdomain: text('subdomain'),
  plan: text('plan').notNull().default('Pro'), // Starter, Pro, Enterprise
  status: text('status').notNull().default('Ativo'), // Ativo, Suspenso, Cancelado
  createdAt: text('created_at').notNull(),
});

// 1. Users Table (matching Firebase Auth / Supabase Auth)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().default('tenant-demo-1'),
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(), // UserRole type
  avatarUrl: text('avatar_url'),
  companyId: text('company_id'),
  createdAt: text('created_at').notNull(),
});

// 2. Employees Table
export const employees = pgTable('employees', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().default('tenant-demo-1'),
  name: text('name').notNull(),
  cpf: text('cpf').notNull(),
  rg: text('rg').notNull(),
  birthDate: text('birth_date').notNull(),
  gender: text('gender').notNull(),
  civilStatus: text('civil_status').notNull(),
  photoUrl: text('photo_url'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  cep: text('cep').notNull(),
  phone: text('phone').notNull(),
  whatsapp: text('whatsapp').notNull(),
  email: text('email').notNull(),
  admissionDate: text('admission_date').notNull(),
  role: text('role').notNull(),
  function: text('function').notNull(),
  supervisorId: text('supervisor_id'),
  scaleType: text('scale_type').notNull(),
  shift: text('shift').notNull(), // Matutino, Vespertino, etc.
  situation: text('situation').notNull(), // Ativo, Em Treinamento, etc.
  salary: doublePrecision('salary').notNull(),
  bankName: text('bank_name').notNull(),
  bankAgency: text('bank_agency').notNull(),
  bankAccount: text('bank_account').notNull(),
  pixKey: text('pix_key').notNull(),
  cnhUrl: text('cnh_url'),
  vigilanteCourseUrl: text('vigilante_course_url'),
  recyclingUrl: text('recycling_url'),
  asoUrl: text('aso_url'),
  certificatesUrls: jsonb('certificates_urls'), // JSON array of strings
  createdAt: text('created_at').notNull(),
});

// 3. Clients Table
export const clients = pgTable('clients', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().default('tenant-demo-1'),
  type: text('type').notNull(), // PF or PJ
  name: text('name').notNull(),
  tradeName: text('trade_name'),
  document: text('document').notNull(),
  contactPhone: text('contact_phone').notNull(),
  contactEmail: text('contact_email').notNull(),
  responsibleName: text('responsible_name').notNull(),
  responsiblePhone: text('responsible_phone'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  cep: text('cep').notNull(),
  notes: text('notes'),
  status: text('status').notNull(), // Ativo, Inativo
  createdAt: text('created_at').notNull(),
});

// 4. Contracts Table
export const contracts = pgTable('contracts', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().default('tenant-demo-1'),
  clientId: text('client_id').notNull(),
  clientName: text('client_name'),
  contractNumber: text('contract_number').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  monthlyValue: doublePrecision('monthly_value').notNull(),
  postCount: integer('post_count').notNull(),
  securityGuardCount: integer('security_guard_count').notNull(),
  contractType: text('contract_type').notNull(),
  situation: text('situation').notNull(), // Ativo, Vencido, etc.
  notes: text('notes'),
  pdfUrl: text('pdf_url'),
  createdAt: text('created_at').notNull(),
});

// 5. Scale Allocation Table (Escalas do Dia)
export const scaleAllocations = pgTable('scale_allocations', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().default('tenant-demo-1'),
  employeeId: text('employee_id').notNull(),
  employeeName: text('employee_name'),
  clientId: text('client_id').notNull(),
  clientName: text('client_name'),
  contractId: text('contract_id').notNull(),
  contractNumber: text('contract_number'),
  postName: text('post_name').notNull(),
  shift: text('shift').notNull(),
  scaleType: text('scale_type').notNull(),
  isOffDay: boolean('is_off_day').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  overtimeHours: doublePrecision('overtime_hours').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// 6. Providers Table (Fornecedores)
export const providers = pgTable('providers', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().default('tenant-demo-1'),
  cnpj: text('cnpj').notNull(),
  companyName: text('company_name').notNull(),
  tradeName: text('trade_name'),
  contactName: text('contact_name'),
  phone: text('phone'),
  email: text('email'),
  suppliedProducts: text('supplied_products'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  address: text('address'),
  serviceProvided: text('service_provided'),
});

// 7. Assets Table (Patrimônio)
export const assets = pgTable('assets', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().default('tenant-demo-1'),
  assetNumber: text('asset_number').notNull(),
  serialNumber: text('serial_number').notNull(),
  category: text('category').notNull(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  providerId: text('provider_id').notNull(),
  providerName: text('provider_name'),
  purchaseDate: text('purchase_date').notNull(),
  purchaseValue: doublePrecision('purchase_value').notNull(),
  warrantyEndDate: text('warranty_end_date').notNull(),
  situation: text('situation').notNull(), // Disponível, Emprestado, etc.
  photoUrl: text('photo_url'),
  notes: text('notes'),
  qrCodeUrl: text('qr_code_url'),
  barcodeValue: text('barcode_value').notNull(),
  createdAt: text('created_at').notNull(),
});

// 8. Asset Allocations Table
export const assetAllocations = pgTable('asset_allocations', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().default('tenant-demo-1'),
  assetId: text('asset_id').notNull(),
  assetNumber: text('asset_number'),
  assetName: text('asset_name'),
  targetType: text('target_type').notNull(), // Funcionário, Cliente, Contrato
  targetId: text('target_id').notNull(),
  targetName: text('target_name'),
  allocationDate: text('allocation_date').notNull(),
  returnDate: text('return_date'),
  expectedReturnDate: text('expected_return_date'),
  registeredBy: text('registered_by').notNull(),
  equipmentCondition: text('equipment_condition').notNull(),
  digitalSignature: text('digital_signature'),
  historyNotes: text('history_notes'),
  createdAt: text('created_at').notNull(),
});

// 9. Maintenances Table
export const maintenances = pgTable('maintenances', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().default('tenant-demo-1'),
  assetId: text('asset_id').notNull(),
  assetNumber: text('asset_number'),
  assetName: text('asset_name'),
  entryDate: text('entry_date').notNull(),
  issueDescription: text('issue_description').notNull(),
  providerId: text('provider_id').notNull(),
  providerName: text('provider_name'),
  cost: doublePrecision('cost').notNull(),
  exitDate: text('exit_date'),
  warrantyEndDate: text('warranty_end_date'),
  attachmentUrl: text('attachment_url'),
  createdAt: text('created_at').notNull(),
});

// 10. Audit Logs Table
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().default('tenant-demo-1'),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  action: text('action').notNull(), // Cadastrar, Editar, etc.
  module: text('module').notNull(),
  details: text('details').notNull(),
  ipAddress: text('ip_address').notNull(),
  beforeState: text('before_state'), // JSON string or text
  afterState: text('after_state'),   // JSON string or text
  createdAt: text('created_at').notNull(),
});

// 11. Notifications Table
export const appNotifications = pgTable('app_notifications', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().default('tenant-demo-1'),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  referenceId: text('reference_id').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: text('created_at').notNull(),
});

// 12. Employee Occurrences Table
export const employeeOccurrences = pgTable('employee_occurrences', {
  id: text('id').notNull(), // Keep original occurrence ID (can have multiple versions)
  tenantId: text('tenant_id').notNull().default('tenant-demo-1'),
  employeeId: text('employee_id').notNull(),
  type: text('type').notNull(),
  date: text('date').notNull(),
  endDate: text('end_date'),
  notes: text('notes'),
  attachmentUrl: text('attachment_url'),
  registeredBy: text('registered_by').notNull(),
  createdAt: text('created_at').notNull(),
  version: integer('version').notNull().default(1),
  
  // Conditional fields
  admissionDate: text('admission_date'),
  role: text('role'),
  department: text('department'),
  unit: text('unit'),
  supervisorId: text('supervisor_id'),
  
  absenceType: text('absence_type'),
  cid: text('cid'),
  
  dismissalDate: text('dismissal_date'),
  dismissalType: text('dismissal_type'),
  motive: text('motive'),
  
  company: text('company'),
  clientId: text('client_id'),
  clientName: text('client_name'),
  postName: text('post_name'),
  
  previousRole: text('previous_role'),
  newRole: text('new_role'),
  previousSalary: doublePrecision('previous_salary'),
  newSalary: doublePrecision('new_salary'),
  
  warningType: text('warning_type'),
  description: text('description'),
  signedDocumentUrl: text('signed_document_url'),
  
  returnDate: text('return_date'),
});
