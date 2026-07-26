import React, { useState } from 'react';
import { BookOpen, Shield, Database, Users, HelpCircle } from 'lucide-react';

export const Docs: React.FC = () => {
  const [activeSec, setActiveSec] = useState<'arch' | 'der' | 'rbac'>('arch');

  return (
    <div className="space-y-6 font-sans text-left max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="border-b border-gray-150 pb-5">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Manual e Documentação do Sistema</h1>
        <p className="text-xs text-gray-500 mt-1">Visão geral sobre a arquitetura corporativa, Diagrama de Entidades (DER) e mapeamentos RBAC de acesso.</p>
      </div>

      {/* TABS CONTROLLER */}
      <div className="flex gap-2.5 border-b border-gray-200 pb-px">
        <button 
          onClick={() => setActiveSec('arch')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeSec === 'arch' ? 'border-blue-600 text-gray-900 font-extrabold bg-blue-50/15' : 'border-transparent text-gray-500'
          }`}
        >
          <Database className="w-4 h-4 text-blue-600" /> Arquitetura de Software
        </button>
        <button 
          onClick={() => setActiveSec('der')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeSec === 'der' ? 'border-blue-600 text-gray-900 font-extrabold bg-blue-50/15' : 'border-transparent text-gray-500'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-600" /> Diagrama DER (Textual)
        </button>
        <button 
          onClick={() => setActiveSec('rbac')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeSec === 'rbac' ? 'border-blue-600 text-gray-900 font-extrabold bg-blue-50/15' : 'border-transparent text-gray-500'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" /> Matriz de Perfis (RBAC)
        </button>
      </div>

      {/* CONTENT BOX */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        
        {/* ARCHITECTURE SECTION */}
        {activeSec === 'arch' && (
          <div className="space-y-5">
            <h3 className="text-sm font-extrabold text-gray-950 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Arquitetura Operacional do Sistema
            </h3>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              O sistema foi concebido seguindo as melhores práticas de engenharia de software para aplicações SPA de alto tráfego operacional e segurança máxima. Ele separa rigorosamente a camada de visualização em React do controle de estados e da persistência de banco de dados.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-150">
                <span className="font-bold text-gray-950 block mb-2">Camada de Visão (Frontend)</span>
                <ul className="space-y-1.5 text-gray-600 list-disc list-inside">
                  <li><strong>React 19 & TypeScript:</strong> Tipagem estrita de todas as entidades de segurança e contratos.</li>
                  <li><strong>Tailwind CSS (Variáveis Globais):</strong> Componentes modernos e de alta visibilidade adequados para visualização rápida.</li>
                  <li><strong>Lucide Icons:</strong> Ícones vetoriais responsivos em todas as abas.</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-150">
                <span className="font-bold text-gray-950 block mb-2">Segurança e Banco (Local & Cloud)</span>
                <ul className="space-y-1.5 text-gray-600 list-disc list-inside">
                  <li><strong>Context API de Segurança:</strong> Gating reativo de rotas de acordo com o token do usuário.</li>
                  <li><strong>Motor LocalStorage de Auditorias:</strong> Caching automático e logs de transações locais.</li>
                  <li><strong>Prevenção Anticolisão:</strong> Motor de validação reativo para evitar conflitos de escala.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* DER MODEL SECTION */}
        {activeSec === 'der' && (
          <div className="space-y-5">
            <h3 className="text-sm font-extrabold text-gray-950 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Diagrama Entidade-Relacionamento Conceitual (DER)
            </h3>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              Estruturação relacional do banco de dados que suporta as transações operacionais do sistema Evolution:
            </p>

            <div className="bg-gray-950 text-emerald-400 font-mono text-xxxxs p-5 rounded-lg overflow-x-auto leading-relaxed border border-gray-900">
{`TABELA: Employees (Funcionários)
  - id: VARCHAR (PK)
  - name: VARCHAR
  - cpf: VARCHAR (UNIQUE)
  - email: VARCHAR (UNIQUE)
  - role: VARCHAR
  - salary: NUMERIC
  - situation: VARCHAR ("Ativo", "Afastado", "Férias")
  - cnhUrl: VARCHAR (NULL)
  - vigilanteCourseUrl: VARCHAR (NULL)

TABELA: Clients (Clientes)
  - id: VARCHAR (PK)
  - name: VARCHAR
  - document: VARCHAR (CNPJ/CPF, UNIQUE)
  - contactEmail: VARCHAR
  - status: VARCHAR ("Ativo", "Inativo")

TABELA: Contracts (Contratos)
  - id: VARCHAR (PK)
  - clientId: VARCHAR (FK -> Clients.id)
  - contractNumber: VARCHAR (UNIQUE)
  - monthlyValue: NUMERIC
  - securityGuardCount: INTEGER
  - startDate: DATE
  - endDate: DATE

TABELA: Scales (Escalas / Alocações)
  - id: VARCHAR (PK)
  - employeeId: VARCHAR (FK -> Employees.id)
  - clientId: VARCHAR (FK -> Clients.id)
  - contractId: VARCHAR (FK -> Contracts.id)
  - shift: VARCHAR ("Diurno", "Noturno")
  - startDate: DATETIME
  - isOffDay: BOOLEAN

TABELA: Assets (Equipamentos / Patrimônio)
  - id: VARCHAR (PK)
  - assetNumber: VARCHAR (UNIQUE)
  - category: VARCHAR
  - brand: VARCHAR
  - model: VARCHAR
  - situation: VARCHAR ("Disponível", "Emprestado", "Manutenção")

TABELA: AuditLogs (Trilha de Auditoria)
  - id: VARCHAR (PK)
  - timestamp: DATETIME
  - userName: VARCHAR
  - userRole: VARCHAR
  - action: VARCHAR
  - details: TEXT`}
            </div>
          </div>
        )}

        {/* RBAC MATRIX SECTION */}
        {activeSec === 'rbac' && (
          <div className="space-y-5">
            <h3 className="text-sm font-extrabold text-gray-950 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Matriz de Acessos de Perfis (RBAC)
            </h3>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              O sistema utiliza filtros de papel (Role-Based Access Control) que determinam a visibilidade e controle de operações críticas de acordo com a função corporativa:
            </p>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 font-bold text-gray-700">
                    <th className="px-4 py-2">Módulo / Permissão</th>
                    <th className="px-4 py-2 text-center text-blue-600">Administrador</th>
                    <th className="px-4 py-2 text-center text-blue-600">Supervisor</th>
                    <th className="px-4 py-2 text-center text-blue-600">RH</th>
                    <th className="px-4 py-2 text-center text-blue-600">Financeiro</th>
                    <th className="px-4 py-2 text-center text-blue-600">Cliente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {[
                    { m: 'Funcionários (C/R/U/D)', p: ['SIM', 'SIM (Apenas R/U)', 'SIM', 'NÃO', 'NÃO'] },
                    { m: 'Contratos e Clientes', p: ['SIM', 'SIM (Apenas R)', 'NÃO', 'SIM (Apenas R/U)', 'SIM (Apenas R)'] },
                    { m: 'Escalas e Alocações', p: ['SIM', 'SIM', 'SIM (Apenas R)', 'NÃO', 'SIM (Apenas R)'] },
                    { m: 'Patrimônio / Cautelas', p: ['SIM', 'SIM', 'NÃO', 'NÃO', 'NÃO'] },
                    { m: 'Logs de Auditoria', p: ['SIM', 'NÃO', 'NÃO', 'NÃO', 'NÃO'] },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{row.m}</td>
                      {row.p.map((perm, pidx) => (
                        <td key={pidx} className={`px-4 py-3 text-center font-bold text-xxs ${
                          perm.startsWith('SIM') ? 'text-emerald-700' : 'text-red-500'
                        }`}>
                          {perm}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
