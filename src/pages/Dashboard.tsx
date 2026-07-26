import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Employee, Contract, Asset, ScaleAllocation } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Users, Briefcase, FileText, Package, AlertTriangle, 
  Calendar, Award, Clock, ArrowRight, ShieldAlert, Sparkles, Activity, CheckCircle2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

export const Dashboard: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { theme } = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [scales, setScales] = useState<ScaleAllocation[]>([]);
  const [clientsCount, setClientsCount] = useState(0);

  useEffect(() => {
    setEmployees(db.getEmployees());
    setContracts(db.getContracts());
    setAssets(db.getAssets());
    setScales(db.getScales());
    setClientsCount(db.getClients().filter(c => c.status === 'Ativo').length);
  }, []);

  // Calculate Operational Metrics
  const activeEmployees = employees.filter(e => e.situation === 'Ativo').length;
  const awayEmployees = employees.filter(e => 
    ['Afastado', 'Licença Médica', 'Licença Maternidade', 'Licença Paternidade', 'Licença Não Remunerada', 'Em Férias', 'Suspenso', 'Em Treinamento'].includes(e.situation)
  ).length;
  const activeContracts = contracts.filter(c => c.situation === 'Ativo').length;
  
  const totalAssets = assets.length;
  const availableAssets = assets.filter(a => a.situation === 'Disponível').length;
  const loanedAssets = assets.filter(a => a.situation === 'Emprestado').length;
  const maintenanceAssets = assets.filter(a => a.situation === 'Manutenção').length;

  // Calculate Birthdays (Current Month: July, based on system date 2026-07)
  const birthdaysThisMonth = employees.filter(emp => {
    const month = emp.birthDate.split('-')[1];
    return month === '07';
  });

  // Recharts: Contracts Value comparison
  const barChartData = contracts.map(con => ({
    name: con.contractNumber,
    'Valor Mensal (R$)': con.monthlyValue,
  }));

  // Recharts: Assets Category Share
  const categoriesMap = assets.reduce((acc, current) => {
    acc[current.category] = (acc[current.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.keys(categoriesMap).map(key => ({
    name: key,
    value: categoriesMap[key],
  }));

  const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#64748b'];

  // Critical Contracts Alerts (Threshold: 30 days)
  const expiringContracts = contracts.filter(con => {
    if (con.situation !== 'Ativo') return false;
    const end = new Date(con.endDate);
    const diffTime = end.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).map(con => {
    const end = new Date(con.endDate);
    const diffTime = end.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      ...con,
      daysLeft: diffDays,
    };
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  const cardBgClass = theme === 'dark' 
    ? 'glass-card glass-card-hover border-slate-800' 
    : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500/40';

  const panelBgClass = theme === 'dark' 
    ? 'glass-panel border-slate-800' 
    : 'bg-white border-slate-200 shadow-sm';

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textMuted = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="space-y-6 md:space-y-8 text-left font-sans transition-colors duration-300">
      
      {/* HUD STATEMENT HEADER */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl border relative overflow-hidden transition-colors ${
        theme === 'dark' 
          ? 'bg-slate-900/60 border-slate-800 glass-panel' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
              theme === 'dark' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" /> SISTEMA TÁTICO OPERACIONAL HUD 3.0
            </span>
          </div>
          <h1 id="dashboard-main-title" className={`text-2xl md:text-3xl font-extrabold tracking-tight font-heading ${textPrimary}`}>
            Centro de Comando & Monitoramento
          </h1>
          <p className={`text-xs ${textMuted} max-w-xl`}>
            Telemetria em tempo real das operações de segurança privada, escala de postos, contingente de vigilantes e patrimônio cautelado.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl border ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-700 shadow-inner'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            OPERACIONAL 100% ATIVO
          </div>
        </div>
      </div>

      {/* 4 CORE KPI METRIC CARDS */}
      <div id="metrics-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Employees */}
        <div className={`p-5 rounded-2xl flex items-center justify-between border ${cardBgClass}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Efetivo de Guardas</p>
              <h3 className={`text-2xl font-black font-heading mt-0.5 ${textPrimary}`}>{employees.length}</h3>
              <p className="text-[10px] font-mono mt-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeEmployees} ativos</span> / <span className="font-bold text-amber-600 dark:text-amber-400">{awayEmployees} ausentes</span>
              </p>
            </div>
          </div>
          <button onClick={() => setActiveTab('employees')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800/80 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* KPI 2: Clients */}
        <div className={`p-5 rounded-2xl flex items-center justify-between border ${cardBgClass}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clientes Ativos</p>
              <h3 className={`text-2xl font-black font-heading mt-0.5 ${textPrimary}`}>{clientsCount}</h3>
              <p className={`text-[10px] font-mono mt-1 ${textMuted}`}>Postos sob monitoramento</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('clients')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800/80 rounded-xl text-slate-400 hover:text-cyan-500 transition-colors cursor-pointer">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* KPI 3: Contracts */}
        <div className={`p-5 rounded-2xl flex items-center justify-between border ${cardBgClass}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contratos Vigentes</p>
              <h3 className={`text-2xl font-black font-heading mt-0.5 ${textPrimary}`}>{activeContracts}</h3>
              <p className={`text-[10px] font-mono mt-1 ${textMuted}`}>Faturamento recorrente seguro</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('contracts')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800/80 rounded-xl text-slate-400 hover:text-blue-500 transition-colors cursor-pointer">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* KPI 4: Assets */}
        <div className={`p-5 rounded-2xl flex items-center justify-between border ${cardBgClass}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Frota & Patrimônio</p>
              <h3 className={`text-2xl font-black font-heading mt-0.5 ${textPrimary}`}>{totalAssets}</h3>
              <p className="text-[10px] font-mono mt-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{loanedAssets} cautelados</span> / <span className="font-bold text-cyan-600 dark:text-cyan-400">{availableAssets} disp</span>
              </p>
            </div>
          </div>
          <button onClick={() => setActiveTab('assets')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800/80 rounded-xl text-slate-400 hover:text-purple-500 transition-colors cursor-pointer">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* GRAPHS AND OPERATIONAL DETAIL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHARTS CONTAINER (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart 1: Contracts monthly value */}
          <div className={`p-5 rounded-2xl border space-y-4 ${panelBgClass}`}>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <span className={textPrimary}>Distribuição de Valores Mensais de Contratos</span>
              <span className="text-emerald-600 dark:text-emerald-400">R$ Total Recorrente</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#475569' }} />
                  <YAxis tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#475569' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#090d16' : '#ffffff', 
                      borderColor: theme === 'dark' ? '#334155' : '#cbd5e1', 
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a', 
                      borderRadius: '12px' 
                    }}
                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString()}`, 'Valor Mensal']} 
                  />
                  <Bar dataKey="Valor Mensal (R$)" fill="#10b981" radius={[6, 6, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 1 ? '#06b6d4' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Inventory distribution */}
          <div className={`p-5 rounded-2xl border space-y-4 ${panelBgClass}`}>
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800/80 pb-3 ${textPrimary}`}>
              Distribuição de Recursos em Cautela por Categoria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#090d16' : '#ffffff', 
                      borderColor: theme === 'dark' ? '#334155' : '#cbd5e1', 
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a', 
                      borderRadius: '12px' 
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {pieChartData.map((item, idx) => (
                  <div key={item.name} className={`flex items-center justify-between text-xs font-mono p-2 rounded-xl border ${
                    theme === 'dark' ? 'bg-slate-900/60 border-slate-800/50' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span className={`font-medium ${textPrimary}`}>{item.name}</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.value} unidades</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* SIDEBAR OPERATIONAL WIDGETS (Right 1/3) */}
        <div className="space-y-6">
          
          {/* CRITICAL ALERTS CARD */}
          <div className={`p-5 rounded-2xl border space-y-4 ${panelBgClass}`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <h3 className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Vencimentos Críticos
              </h3>
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                {expiringContracts.length} Alertas
              </span>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {expiringContracts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-mono">Sem contratos a vencer nos próximos 30 dias.</div>
              ) : (
                expiringContracts.map(c => (
                  <div key={c.id} className="p-3 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-200">
                      <span>Contrato {c.contractNumber}</span>
                      <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                        Vence em {c.daysLeft}d
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">Cliente: {c.clientName}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BIRTHDAYS / RECOGNITION WIDGET */}
          <div className={`p-5 rounded-2xl border space-y-4 ${panelBgClass}`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <h3 className="font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400 flex items-center gap-2 uppercase tracking-wider">
                <Award className="w-4 h-4 text-cyan-500" /> Aniversariantes do Mês
              </h3>
              <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                {birthdaysThisMonth.length} Vigilantes
              </span>
            </div>

            <div className="space-y-2.5">
              {birthdaysThisMonth.map(emp => (
                <div key={emp.id} className={`flex items-center justify-between p-2.5 border rounded-xl text-xs ${
                  theme === 'dark' ? 'bg-slate-900/60 border-slate-800/60' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <img src={emp.photoUrl} alt={emp.name} className="w-7 h-7 rounded-full object-cover border border-cyan-500/30" />
                    <div>
                      <span className={`font-bold block truncate max-w-32 ${textPrimary}`}>{emp.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">{emp.role}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded-lg">
                    {emp.birthDate.split('-')[2]}/07
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
