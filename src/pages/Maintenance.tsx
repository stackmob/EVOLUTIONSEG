import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Asset } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, Plus, Check, X, ShieldAlert, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetNumber: string;
  assetName: string;
  maintenanceType: 'Preventiva' | 'Corretiva';
  description: string;
  providerName: string;
  startDate: string;
  expectedReturnDate: string;
  cost: number;
  status: 'Pendente' | 'Concluído';
  returnDate?: string;
  createdAt: string;
}

export const Maintenance: React.FC = () => {
  const { user: loggedUser, role: loggedRole, hasPermission } = useAuth();
  const auth = useAuth();
  const hasPerm = auth.hasPermission;

  const [maintenances, setMaintenances] = useState<MaintenanceRecord[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [formAssetId, setFormAssetId] = useState('');
  const [formType, setFormType] = useState<'Preventiva' | 'Corretiva'>('Preventiva');
  const [formDescription, setFormDescription] = useState('');
  const [formProviderName, setFormProviderName] = useState('Oficina Autorizada SP');
  const [formStartDate, setFormStartDate] = useState('');
  const [formExpectedReturn, setFormExpectedReturn] = useState('');
  const [formCost, setFormCost] = useState(150);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMaintenances(db.getMaintenance() as any);
    setAssets(db.getAssets().filter(a => a.situation === 'Disponível' || a.situation === 'Manutenção'));
  };

  const handleOpenForm = () => {
    if (assets.length === 0) {
      toast.error('Não há equipamentos de segurança disponíveis ou em manutenção no momento.');
      return;
    }
    setFormAssetId(assets[0].id);
    setFormType('Preventiva');
    setFormDescription('Revisão periódica preventiva de canal regulamentar.');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    
    const oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    setFormExpectedReturn(oneWeekLater.toISOString().split('T')[0]);
    
    setFormCost(200);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAssetId || !formStartDate || !formExpectedReturn) {
      toast.error('Preencha os campos obrigatórios da manutenção.');
      return;
    }

    const currentMaintenances = db.getMaintenance() as any[];
    const currentAssets = db.getAssets();
    const targetAsset = currentAssets.find(a => a.id === formAssetId);

    if (!targetAsset) return;

    const newRecord: MaintenanceRecord = {
      id: `mnt-${Date.now()}`,
      assetId: formAssetId,
      assetNumber: targetAsset.assetNumber,
      assetName: `${targetAsset.brand} ${targetAsset.model}`,
      maintenanceType: formType,
      description: formDescription,
      providerName: formProviderName,
      startDate: formStartDate,
      expectedReturnDate: formExpectedReturn,
      cost: Number(formCost),
      status: 'Pendente',
      createdAt: new Date().toISOString(),
    };

    // Update asset situation to "Manutenção"
    const updatedAssets = currentAssets.map(a => 
      a.id === formAssetId ? { ...a, situation: 'Manutenção' as const } : a
    );

    db.saveAssets(updatedAssets);
    db.saveMaintenance([...currentMaintenances, newRecord] as any);

    const operator = { id: auth.user?.id || 'sys', name: auth.user?.name || 'Assessor', role: auth.role };
    db.audit(operator, 'Cadastrar', 'Maintenance', `Enviou patrimônio ${targetAsset.assetNumber} para manutenção ${formType}`, null, newRecord);
    toast.success('Equipamento enviado para manutenção e atualizado na logística!');

    loadData();
    setShowForm(false);
  };

  const handleComplete = (mnt: MaintenanceRecord) => {
    if (confirm(`Confirmar encerramento e retorno da manutenção do patrimônio ${mnt.assetNumber}?`)) {
      const todayStr = new Date().toISOString().split('T')[0];

      // Update maintenance status
      const updatedMnts = (db.getMaintenance() as any[]).map(m => 
        m.id === mnt.id ? { ...m, status: 'Concluído' as const, returnDate: todayStr } : m
      );

      // Reset asset status to Available
      const updatedAssets = db.getAssets().map(a => 
        a.id === mnt.assetId ? { ...a, situation: 'Disponível' as const } : a
      );

      db.saveMaintenance(updatedMnts as any);
      db.saveAssets(updatedAssets);

      const operator = { id: auth.user?.id || 'sys', name: auth.user?.name || 'Assessor', role: auth.role };
      db.audit(operator, 'Editar', 'Maintenance', `Finalizou manutenção do patrimônio ${mnt.assetNumber}`, mnt, { ...mnt, status: 'Concluído', returnDate: todayStr });
      toast.success('Patrimônio retornado e disponível no almoxarifado!');
      
      loadData();
    }
  };

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Manutenção de Equipamentos</h1>
          <p className="text-xs text-gray-500 mt-1">Supervisão de reparos preventivos/corretivos de viaturas, fardamentos, rádios comunicadores e armas.</p>
        </div>
        
        {hasPerm('assets', 'update') && (
          <button 
            id="btn-add-maintenance"
            onClick={handleOpenForm}
            className="btn btn-primary flex items-center gap-2 cursor-pointer shadow-sm text-xs"
          >
            <Plus className="w-4 h-4" /> Enviar para Reparo / Revisão
          </button>
        )}
      </div>

      {/* CORE TIMELINE REVIEWS */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-400">
          Ordem de Serviços / Histórico de Reparos
        </div>

        <div className="divide-y divide-gray-150">
          {maintenances.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">
              Nenhuma ordem de serviço registrada no momento.
            </div>
          ) : (
            maintenances.map((mnt) => (
              <div key={mnt.id} className="p-5 hover:bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg text-gray-950 ${
                    mnt.status === 'Concluído' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600 animate-pulse'
                  }`}>
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-gray-950">PAT: {mnt.assetNumber} — {mnt.assetName}</span>
                    <p className="text-xxs text-gray-600 mt-1 leading-relaxed max-w-xl">{mnt.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xxxxs text-gray-400 font-bold uppercase tracking-wider">
                      <span>Ref: {mnt.id}</span>
                      <span>•</span>
                      <span>Prestador: {mnt.providerName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right text-xs">
                    <div className="flex items-center justify-end gap-1.5 font-bold text-gray-900">
                      <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                      R$ {mnt.cost.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </div>
                    <div className="text-xxxxs text-gray-400 mt-1 font-semibold flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" />
                      {mnt.startDate} a {mnt.returnDate || mnt.expectedReturnDate}
                    </div>
                  </div>

                  <div>
                    {mnt.status === 'Pendente' ? (
                      <button 
                        onClick={() => handleComplete(mnt)}
                        className="btn btn-secondary py-1 text-xxs font-bold text-blue-700 bg-blue-50 border-blue-200 cursor-pointer flex items-center gap-1 hover:bg-blue-100"
                      >
                        <Check className="w-3 h-3" /> Concluir OS
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xxs font-extrabold bg-emerald-50 text-emerald-700 uppercase">
                        Pronto
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* POPUP WIZARD FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 bg-gray-950 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-500" />
                Registrar Ordem de Serviço
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-900 rounded-full text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-left">
              
              <div>
                <label className="form-label text-xxs font-semibold">Equipamento para Reparo *</label>
                <select 
                  value={formAssetId} 
                  onChange={e => setFormAssetId(e.target.value)} 
                  className="form-input"
                  required
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.brand} {a.model} ({a.assetNumber})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xxs font-semibold">Classificação Manutenção</label>
                  <select 
                    value={formType} 
                    onChange={e => setFormType(e.target.value as any)} 
                    className="form-input"
                  >
                    <option value="Preventiva">Preventiva (Revisão/Troca)</option>
                    <option value="Corretiva">Corretiva (Dano/Conserto)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Custo Previsto (R$)</label>
                  <input type="number" value={formCost} onChange={e => setFormCost(Number(e.target.value))} className="form-input" required />
                </div>
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Oficina / Prestador Homologado</label>
                <input type="text" value={formProviderName} onChange={e => setFormProviderName(e.target.value)} className="form-input" placeholder="Oficina Credenciada" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xxs font-semibold">Data Envio OS *</label>
                  <input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="form-input" required />
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">Previsão Retorno *</label>
                  <input type="date" value={formExpectedReturn} onChange={e => setFormExpectedReturn(e.target.value)} className="form-input" required />
                </div>
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Descrição do Defeito / Escopo da Revisão</label>
                <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={3} className="form-input resize-none" placeholder="Informe o laudo técnico inicial..." required></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary cursor-pointer">Cancelar</button>
                <button type="submit" className="btn btn-primary cursor-pointer text-white bg-blue-600 hover:bg-blue-700 font-bold px-6">Registrar OS</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
