import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useTenant } from '../contexts/TenantContext';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../services/db';
import { 
  Shield, Menu, Search, Bell, LogOut, Home, Users, Clock, Briefcase, 
  FileText, Calendar, Package, Wrench, Truck, BarChart3, History, 
  ChevronLeft, ChevronRight, BookOpen, AlertTriangle, Check, Zap, Building2, Layers, Database,
  Pin, PinOff, Sparkles, Command, Sun, Moon, X, ShieldCheck
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openDetailId: { type: string; id: string } | null;
  setOpenDetailId: (val: { type: string; id: string } | null) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab,
  openDetailId,
  setOpenDetailId
}) => {
  const { user, role, logout, switchRole, hasPermission } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { currentTenant, tenantsList, switchTenant } = useTenant();
  const { theme, toggleTheme } = useTheme();
  
  // Futuristic Auto-Reveal Sidebar State (Hidden by default, expands on Hover or Click)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const tenantRef = useRef<HTMLDivElement>(null);

  // Is menu expanded? Either hovered, pinned or opened on mobile
  const isMenuExpanded = isSidebarHovered || isSidebarPinned || isMobileMenuOpen;

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotificationDropdown(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleSwitcher(false);
      }
      if (tenantRef.current && !tenantRef.current.contains(e.target as Node)) {
        setShowTenantDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard shortcut (Ctrl+K or Cmd+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('search-global-input');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle global search
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const results = db.globalSearch(searchQuery);
      setSearchResults(results);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery]);

  const handleSearchResultClick = (type: string, id: string) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    
    if (type === 'Funcionário') setActiveTab('employees');
    else if (type === 'Cliente') setActiveTab('clients');
    else if (type === 'Contrato') setActiveTab('contracts');
    else if (type === 'Patrimônio') setActiveTab('assets');
    else if (type === 'Fornecedor') setActiveTab('providers');
    
    setOpenDetailId({ type, id });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard HUD', icon: Home, permission: true },
    { id: 'employees', label: 'Funcionários', icon: Users, permission: hasPermission('employees', 'read') },
    { id: 'occurrences', label: 'Ocorrências Funcionais', icon: Clock, permission: hasPermission('employees', 'read') },
    { id: 'clients', label: 'Clientes & Posts', icon: Briefcase, permission: hasPermission('clients', 'read') },
    { id: 'contracts', label: 'Contratos', icon: FileText, permission: hasPermission('contracts', 'read') },
    { id: 'scales', label: 'Escalas do Dia', icon: Calendar, permission: hasPermission('scales', 'read') },
    { id: 'assets', label: 'Patrimônio / Frota', icon: Package, permission: hasPermission('assets', 'read') },
    { id: 'maintenance', label: 'Manutenção', icon: Wrench, permission: hasPermission('maintenance', 'read') },
    { id: 'providers', label: 'Fornecedores', icon: Truck, permission: hasPermission('providers', 'read') },
    { id: 'reports', label: 'Relatórios / Exportação', icon: BarChart3, permission: hasPermission('reports', 'read') },
    { id: 'users', label: 'Usuários & Senhas', icon: ShieldCheck, permission: role === 'Administrador' || role === 'Supervisor' },
    { id: 'saas-plans', label: 'SaaS & Planos', icon: Zap, permission: role === 'Administrador' },
    { id: 'supabase', label: 'Nuvem & Conectividade', icon: Database, permission: role === 'Administrador' },
    { id: 'audit', label: 'Auditoria & Logs', icon: History, permission: role === 'Administrador' },
    { id: 'docs', label: 'Documentação', icon: BookOpen, permission: role === 'Administrador' },
  ];

  const roles: any[] = ['Administrador', 'Supervisor', 'RH', 'Financeiro', 'Operador', 'Cliente'];

  return (
    <div className={`min-h-screen flex relative overflow-x-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* MOBILE / TABLET OVERLAY BACKDROP */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className={`fixed inset-0 z-40 lg:hidden transition-opacity ${
            theme === 'dark' ? 'bg-slate-950/85 backdrop-blur-md' : 'bg-slate-900/60 backdrop-blur-sm'
          }`}
        />
      )}

      {/* BACKGROUND CYBERPUNK AMBIENT GLOW (Only in Dark Mode) */}
      {theme === 'dark' && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[120px] pointer-events-none z-0"></div>
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-[120px] pointer-events-none z-0"></div>
        </>
      )}

      {/* AUTO-REVEALING / HOVER & CLICK HIDDEN NAVIGATION SIDEBAR */}
      <aside 
        id="sidebar-container"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out border-r flex flex-col ${
          isMenuExpanded 
            ? (theme === 'dark' ? 'w-64 glass-panel border-slate-800/80 shadow-2xl shadow-emerald-950/40' : 'w-64 bg-slate-900 border-slate-800 text-white shadow-xl')
            : (theme === 'dark' ? 'w-16 bg-slate-950/95 border-slate-800/80 backdrop-blur-md' : 'w-16 bg-slate-900 border-slate-800 text-white')
        } ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand logo & Pin Lock toggle */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800/60 overflow-hidden">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsSidebarPinned(!isSidebarPinned)}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Shield className="w-5 h-5 fill-slate-950 stroke-none" />
            </div>
            
            {isMenuExpanded && (
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                  EVOLUTION<span className="text-emerald-400 font-sans font-black">SEG</span>
                </span>
                <span className="text-[9px] text-emerald-400/80 font-mono font-bold tracking-widest uppercase flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> SYSTEM HUD 3.0
                </span>
              </div>
            )}
          </div>

          {isMenuExpanded && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsSidebarPinned(!isSidebarPinned)}
                title={isSidebarPinned ? 'Desfixar menu' : 'Fixar menu aberto'}
                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 rounded-lg transition-colors hidden lg:block"
              >
                {isSidebarPinned ? <PinOff className="w-4 h-4 text-emerald-400" /> : <Pin className="w-4 h-4" />}
              </button>
              
              {/* Close Mobile Menu button */}
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg lg:hidden"
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          )}
        </div>

        {/* Hover Cue Indicator when collapsed */}
        {!isMenuExpanded && (
          <div className="py-2 text-center text-[9px] font-mono text-emerald-400/60 tracking-wider uppercase border-b border-slate-900">
            MENU
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-1 custom-scrollbar">
          {navItems.filter(item => item.permission).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-medium transition-all duration-200 group relative min-h-[44px] ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isActive ? 'text-emerald-400 scale-110' : 'text-slate-400 group-hover:text-emerald-300'}`} />
                
                {isMenuExpanded && (
                  <span className="truncate tracking-wide text-xs">{item.label}</span>
                )}

                {!isMenuExpanded && (
                  <span className="absolute left-16 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-xl font-mono">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Indicator */}
        <div className="p-3 border-t border-slate-900/80 flex items-center justify-between text-xs text-slate-500">
          {isMenuExpanded && (
            <div className="flex items-center gap-2 text-xxs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              MULTI-TENANT ACTIVE
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN CONTAINER */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 z-10 ${
        isSidebarPinned ? 'lg:ml-64' : 'lg:ml-16'
      }`}>
        
        {/* TOP HUD NAVBAR */}
        <header id="top-navbar" className={`h-16 border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'glass-panel border-slate-800/80 text-slate-100' 
            : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-900 shadow-xs'
        }`}>
          
          {/* Mobile Menu Trigger & Global Search */}
          <div className="flex items-center gap-3 flex-1">
            <button 
              id="btn-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 hover:bg-slate-800/10 rounded-xl lg:hidden text-slate-700 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              <Menu className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* HUD Global Search Box */}
            <div ref={searchRef} className="relative w-full max-w-md hidden sm:block">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </div>
              <input 
                id="search-global-input"
                type="text" 
                placeholder="Pesquisar (Nome, CPF, CNPJ, Série)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-14 py-2 border rounded-xl text-xs focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono ${
                  theme === 'dark' 
                    ? 'bg-slate-900/90 border-slate-800 text-slate-200 placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-250 text-slate-900 placeholder-slate-400'
                }`}
              />
              <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
                <kbd className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              </div>
              
              {/* Search dropdown results */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div id="search-global-results" className={`absolute top-11 left-0 w-full border rounded-2xl shadow-2xl z-50 overflow-hidden py-1 max-h-80 overflow-y-auto ${
                  theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <span>Resultados da Pesquisa</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{searchResults.length} itens</span>
                  </div>
                  {searchResults.map((res) => (
                    <button
                      key={`${res.type}-${res.id}`}
                      onClick={() => handleSearchResultClick(res.type, res.id)}
                      className="w-full px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 flex flex-col text-left transition-colors border-b border-slate-100 dark:border-slate-900/50 last:border-none cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{res.title}</span>
                        <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                          {res.type}
                        </span>
                      </div>
                      <span className="text-xxs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{res.subtitle}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Controls, SaaS Tenant Switcher, Theme Switcher & Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* THEME TOGGLE BUTTON (DARK vs LIGHT PADRÃO) */}
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Alternar para Tema Claro Padrão' : 'Alternar para Tema Escuro Futurista'}
              className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer min-h-[40px] min-w-[40px] border ${
                theme === 'dark' 
                  ? 'bg-slate-900/90 border-slate-800 text-amber-400 hover:border-amber-500/50' 
                  : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 shadow-xs'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {/* MULTI-TENANT SAAS SWITCHER */}
            <div ref={tenantRef} className="relative">
              <button 
                id="btn-tenant-switcher"
                onClick={() => setShowTenantDropdown(!showTenantDropdown)}
                className={`flex items-center gap-2 border px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer min-h-[40px] ${
                  theme === 'dark' 
                    ? 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-emerald-500/50' 
                    : 'bg-slate-100 border-slate-300 text-slate-900 hover:border-emerald-600'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="max-w-24 sm:max-w-44 truncate">{currentTenant.name}</span>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase hidden sm:inline-block">
                  {currentTenant.plan}
                </span>
              </button>

              {showTenantDropdown && (
                <div className={`absolute right-0 top-11 w-64 border rounded-2xl shadow-2xl z-50 p-2 space-y-1 ${
                  theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800/60 pb-2 mb-1">
                    Selecionar Empresa (Tenant SaaS)
                  </div>
                  {tenantsList.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        switchTenant(t.id);
                        setShowTenantDropdown(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        t.id === currentTenant.id
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold truncate">{t.name}</span>
                        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">CNPJ: {t.cnpj}</span>
                      </div>
                      {t.id === currentTenant.id && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ROLE SWITCHER */}
            <div ref={roleRef} className="relative hidden md:block">
              <button 
                id="btn-role-switcher"
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className={`border px-3 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer min-h-[40px] ${
                  theme === 'dark' 
                    ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700' 
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Perfil: <strong className="text-slate-900 dark:text-white">{role}</strong></span>
              </button>

              {showRoleSwitcher && (
                <div className={`absolute right-0 top-11 w-48 border rounded-2xl shadow-2xl z-50 p-1.5 space-y-1 ${
                  theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800/60 pb-1 mb-1">
                    Alternar Papel
                  </div>
                  {roles.map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setShowRoleSwitcher(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        r === role ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span>{r}</span>
                      {r === role && <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* NOTIFICATION CENTER */}
            <div ref={notifRef} className="relative">
              <button 
                id="btn-notifications-toggle"
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className={`p-2 rounded-xl relative transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ${
                  theme === 'dark' ? 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60' : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-200'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationDropdown && (
                <div className={`absolute right-0 top-11 w-80 sm:w-96 border rounded-2xl shadow-2xl z-50 overflow-hidden ${
                  theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Central de Alertas HUD</span>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-slate-200 dark:divide-slate-800/50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">Sem notificações ativas.</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-3 text-left transition-colors cursor-pointer ${n.read ? 'opacity-60 bg-slate-100/50 dark:bg-slate-950/40' : 'bg-emerald-500/5 hover:bg-emerald-500/10'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{n.title}</span>
                            <span className="text-[9px] font-mono text-slate-500">{new Date(n.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <p className="text-xxs text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* USER LOGOUT BUTTON */}
            <button 
              id="btn-logout"
              onClick={logout}
              title="Sair do Sistema"
              className={`p-2 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ${
                theme === 'dark' ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800/60' : 'text-slate-600 hover:text-red-600 hover:bg-slate-200'
              }`}
            >
              <LogOut className="w-5 h-5" />
            </button>

          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 md:p-6 space-y-6">
          {children}
        </main>

      </div>
    </div>
  );
};
