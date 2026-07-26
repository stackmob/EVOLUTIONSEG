import React from 'react';
import { DocumentMetadata, downloadDocument } from '../services/storage';
import { useTheme } from '../contexts/ThemeContext';
import { FileText, Download, X, Eye, ExternalLink, Calendar, HardDrive, ShieldCheck } from 'lucide-react';

interface DocumentViewerModalProps {
  document: DocumentMetadata | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document: doc, onClose }) => {
  const { theme } = useTheme();

  if (!doc) return null;

  const isPdf = doc.mimeType.includes('pdf') || doc.fileName.toLowerCase().endsWith('.pdf');
  const isImage = doc.mimeType.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.fileName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left ${
        theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        {/* HEADER */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm font-heading text-slate-900 dark:text-white truncate max-w-md">
                {doc.fileName}
              </h3>
              <div className="flex items-center gap-3 text-xxs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {doc.formattedSize}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PREVIEW BODY */}
        <div className="p-4 flex-1 overflow-y-auto bg-slate-900/50 flex flex-col items-center justify-center min-h-80">
          {isPdf ? (
            <iframe
              src={doc.fileUrl}
              title={doc.fileName}
              className="w-full h-96 rounded-xl border border-slate-700 bg-white"
            />
          ) : isImage ? (
            <img 
              src={doc.fileUrl} 
              alt={doc.fileName} 
              className="max-h-96 rounded-xl object-contain border border-slate-700 shadow-md" 
            />
          ) : (
            <div className="p-8 text-center space-y-3">
              <FileText className="w-16 h-16 text-emerald-500 mx-auto opacity-70" />
              <p className="text-xs text-slate-300 font-mono">
                Pré-visualização direta não suportada para este formato de arquivo.
              </p>
              <button
                onClick={() => downloadDocument(doc.fileUrl, doc.fileName)}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" /> Baixar Documento para Abrir
              </button>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-xxs font-mono text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> LINK PROTEGIDO & ARQUIVO FÍSICO AUTÊNTICO
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-xl font-bold cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={() => downloadDocument(doc.fileUrl, doc.fileName)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Download className="w-4 h-4" /> Baixar Arquivo Original
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
