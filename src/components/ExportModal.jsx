import React, { useState } from 'react';
import { X, Copy, Check, Code2, Download } from 'lucide-react';
import { exportToReactTailwind } from '../services/exportService';

export default function ExportModal({ isOpen, onClose, blocks, workspace, brand }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsxCode = exportToReactTailwind(blocks, workspace, brand);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsxCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsxCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'StageExportedComponent.jsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1C1C1F] border border-[#333338] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2E]">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Code2 size={16} className="text-blue-500" />
            <span>Export Production React + Tailwind Component</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#2A2A2E] transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Code View */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs bg-[#111113]">
          <pre className="text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre">
            {jsxCode}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141416] border-t border-[#2A2A2E]">
          <span className="text-xs text-zinc-500 font-mono">
            {blocks.length} Live Canvas Blocks Compiled
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg border border-[#333338] hover:bg-[#25252A] text-zinc-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
            >
              <Download size={14} /> Download JSX
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              {copied ? (
                <>
                  <Check size={14} /> Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy Code
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
