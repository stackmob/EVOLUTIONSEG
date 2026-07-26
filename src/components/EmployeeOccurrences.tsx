import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Employee, EmployeeOccurrence, Client } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, User, Plus, Edit2, Clock, FileText, CheckCircle, 
  AlertCircle, AlertTriangle, ChevronDown, X, ShieldAlert, TrendingUp, RefreshCw, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EmployeeOccurrencesProps {
  employee: Employee;
  onOccurrenceAdded: () => void;
}

export const EmployeeOccurrences: React.FC<EmployeeOccurrencesProps> = ({ employee, onOccurrenceAdded }) => {
  const { user: loggedUser, role: loggedRole } = useAuth();
  const [occurrences, setOccurrences] = useState<EmployeeOccurrence[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [supervisors, setSupervisors] = useState<Employee[]>([]);
  
  // Modal Control
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOcc, setEditingOcc] = useState<EmployeeOccurrence | null>(null);

  // Form Fields State
  const [type, setType] = useState<EmployeeOccurrence['type']>('Afastamento');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  
  // Specific Fields
  const [admissionDate, setAdmissionDate] = useState('');
  const [occRole, setOccRole] = useState('Vigilante');
  const [department, setDepartment] = useState('Operações');
  const [unit, setUnit] = useState('Sede Central');
  const [supervisorId, setSupervisorId] = useState('');
  
  const [absenceType, setAbsenceType] = useState<EmployeeOccurrence['absenceType']>('Licença Médica');
  const [cid, setCid] = useState('');
  
  const [dismissalDate, setDismissalDate] = useState('');
  const [dismissalType, setDismissalType] = useState<EmployeeOccurrence['dismissalType']>('Sem Justa Causa');
  const [motive, setMotive] = useState('');
  
  const [company, setCompany] = useState('Evolution Segurança');
  const [clientId, setClientId] = useState('');
  const [postName, setPostName] = useState('');
  
  const [previousRole, setPreviousRole] = useState('');
  const [newRole, setNewRole] = useState('Supervisor');
  const [previousSalary, setPreviousSalary] = useState(0);
  const [newSalary, setNewSalary] = useState(0);
  
  const [warningType, setWarningType] = useState('Escrita');
  const [warningDescription, setWarningDescription] = useState('');
  const [signedDoc, setSignedDoc] = useState(false);
  
  const [returnDate, setReturnDate] = useState('');

  const loadData = () => {
    setOccurrences(db.getEmployeeOccurrences(employee.id));
    setClients(db.getClients());
    setSupervisors(db.getEmployees().filter(e => e.role === 'Supervisor' || e.role === 'Administrador'));
  };

  useEffect(() => {
    loadData();
  }, [employee.id]);

  const resetForm = () => {
    setIsEditing(false);
    setEditingOcc(null);
    setType('Afastamento');
    setDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setNotes('');
    setAttachmentName('');
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setOccRole(employee.role);
    setDepartment('Operações');
    setUnit('Sede Central');
    setSupervisorId(employee.supervisorId || '');
    setAbsenceType('Licença Médica');
    setCid('');
    setDismissalDate(new Date().toISOString().split('T')[0]);
    setDismissalType('Sem Justa Causa');
    setMotive('');
    setCompany('Evolution Segurança');
    setClientId('');
    setPostName('');
    setPreviousRole(employee.role);
    setNewRole('Supervisor');
    setPreviousSalary(employee.salary);
    setNewSalary(employee.salary + 500);
    setWarningType('Escrita');
    setWarningDescription('');
    setSignedDoc(false);
    setReturnDate('');
  };

  const handleOpenNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (occ: EmployeeOccurrence) => {
    resetForm();
    setIsEditing(true);
    setEditingOcc(occ);
    
    setType(occ.type);
    setDate(occ.date);
    setEndDate(occ.endDate || '');
    setNotes(occ.notes || '');
    setAttachmentName(occ.attachmentUrl || '');
    
    setAdmissionDate(occ.admissionDate || '');
    setOccRole(occ.role || '');
    setDepartment(occ.department || '');
    setUnit(occ.unit || '');
    setSupervisorId(occ.supervisorId || '');
    
    setAbsenceType(occ.absenceType || 'Licença Médica');
    setCid(occ.cid || '');
    
    setDismissalDate(occ.dismissalDate || '');
    setDismissalType(occ.dismissalType || 'Sem Justa Causa');
    setMotive(occ.motive || '');
    
    setCompany(occ.company || '');
    setClientId(occ.clientId || '');
    setPostName(occ.postName || '');
    
    setPreviousRole(occ.previousRole || '');
    setNewRole(occ.newRole || '');
    setPreviousSalary(occ.previousSalary || 0);
    setNewSalary(occ.newSalary || 0);
    
    setWarningType(occ.warningType || 'Escrita');
    setWarningDescription(occ.description || '');
    setSignedDoc(!!occ.signedDocumentUrl);
    setReturnDate(occ.returnDate || '');
    
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('Informe a data do evento.');
      return;
    }

    const occList = db.getOccurrences();
    const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };

    // Find custom selected client name
    const clientName = clientId ? clients.find(c => c.id === clientId)?.companyName : undefined;

    if (isEditing && editingOcc) {
      // Create a NEW VERSION of this occurrence
      const newVersionNum = editingOcc.version + 1;
      
      const updatedOcc: EmployeeOccurrence = {
        id: editingOcc.id, // Keep original ID
        employeeId: employee.id,
        type,
        date,
        endDate: (type === 'Afastamento' || type === 'Suspensão') ? endDate || undefined : undefined,
        notes,
        attachmentUrl: attachmentName ? attachmentName : undefined,
        registeredBy: `${operator.name} (${operator.role})`,
        createdAt: new Date().toISOString(),
        version: newVersionNum, // Increment version
        
        // Conditional fields
        admissionDate: type === 'Admissão' ? admissionDate : undefined,
        role: type === 'Admissão' ? occRole : undefined,
        department: type === 'Admissão' ? department : undefined,
        unit: type === 'Admissão' ? unit : undefined,
        supervisorId: (type === 'Admissão' || type === 'Transferência') ? supervisorId : undefined,
        
        absenceType: type === 'Afastamento' ? absenceType : undefined,
        cid: type === 'Afastamento' ? cid : undefined,
        
        dismissalDate: type === 'Demissão' ? dismissalDate : undefined,
        dismissalType: type === 'Demissão' ? dismissalType : undefined,
        motive: type === 'Demissão' ? motive : undefined,
        
        company: type === 'Transferência' ? company : undefined,
        clientId: type === 'Transferência' ? clientId : undefined,
        clientName: type === 'Transferência' ? clientName : undefined,
        postName: type === 'Transferência' ? postName : undefined,
        
        previousRole: type === 'Promoção' ? previousRole : undefined,
        newRole: type === 'Promoção' ? newRole : undefined,
        previousSalary: type === 'Promoção' ? previousSalary : undefined,
        newSalary: type === 'Promoção' ? newSalary : undefined,
        
        warningType: type === 'Advertência' ? warningType : undefined,
        description: type === 'Advertência' ? warningDescription : undefined,
        signedDocumentUrl: (type === 'Advertência' && signedDoc) ? 'doc_assinado.pdf' : undefined,
        
        returnDate: type === 'Retorno ao Trabalho' ? returnDate : undefined,
      };

      occList.push(updatedOcc); // Push the new version (keeping old version intact in db for audit logs)
      db.saveOccurrences(occList);
      db.applyOccurrenceSideEffects(employee.id, operator);
      
      db.audit(
        operator,
        'Editar',
        'Employees',
        `Corrigiu ocorrência funcional de ${employee.name} (Gerada Versão ${newVersionNum})`,
        editingOcc,
        updatedOcc
      );
      
      toast.success(`Ocorrência corrigida com sucesso! Nova Versão ${newVersionNum} registrada.`);
    } else {
      // Create fresh occurrence
      const newOcc: EmployeeOccurrence = {
        id: `occ-${Date.now()}`,
        employeeId: employee.id,
        type,
        date,
        endDate: (type === 'Afastamento' || type === 'Suspensão') ? endDate || undefined : undefined,
        notes,
        attachmentUrl: attachmentName ? attachmentName : undefined,
        registeredBy: `${operator.name} (${operator.role})`,
        createdAt: new Date().toISOString(),
        version: 1, // Start at version 1
        
        // Conditional fields
        admissionDate: type === 'Admissão' ? admissionDate : undefined,
        role: type === 'Admissão' ? occRole : undefined,
        department: type === 'Admissão' ? department : undefined,
        unit: type === 'Admissão' ? unit : undefined,
        supervisorId: (type === 'Admissão' || type === 'Transferência') ? supervisorId : undefined,
        
        absenceType: type === 'Afastamento' ? absenceType : undefined,
        cid: type === 'Afastamento' ? cid : undefined,
        
        dismissalDate: type === 'Demissão' ? dismissalDate : undefined,
        dismissalType: type === 'Demissão' ? dismissalType : undefined,
        motive: type === 'Demissão' ? motive : undefined,
        
        company: type === 'Transferência' ? company : undefined,
        clientId: type === 'Transferência' ? clientId : undefined,
        clientName: type === 'Transferência' ? clientName : undefined,
        postName: type === 'Transferência' ? postName : undefined,
        
        previousRole: type === 'Promoção' ? previousRole : undefined,
        newRole: type === 'Promoção' ? newRole : undefined,
        previousSalary: type === 'Promoção' ? previousSalary : undefined,
        newSalary: type === 'Promoção' ? newSalary : undefined,
        
        warningType: type === 'Advertência' ? warningType : undefined,
        description: type === 'Advertência' ? warningDescription : undefined,
        signedDocumentUrl: (type === 'Advertência' && signedDoc) ? 'doc_assinado.pdf' : undefined,
        
        returnDate: type === 'Retorno ao Trabalho' ? returnDate : undefined,
      };

      occList.push(newOcc);
      db.saveOccurrences(occList);
      db.applyOccurrenceSideEffects(employee.id, operator);
      
      db.audit(
        operator,
        'Cadastrar',
        'Employees',
        `Registrou nova ocorrência funcional do tipo ${type} para ${employee.name}`,
        null,
        newOcc
      );
      
      toast.success('Ocorrência registrada com sucesso!');
    }

    setShowModal(false);
    loadData();
    onOccurrenceAdded();
  };

  // Group occurrences by ID to identify their latest versions for rendering
  const latestVersionsMap: Record<string, number> = {};
  occurrences.forEach(o => {
    if (!latestVersionsMap[o.id] || o.version > latestVersionsMap[o.id]) {
      latestVersionsMap[o.id] = o.version;
    }
  });

  const getBadgeStyle = (occType: string) => {
    switch (occType) {
      case 'Admissão': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Afastamento': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Demissão': return 'bg-red-50 text-red-800 border-red-200';
      case 'Transferência': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Promoção': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Advertência': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Suspensão': return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Retorno ao Trabalho': return 'bg-teal-50 text-teal-800 border-teal-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Histórico Funcional (Linha do Tempo)
        </h4>
        <button
          onClick={handleOpenNew}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xxs font-bold px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Registrar Ocorrência
        </button>
      </div>

      {occurrences.length === 0 ? (
        <div className="text-center py-6 text-xs text-gray-400">
          Nenhuma ocorrência registrada no histórico deste colaborador.
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
          {occurrences.map((occ) => {
            const isLatestVersion = occ.version === latestVersionsMap[occ.id];
            
            return (
              <div key={`${occ.id}-v${occ.version}`} className="relative">
                {/* Timeline node icon / dot */}
                <span className={`absolute -left-9 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                  isLatestVersion ? 'border-blue-500 text-blue-600 shadow-sm' : 'border-gray-300 text-gray-400'
                }`}>
                  <Calendar className="w-2.5 h-2.5" />
                </span>

                <div className={`p-3.5 rounded-lg border text-xs space-y-2 transition-all ${
                  isLatestVersion 
                    ? 'bg-white border-gray-200 shadow-xs hover:border-gray-300' 
                    : 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-85'
                }`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-xxxxs font-bold uppercase px-2 py-0.5 rounded-full border ${getBadgeStyle(occ.type)}`}>
                        {occ.type}
                      </span>
                      
                      <span className={`text-xxxxs px-1.5 py-0.5 rounded font-mono font-bold ${
                        isLatestVersion ? 'bg-blue-50 text-blue-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        V{occ.version} {isLatestVersion && '• VIGENTE'}
                      </span>
                    </div>

                    {isLatestVersion && (
                      <button
                        onClick={() => handleOpenEdit(occ)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"
                        title="Corrigir Ocorrência (Gera Nova Versão)"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Primary Event Info */}
                  <div className="font-semibold text-gray-900 grid grid-cols-2 gap-y-1 gap-x-2 text-xxs">
                    <div>
                      <span className="text-xxxxs text-gray-400 block font-normal uppercase">Data do Evento</span>
                      {formatDate(occ.date)}
                    </div>
                    {occ.endDate && (
                      <div>
                        <span className="text-xxxxs text-gray-400 block font-normal uppercase">Data Término</span>
                        {formatDate(occ.endDate)}
                      </div>
                    )}

                    {/* Specific conditional render details */}
                    {occ.type === 'Admissão' && (
                      <>
                        <div>
                          <span className="text-xxxxs text-gray-400 block font-normal uppercase">Cargo Atribuído</span>
                          {occ.role || 'Vigilante'}
                        </div>
                        <div>
                          <span className="text-xxxxs text-gray-400 block font-normal uppercase">Unidade/Dept</span>
                          {occ.unit || 'Sede'} ({occ.department || 'Operações'})
                        </div>
                      </>
                    )}

                    {occ.type === 'Afastamento' && (
                      <>
                        <div>
                          <span className="text-xxxxs text-gray-400 block font-normal uppercase">Motivo Afastamento</span>
                          {occ.absenceType}
                        </div>
                        {occ.cid && (
                          <div>
                            <span className="text-xxxxs text-gray-400 block font-normal uppercase">CID</span>
                            <span className="font-mono bg-amber-50 text-amber-900 px-1 py-0.5 rounded text-xxxxs">{occ.cid}</span>
                          </div>
                        )}
                      </>
                    )}

                    {occ.type === 'Demissão' && (
                      <>
                        <div>
                          <span className="text-xxxxs text-gray-400 block font-normal uppercase">Tipo de Desligamento</span>
                          {occ.dismissalType}
                        </div>
                        {occ.motive && (
                          <div className="col-span-2">
                            <span className="text-xxxxs text-gray-400 block font-normal uppercase">Motivo Técnico</span>
                            {occ.motive}
                          </div>
                        )}
                      </>
                    )}

                    {occ.type === 'Transferência' && (
                      <>
                        <div>
                          <span className="text-xxxxs text-gray-400 block font-normal uppercase">Cliente / Destino</span>
                          {occ.clientName || 'Disponível'}
                        </div>
                        <div>
                          <span className="text-xxxxs text-gray-400 block font-normal uppercase">Posto de Trabalho</span>
                          {occ.postName || 'Reserva'}
                        </div>
                      </>
                    )}

                    {occ.type === 'Promoção' && (
                      <>
                        <div>
                          <span className="text-xxxxs text-gray-400 block font-normal uppercase">Cargo Anterior → Novo</span>
                          {occ.previousRole} → <span className="text-blue-700">{occ.newRole}</span>
                        </div>
                        <div>
                          <span className="text-xxxxs text-gray-400 block font-normal uppercase">Novo Salário</span>
                          R$ {occ.newSalary?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </div>
                      </>
                    )}

                    {occ.type === 'Advertência' && (
                      <>
                        <div>
                          <span className="text-xxxxs text-gray-400 block font-normal uppercase">Gravidade / Tipo</span>
                          {occ.warningType}
                        </div>
                        <div className="col-span-2 bg-orange-50/50 p-1.5 rounded border border-orange-100 text-xxxxs text-orange-950">
                          <span className="font-semibold block uppercase">Infração relatada:</span>
                          {occ.description}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Attachment indicator */}
                  {occ.attachmentUrl && (
                    <div className="flex items-center gap-1 text-xxxxs text-blue-600 bg-blue-50/50 p-1 rounded font-medium inline-flex border border-blue-100">
                      <FileText className="w-3.5 h-3.5" />
                      Anexo: {occ.attachmentUrl}
                    </div>
                  )}

                  {occ.notes && (
                    <p className="text-xxxxs text-gray-500 italic bg-gray-50 p-1.5 rounded border border-gray-100">
                      &ldquo;{occ.notes}&rdquo;
                    </p>
                  )}

                  {/* Audit Trail Row */}
                  <div className="pt-1.5 border-t border-gray-50 flex justify-between items-center text-xxxxs text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> Registrado por {occ.registeredBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(occ.createdAt).toLocaleDateString('pt-BR')} {new Date(occ.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPREHENSIVE MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-lg p-5 shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 mb-4">
              {isEditing 
                ? `Corrigir Ocorrência (Gerar Versão ${editingOcc ? editingOcc.version + 1 : 2})` 
                : 'Registrar Nova Ocorrência Funcional'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-gray-700">
              
              {/* Event Type Select */}
              <div>
                <label className="form-label text-xxs font-semibold">Tipo de Ocorrência</label>
                {isEditing ? (
                  <div className="bg-gray-100 p-2 rounded text-xs font-bold border cursor-not-allowed uppercase">
                    {type} <span className="text-xxxxs text-gray-400 font-normal block mt-0.5">Tipo não editável em correção de histórico</span>
                  </div>
                ) : (
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value as any)} 
                    className="form-input"
                  >
                    <option value="Afastamento">Afastamento / Licença / Férias</option>
                    <option value="Demissão">Demissão / Desligamento / Óbito</option>
                    <option value="Transferência">Transferência de Posto/Cliente</option>
                    <option value="Promoção">Promoção / Alteração de Cargo</option>
                    <option value="Advertência">Advertência / Medida Disciplinar</option>
                    <option value="Suspensão">Suspensão Operacional</option>
                    <option value="Retorno ao Trabalho">Retorno ao Trabalho</option>
                    <option value="Admissão">Admissão</option>
                  </select>
                )}
              </div>

              {/* Grid Date fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xxs font-semibold">Data do Evento (Início) *</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    className="form-input" 
                    required 
                  />
                </div>

                {(type === 'Afastamento' || type === 'Suspensão') && (
                  <div>
                    <label className="form-label text-xxs font-semibold">Data de Fim prevista</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)} 
                      className="form-input" 
                    />
                  </div>
                )}
              </div>

              {/* CONDITIONAL SECTIONS */}
              
              {/* Admissão */}
              {type === 'Admissão' && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-150 space-y-3">
                  <h4 className="text-xxxxs font-bold text-gray-400 uppercase tracking-widest">Informações de Admissão</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Cargo de Admissão</label>
                      <select value={occRole} onChange={e => setOccRole(e.target.value)} className="form-input py-1 text-xs">
                        <option value="Vigilante">Vigilante</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Operador">Operador</option>
                        <option value="RH">RH / Administração</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Supervisor Direto</label>
                      <select value={supervisorId} onChange={e => setSupervisorId(e.target.value)} className="form-input py-1 text-xs">
                        <option value="">Sem supervisor</option>
                        {supervisors.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Departamento</label>
                      <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Unidade Operacional</label>
                      <input type="text" value={unit} onChange={e => setUnit(e.target.value)} className="form-input" />
                    </div>
                  </div>
                </div>
              )}

              {/* Afastamento */}
              {type === 'Afastamento' && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-150 space-y-3">
                  <h4 className="text-xxxxs font-bold text-gray-400 uppercase tracking-widest">Detalhes do Afastamento</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Tipo / Motivo</label>
                      <select value={absenceType} onChange={e => setAbsenceType(e.target.value as any)} className="form-input py-1 text-xs">
                        <option value="Licença Médica">Licença Médica</option>
                        <option value="Auxílio Doença">Auxílio Doença</option>
                        <option value="Acidente de Trabalho">Acidente de Trabalho</option>
                        <option value="Licença Maternidade">Licença Maternidade</option>
                        <option value="Licença Paternidade">Licença Paternidade</option>
                        <option value="Licença Não Remunerada">Licença Não Remunerada</option>
                        <option value="Férias">Férias</option>
                        <option value="Treinamento">Treinamento</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label text-xxxxs font-semibold">CID (Opcional)</label>
                      <input 
                        type="text" 
                        value={cid} 
                        onChange={e => setCid(e.target.value)} 
                        className="form-input font-mono uppercase" 
                        placeholder="Z00.0" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Demissão */}
              {type === 'Demissão' && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-150 space-y-3">
                  <h4 className="text-xxxxs font-bold text-gray-400 uppercase tracking-widest">Informações de Desligamento</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Tipo de Desligamento</label>
                      <select value={dismissalType} onChange={e => setDismissalType(e.target.value as any)} className="form-input py-1 text-xs">
                        <option value="Sem Justa Causa">Sem Justa Causa</option>
                        <option value="Pedido de Demissão">Pedido de Demissão</option>
                        <option value="Justa Causa">Justa Causa</option>
                        <option value="Término de Contrato">Término de Contrato</option>
                        <option value="Aposentadoria">Aposentadoria</option>
                        <option value="Falecimento">Falecimento</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="form-label text-xxxxs font-semibold">Mapeamento de Motivo / Detalhes</label>
                      <input 
                        type="text" 
                        value={motive} 
                        onChange={e => setMotive(e.target.value)} 
                        className="form-input" 
                        placeholder="Motivo interno para o desligamento..." 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Transferência */}
              {type === 'Transferência' && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-150 space-y-3">
                  <h4 className="text-xxxxs font-bold text-gray-400 uppercase tracking-widest">Alocação de Cliente e Supervisor</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Alocar em Cliente</label>
                      <select value={clientId} onChange={e => setClientId(e.target.value)} className="form-input py-1 text-xs">
                        <option value="">Reserva / Sem cliente</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.companyName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Posto de Trabalho</label>
                      <input 
                        type="text" 
                        value={postName} 
                        onChange={e => setPostName(e.target.value)} 
                        className="form-input" 
                        placeholder="Ex: Portaria A, Ronda Noturno" 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="form-label text-xxxxs font-semibold">Supervisor de Campo Responsável</label>
                      <select value={supervisorId} onChange={e => setSupervisorId(e.target.value)} className="form-input py-1 text-xs">
                        <option value="">Manter supervisor atual</option>
                        {supervisors.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Promoção */}
              {type === 'Promoção' && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-150 space-y-3">
                  <h4 className="text-xxxxs font-bold text-gray-400 uppercase tracking-widest">Promoção de Cargo e Salário</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Cargo Anterior</label>
                      <input type="text" value={previousRole} readOnly className="form-input bg-gray-100 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Novo Cargo</label>
                      <select value={newRole} onChange={e => setNewRole(e.target.value)} className="form-input py-1 text-xs">
                        <option value="Vigilante">Vigilante</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Operador">Operador</option>
                        <option value="RH">RH / Administração</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Salário Anterior (R$)</label>
                      <input type="number" value={previousSalary} readOnly className="form-input bg-gray-100 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Novo Salário (R$)</label>
                      <input type="number" value={newSalary} onChange={e => setNewSalary(Number(e.target.value))} className="form-input" />
                    </div>
                  </div>
                </div>
              )}

              {/* Advertência */}
              {type === 'Advertência' && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-150 space-y-3">
                  <h4 className="text-xxxxs font-bold text-gray-400 uppercase tracking-widest">Advertência Disciplinar</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Tipo / Severidade</label>
                      <select value={warningType} onChange={e => setWarningType(e.target.value)} className="form-input py-1 text-xs">
                        <option value="Verbal">Advertência Verbal</option>
                        <option value="Escrita">Advertência Escrita</option>
                        <option value="Advertência Formal PF">Advertência Formal PF (Ocorrência Grave)</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label text-xxxxs font-semibold">Infração Cometida (Descrição Detalhada)</label>
                      <textarea 
                        value={warningDescription} 
                        onChange={e => setWarningDescription(e.target.value)} 
                        className="form-input min-h-[60px]" 
                        placeholder="Insira detalhes sobre o atraso, desídia ou abandono de posto temporário..."
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-xxxxs">
                      <input 
                        type="checkbox" 
                        checked={signedDoc} 
                        onChange={e => setSignedDoc(e.target.checked)} 
                        className="rounded text-blue-600 focus:ring-blue-500" 
                      />
                      <span>O colaborador assinou a Advertência física/digital</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Retorno ao Trabalho */}
              {type === 'Retorno ao Trabalho' && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-150 space-y-3">
                  <h4 className="text-xxxxs font-bold text-gray-400 uppercase tracking-widest">Retorno de Afastamento / Suspensão</h4>
                  <div>
                    <label className="form-label text-xxxxs font-semibold">Data Efetiva de Retorno ao Trabalho</label>
                    <input 
                      type="date" 
                      value={returnDate} 
                      onChange={e => setReturnDate(e.target.value)} 
                      className="form-input" 
                    />
                  </div>
                </div>
              )}

              {/* General Fields: Attachments & Notes */}
              <div>
                <label className="form-label text-xxs font-semibold">Simular Documento Anexo (Nome do PDF/Imagem)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={attachmentName} 
                    onChange={e => setAttachmentName(e.target.value)} 
                    className="form-input" 
                    placeholder="atestado_medico.pdf, advertencia_assinada.pdf, etc."
                  />
                  <button 
                    type="button" 
                    onClick={() => setAttachmentName(`anexo_doc_${Date.now()}.pdf`)}
                    className="absolute right-2 top-2 text-xxs text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                  >
                    Auto-Anexar
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Observações Gerais / Despacho</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  className="form-input min-h-[60px]" 
                  placeholder="Insira notas explicativas e justificativas de RH para fins de auditoria interna..."
                />
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 pt-3 border-t border-gray-100 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline text-xxs py-1.5 px-3"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xxs py-1.5 px-4 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isEditing ? 'Salvar Nova Versão' : 'Registrar Ocorrência'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
