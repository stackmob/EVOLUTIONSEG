import 'dotenv/config';

export interface EnvValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

export function validateEnvironmentSecrets(): EnvValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const isProduction = process.env.NODE_ENV === 'production';

  // Check Database Password / Host
  const sqlHost = process.env.SQL_HOST;
  const sqlPassword = process.env.SQL_PASSWORD;
  const databaseUrl = process.env.DATABASE_URL;

  if (isProduction && !databaseUrl && !sqlPassword) {
    errors.push('CRÍTICO: Nenhuma senha de banco de dados (SQL_PASSWORD ou DATABASE_URL) foi configurada para o ambiente de produção.');
  }

  if (sqlPassword === 'YOUR_SUPABASE_DB_PASSWORD' || sqlPassword === 'postgres' || sqlPassword === '123456') {
    warnings.push('ATENÇÃO: A senha do banco de dados parece ser um valor padrão ou de demonstração. Altere para uma senha forte em produção.');
  }

  // Check SSL requirement
  const isSslEnabled = process.env.SQL_SSL === 'true' || (sqlHost && sqlHost.includes('supabase.co')) || (databaseUrl && databaseUrl.includes('sslmode=require'));
  if (isProduction && !isSslEnabled) {
    warnings.push('RECOMENDAÇÃO DE SEGURANÇA: Conexão SSL com o banco de dados não está ativada. Ative SQL_SSL=true para proteger o tráfego em trânsito.');
  }

  // Check Supabase Client keys
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    warnings.push('Aviso: Variáveis de cliente Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY) não encontradas. Usando padrões de contingência.');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}
