import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Provider } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Factory, Search, Plus, Eye, Edit, Trash2, X, Globe, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export const Providers: React.FC = () => {
  const { user: loggedUser, role: loggedRole, hasPermission } = useAuth();
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCnpj, setFormCnpj] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formService, setFormService] = useState('Armamento e Munição');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = () => {
    setProviders(db.getProviders());
  };

  const handleOpenForm = (prv: Provider | null = null) => {
    if (prv) {
      setEditingProvider(prv);
      setFormName(prv.companyName);
      setFormCnpj(prv.cnpj);
      setFormPhone(prv.contactPhone);
      setFormEmail(prv.contactEmail);
      setFormAddress(prv.address || '');
      setFormService(prv.serviceProvided);
      setFormNotes(prv.notes || '');
    } else {
      setEditingProvider(null);
      setFormName('');
      setFormCnpj('');
      setFormPhone('');
      setFormEmail('');
      setFormAddress('');
      setFormService('Armamento e Munição');
      setFormNotes('');
    }
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCnpj || !formEmail) {
      toast.error('Informe os campos obrigatórios do fornecedor.');
      return;
    }

    const list = [...providers];
    const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };

    if (editingProvider) {
      const beforeState = { ...editingProvider };
      const index = list.findIndex(p => p.id === editingProvider.id);
      const updated: Provider = {
        ...editingProvider,
        companyName: formName,
        cnpj: formCnpj,
        contactPhone: formPhone,
        contactEmail: formEmail,
        address: formAddress || undefined,
        serviceProvided: formService,
        notes: formNotes || undefined,
      };
      list[index] = updated;
      db.saveProviders(list);
      db.audit(operator, 'Editar', 'Providers', `Atualizou dados do fornecedor ${formName}`, beforeState, updated);
      toast.success('Fornecedor atualizado com sucesso!');
    } else {
      const newProvider: Provider = {
        id: `prv-${Date.now()}`,
        companyName: formName,
        cnpj: formCnpj,
        contactPhone: formPhone,
        contactEmail: formEmail,
        address: formAddress || undefined,
        serviceProvided: formService,
        notes: formNotes || undefined,
        createdAt: new Date().toISOString(),
      };
      list.push(newProvider);
      db.saveProviders(list);
      db.audit(operator, 'Cadastrar', 'Providers', `Homologou novo fornecedor ${formName}`, null, newProvider);
      toast.success('Fornecedor homologado com sucesso!');
    }

    loadProviders();
    setShowForm(false);
  };

  const handleDelete = (prv: Provider) => {
    if (!hasPermission('assets', 'delete')) {
      toast.error('Privilégios de administrador/diretoria necessários para excluir homologados.');
      return;
    }

    if (confirm(`Remover fornecedor homologado ${prv.companyName}?`)) {
      const filtered = providers.filter(p => p.id !== prv.id);
      const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };
      db.saveProviders(filtered);
      db.audit(operator, 'Excluir', 'Providers', `Removeu o fornecedor homologado ${prv.companyName}`, prv, null);
      toast.success('Fornecedor descredenciado.');
      loadProviders();
      if (selectedProvider?.id === prv.id) setSelectedProvider(null);
    }
  };

  const filteredProviders = providers.filter(prv => {
    return prv.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           prv.cnpj.includes(searchQuery) || 
           prv.serviceProvided.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fornecedores Homologados</h1>
          <p className="text-xs text-gray-500 mt-1">Homologação de parceiros estratégicos de blindagens, radiocomunicação, manutenção de frotas e armas.</p>
        </div>
        
        {hasPermission('assets', 'create') && (
          <button 
            id="btn-add-provider"
            onClick={() => handleOpenForm(null)}
            className="btn btn-primary flex items-center gap-2 cursor-pointer shadow-sm text-xs"
          >
            <Plus className="w-4 h-4" /> Homologar Fornecedor
          </button>
        )}
      </div>

      {/* SEARCH BOX */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input 
            id="provider-search-box"
            type="text" 
            placeholder="Pesquisar por CNPJ, nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9"
          />
        </div>
      </div>

      {/* CORE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LIST TABLE (Left 2/3) */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Razão Social / CNPJ</th>
                    <th className="px-5 py-3.5">Contato</th>
                    <th className="px-5 py-3.5">Serviço Fornecido</th>
                    <th className="px-5 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {filteredProviders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-xs text-gray-400">
                        Nenhum fornecedor cadastrado.
                      </td>
                    </tr>
                  ) : (
                    filteredProviders.map((prv) => (
                      <tr key={prv.id} className="hover:bg-blue-50/5 transition-colors duration-150">
                        <td className="px-5 py-4">
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-xs text-gray-900 leading-tight">
                              {prv.companyName}
                            </span>
                            <span className="text-xxs text-gray-400 mt-0.5 leading-none">
                              CNPJ: {prv.cnpj}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-gray-700">
                          <div className="flex flex-col text-left">
                            <span>{prv.contactPhone}</span>
                            <span className="text-xxs text-gray-400">{prv.contactEmail}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xxs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {prv.serviceProvided}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => setSelectedProvider(prv)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-950"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {hasPermission('assets', 'update') && (
                              <button 
                                onClick={() => handleOpenForm(prv)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {hasPermission('assets', 'delete') && (
                              <button 
                                onClick={() => handleDelete(prv)}
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

        {/* DETAILS SIDE PANEL (Right 1/3) */}
        <div className="xl:col-span-1">
          {selectedProvider ? (
            <div id="provider-details-card" className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 sticky top-20 text-left relative">
              <button 
                onClick={() => setSelectedProvider(null)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-gray-100 pb-3">
                <span className="text-xxs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase">
                  FORNECEDOR HOMOLOGADO
                </span>
                <h3 className="font-extrabold text-sm text-gray-900 mt-2 leading-tight">{selectedProvider.companyName}</h3>
                <p className="text-xxs text-gray-500 mt-0.5 font-mono font-medium">CNPJ: {selectedProvider.cnpj}</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-xxs text-gray-400">Classificação do Portfólio:</span>
                  <p className="font-bold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-blue-500 fill-blue-500" /> {selectedProvider.serviceProvided}
                  </p>
                </div>
                <div>
                  <span className="text-xxs text-gray-400">E-mail Comercial:</span>
                  <p className="font-semibold text-gray-800">{selectedProvider.contactEmail}</p>
                </div>
                <div>
                  <span className="text-xxs text-gray-400">Telefone:</span>
                  <p className="font-semibold text-gray-800">{selectedProvider.contactPhone}</p>
                </div>
                {selectedProvider.address && (
                  <div>
                    <span className="text-xxs text-gray-400">Endereço Sede:</span>
                    <p className="font-semibold text-gray-800 text-xxs leading-relaxed">{selectedProvider.address}</p>
                  </div>
                )}
                {selectedProvider.notes && (
                  <div className="bg-gray-50 p-2 rounded border border-gray-150">
                    <span className="text-xxs text-gray-400 font-bold block mb-1">Notas de Fornecimento:</span>
                    <p className="text-xxxxs text-gray-600 leading-relaxed">{selectedProvider.notes}</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center text-xs text-gray-400 sticky top-20">
              <Factory className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              Selecione um fornecedor para conferir detalhes de sua ficha, contatos rápidos de faturamento de laudos e notas operacionais de suprimentos.
            </div>
          )}
        </div>

      </div>

      {/* POPUP MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 bg-gray-950 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Factory className="w-5 h-5 text-blue-500" />
                {editingProvider ? `Editar Fornecedor` : 'Homologar Novo Fornecedor'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-900 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-left">
              <div>
                <label className="form-label text-xxs font-semibold">Razão Social *</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="form-input" placeholder="Ex: Taurus Armas S.A." required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xxs font-semibold">CNPJ *</label>
                  <input type="text" value={formCnpj} onChange={e => setFormCnpj(e.target.value)} className="form-input" placeholder="00.000.000/0001-00" required />
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Especialidade / Serviço</label>
                  <select value={formService} onChange={e => setFormService(e.target.value)} className="form-input">
                    <option value="Armamento e Munição">Armamento e Munição</option>
                    <option value="Colete Balístico">Colete Balístico</option>
                    <option value="Radiocomunicação">Radiocomunicação</option>
                    <option value="Fardamento">Fardamento</option>
                    <option value="Locação de Viaturas">Locação de Viaturas</option>
                    <option value="Treinamento Operacional">Treinamento Operacional</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xxs font-semibold">E-mail Comercial *</label>
                  <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="form-input" required />
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Telefone de Contato</label>
                  <input type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="form-input" />
                </div>
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Sede Comercial (Endereço)</label>
                <input type="text" value={formAddress} onChange={e => setFormAddress(e.target.value)} className="form-input" />
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Observações e Prazos de Fornecimento</label>
                <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3} className="form-input resize-none" placeholder="Ex: Entrega de munição em até 10 dias..."></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary cursor-pointer">Cancelar</button>
                <button type="submit" className="btn btn-primary cursor-pointer text-white bg-blue-600 hover:bg-blue-700 font-bold px-6">Homologar Fornecedor</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
