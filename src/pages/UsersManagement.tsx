import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User, UserRole } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Users, UserPlus, Shield, Key, Eye, EyeOff, Search, Edit3, Trash2, 
  Lock, Unlock, CheckCircle2, AlertCircle, RefreshCw, Layers, Sparkles, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const UsersManagement: React.FC = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Todos');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Supervisor');
  const [accessLevel, setAccessLevel] = useState<'Total (Admin)' | 'Gerencial' | 'Operacional' | 'Somente Leitura'>('Gerencial');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const loadUsers = () => {
    setUsers(db.getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('Supervisor');
    setAccessLevel('Gerencial');
    setPassword('');
    setShowPassword(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setAccessLevel(u.accessLevel || 'Gerencial');
    setPassword('');
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Preencha nome e e-mail corporativo.');
      return;
    }

    if (editingUser) {
      db.updateUser(editingUser.id, {
        name,
        email,
        role,
        accessLevel,
      });
      toast.success(`Usuário ${name} atualizado com sucesso!`);
    } else {
      if (!password) {
        toast.error('Digite a senha inicial de acesso.');
        return;
      }
      db.addUser({
        name,
        email,
        role,
        status: 'Ativo',
        accessLevel,
        tenantId: 'tenant-demo-1',
        passwordHash: password,
      });
      toast.success(`Usuário ${name} cadastrado com sucesso!`);
    }

    setShowModal(false);
    loadUsers();
  };

  const handleToggleStatus = (u: User) => {
    const updated = db.toggleUserStatus(u.id);
    if (updated) {
      toast.success(`Status de ${u.name} alterado para ${updated.status}.`);
      loadUsers();
    }
  };

  const handleDeleteUser = (u: User) => {
    if (confirm(`Tem certeza que deseja excluir a conta de ${u.name}?`)) {
      db.deleteUser(u.id);
      toast.success('Usuário removido com sucesso.');
      loadUsers();
    }
  };

  const handleOpenPasswordModal = (u: User) => {
    setPasswordTargetUser(u);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTargetUser || !newPassword) {
      toast.error('Informe a nova senha.');
      return;
    }

    db.resetUserPassword(passwordTargetUser.id, newPassword);
    toast.success(`Senha de ${passwordTargetUser.name} redefinida com sucesso!`);
    setShowPasswordModal(false);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let rand = '';
    for (let i = 0; i < 10; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(rand);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const rolesList: UserRole[] = ['Administrador', 'Supervisor', 'RH', 'Financeiro', 'Operador', 'Cliente'];

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* HEADER BANNER */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
        theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xxs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> REGRAS RBAC & CREDENCIAIS
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-white">
            Gestão de Usuários & Senhas de Acesso
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cadastre novos usuários, configure senhas criptografadas, gerencie papéis operacionais e defina níveis de permissão.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Usuário</span>
        </button>
      </div>

      {/* CONTROLS & SEARCH */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
        theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por Nome ou E-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500 border ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-250 text-slate-900'
            }`}
          />
        </div>

        {/* Role Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
          <button
            onClick={() => setRoleFilter('Todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              roleFilter === 'Todos'
                ? 'bg-emerald-500 text-slate-950'
                : (theme === 'dark' ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600')
            }`}
          >
            Todos ({users.length})
          </button>

          {rolesList.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                roleFilter === r
                  ? 'bg-emerald-500 text-slate-950'
                  : (theme === 'dark' ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600')
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* USERS TABLE */}
      <div className={`rounded-2xl border overflow-hidden ${
        theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                theme === 'dark' ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">Perfil (Role)</th>
                <th className="py-3 px-4">Nível de Acesso</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Último Acesso</th>
                <th className="py-3 px-4 text-right">Ações de Segurança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs font-sans">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* User Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 shrink-0">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{u.name}</span>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border uppercase ${
                        u.role === 'Administrador' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30' :
                        u.role === 'Supervisor' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
                        u.role === 'RH' ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30' :
                        u.role === 'Financeiro' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' :
                        'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Access Level */}
                    <td className="py-3.5 px-4 font-mono text-xxs">
                      <span className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 font-bold">
                        {u.accessLevel || 'Gerencial'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 w-fit ${
                        u.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                        'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Ativo' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {u.status}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="py-3.5 px-4 font-mono text-xxs text-slate-500 dark:text-slate-400">
                      {u.lastLogin || 'Nunca acessou'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Reset Password */}
                        <button
                          onClick={() => handleOpenPasswordModal(u)}
                          title="Alterar / Redefinir Senha de Acesso"
                          className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Key className="w-4 h-4" />
                        </button>

                        {/* Edit User */}
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          title="Editar Perfil e Permissões"
                          className="p-1.5 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Toggle Status (Lock/Unlock) */}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'Ativo' ? 'Bloquear Acesso' : 'Desbloquear Acesso'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.status === 'Ativo' ? 'text-slate-400 hover:text-red-500 hover:bg-red-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'
                          }`}
                        >
                          {u.status === 'Ativo' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Excluir Usuário"
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-lg p-6 rounded-2xl border shadow-2xl space-y-5 text-left ${
            theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-500" />
                {editingUser ? 'Editar Usuário e Permissões' : 'Cadastrar Novo Usuário'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Gabriel Santos"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-250 text-slate-900'
                  }`}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@evolution.com"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-250 text-slate-900'
                  }`}
                />
              </div>

              {/* Password (if creating new) */}
              {!editingUser && (
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Senha de Acesso Inicial</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-3.5 pr-10 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-250 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Perfil (Role RBAC)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-250 text-slate-900'
                    }`}
                  >
                    {rolesList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nível de Permissão</label>
                  <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value as any)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-250 text-slate-900'
                    }`}
                  >
                    <option value="Total (Admin)">Total (Admin)</option>
                    <option value="Gerencial">Gerencial</option>
                    <option value="Operacional">Operacional</option>
                    <option value="Somente Leitura">Somente Leitura</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {editingUser ? 'Salvar Alterações' : 'Criar Conta'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showPasswordModal && passwordTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 text-left ${
            theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" /> Alterar Senha de {passwordTargetUser.name}
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha..."
                    className={`w-full pl-3.5 pr-10 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 font-mono ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-250 text-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-mono hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Gerar Senha Segura Aleatória
              </button>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Confirmar Nova Senha
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
