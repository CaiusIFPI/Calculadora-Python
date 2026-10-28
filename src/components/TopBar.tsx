import React from 'react';
import { Download, Terminal, Calculator, FileCode, BookOpen } from 'lucide-react';
import { PyodideStatus } from '../services/pythonRunner';

interface TopBarProps {
  activeTab: 'calculator' | 'terminal' | 'code' | 'guide';
  setActiveTab: (tab: 'calculator' | 'terminal' | 'code' | 'guide') => void;
  onDownloadCode: () => void;
  pyodideStatus: PyodideStatus;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onDownloadCode,
  pyodideStatus,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, single element */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center shadow-sm">
            <span className="font-mono font-bold text-slate-950 text-sm">Py</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            Calculadora Python
          </span>
          {/* Subtle text status indicator */}
          <span className="hidden sm:inline text-xs text-slate-500 font-mono">
            {pyodideStatus.ready ? pyodideStatus.version || 'Python 3.12 (WASM)' : 'Inicializando Python...'}
          </span>
        </div>

        {/* Zone 2: Single-line navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'calculator'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Calculator className="w-4 h-4 text-blue-400" />
            <span>Calculadora</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'terminal'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Terminal REPL</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'code'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>Código Fonte & Testes</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
              activeTab === 'guide'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Guia das 4 Operações</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onDownloadCode}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md shadow-sm transition-colors whitespace-nowrap shrink-0"
            title="Baixar arquivo calculadora.py completo"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar .py</span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer row */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-800/60 bg-slate-900/90 text-xs">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded ${
            activeTab === 'calculator' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-blue-400" />
          <span>Calculadora</span>
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded ${
            activeTab === 'terminal' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span>Terminal</span>
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded ${
            activeTab === 'code' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-emerald-400" />
          <span>Código</span>
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded ${
            activeTab === 'guide' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          <span>Guia</span>
        </button>
      </div>
    </header>
  );
};
