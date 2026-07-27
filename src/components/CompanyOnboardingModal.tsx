import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { Building2, FileText, MapPin, Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CompanyOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const CompanyOnboardingModal: React.FC<CompanyOnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { registerNewTenant } = useTenant();
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cityState, setCityState] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error('Informe a Razão Social ou Nome da sua empresa.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create new tenant linked to logged in user
      registerNewTenant(
        companyName.trim(),
        cnpj.trim() || '00.000.000/0001-00',
        user?.name || 'Administrador',
        user?.email || 'admin@empresa.com',
        'Pro'
      );

      toast.success(`Empresa "${companyName}" configurada com sucesso!`);
      onComplete();
    } catch (err: any) {
      toast.error('Erro ao configurar empresa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="w-full max-w-lg glass-panel border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-left relative overflow-hidden">
        
        {/* Glow Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header Banner */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Building2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xxs font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> PASSO DE CONFIGURAÇÃO INICIAL
              </span>
              <h2 className="text-xl font-extrabold text-white font-heading">
                Cadastrar Sua Empresa
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Bem-vindo ao <strong className="text-emerald-400">Evolution Seg APP</strong>, {user?.name || 'Administrador'}! Informe os dados da sua empresa para criar um ambiente isolado e seguro no sistema.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          
          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Razão Social / Nome da Empresa *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Ex: Alfa Segurança e Portaria Ltda"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* CNPJ & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                CNPJ (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Cidade / Estado
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="São Paulo / SP"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2 text-xxs text-emerald-400 font-mono font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ambientes e dados 100% isolados por criptografia multi-tenant
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer mt-4"
          >
            <span>Concluir Configuração & Acessar Painel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
