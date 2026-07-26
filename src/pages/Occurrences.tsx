import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Employee, EmployeeOccurrence, Client } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { uploadDocument, DocumentMetadata } from '../services/storage';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Clock, Plus, Search, SlidersHorizontal, Calendar, User, FileText, 
  AlertCircle, Edit2, ShieldAlert, CheckCircle, TrendingUp, RefreshCw, Send,
  Briefcase, ArrowRight, UserCheck, Upload, Eye, Download, HardDrive
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Occurrences: React.FC = () => {
  const { user: loggedUser, role: loggedRole } = useAuth();
  const { theme } = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [occurrences, setOccurrences] = useState<EmployeeOccurrence[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [supervisors, setSupervisors] = useState<Employee[]>([]);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmployeeId, setFilterEmployeeId] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Modal Control
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOcc, setEditingOcc] = useState<EmployeeOccurrence | null>(null);

  // Real File Upload & Viewer State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeViewDoc, setActiveViewDoc] = useState<DocumentMetadata | null>(null);

  // Form Fields State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
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
  
  const [company, setCompany] = useState('EVOLUTIONSEG');
  const [clientId, setClientId] = useState('');
  const [postName, setPostName] = useState('');
  
  const [previousRole, setPreviousRole] = useState('');
  const [newRole, setNewRole] = useState('Supervisor');
  const [previousSalary, setPreviousSalary] = useState(0);
  const [newSalary, setNewSalary] = useState(0);
  
  const [warningType, setWarningType] = useState('Verbal');
  const [warningDescription, setWarningDescription] = useState('');
  const [signedDoc, setSignedDoc] = useState(false);

  const [returnDate, setReturnDate] = useState('');

  const loadData = () => {
    const emps = db.getEmployees();
    setEmployees(emps);
    setOccurrences(db.getOccurrences());
    setClients(db.getClients());
    setSupervisors(emps.filter(e => e.role === 'Supervisor' || e.role === 'Administrador'));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update promotion fields when employee changes
  useEffect(() => {
    if (selectedEmployeeId && type === 'Promoção') {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      if (emp) {
        setPreviousRole(emp.role);
        setPreviousSalary(emp.salary);
        setNewSalary(emp.salary * 1.15); // Suggest 15% increase
      }
    }
  }, [selectedEmployeeId, type, employees]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingOcc(null);
    setSelectedEmployeeId(employees[0]?.id || '');
    setType('Afastamento');
    setDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setNotes('');
    setAttachmentName('');
    setSelectedFile(null);
    
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setOccRole('Vigilante');
    setDepartment('Operações');
    setUnit('Sede Central');
    setSupervisorId('');
    
    setAbsenceType('Licença Médica');
    setCid('');
    
    setDismissalDate(new Date().toISOString().split('T')[0]);
    setDismissalType('Sem Justa Causa');
    setMotive('');
    
    setCompany('EVOLUTIONSEG');
    setClientId('');
    setPostName('');
    
    setWarningType('Verbal');
    setWarningDescription('');
    setSignedDoc(false);
    setReturnDate(new Date().toISOString().split('T')[0]);

    setShowModal(true);
  };

  const handleOpenEdit = (occ: EmployeeOccurrence) => {
    setIsEditing(true);
    setEditingOcc(occ);
    setSelectedEmployeeId(occ.employeeId);
    setType(occ.type);
    setDate(occ.date);
    setEndDate(occ.endDate || '');
    setNotes(occ.notes || '');
    setAttachmentName(occ.attachmentUrl || '');
    setSelectedFile(null);
    
    setAdmissionDate(occ.admissionDate || occ.date);
    setOccRole(occ.role || 'Vigilante');
    setDepartment(occ.department || 'Operações');
    setUnit(occ.unit || 'Sede Central');
    setSupervisorId(occ.supervisorId || '');
    
    setAbsenceType(occ.absenceType || 'Licença Médica');
    setCid(occ.cid || '');
    
    setDismissalDate(occ.dismissalDate || occ.date);
    setDismissalType(occ.dismissalType || 'Sem Justa Causa');
    setMotive(occ.motive || '');
    
    setCompany(occ.company || 'EVOLUTIONSEG');
    setClientId(occ.clientId || '');
    setPostName(occ.postName || '');
    
    setPreviousRole(occ.previousRole || '');
    setNewRole(occ.newRole || 'Supervisor');
    setPreviousSalary(occ.previousSalary || 0);
    setNewSalary(occ.newSalary || 0);
    
    setWarningType(occ.warningType || 'Verbal');
    setWarningDescription(occ.description || '');
    setSignedDoc(!!occ.signedDocumentUrl);
    setReturnDate(occ.returnDate || occ.date);

    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !date) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    const employee = employees.find(e => e.id === selectedEmployeeId);
    if (!employee) return;

    const operator = {
      id: loggedUser?.id || 'usr-1',
      name: loggedUser?.name || 'Operador RH',
      role: loggedRole || 'RH',
    };

    let uploadedMeta: DocumentMetadata | undefined = editingOcc?.attachmentMeta;
    if (selectedFile) {
      toast.loading('Enviando documento físico...', { id: 'upload-toast' });
      uploadedMeta = await uploadDocument(selectedFile, 'occurrences');
      toast.success('Documento físico anexado com sucesso!', { id: 'upload-toast' });
    }

    let clientName: string | undefined = undefined;
    if (clientId) {
      const foundClient = clients.find(c => c.id === clientId);
      if (foundClient) clientName = foundClient.companyName;
    }

    const occList = db.getOccurrences();

    if (isEditing && editingOcc) {
      // Version increment: Create a new correction entry linked to the original ID
      const newVersion = (editingOcc.version || 1) + 1;
      const correctedOcc: EmployeeOccurrence = {
        ...editingOcc,
        date,
        endDate: (type === 'Afastamento' || type === 'Suspensão') ? endDate || undefined : undefined,
        notes,
        attachmentUrl: uploadedMeta ? uploadedMeta.fileUrl : (attachmentName || undefined),
        attachmentMeta: uploadedMeta,
        registeredBy: `${operator.name} (${operator.role}) [Correção]`,
        version: newVersion,
        
        // Specific fields
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

      const updatedList = db.updateOccurrence(correctedOcc);
      setOccurrences(updatedList);
      db.applyOccurrenceSideEffects(selectedEmployeeId, operator);
      
      db.audit(
        operator,
        'Editar',
        'Employees',
        `Corrigiu ocorrência funcional (V${newVersion}) do tipo ${type} para ${employee.name}`,
        editingOcc,
        correctedOcc
      );
      
      toast.success(`Ocorrência corrigida com sucesso! Versão ${newVersion} registrada.`);
    } else {
      // New Occurrence
      const newOcc: EmployeeOccurrence = {
        id: `occ-${Date.now()}`,
        employeeId: selectedEmployeeId,
        type,
        date,
        endDate: (type === 'Afastamento' || type === 'Suspensão') ? endDate || undefined : undefined,
        notes,
        attachmentUrl: uploadedMeta ? uploadedMeta.fileUrl : (attachmentName || undefined),
        attachmentMeta: uploadedMeta,
        registeredBy: `${operator.name} (${operator.role})`,
        createdAt: new Date().toISOString(),
        version: 1,
        
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
      db.applyOccurrenceSideEffects(selectedEmployeeId, operator);
      
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
  };

  // Helper for date formatting
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Group occurrences by employee to determine the highest version per record
  const occurrencesByOriginalId: Record<string, EmployeeOccurrence[]> = {};
  occurrences.forEach(occ => {
    const key = occ.id;
    if (!occurrencesByOriginalId[key]) occurrencesByOriginalId[key] = [];
    occurrencesByOriginalId[key].push(occ);
  });

  // Filtered List
  const filteredOccurrences = occurrences.filter(occ => {
    const emp = employees.find(e => e.id === occ.employeeId);
    const matchesSearch = emp ? emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 emp.cpf.includes(searchQuery) : false;
    const matchesEmployee = filterEmployeeId === 'all' || occ.employeeId === filterEmployeeId;
    const matchesType = filterType === 'all' || occ.type === filterType;
    return matchesSearch && matchesEmployee && matchesType;
  });

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* HEADER BANNER */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
        theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xxs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" /> HISTÓRICO FUNCIONAL AUDITÁVEL
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-white">
            Ocorrências Funcionais & Anexos Reais
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registro de atestados médicos, licenças, advertências, transferências e promoções com upload físico de arquivos e visualizador PDF.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Ocorrência</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
        theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por Vigilante ou CPF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500 border ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-250 text-slate-900'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:border-emerald-500 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-250 text-slate-900'
            }`}
          >
            <option value="all">Todos os Tipos de Ocorrência</option>
            <option value="Afastamento">Afastamentos / Licenças</option>
            <option value="Demissão">Demissões / Desligamentos</option>
            <option value="Transferência">Transferências de Posto</option>
            <option value="Promoção">Promoções de Cargo</option>
            <option value="Advertência">Advertências Disciplinares</option>
            <option value="Suspensão">Suspensões Operacionais</option>
            <option value="Retorno ao Trabalho">Retornos ao Trabalho</option>
            <option value="Admissão">Admissões</option>
          </select>
        </div>
      </div>

      {/* OCCURRENCES TABLE */}
      <div className={`rounded-2xl border overflow-hidden ${
        theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                theme === 'dark' ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Tipo de Evento</th>
                <th className="py-3 px-4">Data Início / Fim</th>
                <th className="py-3 px-4">Documento Físico Real</th>
                <th className="py-3 px-4">Versão & Audit</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs font-sans">
              {filteredOccurrences.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                    Nenhuma ocorrência registrada.
                  </td>
                </tr>
              ) : (
                filteredOccurrences.map((occ) => {
                  const emp = employees.find(e => e.id === occ.employeeId);
                  const docMeta = occ.attachmentMeta || (occ.attachmentUrl ? {
                    id: 'doc-legacy',
                    fileName: occ.attachmentUrl,
                    fileUrl: occ.attachmentUrl,
                    fileSize: 1024 * 450,
                    formattedSize: '450 KB',
                    mimeType: 'application/pdf',
                    uploadedAt: occ.createdAt
                  } : null);

                  return (
                    <tr key={occ.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Employee Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={emp?.photoUrl} alt={emp?.name} className="w-8 h-8 rounded-full object-cover border border-emerald-500/30" />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{emp?.name || 'Não Encontrado'}</span>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">CPF: {emp?.cpf}</span>
                          </div>
                        </div>
                      </td>

                      {/* Event Type */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          occ.type === 'Afastamento' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                          occ.type === 'Demissão' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' :
                          occ.type === 'Transferência' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' :
                          occ.type === 'Promoção' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                          'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30'
                        }`}>
                          {occ.type}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                        <div>{formatDate(occ.date)}</div>
                        {occ.endDate && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">Até {formatDate(occ.endDate)}</div>
                        )}
                      </td>

                      {/* Document Attachment Button */}
                      <td className="py-3.5 px-4">
                        {docMeta ? (
                          <button
                            onClick={() => setActiveViewDoc(docMeta)}
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Ver PDF / Anexo</span>
                          </button>
                        ) : (
                          <span className="text-xxs font-mono text-slate-400">Sem documento físico</span>
                        )}
                      </td>

                      {/* Version */}
                      <td className="py-3.5 px-4 font-mono text-xxs">
                        <span className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 font-bold">
                          v{occ.version || 1}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(occ)}
                          className="p-1.5 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Corrigir Registro de Ocorrência"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL WITH REAL FILE UPLOAD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-lg p-6 rounded-2xl border shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                {isEditing ? 'Corrigir Registro de Ocorrência' : 'Nova Ocorrência Funcional'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Employee */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Colaborador Afetado</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-250 text-slate-900'
                  }`}
                  required
                >
                  <option value="" disabled>Selecione um colaborador...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role}) - CPF: {e.cpf}</option>
                  ))}
                </select>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Tipo de Ocorrência</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-250 text-slate-900'
                  }`}
                >
                  <option value="Afastamento">Afastamento / Licença Médica / Férias</option>
                  <option value="Demissão">Demissão / Desligamento / Óbito</option>
                  <option value="Transferência">Transferência de Posto/Cliente</option>
                  <option value="Promoção">Promoção de Cargo / Reajuste</option>
                  <option value="Advertência">Advertência / Medida Disciplinar</option>
                  <option value="Suspensão">Suspensão Operacional</option>
                  <option value="Retorno ao Trabalho">Retorno ao Trabalho</option>
                  <option value="Admissão">Admissão</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Data Início</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-250 text-slate-900'
                    }`}
                  />
                </div>

                {(type === 'Afastamento' || type === 'Suspensão') && (
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Data Fim Prevista</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-250 text-slate-900'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* REAL PHYSICAL FILE UPLOAD FIELD */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-500" /> Anexar Documento Físico Real (PDF / Atestado)
                </label>
                
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer font-mono"
                />

                {selectedFile && (
                  <div className="flex items-center gap-2 text-xxs font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Observações do Registro</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Insira detalhes adicionais sobre o atestado médico, cid ou desídia..."
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:border-emerald-500 min-h-[60px] ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-250 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {isEditing ? 'Salvar Correção' : 'Registrar Ocorrência'}
                </button>
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
