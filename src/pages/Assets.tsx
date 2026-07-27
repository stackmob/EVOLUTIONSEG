import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Asset, Employee, Client, Contract, AssetAllocation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, Search, Plus, Eye, Edit, Trash2, X, ClipboardSignature, 
  ArrowRight, ShieldCheck, History, Calendar, CheckCircle2, QrCode, FileText, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadDocument, DocumentMetadata } from '../services/storage';
import { DocumentViewerModal } from '../components/DocumentViewerModal';

interface AssetsProps {
  openDetailId: { type: string; id: string } | null;
  setOpenDetailId: (val: { type: string; id: string } | null) => void;
}

export const Assets: React.FC<AssetsProps> = ({ openDetailId, setOpenDetailId }) => {
  const { user: loggedUser, role: loggedRole, hasPermission } = useAuth();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSituation, setFilterSituation] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Asset Form fields
  const [activeViewDoc, setActiveViewDoc] = useState<DocumentMetadata | null>(null);
  const [formDocUrl, setFormDocUrl] = useState<string | undefined>(undefined);
  const [formNumber, setFormNumber] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formCategory, setFormCategory] = useState<'Celulares' | 'Carros' | 'Motos' | 'Notebook' | 'Computador' | 'Tablet' | 'Colete' | 'Arma' | 'Rádio Comunicador' | 'Lanterna' | 'Uniformes' | 'Equipamentos' | 'Outros'>('Rádio Comunicador');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formProviderId, setFormProviderId] = useState('');
  const [formPurchaseDate, setFormPurchaseDate] = useState('');
  const [formPurchaseValue, setFormPurchaseValue] = useState(1000);
  const [formWarrantyDate, setFormWarrantyDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Allocation Form fields
  const [allocAssetId, setAllocAssetId] = useState('');
  const [allocTargetType, setAllocTargetType] = useState<'Funcionário' | 'Cliente' | 'Contrato'>('Funcionário');
  const [allocTargetId, setAllocTargetId] = useState('');
  const [allocExpectedReturn, setAllocExpectedReturn] = useState('');
  const [allocCondition, setAllocCondition] = useState('Excelente');
  const [allocSignature, setAllocSignature] = useState('');
  const [allocNotes, setAllocNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (openDetailId && openDetailId.type === 'Patrimônio') {
      const target = db.getAssets().find(a => a.id === openDetailId.id);
      if (target) {
        setSelectedAsset(target);
      }
      setOpenDetailId(null);
    }
  }, [openDetailId]);

  const loadData = () => {
    setAssets(db.getAssets());
    setEmployees(db.getEmployees().filter(e => e.situation === 'Ativo'));
    setClients(db.getClients().filter(c => c.status === 'Ativo'));
    setContracts(db.getContracts().filter(c => c.situation === 'Ativo'));
    setAllocations(db.getAllocations());
  };

  const handleOpenForm = () => {
    const providers = db.getProviders();
    if (providers.length === 0) {
      toast.error('Cadastre pelo menos um fornecedor homologado antes de incluir patrimônios.');
      return;
    }

    setFormNumber(`PAT-00${db.getAssets().length + 12}`);
    setFormSerial(`SR-${Date.now().toString().slice(-6)}`);
    setFormCategory('Rádio Comunicador');
    setFormBrand('Motorola');
    setFormModel('Portátil DEP450');
    setFormProviderId(providers[0].id);
    setFormPurchaseDate(new Date().toISOString().split('T')[0]);
    setFormPurchaseValue(1500);
    
    const warrantY = new Date();
    warrantY.setFullYear(warrantY.getFullYear() + 2); // 2 years warranty
    setFormWarrantyDate(warrantY.toISOString().split('T')[0]);
    
    setFormNotes('');
    setShowForm(true);
  };

  const handleOpenAllocationForm = (ast: Asset) => {
    setAllocAssetId(ast.id);
    setAllocTargetType('Funcionário');
    setAllocTargetId(employees[0]?.id || '');
    setAllocCondition('Excelente');
    setAllocSignature('');
    setAllocNotes('');
    
    const retDate = new Date();
    retDate.setMonth(retDate.getMonth() + 6); // 6 months standard checkout
    setAllocExpectedReturn(retDate.toISOString().split('T')[0]);

    setShowAllocationForm(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber || !formSerial || !formBrand || !formModel) {
      toast.error('Informe os campos obrigatórios do patrimônio.');
      return;
    }

    const list = db.getAssets();
    const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };

    const newAsset: Asset = {
      id: `ast-${Date.now()}`,
      assetNumber: formNumber,
      serialNumber: formSerial,
      category: formCategory,
      brand: formBrand,
      model: formModel,
      providerId: formProviderId,
      purchaseDate: formPurchaseDate,
      purchaseValue: Number(formPurchaseValue),
      warrantyEndDate: formWarrantyDate,
      situation: 'Disponível',
      notes: formNotes || undefined,
      barcodeValue: `789${Date.now().toString().slice(-9)}`,
      createdAt: new Date().toISOString(),
    };

    list.push(newAsset);
    db.saveAssets(list);
    db.audit(operator, 'Cadastrar', 'Assets', `Cadastrou patrimônio logístico: ${formBrand} ${formModel} (${formNumber})`, null, newAsset);
    toast.success('Patrimônio cadastrado com sucesso!');
    
    loadData();
    setShowForm(false);
  };

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocTargetId || !allocSignature) {
      toast.error('Por favor, assine digitalmente o termo para concluir a cautela.');
      return;
    }

    const currentAllocations = db.getAllocations();
    const currentAssets = db.getAssets();
    const asset = currentAssets.find(a => a.id === allocAssetId);

    if (!asset) return;

    // Create checkout cautela record
    const newAlloc: AssetAllocation = {
      id: `alc-${Date.now()}`,
      assetId: allocAssetId,
      targetType: allocTargetType,
      targetId: allocTargetId,
      allocationDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: allocExpectedReturn,
      registeredBy: loggedUser?.name || 'Supervisor',
      equipmentCondition: allocCondition,
      digitalSignature: allocSignature,
      historyNotes: allocNotes || undefined,
      createdAt: new Date().toISOString(),
    };

    // Update asset status to "Emprestado"
    const updatedAssets = currentAssets.map(a => 
      a.id === allocAssetId ? { ...a, situation: 'Emprestado' as const } : a
    );

    db.saveAssets(updatedAssets);
    db.saveAllocations([...currentAllocations, newAlloc]);
    
    const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };
    db.audit(operator, 'Cadastrar', 'Assets', `Realizou cautela do patrimônio ${asset.assetNumber} para ${allocTargetType}`, null, newAlloc);
    toast.success('Termo de Cautela firmado e assinado digitalmente!');
    
    loadData();
    setShowAllocationForm(false);
    if (selectedAsset?.id === allocAssetId) setSelectedAsset({ ...selectedAsset, situation: 'Emprestado' });
  };

  const handleReturnAsset = (ast: Asset) => {
    const allAlcs = db.getAllocations();
    const activeAlloc = allAlcs.find(al => al.assetId === ast.id && !al.returnDate);

    if (!activeAlloc) return;

    if (confirm(`Confirmar devolução do patrimônio ${ast.assetNumber} (${ast.brand} ${ast.model}) ao almoxarifado?`)) {
      const todayStr = new Date().toISOString().split('T')[0];
      
      // Update allocation record with return date
      const updatedAlcs = allAlcs.map(al => 
        al.id === activeAlloc.id ? { ...al, returnDate: todayStr } : al
      );

      // Update asset state back to Available
      const updatedAssets = db.getAssets().map(a => 
        a.id === ast.id ? { ...a, situation: 'Disponível' as const } : a
      );

      db.saveAllocations(updatedAlcs);
      db.saveAssets(updatedAssets);

      const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };
      db.audit(operator, 'Editar', 'Assets', `Registrou devolução e encerrou cautela do patrimônio ${ast.assetNumber}`, activeAlloc, { ...activeAlloc, returnDate: todayStr });
      toast.success('Devolução registrada. Patrimônio disponível!');
      
      loadData();
      if (selectedAsset?.id === ast.id) setSelectedAsset({ ...selectedAsset, situation: 'Disponível' });
    }
  };

  const filteredAssets = assets.filter(ast => {
    const matchesSearch = ast.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ast.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ast.assetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ast.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || ast.category === filterCategory;
    const matchesSituation = filterSituation === 'all' || ast.situation === filterSituation;
    return matchesSearch && matchesCategory && matchesSituation;
  });

  const categories = ['Celulares', 'Carros', 'Motos', 'Notebook', 'Computador', 'Tablet', 'Colete', 'Arma', 'Rádio Comunicador', 'Lanterna', 'Uniformes', 'Equipamentos', 'Outros'];

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Controle Patrimonial</h1>
          <p className="text-xs text-gray-500 mt-1">Gestão de armamento, coletes balísticos, veículos e telecomunicações com QR Code, Cautela Digital e Devoluções.</p>
        </div>
        
        {hasPermission('assets', 'create') && (
          <button 
            id="btn-add-asset"
            onClick={handleOpenForm}
            className="btn btn-primary flex items-center gap-2 cursor-pointer shadow-sm text-xs"
          >
            <Plus className="w-4 h-4" /> Cadastrar Equipamento / Veículo
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input 
            id="asset-search-box"
            type="text" 
            placeholder="Pesquisar por PAT, modelo, série..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          <select 
            id="filter-asset-category"
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-input py-1 text-xs"
          >
            <option value="all">Todas Categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            id="filter-asset-situation"
            value={filterSituation} 
            onChange={(e) => setFilterSituation(e.target.value)}
            className="form-input py-1 text-xs"
          >
            <option value="all">Todas Situações</option>
            <option value="Disponível">Disponível</option>
            <option value="Emprestado">Cautelado (Emprestado)</option>
            <option value="Manutenção">Em Manutenção</option>
            <option value="Baixado">Baixado / Descartado</option>
          </select>
        </div>
      </div>

      {/* CORE VIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* TABULAR LIST (Left 2/3) */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Patrimônio / Categoria</th>
                    <th className="px-5 py-3.5">Nº de Série</th>
                    <th className="px-5 py-3.5">Modelo / Marca</th>
                    <th className="px-5 py-3.5">Situação</th>
                    <th className="px-5 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-xs text-gray-400">
                        Nenhum item patrimonial registrado.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((ast) => (
                      <tr key={ast.id} className="hover:bg-blue-50/5 transition-colors duration-150">
                        <td className="px-5 py-4">
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-xs text-gray-900 leading-tight">
                              {ast.assetNumber}
                            </span>
                            <span className="text-xxs text-gray-400 mt-0.5 leading-none font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase self-start">
                              {ast.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-mono text-gray-700 font-medium">
                          {ast.serialNumber}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-800 font-semibold">
                          {ast.brand} {ast.model}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-bold uppercase ${
                            ast.situation === 'Disponível' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : ast.situation === 'Emprestado' 
                                ? 'bg-blue-50 text-blue-800' 
                                : ast.situation === 'Manutenção'
                                  ? 'bg-red-50 text-red-700 animate-pulse'
                                  : 'bg-gray-100 text-gray-700'
                          }`}>
                            {ast.situation === 'Emprestado' ? 'Cautelado' : ast.situation}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => setSelectedAsset(ast)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-950"
                              title="Visualizar Cautelas e Códigos"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {hasPermission('assets', 'update') && ast.situation === 'Disponível' && (
                              <button 
                                onClick={() => handleOpenAllocationForm(ast)}
                                className="p-1 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600"
                                title="Entregar Cautela (Checkout)"
                              >
                                <ClipboardSignature className="w-4 h-4" />
                              </button>
                            )}

                            {hasPermission('assets', 'update') && ast.situation === 'Emprestado' && (
                              <button 
                                onClick={() => handleReturnAsset(ast)}
                                className="p-1 hover:bg-emerald-50 rounded text-gray-400 hover:text-emerald-600"
                                title="Registrar Devolução"
                              >
                                <CheckCircle2 className="w-4 h-4" />
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
          {selectedAsset ? (
            <div id="asset-details-card" className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 sticky top-20 text-left relative overflow-hidden">
              <button 
                onClick={() => setSelectedAsset(null)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-150 rounded-full text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-gray-100 pb-3">
                <span className="text-xxs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase">
                  {selectedAsset.category}
                </span>
                <h3 className="font-extrabold text-sm text-gray-900 mt-2 leading-tight">{selectedAsset.brand} {selectedAsset.model}</h3>
                <p className="text-xxs text-gray-500 mt-0.5 font-mono font-medium">PATRIMÔNIO: {selectedAsset.assetNumber} | S/N: {selectedAsset.serialNumber}</p>
              </div>

              {/* Barcode & QR code Frame */}
              <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-3">
                <div className="flex flex-col items-center justify-center border border-gray-100 rounded-lg p-2.5 bg-gray-50">
                  <QrCode className="w-12 h-12 text-gray-950" />
                  <span className="text-xxxxs text-gray-400 uppercase tracking-widest mt-1.5 font-bold">QR CODE LOCAL</span>
                </div>
                <div className="flex flex-col items-center justify-center border border-gray-100 rounded-lg p-2 bg-gray-50">
                  <div className="h-10 w-24 bg-repeating-linear bg-black" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 5px)' }}></div>
                  <span className="text-xxxxs font-mono text-gray-500 mt-1.5 font-bold">{selectedAsset.barcodeValue}</span>
                </div>
              </div>

              {/* Cautela Timeline details */}
              <div className="space-y-3.5">
                <h4 className="text-xxs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-50 pb-1">
                  <History className="w-4 h-4" /> Termos de Cautela e Histórico
                </h4>
                
                {allocations.filter(al => al.assetId === selectedAsset.id).length === 0 ? (
                  <p className="text-xxs text-gray-400 py-2">Sem registros de empréstimos/cautelas para este item.</p>
                ) : (
                  <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                    {allocations.filter(al => al.assetId === selectedAsset.id).map(al => (
                      <div key={al.id} className="pl-6 text-xxs relative text-left">
                        <span className={`absolute left-1 top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          al.returnDate ? 'bg-gray-300' : 'bg-blue-500 animate-pulse'
                        }`}></span>
                        
                        <p className="font-bold text-gray-900">Alocado para: {al.targetName}</p>
                        <p className="text-xxxxs text-gray-400 mt-0.5">Retirada: {al.allocationDate} {al.returnDate ? `| Devolução: ${al.returnDate}` : `| Previsão: ${al.expectedReturnDate}`}</p>
                        <p className="text-xxxxs text-gray-500 font-medium">Condição: <span className="font-semibold text-gray-700">{al.equipmentCondition}</span> | Resp: {al.registeredBy}</p>
                        {al.digitalSignature && (
                          <span className="inline-block border border-dashed border-blue-300 bg-blue-50/50 text-blue-700 text-xxxxs px-1.5 py-0.5 rounded font-mono mt-1">
                            Assinatura: {al.digitalSignature}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center text-xs text-gray-400 sticky top-20">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              Selecione um patrimônio para gerar etiquetas de QR code / Barcode, verificar cautelas ativas, consultar prazos de garantias e conferir termos de assinaturas operacionais.
            </div>
          )}
        </div>

      </div>

      {/* POPUP ASSET CREATION FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 bg-gray-950 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Cadastrar Patrimônio Logístico
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-900 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="p-6 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xxs font-semibold">Número Patrimônio *</label>
                  <input type="text" value={formNumber} onChange={e => setFormNumber(e.target.value)} className="form-input" placeholder="PAT-0042" required />
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Número de Série *</label>
                  <input type="text" value={formSerial} onChange={e => setFormSerial(e.target.value)} className="form-input" placeholder="S/N: SR-10291" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="form-label text-xxs font-semibold">Categoria Equipamento</label>
                  <select 
                    value={formCategory} 
                    onChange={e => setFormCategory(e.target.value as any)} 
                    className="form-input"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Marca *</label>
                  <input type="text" value={formBrand} onChange={e => setFormBrand(e.target.value)} className="form-input" placeholder="Ex: Taurus" required />
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Modelo *</label>
                  <input type="text" value={formModel} onChange={e => setFormModel(e.target.value)} className="form-input" placeholder="Ex: PT92" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="form-label text-xxs font-semibold">Fornecedor Comprador</label>
                  <select 
                    value={formProviderId} 
                    onChange={e => setFormProviderId(e.target.value)} 
                    className="form-input"
                  >
                    {db.getProviders().map(p => (
                      <option key={p.id} value={p.id}>{p.companyName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Valor Compra (R$)</label>
                  <input type="number" value={formPurchaseValue} onChange={e => setFormPurchaseValue(Number(e.target.value))} className="form-input" />
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Garantia Até</label>
                  <input type="date" value={formWarrantyDate} onChange={e => setFormWarrantyDate(e.target.value)} className="form-input" />
                </div>
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Data da Aquisição</label>
                <input type="date" value={formPurchaseDate} onChange={e => setFormPurchaseDate(e.target.value)} className="form-input" />
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Laudos e Anotações Físicas</label>
                <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3} className="form-input resize-none" placeholder="Marcas físicas, termos balísticos..."></textarea>
              </div>

              <div>
                <label className="form-label text-xxs font-semibold block mb-1">Nota Fiscal / Laudo do Equipamento (PDF / Imagem)</label>
                <label className={`w-full p-2.5 border rounded-lg flex items-center justify-between cursor-pointer transition-all hover:border-blue-400 ${
                  formDocUrl ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  <span className="flex items-center gap-2 text-xs">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>{formDocUrl ? 'Nota Fiscal / Laudo Anexado' : 'Clique para Escolher Arquivo da NF / Laudo'}</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xxxxs ${formDocUrl ? 'bg-emerald-200 text-emerald-900 font-bold' : 'bg-gray-200 text-gray-500'}`}>
                    {formDocUrl ? 'Anexado' : 'Selecionar'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        toast.loading('Enviando Nota Fiscal / Laudo...', { id: 'upload-ast-doc' });
                        try {
                          const meta = await uploadDocument(file, 'assets');
                          setFormDocUrl(meta.fileUrl);
                          toast.success('Documento do equipamento anexado!', { id: 'upload-ast-doc' });
                        } catch (err) {
                          toast.error('Erro ao enviar arquivo.', { id: 'upload-ast-doc' });
                        }
                      }
                    }}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary cursor-pointer">Cancelar</button>
                <button type="submit" className="btn btn-primary cursor-pointer text-white bg-blue-600 hover:bg-blue-700 font-bold px-6">Salvar Patrimônio</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* POPUP CAUTELA SIGNATURE FORM */}
      {showAllocationForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 bg-gray-950 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <ClipboardSignature className="w-5 h-5 text-blue-500" />
                Firmar Termo de Cautela
              </h3>
              <button onClick={() => setShowAllocationForm(false)} className="p-1 hover:bg-gray-900 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAllocation} className="p-6 space-y-4 text-left">
              
              <div className="bg-blue-50 border border-blue-200 p-2.5 rounded text-xxxxs text-blue-800 leading-relaxed">
                Você está retirando um patrimônio do almoxarifado. Esta ação criará um termo de custódia assinado e monitorado pelo setor de auditorias da Evolution.
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Vincular Cautela para:</label>
                <select 
                  value={allocTargetType} 
                  onChange={e => {
                    const type = e.target.value as any;
                    setAllocTargetType(type);
                    if (type === 'Funcionário') setAllocTargetId(employees[0]?.id || '');
                    else if (type === 'Cliente') setAllocTargetId(clients[0]?.id || '');
                    else if (type === 'Contrato') setAllocTargetId(contracts[0]?.id || '');
                  }} 
                  className="form-input"
                >
                  <option value="Funcionário">Funcionário (Guarda/Vigilante)</option>
                  <option value="Cliente">Cliente (Posto de Serviço)</option>
                  <option value="Contrato">Contrato Ativo</option>
                </select>
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Destinatário Responsável *</label>
                <select 
                  value={allocTargetId} 
                  onChange={e => setAllocTargetId(e.target.value)} 
                  className="form-input"
                  required
                >
                  {allocTargetType === 'Funcionário' && employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                  {allocTargetType === 'Cliente' && clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  {allocTargetType === 'Contrato' && contracts.map(con => (
                    <option key={con.id} value={con.id}>{con.contractNumber} (Cliente: {con.clientName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xxs font-semibold">Previsão Devolução *</label>
                  <input type="date" value={allocExpectedReturn} onChange={e => setAllocExpectedReturn(e.target.value)} className="form-input" required />
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Estado de Conservação</label>
                  <select value={allocCondition} onChange={e => setAllocCondition(e.target.value)} className="form-input">
                    <option value="Excelente">Excelente</option>
                    <option value="Regular">Regular (Pequeno Desgaste)</option>
                    <option value="Com avaria">Com Avaria (Mapeado)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Anotações da Retirada</label>
                <input type="text" value={allocNotes} onChange={e => setAllocNotes(e.target.value)} className="form-input" placeholder="Ex: Com 12 cartuchos..." />
              </div>

              <div className="border-t border-gray-150 pt-3">
                <label className="form-label text-xxs font-extrabold text-blue-700 uppercase tracking-widest block mb-1">Assinatura Eletrônica Formal *</label>
                <span className="text-xxxxs text-gray-400 block mb-2 leading-tight">Escreva seu nome completo exatamente para firmar o aceite do termo.</span>
                <input 
                  type="text" 
                  value={allocSignature} 
                  onChange={e => setAllocSignature(e.target.value)} 
                  className="form-input font-mono text-xs border-blue-500/35 focus:ring-blue-500 bg-blue-50/10 placeholder-gray-400" 
                  placeholder="Nome Completo do Recebedor"
                  required 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAllocationForm(false)} className="btn btn-secondary cursor-pointer">Cancelar</button>
                <button type="submit" className="btn btn-primary cursor-pointer text-white bg-blue-600 hover:bg-blue-700 font-bold px-6">Firmar e Assinar Cautela</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT VIEWER MODAL */}
      <DocumentViewerModal
        document={activeViewDoc}
        onClose={() => setActiveViewDoc(null)}
      />

    </div>
  );
};
