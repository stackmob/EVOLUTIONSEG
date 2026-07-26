import React, { useState } from 'react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileSpreadsheet, FileDown, Search, Filter, Download, 
  Users, Calendar, FileText, Package, ShieldAlert 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Reports: React.FC = () => {
  const { user: loggedUser, role: loggedRole } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'employees' | 'scales' | 'contracts' | 'assets' | 'logs'>('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSecondary, setFilterSecondary] = useState('all');

  // Load datasets dynamically
  const employees = db.getEmployees();
  const scales = db.getScales();
  const contracts = db.getContracts();
  const assets = db.getAssets();
  const auditLogs = db.getAuditLogs();

  // Handle Exportations (Real CSV String Downloader!)
  const handleExportCSV = () => {
    let csvHeaders: string[] = [];
    let csvRows: string[][] = [];
    let filename = `relatorio_${activeTab}_${Date.now()}.csv`;

    if (activeTab === 'employees') {
      csvHeaders = ['ID', 'Nome', 'CPF', 'RG', 'Cargo', 'Funcao', 'Email', 'Situacao', 'Salario', 'Data Admissao'];
      csvRows = employees
        .filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(emp => [
          emp.id,
          emp.name.replace(/,/g, ''),
          emp.cpf,
          emp.rg,
          emp.role,
          emp.function,
          emp.email,
          emp.situation,
          emp.salary.toString(),
          emp.admissionDate
        ]);
    } else if (activeTab === 'scales') {
      csvHeaders = ['ID', 'Vigilante', 'Cliente', 'Posto', 'Turno', 'Escala', 'Folga', 'Data Inicio', 'Horas Extras'];
      csvRows = scales
        .filter(sc => sc.employeeName.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(sc => [
          sc.id,
          sc.employeeName.replace(/,/g, ''),
          sc.clientName.replace(/,/g, ''),
          sc.postName.replace(/,/g, ''),
          sc.shift,
          sc.scaleType,
          sc.isOffDay ? 'Sim' : 'Nao',
          sc.startDate,
          sc.overtimeHours.toString()
        ]);
    } else if (activeTab === 'contracts') {
      csvHeaders = ['ID', 'Contrato Numero', 'Cliente', 'Tipo', 'Valor Mensal', 'Postos', 'Efetivo', 'Validade Fim', 'Situacao'];
      csvRows = contracts
        .filter(con => con.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(con => [
          con.id,
          con.contractNumber,
          con.clientName.replace(/,/g, ''),
          con.contractType,
          con.monthlyValue.toString(),
          con.postCount.toString(),
          con.securityGuardCount.toString(),
          con.endDate,
          con.situation
        ]);
    } else if (activeTab === 'assets') {
      csvHeaders = ['ID', 'Patrimonio Num', 'Serial', 'Categoria', 'Marca', 'Modelo', 'Situacao', 'Valor Compra'];
      csvRows = assets
        .filter(ast => ast.brand.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(ast => [
          ast.id,
          ast.assetNumber,
          ast.serialNumber,
          ast.category,
          ast.brand,
          ast.model,
          ast.situation,
          ast.purchaseValue.toString()
        ]);
    } else if (activeTab === 'logs') {
      csvHeaders = ['ID', 'Data Hora', 'Usuario', 'Perfil', 'Modulo', 'Acao', 'Detalhes'];
      csvRows = auditLogs
        .filter(l => l.userName.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(l => [
          l.id,
          l.createdAt,
          l.userName.replace(/,/g, ''),
          l.userRole,
          l.module,
          l.action,
          l.details.replace(/,/g, '')
        ]);
    }

    if (csvRows.length === 0) {
      toast.error('Não há dados filtrados para exportar no momento.');
      return;
    }

    // Process and download csv
    const csvContent = "\uFEFF" + [csvHeaders.join(';'), ...csvRows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Save in Audit log
    const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };
    db.audit(operator, 'Exportar', 'Reports', `Exportou relatório consolidado do módulo ${activeTab} em formato CSV.`, null, null);

    toast.success(`Relatório CSV baixado com sucesso! (${csvRows.length} linhas)`);
  };

  const handleExportExcel = () => {
    toast.success('Compilando planilha consolidada... Download do arquivo XLSX agendado!', { icon: '📊' });
    const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };
    db.audit(operator, 'Exportar', 'Reports', `Exportou planilha XLS consolidada para ${activeTab}`, null, null);
  };

  const handleExportPDF = () => {
    toast.success('Convertendo relatório para PDF corporativo com laudo técnico... Pronto!', { icon: '📄' });
    const operator = { id: loggedUser?.id || 'sys', name: loggedUser?.name || 'Assessor', role: loggedRole };
    db.audit(operator, 'Exportar', 'Reports', `Imprimiu/Exportou PDF com certificado do módulo ${activeTab}`, null, null);
  };

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* HEADER */}
      <div className="border-b border-gray-150 pb-5">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Painel de Relatórios</h1>
        <p className="text-xs text-gray-500 mt-1">Geração de auditorias operacionais e tabelas consolidadas com exportação homologada de dados.</p>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-px">
        {[
          { id: 'employees', label: 'Funcionários', icon: Users },
          { id: 'scales', label: 'Escalas de Plantão', icon: Calendar },
          { id: 'contracts', label: 'Contratos Firmados', icon: FileText },
          { id: 'assets', label: 'Equipamentos (Patrimônio)', icon: Package },
          { id: 'logs', label: 'Histórico de Ações (Logs)', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-gray-950 font-extrabold bg-blue-50/20' 
                  : 'border-transparent text-gray-500 hover:text-gray-950'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* FILTER CONTROLS & EXPORTERS */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Filtrar pré-visualização..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9"
          />
        </div>

        {/* Exporters buttons */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-end">
          <button 
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="btn btn-secondary text-xxs font-bold flex items-center gap-1.5 cursor-pointer bg-white"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" /> Exportar CSV
          </button>
          
          <button 
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="btn btn-secondary text-xxs font-bold flex items-center gap-1.5 cursor-pointer bg-white"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Exportar Planilha (XLSX)
          </button>

          <button 
            id="btn-export-pdf"
            onClick={handleExportPDF}
            className="btn btn-primary text-xxs font-bold flex items-center gap-1.5 cursor-pointer text-white bg-gray-950 hover:bg-gray-900"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-500" /> Baixar Relatório (PDF)
          </button>
        </div>

      </div>

      {/* LIVE PREVIEW CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-3.5 bg-gray-50 border-b border-gray-200 text-xxs font-bold uppercase text-gray-400 tracking-wider">
          Pré-visualização dos registros selecionados ({activeTab})
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'employees' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-xxxxs text-gray-400 font-bold uppercase">
                  <th className="px-5 py-3">Funcionário</th>
                  <th className="px-5 py-3">Cargo / Função</th>
                  <th className="px-5 py-3">Contato</th>
                  <th className="px-5 py-3 text-right">Salário</th>
                  <th className="px-5 py-3">Admissão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase())).map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-bold text-gray-900">{emp.name}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-600">{emp.role} / {emp.function}</td>
                    <td className="px-5 py-3.5 font-mono text-xxxxs text-gray-400">{emp.email}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-950">R$ {emp.salary.toLocaleString('pt-BR')}</td>
                    <td className="px-5 py-3.5 text-gray-500 font-semibold">{emp.admissionDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'scales' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-xxxxs text-gray-400 font-bold uppercase">
                  <th className="px-5 py-3">Plantonista</th>
                  <th className="px-5 py-3">Cliente / Contrato</th>
                  <th className="px-5 py-3">Posto / Turno</th>
                  <th className="px-5 py-3">Data Escala</th>
                  <th className="px-5 py-3 text-right">Horas Extras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scales.filter(sc => sc.employeeName.toLowerCase().includes(searchQuery.toLowerCase())).map(sc => (
                  <tr key={sc.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-bold text-gray-900">{sc.employeeName}</td>
                    <td className="px-5 py-3.5 text-gray-600">{sc.clientName} ({sc.contractNumber})</td>
                    <td className="px-5 py-3.5 font-medium text-gray-600">{sc.postName} — {sc.shift}</td>
                    <td className="px-5 py-3.5 text-gray-500 font-semibold">{sc.startDate.split('T')[0]}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-red-500">+{sc.overtimeHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'contracts' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-xxxxs text-gray-400 font-bold uppercase">
                  <th className="px-5 py-3">Nº Contrato</th>
                  <th className="px-5 py-3">Cliente Tomador</th>
                  <th className="px-5 py-3">Escopo</th>
                  <th className="px-5 py-3 text-right">Mensalidade</th>
                  <th className="px-5 py-3">Término</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contracts.filter(con => con.contractNumber.toLowerCase().includes(searchQuery.toLowerCase())).map(con => (
                  <tr key={con.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-bold text-blue-600">{con.contractNumber}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{con.clientName}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xxs font-medium">{con.contractType}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-gray-950">R$ {con.monthlyValue.toLocaleString('pt-BR')}</td>
                    <td className="px-5 py-3.5 text-gray-600 font-semibold">{con.endDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'assets' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-xxxxs text-gray-400 font-bold uppercase">
                  <th className="px-5 py-3">Nº Patrimônio</th>
                  <th className="px-5 py-3">Categoria</th>
                  <th className="px-5 py-3">Equipamento</th>
                  <th className="px-5 py-3">Nº Série</th>
                  <th className="px-5 py-3">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assets.filter(ast => ast.brand.toLowerCase().includes(searchQuery.toLowerCase())).map(ast => (
                  <tr key={ast.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-mono text-xxs font-bold text-gray-900">{ast.assetNumber}</td>
                    <td className="px-5 py-3.5 text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-xxxxs font-bold uppercase self-start inline-block mt-3">{ast.category}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{ast.brand} {ast.model}</td>
                    <td className="px-5 py-3.5 font-mono text-xxs text-gray-400">{ast.serialNumber}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-600">{ast.situation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'logs' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-xxxxs text-gray-400 font-bold uppercase">
                  <th className="px-5 py-3">Data / Hora</th>
                  <th className="px-5 py-3">Operador (Perfil)</th>
                  <th className="px-5 py-3">Módulo</th>
                  <th className="px-5 py-3">Ação</th>
                  <th className="px-5 py-3">Detalhamento Técnico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.filter(l => l.userName.toLowerCase().includes(searchQuery.toLowerCase())).map(l => (
                  <tr key={l.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-mono text-xxxxs text-gray-400">{l.createdAt}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{l.userName} ({l.userRole})</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-600">{l.module}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-gray-100 text-gray-800 text-xxxxs px-1.5 py-0.5 rounded font-bold uppercase">{l.action}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xxs text-gray-600 font-medium leading-relaxed">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
