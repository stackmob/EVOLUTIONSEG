import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Employee, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { EmployeeOccurrences } from '../components/EmployeeOccurrences';
import { uploadDocument, DocumentMetadata } from '../services/storage';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { 
  Users, Search, UserPlus, SlidersHorizontal, Eye, Edit, Trash2, 
  X, Check, AlertCircle, Calendar, Shield, CreditCard, FileText, Upload,
  User, Phone, MapPin, Briefcase, ChevronRight, ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EmployeesProps {
  openDetailId: { type: string; id: string } | null;
  setOpenDetailId: (val: { type: string; id: string } | null) => void;
}

export const Employees: React.FC<EmployeesProps> = ({ openDetailId, setOpenDetailId }) => {
  const { user: loggedUser, role: loggedRole, hasPermission } = useAuth();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filterSituation, setFilterSituation] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [formTab, setFormTab] = useState<'pessoais' | 'contato' | 'profissional' | 'financeiro_docs'>('pessoais');
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'cadastro' | 'historico'>('cadastro');
  const [activeViewDoc, setActiveViewDoc] = useState<DocumentMetadata | null>(null);

  useEffect(() => {
    if (selectedEmp) {
      setActiveTab('cadastro');
    }
  }, [selectedEmp]);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formRg, setFormRg] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formGender, setFormGender] = useState('Masculino');
  const [formCivilStatus, setFormCivilStatus] = useState('Casado');
  const [formPhoto, setFormPhoto] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('SP');
  const [formCep, setFormCep] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAdmissionDate, setFormAdmissionDate] = useState('');
  const [formRole, setFormRole] = useState('Vigilante');
  const [formFunction, setFormFunction] = useState('Vigilante Patrimonial');
  const [formSupervisor, setFormSupervisor] = useState('');
  const [formScale, setFormScale] = useState('12x36');
  const [formShift, setFormShift] = useState('Diurno');
  const [formSituation, setFormSituation] = useState('Ativo');
  const [formSalary, setFormSalary] = useState(3100);
  const [formBankName, setFormBankName] = useState('Itaú Unibanco');
  const [formBankAgency, setFormBankAgency] = useState('');
  const [formBankAccount, setFormBankAccount] = useState('');
  const [formPix, setFormPix] = useState('');

  // Real document file attachment states
  const [formCnhUrl, setFormCnhUrl] = useState<string | undefined>(undefined);
  const [formVigilanteCourseUrl, setFormVigilanteCourseUrl] = useState<string | undefined>(undefined);
  const [formRecyclingUrl, setFormRecyclingUrl] = useState<string | undefined>(undefined);
  const [formAsoUrl, setFormAsoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadEmployees();
  }, []);

  // Listen to external opening from global search or notification click!
  useEffect(() => {
    if (openDetailId && openDetailId.type === 'Funcionário') {
      const target = db.getEmployees().find(e => e.id === openDetailId.id);
      if (target) {
        setSelectedEmp(target);
      }
      setOpenDetailId(null);
    }
  }, [openDetailId]);

  const loadEmployees = () => {
    setEmployees(db.getEmployees());
  };

  const handleOpenForm = (emp: Employee | null = null) => {
    setFormTab('pessoais');
    if (emp) {
      setEditingEmp(emp);
      setFormName(emp.name);
      setFormCpf(emp.cpf);
      setFormRg(emp.rg);
      setFormBirthDate(emp.birthDate);
      setFormGender(emp.gender);
      setFormCivilStatus(emp.civilStatus);
      setFormPhoto(emp.photoUrl || '');
      setFormAddress(emp.address);
      setFormCity(emp.city);
      setFormState(emp.state);
      setFormCep(emp.cep);
      setFormPhone(emp.phone);
      setFormWhatsapp(emp.whatsapp);
      setFormEmail(emp.email);
      setFormAdmissionDate(emp.admissionDate);
      setFormRole(emp.role);
      setFormFunction(emp.function);
      setFormSupervisor(emp.supervisorId || '');
      setFormScale(emp.scaleType);
      setFormShift(emp.shift);
      setFormSituation(emp.situation);
      setFormSalary(emp.salary);
      setFormBankName(emp.bankName);
      setFormBankAgency(emp.bankAgency);
      setFormBankAccount(emp.bankAccount);
      setFormPix(emp.pixKey);
      
      setFormCnhUrl(emp.cnhUrl);
      setFormVigilanteCourseUrl(emp.vigilanteCourseUrl);
      setFormRecyclingUrl(emp.recyclingUrl);
      setFormAsoUrl(emp.asoUrl);
    } else {
      setEditingEmp(null);
      setFormName('');
      setFormCpf('');
      setFormRg('');
      setFormBirthDate('');
      setFormGender('Masculino');
      setFormCivilStatus('Solteiro');
      setFormPhoto('');
      setFormAddress('');
      setFormCity('');
      setFormState('SP');
      setFormCep('');
      setFormPhone('');
      setFormWhatsapp('');
      setFormEmail('');
      setFormAdmissionDate(new Date().toISOString().split('T')[0]);
      setFormRole('Vigilante');
      setFormFunction('Vigilante Patrimonial');
      setFormSupervisor('');
      setFormScale('12x36');
      setFormShift('Diurno');
      setFormSituation('Ativo');
      setFormSalary(3100);
      setFormBankName('Itaú Unibanco');
      setFormBankAgency('');
      setFormBankAccount('');
      setFormPix('');
      
      setFormCnhUrl(undefined);
      setFormVigilanteCourseUrl(undefined);
      setFormRecyclingUrl(undefined);
      setFormAsoUrl(undefined);
    }
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCpf || !formEmail) {
      toast.error('Preencha os campos obrigatórios: Nome, CPF e E-mail.');
      return;
    }

    const list = [...employees];
    const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };

    if (editingEmp) {
      // Update
      const beforeState = { ...editingEmp };
      const index = list.findIndex(emp => emp.id === editingEmp.id);
      const updated: Employee = {
        ...editingEmp,
        name: formName,
        cpf: formCpf,
        rg: formRg,
        birthDate: formBirthDate,
        gender: formGender,
        civilStatus: formCivilStatus,
        photoUrl: formPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        address: formAddress,
        city: formCity,
        state: formState,
        cep: formCep,
        phone: formPhone,
        whatsapp: formWhatsapp,
        email: formEmail,
        admissionDate: formAdmissionDate,
        role: formRole,
        function: formFunction,
        supervisorId: formSupervisor || undefined,
        scaleType: formScale,
        shift: formShift as any,
        situation: db.getEmployeeOccurrences(editingEmp.id).length > 0 ? editingEmp.situation : 'A Definir',
        salary: Number(formSalary),
        bankName: formBankName,
        bankAgency: formBankAgency,
        bankAccount: formBankAccount,
        pixKey: formPix,
        cnhUrl: formCnhUrl,
        vigilanteCourseUrl: formVigilanteCourseUrl,
        recyclingUrl: formRecyclingUrl,
        asoUrl: formAsoUrl,
      };

      list[index] = updated;
      db.saveEmployees(list, operator);
      db.audit(operator, 'Editar', 'Employees', `Atualizou dados cadastrais do funcionário ${formName}`, beforeState, updated);
      toast.success('Funcionário atualizado com sucesso!');
    } else {
      // Create
      const newId = `emp-${Date.now()}`;
      const newEmp: Employee = {
        id: newId,
        name: formName,
        cpf: formCpf,
        rg: formRg,
        birthDate: formBirthDate,
        gender: formGender,
        civilStatus: formCivilStatus,
        photoUrl: formPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        address: formAddress,
        city: formCity,
        state: formState,
        cep: formCep,
        phone: formPhone,
        whatsapp: formWhatsapp,
        email: formEmail,
        admissionDate: formAdmissionDate,
        role: formRole,
        function: formFunction,
        supervisorId: formSupervisor || undefined,
        scaleType: formScale,
        shift: formShift as any,
        situation: 'A Definir',
        salary: Number(formSalary),
        bankName: formBankName,
        bankAgency: formBankAgency,
        bankAccount: formBankAccount,
        pixKey: formPix,
        cnhUrl: formCnhUrl,
        vigilanteCourseUrl: formVigilanteCourseUrl,
        recyclingUrl: formRecyclingUrl,
        asoUrl: formAsoUrl,
        createdAt: new Date().toISOString(),
      };

      list.push(newEmp);
      db.saveEmployees(list, operator);
      db.audit(operator, 'Cadastrar', 'Employees', `Cadastrou o novo funcionário ${formName}`, null, newEmp);

      // Automatically register initial Admissão occurrence
      const occs = db.getOccurrences();
      occs.push({
        id: `occ-${Date.now()}`,
        employeeId: newId,
        type: 'Admissão',
        date: formAdmissionDate || new Date().toISOString().split('T')[0],
        admissionDate: formAdmissionDate || new Date().toISOString().split('T')[0],
        role: formRole,
        department: 'Operações',
        unit: 'Sede Central',
        supervisorId: formSupervisor || undefined,
        notes: 'Admissão registrada automaticamente ao cadastrar funcionário.',
        registeredBy: loggedUser?.name || 'Sistema',
        createdAt: new Date().toISOString(),
        version: 1,
      });
      db.saveOccurrences(occs);
      db.applyOccurrenceSideEffects(newId, operator);
      toast.success('Novo funcionário cadastrado com sucesso!');
    }

    loadEmployees();
    setShowForm(false);
  };

  const handleDelete = (emp: Employee) => {
    if (!hasPermission('employees', 'delete')) {
      toast.error('Seu perfil atual não permite excluir funcionários.');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir permanentemente o funcionário ${emp.name}?`)) {
      const filtered = employees.filter(e => e.id !== emp.id);
      const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };
      
      db.saveEmployees(filtered, operator);
      db.audit(operator, 'Excluir', 'Employees', `Excluiu o cadastro do funcionário ${emp.name}`, emp, null);
      toast.success('Cadastro excluído com sucesso.');
      loadEmployees();
      if (selectedEmp?.id === emp.id) setSelectedEmp(null);
    }
  };

  // Filter lists based on UI controls
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.cpf.includes(searchQuery) || 
                          emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSituation = filterSituation === 'all' || emp.situation === filterSituation;
    const matchesRole = filterRole === 'all' || emp.role === filterRole;

    return matchesSearch && matchesSituation && matchesRole;
  });

  const supervisors = employees.filter(e => e.role === 'Supervisor' || e.role === 'Administrador');

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Gestão de Funcionários</h1>
          <p className="text-xs text-gray-500 mt-1">Cadastro de dados pessoais, exames médicos, banco e certificados regulamentares PF/ANATEL.</p>
        </div>
        
        {hasPermission('employees', 'create') && (
          <button 
            id="btn-add-employee"
            onClick={() => handleOpenForm(null)}
            className="btn btn-primary flex items-center gap-2 cursor-pointer shadow-sm text-xs"
          >
            <UserPlus className="w-4 h-4" /> Cadastrar Vigilante / Efetivo
          </button>
        )}
      </div>

      {/* FILTER AND SEARCH CONTROLS */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input 
            id="employee-search-box"
            type="text" 
            placeholder="Pesquisar por nome, CPF ou cargo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9"
          />
        </div>

        {/* Filter selects */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
            <select 
              id="filter-employee-situation"
              value={filterSituation} 
              onChange={(e) => setFilterSituation(e.target.value)}
              className="form-input py-1 text-xs"
            >
              <option value="all">Todas Situações</option>
              <option value="Ativo">Ativo</option>
              <option value="Afastado">Afastado</option>
              <option value="Férias">Em Férias</option>
              <option value="Demitido">Demitido</option>
            </select>
          </div>

          <select 
            id="filter-employee-role"
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="form-input py-1 text-xs"
          >
            <option value="all">Todos Cargos</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Vigilante">Vigilante</option>
            <option value="RH">Recursos Humanos</option>
            <option value="Operador">Operador</option>
          </select>
        </div>
      </div>

      {/* LIST OR WIZARD GRID VIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* MAIN LIST OF EMPLOYEES (Left 2/3) */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Efetivo / Guarda</th>
                    <th className="px-5 py-3.5">Função</th>
                    <th className="px-5 py-3.5">Escala / Turno</th>
                    <th className="px-5 py-3.5">Situação</th>
                    <th className="px-5 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-xs text-gray-400">
                        Nenhum funcionário cadastrado correspondente aos filtros atuais.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-blue-50/5 transition-colors duration-150">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={emp.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                              alt={emp.name} 
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-xs text-gray-900 leading-tight">{emp.name}</span>
                              <span className="text-xxs text-gray-400 mt-0.5 leading-none">CPF: {emp.cpf}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col text-left">
                            <span className="text-xs text-gray-700 font-semibold">{emp.role}</span>
                            <span className="text-xxs text-gray-400 mt-0.5 leading-none">{emp.function}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col text-left">
                            <span className="text-xs text-gray-700 font-medium">{emp.scaleType}</span>
                            <span className="text-xxs text-gray-400 mt-0.5 leading-none">{emp.shift}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-bold uppercase ${
                            emp.situation === 'Ativo' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : emp.situation === 'Afastado' 
                                ? 'bg-orange-50 text-orange-800' 
                                : emp.situation === 'Férias'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-red-50 text-red-700'
                          }`}>
                            {emp.situation}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => setSelectedEmp(emp)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-950"
                              title="Visualizar Detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {hasPermission('employees', 'update') && (
                              <button 
                                onClick={() => handleOpenForm(emp)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"
                                title="Editar Cadastro"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            
                            {hasPermission('employees', 'delete') && (
                              <button 
                                onClick={() => handleDelete(emp)}
                                className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                                title="Excluir Registro"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* DETAILS DRAWER COLUMN (Right 1/3) */}
        <div className="xl:col-span-1">
          {selectedEmp ? (
            <div id="employee-details-drawer" className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5 sticky top-20 text-left relative overflow-hidden">
              <button 
                onClick={() => setSelectedEmp(null)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-150 rounded-full text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center border-b border-gray-100 pb-4">
                <img 
                  src={selectedEmp.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                  alt={selectedEmp.name} 
                  className="w-18 h-18 rounded-full border-2 border-blue-600 object-cover shadow-sm mb-3"
                />
                <h3 className="font-extrabold text-sm text-gray-900 leading-tight">{selectedEmp.name}</h3>
                <span className="text-xxs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase mt-1">
                  {selectedEmp.role}
                </span>
                <span className="text-xxxxs text-gray-400 mt-2">Admissão: {selectedEmp.admissionDate}</span>
              </div>

              {/* TAB SELECTORS */}
              <div className="flex border-b border-gray-100 pb-1.5 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('cadastro')}
                  className={`flex-1 py-1.5 text-center text-xxs font-bold uppercase border-b-2 transition-all cursor-pointer ${
                    activeTab === 'cadastro'
                      ? 'border-blue-600 text-blue-700 font-extrabold'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Cadastro & Docs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('historico')}
                  className={`flex-1 py-1.5 text-center text-xxs font-bold uppercase border-b-2 transition-all cursor-pointer ${
                    activeTab === 'historico'
                      ? 'border-blue-600 text-blue-700 font-extrabold'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Histórico Funcional
                </button>
              </div>

              {activeTab === 'cadastro' && (
                <>
                  {/* Personal details */}
                  <div className="space-y-3">
                    <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-50 pb-1">
                      <Shield className="w-3.5 h-3.5" /> Dados Pessoais e Contato
                    </h4>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                      <div>
                        <span className="text-xxs text-gray-400">CPF:</span>
                        <p className="font-semibold text-gray-800">{selectedEmp.cpf}</p>
                      </div>
                      <div>
                        <span className="text-xxs text-gray-400">RG:</span>
                        <p className="font-semibold text-gray-800">{selectedEmp.rg}</p>
                      </div>
                      <div>
                        <span className="text-xxs text-gray-400">Nascimento:</span>
                        <p className="font-semibold text-gray-800">{selectedEmp.birthDate}</p>
                      </div>
                      <div>
                        <span className="text-xxs text-gray-400">Estado Civil:</span>
                        <p className="font-semibold text-gray-800">{selectedEmp.civilStatus}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xxs text-gray-400">E-mail:</span>
                        <p className="font-semibold text-gray-800 truncate">{selectedEmp.email}</p>
                      </div>
                      <div>
                        <span className="text-xxs text-gray-400">Telefone:</span>
                        <p className="font-semibold text-gray-800">{selectedEmp.phone}</p>
                      </div>
                      <div>
                        <span className="text-xxs text-gray-400">Cidade/Estado:</span>
                        <p className="font-semibold text-gray-800">{selectedEmp.city} - {selectedEmp.state}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-3">
                    <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-50 pb-1">
                      <CreditCard className="w-3.5 h-3.5" /> Dados Financeiros e PIX
                    </h4>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                      <div>
                        <span className="text-xxs text-gray-400">Banco:</span>
                        <p className="font-semibold text-gray-800">{selectedEmp.bankName}</p>
                      </div>
                      <div>
                        <span className="text-xxs text-gray-400">Ag/Conta:</span>
                        <p className="font-semibold text-gray-800">{selectedEmp.bankAgency} / {selectedEmp.bankAccount}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xxs text-gray-400">Chave PIX:</span>
                        <p className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded truncate text-xxs font-mono">{selectedEmp.pixKey || 'Não cadastrada'}</p>
                      </div>
                      <div>
                        <span className="text-xxs text-gray-400">Salário:</span>
                        <p className="font-bold text-gray-800 text-sm">R$ {selectedEmp.salary.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                      </div>
                    </div>
                  </div>

                  {/* Attached docs */}
                  <div className="space-y-3">
                    <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-50 pb-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" /> Documentos Regulamentares (Polícia Federal)
                    </h4>
                    <div className="space-y-2">
                      {[
                        { label: 'CNH do Condutor', value: selectedEmp.cnhUrl, docKey: 'cnhUrl' as const },
                        { label: 'Curso de Vigilante (PF)', value: selectedEmp.vigilanteCourseUrl, docKey: 'vigilanteCourseUrl' as const },
                        { label: 'Reciclagem Válida', value: selectedEmp.recyclingUrl, docKey: 'recyclingUrl' as const },
                        { label: 'Atestado Saúde (ASO)', value: selectedEmp.asoUrl, docKey: 'asoUrl' as const },
                      ].map((doc, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs">
                          <span className="text-gray-800 font-medium">{doc.label}</span>
                          <div className="flex items-center gap-2">
                            {doc.value && (
                              <button
                                type="button"
                                onClick={() => setActiveViewDoc({
                                  id: `doc-emp-${idx}`,
                                  fileName: `${doc.label}.pdf`,
                                  fileUrl: doc.value!,
                                  fileSize: 1024 * 520,
                                  formattedSize: '520 KB',
                                  mimeType: 'application/pdf',
                                  uploadedAt: new Date().toISOString()
                                })}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xxs font-bold flex items-center gap-1 cursor-pointer hover:bg-emerald-100"
                              >
                                <Eye className="w-3 h-3 text-emerald-600" /> Ver / Baixar
                              </button>
                            )}
                            <label className="px-2.5 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg text-xxs font-bold flex items-center gap-1 cursor-pointer hover:bg-cyan-100">
                              <Upload className="w-3 h-3 text-cyan-600" /> {doc.value ? 'Trocar Anexo' : 'Anexar Físico'}
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    toast.loading('Enviando documento...', { id: 'upload-emp-doc' });
                                    try {
                                      const meta = await uploadDocument(file, 'employee-docs');
                                      db.updateEmployee(selectedEmp.id, { [doc.docKey]: meta.fileUrl });
                                      loadEmployees();
                                      const updated = db.getEmployees().find(emp => emp.id === selectedEmp.id);
                                      if (updated) setSelectedEmp(updated);
                                      toast.success(`Documento "${doc.label}" anexado com sucesso!`, { id: 'upload-emp-doc' });
                                    } catch (err) {
                                      toast.error('Erro ao enviar documento.', { id: 'upload-emp-doc' });
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'historico' && (
                <EmployeeOccurrences 
                  employee={selectedEmp} 
                  onOccurrenceAdded={() => {
                    loadEmployees();
                    const updated = db.getEmployees().find(e => e.id === selectedEmp.id);
                    if (updated) setSelectedEmp(updated);
                  }}
                />
              )}

            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center text-xs text-gray-400 sticky top-20">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              Selecione um funcionário da lista para exibir seus detalhes cadastrais operacionais completos, documentos e PIX.
            </div>
          )}
        </div>

      </div>

      {/* CREATION/EDIT POPUP DIALOG FORM */}
      {showForm && (
        <div id="employee-modal-overlay" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 bg-gray-950 text-white flex items-center justify-between border-b border-gray-900">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                {editingEmp ? `Editar Cadastro: ${editingEmp.name}` : 'Cadastrar Vigilante / Efetivo'}
              </h3>
              <button 
                onClick={() => setShowForm(false)} 
                className="p-1 hover:bg-gray-900 rounded-full text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 gap-2 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormTab('pessoais')}
                className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-bold transition-all cursor-pointer whitespace-nowrap ${
                  formTab === 'pessoais'
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <User className="w-4 h-4" />
                1. Dados Pessoais
              </button>

              <button
                type="button"
                onClick={() => setFormTab('contato')}
                className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-bold transition-all cursor-pointer whitespace-nowrap ${
                  formTab === 'contato'
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Phone className="w-4 h-4" />
                2. Contato & Endereço
              </button>

              <button
                type="button"
                onClick={() => setFormTab('profissional')}
                className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-bold transition-all cursor-pointer whitespace-nowrap ${
                  formTab === 'profissional'
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                3. Profissional
              </button>

              <button
                type="button"
                onClick={() => setFormTab('financeiro_docs')}
                className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-bold transition-all cursor-pointer whitespace-nowrap ${
                  formTab === 'financeiro_docs'
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                4. Financeiro & Docs
              </button>
            </div>

            {/* Form scrollable fields per active tab */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
              
              {/* TAB 1: Dados Pessoais */}
              {formTab === 'pessoais' && (
                <div className="space-y-4">
                  <h4 className="text-xxs font-extrabold text-blue-600 uppercase tracking-widest border-b border-gray-100 pb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Informações de Identificação
                  </h4>
                  
                  <div>
                    <label className="form-label text-xxs font-semibold">Nome Completo *</label>
                    <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="form-input" placeholder="Ex: Roberto Silva" required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-xxs font-semibold">CPF *</label>
                      <input type="text" value={formCpf} onChange={e => setFormCpf(e.target.value)} className="form-input" placeholder="000.000.000-00" required />
                    </div>
                    <div>
                      <label className="form-label text-xxs font-semibold">RG</label>
                      <input type="text" value={formRg} onChange={e => setFormRg(e.target.value)} className="form-input" placeholder="00.000.000-0" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-xxs font-semibold">Data de Nascimento</label>
                      <input type="date" value={formBirthDate} onChange={e => setFormBirthDate(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label text-xxs font-semibold">Sexo</label>
                      <select value={formGender} onChange={e => setFormGender(e.target.value)} className="form-input">
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-xxs font-semibold">Estado Civil</label>
                      <select value={formCivilStatus} onChange={e => setFormCivilStatus(e.target.value)} className="form-input">
                        <option value="Solteiro">Solteiro</option>
                        <option value="Casado">Casado</option>
                        <option value="Divorciado">Divorciado</option>
                        <option value="Viúvo">Viúvo</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label text-xxs font-semibold">URL da Foto de Perfil</label>
                      <input type="text" value={formPhoto} onChange={e => setFormPhoto(e.target.value)} className="form-input" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Contato & Endereço */}
              {formTab === 'contato' && (
                <div className="space-y-4">
                  <h4 className="text-xxs font-extrabold text-blue-600 uppercase tracking-widest border-b border-gray-100 pb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Meios de Contato e Localização
                  </h4>
                  
                  <div>
                    <label className="form-label text-xxs font-semibold">E-mail Corporativo / Pessoal *</label>
                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="form-input" placeholder="roberto@evolution.com" required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-xxs font-semibold">Telefone Principal</label>
                      <input type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="form-input" placeholder="(11) 90000-0000" />
                    </div>
                    <div>
                      <label className="form-label text-xxs font-semibold">WhatsApp</label>
                      <input type="text" value={formWhatsapp} onChange={e => setFormWhatsapp(e.target.value)} className="form-input" placeholder="(11) 90000-0000" />
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-xxs font-semibold">Endereço Residencial</label>
                    <input type="text" value={formAddress} onChange={e => setFormAddress(e.target.value)} className="form-input" placeholder="Rua, Número, Bairro" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="form-label text-xxs font-semibold">Cidade</label>
                      <input type="text" value={formCity} onChange={e => setFormCity(e.target.value)} className="form-input" placeholder="São Paulo" />
                    </div>
                    <div>
                      <label className="form-label text-xxs font-semibold">UF</label>
                      <input type="text" value={formState} onChange={e => setFormState(e.target.value)} className="form-input" placeholder="SP" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Profissional */}
              {formTab === 'profissional' && (
                <div className="space-y-4">
                  <h4 className="text-xxs font-extrabold text-blue-600 uppercase tracking-widest border-b border-gray-100 pb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Função Operacional & Escala
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-xxs font-semibold">Data Admissão</label>
                      <input type="date" value={formAdmissionDate} onChange={e => setFormAdmissionDate(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label text-xxs font-semibold">Função Específica</label>
                      <input type="text" value={formFunction} onChange={e => setFormFunction(e.target.value)} className="form-input" placeholder="Vigilante Patrimonial" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-xxs font-semibold">Cargo Hierárquico</label>
                      <select value={formRole} onChange={e => setFormRole(e.target.value)} className="form-input">
                        <option value="Vigilante">Vigilante</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Operador">Operador</option>
                        <option value="RH">RH / Administração</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label text-xxs font-semibold">Salário (R$)</label>
                      <input type="number" value={formSalary} onChange={e => setFormSalary(Number(e.target.value))} className="form-input" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="form-label text-xxs font-semibold">Escala</label>
                      <select value={formScale} onChange={e => setFormScale(e.target.value)} className="form-input">
                        <option value="12x36">12x36</option>
                        <option value="5x2">5x2</option>
                        <option value="6x1">6x1</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label text-xxs font-semibold">Turno</label>
                      <select value={formShift} onChange={e => setFormShift(e.target.value)} className="form-input">
                        <option value="Diurno">Diurno</option>
                        <option value="Noturno">Noturno</option>
                        <option value="Matutino">Matutino</option>
                        <option value="Vespertino">Vespertino</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label text-xxs font-semibold">Situação</label>
                      <div className="bg-gray-100 text-gray-700 p-2.5 rounded-lg text-xs font-bold border border-gray-200 cursor-not-allowed">
                        {editingEmp ? (db.getEmployeeOccurrences(editingEmp.id).length > 0 ? editingEmp.situation : 'A Definir') : 'A Definir'}
                        <span className="text-xxxxs font-normal text-gray-400 block mt-0.5 uppercase tracking-wider">Gerido via Ocorrências</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Financeiro & Documentos */}
              {formTab === 'financeiro_docs' && (
                <div className="space-y-4">
                  <h4 className="text-xxs font-extrabold text-blue-600 uppercase tracking-widest border-b border-gray-100 pb-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> Pagamento & Documentos Regulamentares
                  </h4>
                  
                  <div>
                    <label className="form-label text-xxs font-semibold">Banco Depositário</label>
                    <input type="text" value={formBankName} onChange={e => setFormBankName(e.target.value)} className="form-input" placeholder="Ex: Itaú Unibanco" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-xxs font-semibold">Agência Bancária</label>
                      <input type="text" value={formBankAgency} onChange={e => setFormBankAgency(e.target.value)} className="form-input" placeholder="0000" />
                    </div>
                    <div>
                      <label className="form-label text-xxs font-semibold">Conta Corrente</label>
                      <input type="text" value={formBankAccount} onChange={e => setFormBankAccount(e.target.value)} className="form-input" placeholder="00000-0" />
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-xxs font-semibold">Chave PIX</label>
                    <input type="text" value={formPix} onChange={e => setFormPix(e.target.value)} className="form-input" placeholder="Chave celular / email / CPF" />
                  </div>

                  {/* Upload de Documentos Regulamentares */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <span className="form-label text-xxs font-semibold block mb-1">Anexo de Documentos Regulamentares (Clique para abrir janela de arquivos)</span>
                    
                    <div className="grid grid-cols-2 gap-2 text-xxxxs">
                      {[
                        { label: 'CNH Condutor', val: formCnhUrl, setter: setFormCnhUrl },
                        { label: 'Curso Vigilante', val: formVigilanteCourseUrl, setter: setFormVigilanteCourseUrl },
                        { label: 'Reciclagem Válida', val: formRecyclingUrl, setter: setFormRecyclingUrl },
                        { label: 'ASO Ocupacional', val: formAsoUrl, setter: setFormAsoUrl },
                      ].map((item, i) => (
                        <label 
                          key={i}
                          className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all hover:border-blue-400 ${
                            item.val ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <Upload className="w-3.5 h-3.5 text-blue-600 shrink-0" /> 
                            <span className="truncate">{item.label}</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-xxxxs shrink-0 ${item.val ? 'bg-emerald-200 text-emerald-900 font-bold' : 'bg-gray-200 text-gray-500'}`}>
                            {item.val ? 'Anexado' : 'Selecionar'}
                          </span>
                          <input 
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                toast.loading(`Enviando ${item.label}...`, { id: `upload-form-${i}` });
                                try {
                                  const meta = await uploadDocument(file, 'employee-docs');
                                  item.setter(meta.fileUrl);
                                  toast.success(`Documento "${item.label}" anexado com sucesso!`, { id: `upload-form-${i}` });
                                } catch (err) {
                                  toast.error('Erro ao anexar arquivo.', { id: `upload-form-${i}` });
                                }
                              }
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal controls footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  {formTab !== 'pessoais' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (formTab === 'contato') setFormTab('pessoais');
                        else if (formTab === 'profissional') setFormTab('contato');
                        else if (formTab === 'financeiro_docs') setFormTab('profissional');
                      }}
                      className="btn btn-secondary text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>
                  )}
                  {formTab !== 'financeiro_docs' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (formTab === 'pessoais') setFormTab('contato');
                        else if (formTab === 'contato') setFormTab('profissional');
                        else if (formTab === 'profissional') setFormTab('financeiro_docs');
                      }}
                      className="btn btn-secondary text-xs flex items-center gap-1 cursor-pointer text-blue-600 font-bold"
                    >
                      Próximo <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="btn btn-secondary cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary cursor-pointer text-white px-6 bg-blue-600 hover:bg-blue-700 font-bold"
                  >
                    Salvar Cadastro
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DOCUMENT VIEWER & DOWNLOAD MODAL */}
      <DocumentViewerModal
        document={activeViewDoc}
        onClose={() => setActiveViewDoc(null)}
      />

    </div>
  );
};
