import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Permission } from '../types';
import { db } from '../services/db';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (email: string, password?: string) => Promise<boolean>;
  registerUser: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  recoverPassword: (email: string) => Promise<boolean>;
  switchRole: (newRole: UserRole) => void;
  hasPermission: (module: Permission['module'], action: keyof Permission['actions']) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define rigid RBAC rules based on user requirements
const ROLE_PERMISSIONS: Record<UserRole, Record<Permission['module'], { create: boolean; read: boolean; update: boolean; delete: boolean; export: boolean }>> = {
  Administrador: {
    employees: { create: true, read: true, update: true, delete: true, export: true },
    clients: { create: true, read: true, update: true, delete: true, export: true },
    contracts: { create: true, read: true, update: true, delete: true, export: true },
    scales: { create: true, read: true, update: true, delete: true, export: true },
    assets: { create: true, read: true, update: true, delete: true, export: true },
    maintenance: { create: true, read: true, update: true, delete: true, export: true },
    providers: { create: true, read: true, update: true, delete: true, export: true },
    audit: { create: true, read: true, update: true, delete: true, export: true },
    reports: { create: true, read: true, update: true, delete: true, export: true },
  },
  Supervisor: {
    employees: { create: true, read: true, update: true, delete: false, export: true },
    clients: { create: true, read: true, update: true, delete: false, export: true },
    contracts: { create: true, read: true, update: true, delete: false, export: true },
    scales: { create: true, read: true, update: true, delete: false, export: true },
    assets: { create: true, read: true, update: true, delete: false, export: true },
    maintenance: { create: true, read: true, update: true, delete: false, export: true },
    providers: { create: true, read: true, update: true, delete: false, export: true },
    audit: { create: false, read: true, update: false, delete: false, export: false },
    reports: { create: false, read: true, update: false, delete: false, export: true },
  },
  Operador: {
    employees: { create: false, read: true, update: false, delete: false, export: false },
    clients: { create: false, read: true, update: false, delete: false, export: false },
    contracts: { create: false, read: true, update: false, delete: false, export: false },
    scales: { create: false, read: true, update: false, delete: false, export: false },
    assets: { create: false, read: true, update: false, delete: false, export: false },
    maintenance: { create: false, read: true, update: false, delete: false, export: false },
    providers: { create: false, read: true, update: false, delete: false, export: false },
    audit: { create: false, read: false, update: false, delete: false, export: false },
    reports: { create: false, read: true, update: false, delete: false, export: false },
  },
  RH: {
    employees: { create: true, read: true, update: true, delete: true, export: true },
    clients: { create: false, read: true, update: false, delete: false, export: false },
    contracts: { create: false, read: true, update: false, delete: false, export: false },
    scales: { create: false, read: true, update: false, delete: false, export: false },
    assets: { create: false, read: false, update: false, delete: false, export: false },
    maintenance: { create: false, read: false, update: false, delete: false, export: false },
    providers: { create: false, read: false, update: false, delete: false, export: false },
    audit: { create: false, read: false, update: false, delete: false, export: false },
    reports: { create: false, read: true, update: false, delete: false, export: true },
  },
  Financeiro: {
    employees: { create: false, read: true, update: false, delete: false, export: false },
    clients: { create: false, read: true, update: false, delete: false, export: false },
    contracts: { create: false, read: true, update: false, delete: false, export: true },
    scales: { create: false, read: false, update: false, delete: false, export: false },
    assets: { create: false, read: false, update: false, delete: false, export: false },
    maintenance: { create: false, read: false, update: false, delete: false, export: false },
    providers: { create: false, read: false, update: false, delete: false, export: false },
    audit: { create: false, read: false, update: false, delete: false, export: false },
    reports: { create: false, read: true, update: false, delete: false, export: true },
  },
  Cliente: {
    employees: { create: false, read: false, update: false, delete: false, export: false },
    clients: { create: false, read: true, update: false, delete: false, export: false }, // only own
    contracts: { create: false, read: true, update: false, delete: false, export: false }, // only own
    scales: { create: false, read: true, update: false, delete: false, export: false }, // only own
    assets: { create: false, read: false, update: false, delete: false, export: false },
    maintenance: { create: false, read: false, update: false, delete: false, export: false },
    providers: { create: false, read: false, update: false, delete: false, export: false },
    audit: { create: false, read: false, update: false, delete: false, export: false },
    reports: { create: false, read: false, update: false, delete: false, export: false },
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('Administrador');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await db.init();
      } catch (err) {
        console.error('Initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const storedUser = localStorage.getItem('evo_auth_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setRole(parsed.role);
      } catch (e) {
        localStorage.removeItem('evo_auth_user');
        setUser(null);
      }
    } else {
      setUser(null);
    }

    bootstrap();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-5 text-sm font-semibold text-emerald-400 font-mono tracking-tight uppercase">Iniciando Conexão Segura...</p>
        <p className="mt-2 text-xs text-slate-400 font-sans">Carregando dados operacionais de infraestrutura</p>
      </div>
    );
  }

  const login = async (email: string, password?: string): Promise<boolean> => {
    // Check if employee exists and is desligado, aposentado, or falecido
    const employees = db.getEmployees();
    const matchingEmployee = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (matchingEmployee) {
      if (['Desligado', 'Aposentado', 'Falecido'].includes(matchingEmployee.situation)) {
        throw new Error(`Acesso bloqueado: Este colaborador encontra-se na situação de ${matchingEmployee.situation}.`);
      }
    }

    // Try Supabase Auth first if password is provided
    if (password && password.length >= 6) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!authError && authData.user) {
          const loggedUser: User = {
            id: authData.user.id,
            email: authData.user.email || email,
            name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'Usuário Autenticado',
            role: (authData.user.user_metadata?.role as UserRole) || 'Administrador',
            status: 'Ativo',
            createdAt: authData.user.created_at,
            accessLevel: 'Total (Admin)',
            avatarUrl: authData.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          };

          localStorage.setItem('evo_auth_user', JSON.stringify(loggedUser));
          setUser(loggedUser);
          setRole(loggedUser.role);

          db.audit(
            { id: loggedUser.id, name: loggedUser.name, role: loggedUser.role },
            'Login',
            'Auth',
            `Login efetuado via Supabase Auth com RLS ativado para ${loggedUser.name}`
          );

          return true;
        }
      } catch (err) {
        console.warn('Supabase Auth offline ou não configurado, utilizando fallback de login:', err);
      }
    }

    // Resilient Fallback Login
    let loggedUser: User;
    if (email.toLowerCase().includes('client') || email.toLowerCase().includes('condominio')) {
      loggedUser = {
        id: 'usr-client-1',
        email,
        name: 'Marcos Aurelio (Síndico Flores)',
        role: 'Cliente',
        status: 'Ativo',
        createdAt: '2026-01-01',
        accessLevel: 'Somente Leitura',
        companyId: 'cli-1',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      };
    } else if (email.toLowerCase().includes('rh')) {
      loggedUser = {
        id: 'usr-rh-1',
        email,
        name: 'Mariana Costa',
        role: 'RH',
        status: 'Ativo',
        createdAt: '2026-01-01',
        accessLevel: 'Gerencial',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      };
    } else {
      loggedUser = {
        id: 'usr-1',
        email,
        name: 'Elmaneko Admin',
        role: 'Administrador',
        status: 'Ativo',
        createdAt: '2026-01-01',
        accessLevel: 'Total (Admin)',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      };
    }

    localStorage.setItem('evo_auth_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    setRole(loggedUser.role);

    db.audit(
      { id: loggedUser.id, name: loggedUser.name, role: loggedUser.role },
      'Login',
      'Auth',
      `Login efetuado com sucesso por ${loggedUser.name} (${loggedUser.role})`
    );

    return true;
  };

  const registerUser = async (name: string, email: string, password?: string): Promise<boolean> => {
    if (password && password.length >= 6) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, role: 'Administrador' }
          }
        });

        if (!authError && authData.user) {
          const newUser: User = {
            id: authData.user.id,
            email: authData.user.email || email,
            name: name || authData.user.email?.split('@')[0] || 'Novo Administrador',
            role: 'Administrador',
            status: 'Ativo',
            createdAt: new Date().toISOString().split('T')[0],
            accessLevel: 'Total (Admin)',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          };

          localStorage.setItem('evo_auth_user', JSON.stringify(newUser));
          setUser(newUser);
          setRole('Administrador');

          db.audit(
            { id: newUser.id, name: newUser.name, role: newUser.role },
            'Cadastrar',
            'Auth',
            `Novo usuário cadastrado por e-mail com sucesso: ${newUser.email}`
          );

          return true;
        }
      } catch (err) {
        console.warn('Supabase Auth signUp offline ou erro:', err);
      }
    }

    // Fallback registration
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      role: 'Administrador',
      status: 'Ativo',
      createdAt: new Date().toISOString().split('T')[0],
      accessLevel: 'Total (Admin)',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    };

    localStorage.setItem('evo_auth_user', JSON.stringify(newUser));
    setUser(newUser);
    setRole('Administrador');

    db.audit(
      { id: newUser.id, name: newUser.name, role: newUser.role },
      'Cadastrar',
      'Auth',
      `Novo usuário registrado por e-mail: ${newUser.email}`
    );

    return true;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Erro ao encerrar sessão Supabase:', e);
    }

    if (user) {
      db.audit(
        { id: user.id, name: user.name, role: user.role },
        'Login',
        'Auth',
        `Logout efetuado por ${user.name}`
      );
    }
    localStorage.removeItem('evo_auth_user');
    setUser(null);
  };

  const recoverPassword = async (email: string): Promise<boolean> => {
    try {
      await supabase.auth.resetPasswordForEmail(email);
    } catch (e) {
      console.warn('Recuperação via Supabase Auth offline:', e);
    }

    db.audit(
      { id: 'anonymous', name: 'Visitante Anônimo', role: 'Operador' },
      'Recuperar Senha',
      'Auth',
      `Solicitação de recuperação de senha para o e-mail: ${email}`
    );
    return true;
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    
    // If switching to Cliente, associate client id
    if (newRole === 'Cliente') {
      updatedUser.companyId = 'cli-1';
      updatedUser.name = 'Marcos Aurelio (Síndico Flores)';
    } else if (newRole === 'RH') {
      updatedUser.name = 'Mariana Costa (Recursos Humanos)';
    } else {
      updatedUser.name = 'Elmaneko Admin';
      updatedUser.companyId = undefined;
    }

    localStorage.setItem('evo_auth_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setRole(newRole);

    db.audit(
      { id: user.id, name: user.name, role: user.role },
      'Editar',
      'Auth',
      `Alterou perfil de acesso em tempo de execução para: ${newRole}`
    );
  };

  const hasPermission = (module: Permission['module'], action: keyof Permission['actions']): boolean => {
    return ROLE_PERMISSIONS[role]?.[module]?.[action] ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, role, login, registerUser, logout, recoverPassword, switchRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
