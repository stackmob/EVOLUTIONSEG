import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { ScaleAllocation, Employee, Client, Contract } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Calendar as CalendarIcon, Plus, Eye, Trash2, X, AlertTriangle, Clock, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const Scales: React.FC = () => {
  const { user: loggedUser, role: loggedRole, hasPermission } = useAuth();
  
  const [scales, setScales] = useState<ScaleAllocation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [selectedScale, setSelectedScale] = useState<ScaleAllocation | null>(null);

  // Form Fields
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formClientId, setFormClientId] = useState('');
  const [formContractId, setFormContractId] = useState('');
  const [formPostName, setFormPostName] = useState('Portaria A');
  const [formShift, setFormShift] = useState<'Matutino' | 'Vespertino' | 'Noturno' | 'Diurno'>('Diurno');
  const [formScaleType, setFormScaleType] = useState('12x36');
  const [formIsOffDay, setFormIsOffDay] = useState(false);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formOvertime, setFormOvertime] = useState(0);
  const [formNotes, setFormNotes] = useState('');

  // Selected date filter (default is today)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setScales(db.getScales());
    setEmployees(db.getEmployees().filter(e => e.situation === 'Ativo'));
    setClients(db.getClients().filter(c => c.status === 'Ativo'));
    setContracts(db.getContracts().filter(c => c.situation === 'Ativo'));
  };

  const handleOpenForm = () => {
    if (employees.length === 0) {
      toast.error('Nenhum vigilante ativo disponível para alocação.');
      return;
    }
    if (clients.length === 0 || contracts.length === 0) {
      toast.error('É necessário cadastrar clientes e contratos operacionais antes de gerar escalas.');
      return;
    }

    setFormEmployeeId(employees[0].id);
    setFormClientId(clients[0].id);
    // Find contract for first client
    const clientContract = contracts.find(c => c.clientId === clients[0].id);
    setFormContractId(clientContract?.id || contracts[0].id);
    
    setFormPostName('Guarita Entrada Principal');
    setFormShift('Diurno');
    setFormScaleType('12x36');
    setFormIsOffDay(false);
    setFormStartDate(selectedDate);
    setFormEndDate(selectedDate);
    setFormOvertime(0);
    setFormNotes('');
    
    setShowForm(true);
  };

  // Dynamically update contracts select based on selected client
  const handleClientChange = (clientId: string) => {
    setFormClientId(clientId);
    const related = contracts.find(c => c.clientId === clientId);
    if (related) {
      setFormContractId(related.id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployeeId || !formClientId || !formContractId || !formStartDate) {
      toast.error('Preencha as informações obrigatórias da escala.');
      return;
    }

    // STRICT COLLISION / CONFLICT DETECTOR
    const currentScales = db.getScales();
    const guardName = employees.find(e => e.id === formEmployeeId)?.name || 'Vigilante';

    // Verify if same guard is already allocated on the same day and shift, and not on OFF-DAY
    const isConflict = currentScales.some(sc => 
      sc.employeeId === formEmployeeId && 
      sc.startDate.split('T')[0] === formStartDate && 
      sc.shift === formShift &&
      !formIsOffDay &&
      !sc.isOffDay
    );

    if (isConflict) {
      const conflictMsg = `CONFLITO CRÍTICO: ${guardName} já possui alocação ativa no turno ${formShift} do dia ${formStartDate}! Não é permitido colocar um vigilante em múltiplos postos no mesmo período.`;
      toast.error(conflictMsg, { duration: 6000 });
      
      // Log conflict in audit log & add notification for supervisor review
      const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };
      db.audit(operator, 'Cadastrar', 'Scales', `CONFLITO DETECTADO: Tentativa de alocação de ${guardName} em conflito de escala.`, { employeeId: formEmployeeId, date: formStartDate, shift: formShift }, null);
      
      // Create a warning notification in database
      const notifs = db.getNotifications();
      db.saveNotifications([
        {
          id: `not-scale-conflict-${Date.now()}`,
          type: 'ConflitoEscala',
          title: 'Conflito de Escala Bloqueado',
          message: `O supervisor tentou alocar ${guardName} em dois locais simultâneos.`,
          referenceId: formEmployeeId,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...notifs
      ]);

      return;
    }

    // Success - Insert scale
    const newScale: ScaleAllocation = {
      id: `sca-${Date.now()}`,
      employeeId: formEmployeeId,
      clientId: formClientId,
      contractId: formContractId,
      postName: formPostName,
      shift: formShift,
      scaleType: formScaleType,
      isOffDay: formIsOffDay,
      startDate: `${formStartDate}T${formShift === 'Noturno' ? '18:00:00' : '06:00:00'}`,
      endDate: `${formEndDate}T${formShift === 'Noturno' ? '06:00:00' : '18:00:00'}`,
      overtimeHours: Number(formOvertime),
      notes: formNotes || undefined,
      createdAt: new Date().toISOString(),
    };

    const list = [...currentScales, newScale];
    const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };
    
    db.saveScales(list);
    db.audit(operator, 'Cadastrar', 'Scales', `Alocou escala de trabalho para ${guardName} em ${formStartDate} no posto ${formPostName}`, null, newScale);
    toast.success(`Escala registrada com sucesso para ${guardName}!`);
    
    loadData();
    setShowForm(false);
  };

  const handleDelete = (sc: ScaleAllocation) => {
    if (!hasPermission('scales', 'delete')) {
      toast.error('Privilégios insuficientes para remover alocações de escala.');
      return;
    }

    if (confirm(`Remover alocação de escala do vigilante ${sc.employeeName} no dia ${sc.startDate.split('T')[0]}?`)) {
      const list = scales.filter(item => item.id !== sc.id);
      const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };
      
      db.saveScales(list);
      db.audit(operator, 'Excluir', 'Scales', `Removeu escala de trabalho de ${sc.employeeName} do dia ${sc.startDate.split('T')[0]}`, sc, null);
      toast.success('Escala removida.');
      loadData();
    }
  };

  // Filter scales for selected date
  const dateScales = scales.filter(sc => sc.startDate.startsWith(selectedDate));

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Escalas de Trabalho</h1>
          <p className="text-xs text-gray-500 mt-1">Alocação operacional de guardas, vigilantes de postos e rondas com prevenção inteligente de colisões de horário.</p>
        </div>
        
        {hasPermission('scales', 'create') && (
          <button 
            id="btn-add-scale"
            onClick={handleOpenForm}
            className="btn btn-primary flex items-center gap-2 cursor-pointer shadow-sm text-xs"
          >
            <Plus className="w-4 h-4" /> Alocar Plantonista
          </button>
        )}
      </div>

      {/* TIMELINE CALENDAR NAV BAR */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-blue-500 shrink-0" />
          <span className="font-bold text-xs text-gray-700">Selecione o Dia de Operação:</span>
          <input 
            id="scale-date-selector"
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input py-1 text-xs max-w-xs font-semibold text-gray-950 bg-gray-50 border-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 text-xxs font-bold text-gray-500 uppercase bg-gray-50 border border-gray-150 px-3 py-1.5 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          Filtro Inteligente: {dateScales.length} Alocação(ões) no Dia
        </div>
      </div>

      {/* CORE SCHEDULER VIEW (STYLE GRID CALENDAR) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-gray-400">Quadro de Plantões: {selectedDate}</span>
          <span className="text-xxs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded">Sistema Anticolisão Ativo</span>
        </div>

        <div className="divide-y divide-gray-150">
          {dateScales.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-blue-500" />
              Nenhum vigilante alocado para escalas de serviço nesta data ({selectedDate}).
            </div>
          ) : (
            dateScales.map((sc) => (
              <div key={sc.id} className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-150">
                
                {/* Employee / Guard block */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white font-extrabold rounded-lg flex items-center justify-center text-xs shadow">
                    {sc.employeeName?.split(' ').slice(0, 2).map(w=>w[0]).join('')}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900">{sc.employeeName}</span>
                    <div className="flex items-center gap-2 text-xxxxs font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                      <span>Ref: {sc.employeeId}</span>
                      <span>•</span>
                      <span>Escala {sc.scaleType}</span>
                    </div>
                  </div>
                </div>

                {/* Client / Location details */}
                <div className="text-left flex-1 sm:pl-8">
                  <span className="font-semibold text-xs text-gray-800">Posto: {sc.postName}</span>
                  <p className="text-xxs text-gray-500 mt-0.5">Cliente: <span className="font-medium text-gray-700">{sc.clientName}</span> ({sc.contractNumber})</p>
                </div>

                {/* Overtime & Shift Badge */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 text-xxs font-extrabold uppercase rounded-full ${
                      sc.shift === 'Noturno' ? 'bg-gray-950 text-white' : 'bg-blue-100 text-blue-900'
                    }`}>
                      Turno {sc.shift}
                    </span>
                    {sc.overtimeHours > 0 && (
                      <p className="text-xxxxs font-bold text-red-500 mt-1 uppercase tracking-wide flex items-center justify-end gap-0.5">
                        <Clock className="w-3 h-3" /> +{sc.overtimeHours}h Extras
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {hasPermission('scales', 'delete') && (
                    <button 
                      onClick={() => handleDelete(sc)}
                      className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all duration-150"
                      title="Excluir Escala"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE POPUP FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 bg-gray-950 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-500" />
                Alocar Vigilante para Plantão
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-900 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-left">
              
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xxxxs text-blue-700 leading-relaxed">
                  <strong>Validador Ativo:</strong> O sistema bloqueará automaticamente qualquer tentativa de colocar o mesmo vigilante em múltiplos postos de serviços concorrentes no mesmo turno desta data, garantindo integridade das horas e auditorias.
                </p>
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Vigilante / Guarda Ativo *</label>
                <select 
                  value={formEmployeeId} 
                  onChange={e => setFormEmployeeId(e.target.value)} 
                  className="form-input"
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.function})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xxs font-semibold">Cliente Contratante *</label>
                  <select 
                    value={formClientId} 
                    onChange={e => handleClientChange(e.target.value)} 
                    className="form-input"
                    required
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Contrato Operacional *</label>
                  <select 
                    value={formContractId} 
                    onChange={e => setFormContractId(e.target.value)} 
                    className="form-input"
                    required
                  >
                    {contracts.filter(c => c.clientId === formClientId).map(c => (
                      <option key={c.id} value={c.id}>{c.contractNumber}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="form-label text-xxs font-semibold">Nome do Posto *</label>
                  <input type="text" value={formPostName} onChange={e => setFormPostName(e.target.value)} className="form-input" placeholder="Ex: Portaria Docas Norte" required />
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Horas Extras</label>
                  <input type="number" value={formOvertime} onChange={e => setFormOvertime(Number(e.target.value))} className="form-input" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="form-label text-xxs font-semibold">Regime Escala</label>
                  <select value={formScaleType} onChange={e => setFormScaleType(e.target.value)} className="form-input">
                    <option value="12x36">12x36</option>
                    <option value="5x2">5x2</option>
                    <option value="6x1">6x1</option>
                  </select>
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Turno de Serviço *</label>
                  <select value={formShift} onChange={e => setFormShift(e.target.value as any)} className="form-input" required>
                    <option value="Diurno">Diurno</option>
                    <option value="Noturno">Noturno</option>
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                  </select>
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Dia de Folga?</label>
                  <select value={formIsOffDay ? 'sim' : 'nao'} onChange={e => setFormIsOffDay(e.target.value === 'sim')} className="form-input">
                    <option value="nao">Não (Trabalho)</option>
                    <option value="sim">Sim (Folga)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xxs font-semibold">Data Início *</label>
                  <input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="form-input" required />
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Data Fim *</label>
                  <input type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} className="form-input" required />
                </div>
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Instruções Operacionais de Posto (Ronda/Acesso)</label>
                <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2} className="form-input resize-none" placeholder="Ex: Chaves guardadas na sala principal..."></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary cursor-pointer">Cancelar</button>
                <button type="submit" className="btn btn-primary cursor-pointer text-white bg-blue-600 hover:bg-blue-700 font-bold px-6">Salvar Alocação</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
