import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { db } from '../services/db';
import { SaasPlan } from '../types';
import { 
  CreditCard, Shield, CheckCircle2, Zap, Building2, Users, 
  Briefcase, Package, ArrowUpRight, Plus, Download, Sparkles, 
  HelpCircle, Clock, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SaasSubscription: React.FC = () => {
  const { currentTenant, tenantsList, switchTenant, updatePlan, invoices, registerNewTenant } = useTenant();
  
  const [activeSubTab, setActiveSubTab] = useState<'planos' | 'faturas' | 'multi_tenant'>('planos');
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');
  const [showNewTenantModal, setShowNewTenantModal] = useState(false);

  // New tenant form states
  const [tenantName, setTenantName] = useState('');
  const [tenantCnpj, setTenantCnpj] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SaasPlan>('Pro');

  // Calculate actual usage from DB
  const employeesCount = db.getEmployees().length;
  const clientsCount = db.getClients().length;
  const assetsCount = db.getAssets().length;

  const empPercent = Math.min(Math.round((employeesCount / currentTenant.maxEmployees) * 100), 100);
  const clientPercent = Math.min(Math.round((clientsCount / currentTenant.maxClients) * 100), 100);
  const assetPercent = Math.min(Math.round((assetsCount / currentTenant.maxAssets) * 100), 100);

  const handleRegisterTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !tenantCnpj || !ownerEmail) {
      toast.error('Preencha os campos obrigatórios para cadastrar a empresa SaaS.');
      return;
    }
    registerNewTenant(tenantName, tenantCnpj, ownerName || 'Administrador', ownerEmail, selectedPlan);
    setShowNewTenantModal(false);
    setTenantName('');
    setTenantCnpj('');
    setOwnerName('');
    setOwnerEmail('');
  };

  return (
    <div className="space-y-6">
      
      {/* SaaS Page Title & Tenant Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-slate-900 to-blue-950 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 text-white pointer-events-none">
          <Shield className="w-80 h-80" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xxs font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> EvolutionSeg SaaS Multi-Tenant
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold uppercase tracking-wider ${
                currentTenant.plan === 'Enterprise' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                currentTenant.plan === 'Pro' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                Plano {currentTenant.plan}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Gestão da Assinatura & Licenciamento
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Gerencie a cota de vigilantes, postos de clientes, renovação de licenças SaaS e faturamento da empresa <strong className="text-white font-bold">{currentTenant.name}</strong>.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col gap-1 text-left min-w-56">
            <span className="text-xxxxs text-slate-300 font-bold uppercase tracking-widest">Organização Selecionada</span>
            <div className="font-bold text-base text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="truncate">{currentTenant.name}</span>
            </div>
            <span className="text-xxs text-slate-300">CNPJ: {currentTenant.cnpj}</span>
            <span className="text-xxs text-emerald-300 font-semibold mt-1">Status: Assinatura {currentTenant.status}</span>
          </div>
        </div>
      </div>

      {/* Navigation SubTabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl p-1 shadow-xs justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('planos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'planos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            Planos & Uso de Cotas
          </button>

          <button
            onClick={() => setActiveSubTab('faturas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'faturas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Faturas & Cobrança SaaS
          </button>

          <button
            onClick={() => setActiveSubTab('multi_tenant')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'multi_tenant'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Empresas do Grupo (Multi-Tenant)
          </button>
        </div>

        <div className="pr-3 text-xxs font-bold text-gray-500 hidden sm:block">
          SaaS ID: <span className="font-mono text-gray-900">{currentTenant.subdomain}.evolutionseg.com.br</span>
        </div>
      </div>

      {/* SUBTAB 1: PLANOS & USO DE COTAS */}
      {activeSubTab === 'planos' && (
        <div className="space-y-6">
          
          {/* Quotas & License Consumption Grid */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Consumo de Licenças e Cotas do Plano ({currentTenant.plan})</h3>
                <p className="text-xxs text-gray-500">Acompanhe o limite cadastral de colaboradores, clientes e ativos para esta empresa.</p>
              </div>
              <span className="text-xxs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                Renova em: {new Date(currentTenant.renewsAt).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Employee Quota */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">Vigilantes & Staff</span>
                      <span className="text-xxxxs text-gray-400">Limite do Plano</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-gray-900">{employeesCount} / {currentTenant.maxEmployees}</span>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        empPercent >= 90 ? 'bg-red-500' : empPercent >= 75 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${empPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xxxxs text-gray-500 font-semibold">
                    <span>{empPercent}% Utilizado</span>
                    <span>{currentTenant.maxEmployees - employeesCount} Vagas Restantes</span>
                  </div>
                </div>
              </div>

              {/* Clients Quota */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">Clientes Contratantes</span>
                      <span className="text-xxxxs text-gray-400">Limite de Postos</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-gray-900">{clientsCount} / {currentTenant.maxClients}</span>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        clientPercent >= 90 ? 'bg-red-500' : clientPercent >= 75 ? 'bg-amber-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${clientPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xxxxs text-gray-500 font-semibold">
                    <span>{clientPercent}% Utilizado</span>
                    <span>{currentTenant.maxClients - clientsCount} Clientes Livres</span>
                  </div>
                </div>
              </div>

              {/* Assets Quota */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">Patrimônio / Veículos</span>
                      <span className="text-xxxxs text-gray-400">Ativos Gerenciados</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-gray-900">{assetsCount} / {currentTenant.maxAssets}</span>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        assetPercent >= 90 ? 'bg-red-500' : assetPercent >= 75 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${assetPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xxxxs text-gray-500 font-semibold">
                    <span>{assetPercent}% Utilizado</span>
                    <span>{currentTenant.maxAssets - assetsCount} Ativos Livres</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <span className={`text-xs font-bold ${billingCycle === 'mensal' ? 'text-gray-900' : 'text-gray-400'}`}>
              Cobrança Mensal
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'mensal' ? 'anual' : 'mensal')}
              className="w-14 h-7 bg-gray-900 rounded-full p-1 transition-colors duration-200 flex items-center cursor-pointer shadow-inner"
            >
              <div className={`w-5 h-5 bg-blue-500 rounded-full transition-transform duration-200 ${
                billingCycle === 'anual' ? 'translate-x-7' : 'translate-x-0'
              }`}></div>
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'anual' ? 'text-blue-600' : 'text-gray-400'}`}>
              Cobrança Anual
              <span className="bg-emerald-100 text-emerald-800 text-xxxxs px-2 py-0.5 rounded-full font-extrabold uppercase">Economize 20%</span>
            </span>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* PLANO STARTER */}
            <div className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between relative ${
              currentTenant.plan === 'Starter' ? 'border-2 border-blue-600 ring-2 ring-blue-600/10' : 'border-gray-200'
            }`}>
              {currentTenant.plan === 'Starter' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xxxxs font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                  Seu Plano Atual
                </div>
              )}

              <div>
                <h4 className="font-extrabold text-lg text-gray-900">Plano Starter</h4>
                <p className="text-xxs text-gray-500 mt-1">Ideal para pequenas empresas de vigilância ou empresas iniciantes.</p>

                <div className="my-6">
                  <span className="text-3xl font-black text-gray-900">R$ {billingCycle === 'anual' ? '232' : '290'}</span>
                  <span className="text-xs text-gray-400 font-medium">/mês {billingCycle === 'anual' && '(faturamento anual)'}</span>
                </div>

                <ul className="space-y-3 text-xs text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Até <strong>10 Vigilantes/Funcionários</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Até <strong>3 Clientes/Postos</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Até <strong>15 Ativos de Patrimônio</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Gestão de Escalas Diárias (12x36, 5x2)
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gray-300 shrink-0" />
                    Ocorrências Funcionais Básicas
                  </li>
                </ul>
              </div>

              <button
                disabled={currentTenant.plan === 'Starter'}
                onClick={() => updatePlan('Starter', billingCycle)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  currentTenant.plan === 'Starter'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {currentTenant.plan === 'Starter' ? 'Plano Ativo' : 'Selecionar Starter'}
              </button>
            </div>

            {/* PLANO PRO */}
            <div className={`bg-white border rounded-2xl p-6 shadow-md flex flex-col justify-between relative border-blue-500 ${
              currentTenant.plan === 'Pro' ? 'border-2 border-blue-600 ring-2 ring-blue-600/20' : 'border-blue-200'
            }`}>
              {currentTenant.plan === 'Pro' ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xxxxs font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                  Seu Plano Atual
                </div>
              ) : (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xxxxs font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                  Mais Popular
                </div>
              )}

              <div>
                <h4 className="font-extrabold text-lg text-gray-900">Plano Profissional</h4>
                <p className="text-xxs text-gray-500 mt-1">Para empresas de segurança privada em franca expansão operando múltiplos postos.</p>

                <div className="my-6">
                  <span className="text-3xl font-black text-gray-900">R$ {billingCycle === 'anual' ? '552' : '690'}</span>
                  <span className="text-xs text-gray-400 font-medium">/mês {billingCycle === 'anual' && '(faturamento anual)'}</span>
                </div>

                <ul className="space-y-3 text-xs text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    Até <strong>50 Vigilantes/Funcionários</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    Até <strong>15 Clientes/Postos</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    Até <strong>60 Ativos/Veículos</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    Módulo Avançado de Ocorrências e Histórico
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    Relatórios em PDF e Excel Customizados
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    Controle de Manutenção e Fornecedores
                  </li>
                </ul>
              </div>

              <button
                disabled={currentTenant.plan === 'Pro'}
                onClick={() => updatePlan('Pro', billingCycle)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  currentTenant.plan === 'Pro'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                }`}
              >
                {currentTenant.plan === 'Pro' ? 'Plano Ativo' : 'Selecionar Pro'}
              </button>
            </div>

            {/* PLANO ENTERPRISE */}
            <div className={`bg-slate-900 text-white border rounded-2xl p-6 shadow-xl flex flex-col justify-between relative ${
              currentTenant.plan === 'Enterprise' ? 'border-2 border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-800'
            }`}>
              {currentTenant.plan === 'Enterprise' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-gray-950 text-xxxxs font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                  Seu Plano Atual
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-lg text-white">Plano Enterprise</h4>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-xxs text-slate-300 mt-1">Para grandes corporações de segurança privada que exigem capacidade ilimitada.</p>

                <div className="my-6">
                  <span className="text-3xl font-black text-white">R$ {billingCycle === 'anual' ? '1.032' : '1.290'}</span>
                  <span className="text-xs text-slate-400 font-medium">/mês {billingCycle === 'anual' && '(faturamento anual)'}</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-200 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    Até <strong>250+ Vigilantes/Funcionários</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    Até <strong>100+ Clientes/Postos</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    Até <strong>500+ Patrimônios & Armas</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    Auditoria de Logs Completa (Segurança LGPD)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    Acesso Multi-Supervisor & Portal do Cliente
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    Suporte VIP 24/7 com Gerente Dedicado
                  </li>
                </ul>
              </div>

              <button
                disabled={currentTenant.plan === 'Enterprise'}
                onClick={() => updatePlan('Enterprise', billingCycle)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  currentTenant.plan === 'Enterprise'
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500 text-gray-950 hover:bg-amber-400 shadow-lg font-black'
                }`}
              >
                {currentTenant.plan === 'Enterprise' ? 'Plano Ativo' : 'Upgrade para Enterprise'}
              </button>
            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 2: FATURAS & COBRANÇA */}
      {activeSubTab === 'faturas' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Formas de Pagamento */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs col-span-1 space-y-4">
              <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" /> Método de Pagamento SaaS
              </h3>

              <div className="bg-gray-900 text-white rounded-xl p-4 space-y-3 relative overflow-hidden shadow-md">
                <div className="flex justify-between items-center">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Cartão Corporativo</span>
                  <span className="text-xs font-black italic text-blue-400">VISA</span>
                </div>
                <div className="font-mono text-sm tracking-wider my-2 text-slate-200">
                  •••• •••• •••• 8842
                </div>
                <div className="flex justify-between text-xxxxs text-slate-400 font-semibold">
                  <span>TITULAR: EVOLUTION SEGURANCA LTDA</span>
                  <span>EXP: 09/29</span>
                </div>
              </div>

              <button
                onClick={() => toast.success('Abertura de modal para alterar cartão de crédito.')}
                className="btn btn-secondary w-full text-xs cursor-pointer"
              >
                Alterar Cartão Registrado
              </button>
            </div>

            {/* Invoices List */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-extrabold text-sm text-gray-900">Histórico de Faturas Emitidas</h3>
                <span className="text-xxs text-gray-500 font-semibold">Faturamento Recorrente SaaS</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xxxxs font-extrabold">
                    <tr>
                      <th className="p-3 rounded-l-lg">Nº Fatura</th>
                      <th className="p-3">Vencimento</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right rounded-r-lg">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-gray-900">{inv.invoiceNumber}</td>
                        <td className="p-3 text-gray-600">{new Date(inv.dueDate).toLocaleDateString('pt-BR')}</td>
                        <td className="p-3 font-bold text-gray-900">
                          {inv.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-xxxxs font-extrabold uppercase ${
                            inv.status === 'Pago' ? 'bg-emerald-100 text-emerald-800' :
                            inv.status === 'Pendente' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => toast.success(`Iniciando download do comprovante da fatura ${inv.invoiceNumber}`)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-blue-600 font-bold flex items-center gap-1 ml-auto text-xxs cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 3: EMPRESAS DO GRUPO (MULTI-TENANT) */}
      {activeSubTab === 'multi_tenant' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Empresas e Filiais Cadastradas no SaaS (Multi-Tenant)</h3>
                <p className="text-xxs text-gray-500">Alterne instantaneamente o contexto operacional ou provisione novas organizações independentes.</p>
              </div>

              <button
                onClick={() => setShowNewTenantModal(true)}
                className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" /> Nova Empresa SaaS
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tenantsList.map((t) => {
                const isSelected = t.id === currentTenant.id;
                return (
                  <div 
                    key={t.id}
                    className={`border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-blue-50/40 border-blue-600 ring-2 ring-blue-600/20 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xxxxs font-mono font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {t.subdomain}
                        </span>
                        <span className={`text-xxxxs font-bold px-2 py-0.5 rounded-full uppercase ${
                          t.plan === 'Enterprise' ? 'bg-amber-100 text-amber-800' :
                          t.plan === 'Pro' ? 'bg-blue-100 text-blue-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {t.plan}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        {t.name}
                      </h4>
                      <p className="text-xxs text-gray-500 mt-1">CNPJ: {t.cnpj}</p>
                      <p className="text-xxs text-gray-500">Proprietário: {t.ownerName}</p>

                      <div className="my-3 pt-2 border-t border-gray-100 flex justify-between text-xxxxs font-bold text-gray-600">
                        <span>Max Vigilantes: {t.maxEmployees}</span>
                        <span>Max Clientes: {t.maxClients}</span>
                      </div>
                    </div>

                    <button
                      disabled={isSelected}
                      onClick={() => switchTenant(t.id)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-600 text-white font-black cursor-default shadow-xs' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected ? 'Contexto Ativo' : 'Alternar para esta Empresa'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* NEW TENANT PROVISIONING MODAL */}
      {showNewTenantModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-gray-950 text-white flex items-center justify-between border-b border-gray-900">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" /> Provisionar Nova Empresa SaaS
              </h3>
              <button 
                onClick={() => setShowNewTenantModal(false)}
                className="p-1 hover:bg-gray-900 rounded-full text-gray-400 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRegisterTenant} className="p-6 space-y-4 text-left">
              <div>
                <label className="form-label text-xxs font-semibold">Razão Social / Nome da Empresa *</label>
                <input 
                  type="text" 
                  value={tenantName} 
                  onChange={e => setTenantName(e.target.value)} 
                  className="form-input" 
                  placeholder="Ex: Bravos Segurança SP Ltda" 
                  required 
                />
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">CNPJ da Empresa *</label>
                <input 
                  type="text" 
                  value={tenantCnpj} 
                  onChange={e => setTenantCnpj(e.target.value)} 
                  className="form-input" 
                  placeholder="00.000.000/0001-00" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xxs font-semibold">Nome do Responsável</label>
                  <input 
                    type="text" 
                    value={ownerName} 
                    onChange={e => setOwnerName(e.target.value)} 
                    className="form-input" 
                    placeholder="Carlos Oliveira" 
                  />
                </div>
                <div>
                  <label className="form-label text-xxs font-semibold">E-mail do Administrador *</label>
                  <input 
                    type="email" 
                    value={ownerEmail} 
                    onChange={e => setOwnerEmail(e.target.value)} 
                    className="form-input" 
                    placeholder="carlos@bravos.com.br" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xxs font-semibold">Plano Inicial SaaS</label>
                <select 
                  value={selectedPlan} 
                  onChange={e => setSelectedPlan(e.target.value as SaasPlan)} 
                  className="form-input"
                >
                  <option value="Starter">Starter (Até 10 Vigilantes - R$ 290/mês)</option>
                  <option value="Pro">Pro (Até 50 Vigilantes - R$ 690/mês)</option>
                  <option value="Enterprise">Enterprise (Até 250+ Vigilantes - R$ 1.290/mês)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowNewTenantModal(false)} 
                  className="btn btn-secondary cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary cursor-pointer text-white bg-blue-600 hover:bg-blue-700 font-bold px-6"
                >
                  Provisionar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
