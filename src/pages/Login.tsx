import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Eye, EyeOff, Lock, Mail, RefreshCw, Sparkles, ArrowRight, Activity, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const { login, recoverPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Por favor, informe seu e-mail.');
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Acesso autenticado no Sistema HUD EVOLUTIONSEG!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro de autenticação. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) {
      toast.error('Por favor, informe o e-mail cadastrado.');
      return;
    }
    setIsSubmitting(true);
    try {
      await recoverPassword(recoveryEmail);
      toast.success('Instruções de redefinição de senha enviadas para o seu e-mail!');
      setIsRecovering(false);
    } catch (err) {
      toast.error('Erro ao processar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreSelectLogin = async (roleEmail: string) => {
    setIsSubmitting(true);
    try {
      await login(roleEmail, 'senha123');
      toast.success('Acesso concedido com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao acessar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRecovering) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden font-sans">
        <div className="fixed top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md glass-panel border border-slate-800 rounded-3xl p-8 relative z-10 shadow-2xl space-y-6 text-left">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Shield className="w-8 h-8 fill-slate-950 stroke-none" />
            </div>
            <h2 className="text-xl font-extrabold text-white font-heading">Recuperação de Senha HUD</h2>
            <p className="text-xs text-slate-400">Informe seu e-mail de cadastro para receber o link de redefinição seguro.</p>
          </div>

          <form onSubmit={handleRecoverySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5 uppercase tracking-wider">E-mail Corporativo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="seu.nome@evolution.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Enviar Redefinição'}
            </button>
          </form>

          <button
            onClick={() => setIsRecovering(false)}
            className="w-full text-center text-xs text-slate-400 hover:text-emerald-400 font-mono transition-colors cursor-pointer"
          >
            ← Voltar para a tela de autenticação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden font-sans">
      
      {/* FUTURISTIC CYBERPUNK LIGHTING */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[140px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 glass-panel border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        
        {/* LEFT FUTURISTIC HERO BANNER */}
        <div className="p-8 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-900 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80 text-left space-y-8 relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
                <Shield className="w-7 h-7 fill-slate-950 stroke-none" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                  EVOLUTION<span className="text-emerald-400 font-sans font-black">SEG</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> SAAS MULTI-TENANT 3.0
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h1 className="text-2xl font-extrabold text-white font-heading leading-tight">
                Plataforma de Alta Precisão em Segurança Privada
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gestão tática de vigilantes, postos de trabalho, frotas cauteladas e auditoria operacional em tempo real.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800/60">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Acesso Rápido de Teste (Perfis):</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePreSelectLogin('carlos.supervisor@evolution.com')}
                className="p-2 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-200 block group-hover:text-emerald-400">Supervisor</span>
                <span className="text-[9px] font-mono text-slate-500">Operações Táticas</span>
              </button>

              <button
                onClick={() => handlePreSelectLogin('mariana.rh@evolution.com')}
                className="p-2 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-200 block group-hover:text-emerald-400">Gestão RH</span>
                <span className="text-[9px] font-mono text-slate-500">Ocorrências & Efetivo</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="p-8 flex flex-col justify-center space-y-6 text-left">
          
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white font-heading">Portal de Autenticação</h2>
            <p className="text-xs text-slate-400">Digite suas credenciais corporativas para acessar a central.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">E-mail Corporativo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="usuario@evolution.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 font-mono transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Senha de Acesso</label>
                <button
                  type="button"
                  onClick={() => setIsRecovering(true)}
                  className="text-[10px] font-mono text-emerald-400 hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Entrar no Sistema HUD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <div className="text-center border-t border-slate-800/60 pt-4 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-400" /> SSL 256-BIT ENCRYPTED</span>
            <span>BUILD v3.0 MULTI-TENANT</span>
          </div>

        </div>

      </div>

    </div>
  );
};
