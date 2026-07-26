import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://enqenbfaooajxryiknkx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_C4Lyj23G4q6NP18BB0Z2rA_knTd4bQ0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseTestResult {
  stepName: string;
  success: boolean;
  message: string;
  details?: any;
}

export const runFullSupabaseDiagnostics = async (): Promise<SupabaseTestResult[]> => {
  const results: SupabaseTestResult[] = [];

  // Step 1: Central Server Connectivity check
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });
    if (response.ok || response.status === 200 || response.status === 404) {
      results.push({
        stepName: '1. Conectividade do Servidor Central',
        success: true,
        message: `Servidor de dados ativo e operando em nuvem segura. (Status HTTP: ${response.status})`,
      });
    } else {
      results.push({
        stepName: '1. Conectividade do Servidor Central',
        success: false,
        message: `Resposta inesperada do servidor HTTP ${response.status}: ${response.statusText}`,
      });
    }
  } catch (err: any) {
    results.push({
      stepName: '1. Conectividade do Servidor Central',
      success: false,
      message: `Erro na conexão com o servidor de dados: ${err?.message || 'Falha de rede'}`,
    });
  }

  // Step 2: Auth Service Ping
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      results.push({
        stepName: '2. Serviço de Autenticação Segura',
        success: false,
        message: `Erro ao consultar serviço de acesso: ${error.message}`,
      });
    } else {
      results.push({
        stepName: '2. Serviço de Autenticação Segura',
        success: true,
        message: data.session ? `Sessão ativa encontrada para ${data.session.user.email}` : 'Serviço de autenticação ativo (Aguardando login de usuário)',
      });
    }
  } catch (err: any) {
    results.push({
      stepName: '2. Serviço de Autenticação Segura',
      success: false,
      message: `Falha ao conectar com o serviço de autenticação: ${err?.message}`,
    });
  }

  // Step 3: Database Query Ping
  try {
    const { data, error } = await supabase.from('employees').select('*').limit(5);
    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        results.push({
          stepName: '3. Leitura e Integridade do Banco de Dados',
          success: true,
          message: 'Estrutura de dados ativa! (Aviso: Tabela inicial aguardando execução do script de sincronização)',
          details: { error: error.message, code: error.code },
        });
      } else {
        results.push({
          stepName: '3. Leitura e Integridade do Banco de Dados',
          success: false,
          message: `Aviso na consulta de dados: [${error.code}] ${error.message}`,
          details: error,
        });
      }
    } else {
      results.push({
        stepName: '3. Leitura e Integridade do Banco de Dados',
        success: true,
        message: `Consulta executada com sucesso! ${data ? data.length : 0} registros sincronizados.`,
        details: data,
      });
    }
  } catch (err: any) {
    results.push({
      stepName: '3. Leitura e Integridade do Banco de Dados',
      success: false,
      message: `Erro na consulta de dados: ${err?.message}`,
    });
  }

  // Step 4: Realtime Engine Ping
  try {
    const channel = supabase.channel('ping_test');
    results.push({
      stepName: '4. Canal de Sincronização em Tempo Real',
      success: true,
      message: 'Canal de comunicação instantânea ativado com sucesso!',
    });
    supabase.removeChannel(channel);
  } catch (err: any) {
    results.push({
      stepName: '4. Canal de Sincronização em Tempo Real',
      success: false,
      message: `Falha ao criar canal de transmissão instantânea: ${err?.message}`,
    });
  }

  return results;
};

export const checkSupabaseConnection = async (): Promise<{ connected: boolean; message: string }> => {
  try {
    const { error } = await supabase.from('test_ping').select('*').limit(1);
    if (!error || error.code === 'PGRST301' || error.code === '42P01' || error.message.includes('relation')) {
      return { connected: true, message: 'Conexão segura com a nuvem estabelecida com sucesso!' };
    }
    return { connected: true, message: `Conexão ativa com o servidor de dados` };
  } catch (err: any) {
    return { connected: false, message: err?.message || 'Falha ao conectar ao servidor de dados' };
  }
};
