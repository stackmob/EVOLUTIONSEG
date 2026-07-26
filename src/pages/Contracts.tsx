import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Contract, Client } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Search, Plus, Eye, Edit, Trash2, X, AlertTriangle, FileUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContractsProps {
  openDetailId: { type: string; id: string } | null;
  setOpenDetailId: (val: { type: string; id: string } | null) => void;
}

export const Contracts: React.FC<ContractsProps> = ({ openDetailId, setOpenDetailId }) => {
  const { user: loggedUser, role: loggedRole, hasPermission } = useAuth();
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSituation, setFilterSituation] = useState('all');
  
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Form Fields
  const [formClientId, setFormClientId] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formMonthlyValue, setFormMonthlyValue] = useState(10000);
  const [formPostCount, setFormPostCount] = useState(1);
  const [formGuardCount, setFormGuardCount] = useState(2);
  const [formContractType, setFormContractType] = useState('Vigilância Patrimonial');
  const [formSituation, setFormSituation] = useState<'Ativo' | 'Vencido' | 'Suspenso' | 'Cancelado'>('Ativo');
  const [formNotes, setFormNotes] = useState('');
  const [attachedPdf, setAttachedPdf] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (openDetailId && openDetailId.type === 'Contrato') {
      const target = db.getContracts().find(c => c.id === openDetailId.id);
      if (target) {
        setSelectedContract(target);
      }
      setOpenDetailId(null);
    }
  }, [openDetailId]);

  const loadData = () => {
    setContracts(db.getContracts());
    setClients(db.getClients());
  };

  const handleOpenForm = (con: Contract | null = null) => {
    const clientsList = db.getClients();
    if (clientsList.length === 0) {
      toast.error('Cadastre pelo menos um cliente antes de redigir um contrato.');
      return;
    }

    if (con) {
      setEditingContract(con);
      setFormClientId(con.clientId);
      setFormNumber(con.contractNumber);
      setFormStartDate(con.startDate);
      setFormEndDate(con.endDate);
      setFormMonthlyValue(con.monthlyValue);
      setFormPostCount(con.postCount);
      setFormGuardCount(con.securityGuardCount);
      setFormContractType(con.contractType);
      setFormSituation(con.situation);
      setFormNotes(con.notes || '');
      setAttachedPdf(!!con.pdfUrl);
    } else {
      setEditingContract(null);
      setFormClientId(clientsList[0]?.id || '');
      setFormNumber(`CT-2026-00${db.getContracts().length + 1}`);
      setFormStartDate(new Date().toISOString().split('T')[0]);
      
      // Default duration is 1 year from now
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      setFormEndDate(oneYearLater.toISOString().split('T')[0]);
      
      setFormMonthlyValue(15000);
      setFormPostCount(1);
      setFormGuardCount(2);
      setFormContractType('Vigilância Patrimonial Desarmada 12x36');
      setFormSituation('Ativo');
      setFormNotes('');
      setAttachedPdf(false);
    }
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientId || !formNumber || !formStartDate || !formEndDate) {
      toast.error('Preencha todos os campos contratuais obrigatórios.');
      return;
    }

    const list = db.getContracts();
    const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };

    if (editingContract) {
      const beforeState = { ...editingContract };
      const index = list.findIndex(c => c.id === editingContract.id);
      const updated: Contract = {
        ...editingContract,
        clientId: formClientId,
        contractNumber: formNumber,
        startDate: formStartDate,
        endDate: formEndDate,
        monthlyValue: Number(formMonthlyValue),
        postCount: Number(formPostCount),
        securityGuardCount: Number(formGuardCount),
        contractType: formContractType,
        situation: formSituation,
        notes: formNotes || undefined,
        pdfUrl: attachedPdf ? 'contrato_assinado.pdf' : undefined,
      };
      list[index] = updated;
      db.saveContracts(list);
      db.audit(operator, 'Editar', 'Contracts', `Atualizou cláusulas do contrato ${formNumber}`, beforeState, updated);
      toast.success('Cláusulas contratuais salvas com sucesso!');
    } else {
      const newContract: Contract = {
        id: `con-${Date.now()}`,
        clientId: formClientId,
        contractNumber: formNumber,
        startDate: formStartDate,
        endDate: formEndDate,
        monthlyValue: Number(formMonthlyValue),
        postCount: Number(formPostCount),
        securityGuardCount: Number(formGuardCount),
        contractType: formContractType,
        situation: formSituation,
        notes: formNotes || undefined,
        pdfUrl: attachedPdf ? 'contrato_assinado.pdf' : undefined,
        createdAt: new Date().toISOString(),
      };
      list.push(newContract);
      db.saveContracts(list);
      db.audit(operator, 'Cadastrar', 'Contracts', `Firmou novo contrato operacional ${formNumber}`, null, newContract);
      toast.success('Contrato operacional firmado com sucesso!');
    }

    loadData();
    setShowForm(false);
  };

  const handleDelete = (con: Contract) => {
    if (!hasPermission('contracts', 'delete')) {
      toast.error('Seu nível de acesso atual não possui permissão para revogar contratos.');
      return;
    }

    if (confirm(`A revogação de contratos é uma ação drástica. Deseja revogar permanentemente o contrato ${con.contractNumber}?`)) {
      const list = db.getContracts().filter(c => c.id !== con.id);
      const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };
      db.saveContracts(list);
      db.audit(operator, 'Excluir', 'Contracts', `Excluiu/Revogou contrato operacional ${con.contractNumber}`, con, null);
      toast.success('Contrato excluído.');
      loadData();
      if (selectedContract?.id === con.id) setSelectedContract(null);
    }
  };

  const getDaysRemainingBadge = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xxs font-bold uppercase bg-red-100 text-red-700 animate-pulse">
          <AlertTriangle className="w-3 h-3" /> VENCIDO
        </span>
      );
    } else if (diffDays <= 7) {
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xxs font-bold uppercase bg-red-50 text-red-600 animate-pulse">
          ⚠️ Crítico ({diffDays} dias)
        </span>
      );
    } else if (diffDays <= 15) {
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xxs font-bold uppercase bg-blue-100 text-blue-800">
          ⚠️ Alerta ({diffDays} dias)
        </span>
      );
    } else if (diffDays <= 30) {
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xxs font-bold uppercase bg-gray-150 text-gray-700">
          Aviso ({diffDays} dias)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-bold uppercase bg-emerald-50 text-emerald-700">
          Válido
        </span>
      );
    }
  };

  const filteredContracts = contracts.filter(con => {
    const clientName = clients.find(cl => cl.id === con.clientId)?.name || '';
    const matchesSearch = con.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          con.contractType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSituation = filterSituation === 'all' || con.situation === filterSituation;
    return matchesSearch && matchesSituation;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Gestão de Contratos</h1>
          <p className="text-xs text-gray-500 mt-1">Supervisão de acordos de prestação de serviços, postos contratados, faturamento mensal e alarmes de vencimento.</p>
        </div>
        
        {hasPermission('contracts', 'create') && (
          <button 
            id="btn-add-contract"
            onClick={() => handleOpenForm(null)}
            className="btn btn-primary flex items-center gap-2 cursor-pointer shadow-sm text-xs"
          >
            <Plus className="w-4 h-4" /> Registrar Contrato
          </button>
        )}
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input 
            id="contract-search-box"
            type="text" 
            placeholder="Pesquisar por número ou cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9"
          />
        </div>

        <select 
          id="filter-contract-situation"
          value={filterSituation} 
          onChange={(e) => setFilterSituation(e.target.value)}
          className="form-input py-1 text-xs max-w-xs"
        >
          <option value="all">Todas Situações</option>
          <option value="Ativo">Ativo</option>
          <option value="Vencido">Vencido / Expirado</option>
          <option value="Suspenso">Suspenso</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* TABULAR CONTRACT LIST (Left 2/3) */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Nº Contrato / Tipo</th>
                    <th className="px-5 py-3.5">Cliente Tomador</th>
                    <th className="px-5 py-3.5 text-right">Faturamento / Postos</th>
                    <th className="px-5 py-3.5">Validade / Alerta</th>
                    <th className="px-5 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {filteredContracts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-xs text-gray-400">
                        Nenhum contrato correspondente cadastrado.
                      </td>
                    </tr>
                  ) : (
                    filteredContracts.map((con) => (
                      <tr key={con.id} className="hover:bg-blue-50/5 transition-colors duration-150">
                        <td className="px-5 py-4">
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-xs text-gray-900 leading-tight">
                              {con.contractNumber}
                            </span>
                            <span className="text-xxs text-gray-400 mt-0.5 leading-none">
                              {con.contractType}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-800 text-left">
                          {con.clientName}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex flex-col text-right">
                            <span className="font-bold text-xs text-gray-950">
                              R$ {con.monthlyValue.toLocaleString('pt-BR')} /mês
                            </span>
                            <span className="text-xxs text-gray-400 mt-0.5 leading-none">
                              {con.postCount} postos | {con.securityGuardCount} vigilantes
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-left">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-xxs text-gray-700 font-semibold">{con.startDate} a {con.endDate}</span>
                            {con.situation === 'Ativo' ? getDaysRemainingBadge(con.endDate) : (
                              <span className="text-xxxxs font-bold px-1.5 py-0.5 rounded-full uppercase bg-gray-100 text-gray-500">
                                {con.situation}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => setSelectedContract(con)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-950"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {hasPermission('contracts', 'update') && (
                              <button 
                                onClick={() => handleOpenForm(con)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {hasPermission('contracts', 'delete') && (
                              <button 
                                onClick={() => handleDelete(con)}
                                className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
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

        {/* DETAILS COLUMN PANEL (Right 1/3) */}
        <div className="xl:col-span-1">
          {selectedContract ? (
            <div id="contract-details-card" className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 sticky top-20 text-left relative">
              <button 
                onClick={() => setSelectedContract(null)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-150 rounded-full text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-gray-100 pb-3">
                <span className="text-xxs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase">
                  CONTRATO OPERACIONAL
                </span>
                <h3 className="font-extrabold text-sm text-gray-900 mt-2 leading-tight">{selectedContract.contractNumber}</h3>
                <p className="text-xxs text-gray-500 mt-0.5 font-medium">Cliente: {selectedContract.clientName}</p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-xxs text-gray-400">Tipo de Atividade Contratada:</span>
                  <p className="font-semibold text-gray-800">{selectedContract.contractType}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-gray-50 py-3">
                  <div>
                    <span className="text-xxs text-gray-400">Faturamento Mensal:</span>
                    <p className="font-extrabold text-gray-900 text-sm">R$ {selectedContract.monthlyValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                  </div>
                  <div>
                    <span className="text-xxs text-gray-400">Período de Validade:</span>
                    <p className="font-bold text-gray-800 text-xxs">{selectedContract.startDate} a {selectedContract.endDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xxs text-gray-400">Postos Ativos:</span>
                    <p className="font-semibold text-gray-800">{selectedContract.postCount} Postos Físicos</p>
                  </div>
                  <div>
                    <span className="text-xxs text-gray-400">Efetivo Alocado:</span>
                    <p className="font-semibold text-gray-800">{selectedContract.securityGuardCount} Vigilantes</p>
                  </div>
                </div>

                {selectedContract.notes && (
                  <div>
                    <span className="text-xxs text-gray-400">Escopo Técnico Operacional:</span>
                    <p className="text-xxs text-gray-600 bg-gray-50 p-2 rounded leading-relaxed">{selectedContract.notes}</p>
                  </div>
                )}

                <div className="pt-2">
                  <span className="text-xxs text-gray-400 block mb-1.5">Documento Digitalizado (PDF):</span>
                  {selectedContract.pdfUrl ? (
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); toast.success('Exibindo arquivo contrato_assinado.pdf!'); }}
                      className="inline-flex items-center gap-1.5 text-xxs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg"
                    >
                      <FileText className="w-4 h-4" /> Visualizar Contrato Assinado.pdf
                    </a>
                  ) : (
                    <span className="text-xxs text-gray-400 bg-gray-100 p-2 rounded block">Nenhum contrato em PDF anexado.</span>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center text-xs text-gray-400 sticky top-20">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              Selecione um contrato da lista para consultar o faturamento mensal, prazos regulamentares, número de postos em atividade e visualizar o arquivo PDF.
            </div>
          )}
        </div>

      </div>

      {/* POPUP WIZARD FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 bg-gray-950 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                {editingContract ? `Editar Contrato: ${editingContract.contractNumber}` : 'Firmar Novo Contrato'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-900 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-left overflow-y-auto max-h-[80vh]">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xxs font-semibold">Cliente Contratante *</label>
                  <select 
                    value={formClientId} 
                    onChange={e => setFormClientId(e.target.value)} 
                    className="form-input"
                    required
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Código do Contrato *</label>
                  <input type="text" value={formNumber} onChange={e => setFormNumber(e.target.value)} className="form-input" placeholder="Ex: CT-2026-042" required />
                </div>
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Tipo do Escopo Contratado</label>
                <input type="text" value={formContractType} onChange={e => setFormContractType(e.target.value)} className="form-input" placeholder="Ex: Vigilância Armada 24h" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xxs font-semibold">Data de Início *</label>
                  <input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="form-input" required />
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Data de Término *</label>
                  <input type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} className="form-input" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="form-label text-xxs font-semibold">Valor Mensal (R$) *</label>
                  <input type="number" value={formMonthlyValue} onChange={e => setFormMonthlyValue(Number(e.target.value))} className="form-input" required />
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Qtd Postos *</label>
                  <input type="number" value={formPostCount} onChange={e => setFormPostCount(Number(e.target.value))} className="form-input" required />
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Efetivo Necessário *</label>
                  <input type="number" value={formGuardCount} onChange={e => setFormGuardCount(Number(e.target.value))} className="form-input" required />
                </div>
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Cláusulas e Observações Adicionais</label>
                <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3} className="form-input resize-none" placeholder="Instruções contratuais, detalhes de cobrança..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="form-label text-xxs font-semibold">Situação do Contrato</label>
                  <select 
                    value={formSituation} 
                    onChange={e => setFormSituation(e.target.value as any)} 
                    className="form-input"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Vencido">Vencido</option>
                    <option value="Suspenso">Suspenso</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label text-xxs font-semibold block mb-2">Contrato Digitalizado (Upload)</label>
                  <button 
                    type="button" 
                    onClick={() => setAttachedPdf(!attachedPdf)}
                    className={`w-full py-2 border rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors text-xxs ${
                      attachedPdf ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    <FileUp className="w-4 h-4" />
                    <span>{attachedPdf ? 'CONTRATO ANEXADO.PDF' : 'Anexar Instrumento Assinado PDF'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary cursor-pointer">Cancelar</button>
                <button type="submit" className="btn btn-primary cursor-pointer text-white bg-blue-600 hover:bg-blue-700 font-bold px-6">Firmar Contrato</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
