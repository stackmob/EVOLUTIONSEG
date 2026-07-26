import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { AuditLog } from '../types';
import { ShieldCheck, Search, Trash2, Database, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    setLogs(db.getAuditLogs());
  }, []);

  const handleClear = () => {
    if (confirm('Deseja limpar todos os registros de auditoria local? Esta ação é irreversível.')) {
      db.clearAuditLogs();
      setLogs([]);
      toast.success('Histórico de auditorias limpo com sucesso.');
    }
  };

  const filteredLogs = logs.filter(l => {
    return l.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           l.module.toLowerCase().includes(searchQuery.toLowerCase()) || 
           l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
           l.details.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Rastreabilidade e Compliance</h1>
          <p className="text-xs text-gray-500 mt-1">Logs de auditoria e segurança em conformidade com as diretivas LGPD e Polícia Federal de rastreamento de acessos.</p>
        </div>
        
        <button 
          onClick={handleClear}
          className="btn btn-secondary text-red-600 bg-red-50 hover:bg-red-100 border-red-200 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" /> Limpar Logs Locais
        </button>
      </div>

      {/* FILTER SEARCH */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Pesquisar operadores, módulos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9"
          />
        </div>

        <div className="flex items-center gap-2 text-xxs font-bold text-gray-500 uppercase bg-gray-50 border border-gray-150 px-3 py-1.5 rounded-lg">
          <Database className="w-3.5 h-3.5 text-blue-500" />
          Total de {logs.length} registros auditados
        </div>
      </div>

      {/* COMPLIANCE LOG TIMELINE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs font-bold uppercase text-gray-400">
          Trilha de Auditorias do Sistema (Audit Trail)
          <span className="text-xxxxs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Imutável</span>
        </div>

        <div className="divide-y divide-gray-150">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-gray-300" />
              Nenhuma ação registrada para os filtros atuais.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div key={log.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xxxxs text-gray-400 font-bold">{log.createdAt}</span>
                        <span className="bg-gray-950 text-white font-extrabold text-xxxxs px-1.5 py-0.5 rounded uppercase">
                          {log.action}
                        </span>
                        <span className="text-xxs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {log.module}
                        </span>
                      </div>
                      <p className="font-semibold text-xs text-gray-950">{log.details}</p>
                      <p className="text-xxxxs text-gray-400 font-medium">Operador: <span className="font-bold text-gray-700">{log.userName}</span> ({log.userRole})</p>
                    </div>

                    {/* Expand Diff triggers */}
                    {(log.beforeState || log.afterState) && (
                      <button 
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="btn btn-secondary py-1 text-xxxxs font-bold flex items-center gap-1 cursor-pointer bg-white"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? 'Ocultar JSON' : 'Ver Modificações'}
                      </button>
                    )}

                  </div>

                  {/* Render payload difference if expanded */}
                  {isExpanded && (
                    <div className="mt-4 p-4 rounded-lg bg-gray-950 text-emerald-400 font-mono text-xxxxs border border-gray-900 leading-relaxed overflow-x-auto max-h-72 text-left">
                      {log.beforeState && (
                        <div className="mb-3">
                          <span className="text-red-400 font-bold block mb-1 uppercase tracking-widest">[Antes da Modificação]</span>
                          <pre>{JSON.stringify(log.beforeState, null, 2)}</pre>
                        </div>
                      )}
                      {log.afterState && (
                        <div>
                          <span className="text-emerald-400 font-bold block mb-1 uppercase tracking-widest">[Depois da Modificação]</span>
                          <pre>{JSON.stringify(log.afterState, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
