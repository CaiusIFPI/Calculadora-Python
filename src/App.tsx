import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { VisualCalculator, HistoryItem } from './components/VisualCalculator';
import { PythonTerminal } from './components/PythonTerminal';
import { CodeViewer } from './components/CodeViewer';
import { OperationsGuide } from './components/OperationsGuide';
import { 
  initPyodide, 
  subscribePyodideStatus, 
  PyodideStatus 
} from './services/pythonRunner';
import { PYTHON_SOURCE_CODE } from './data/pythonCode';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'terminal' | 'code' | 'guide'>('calculator');
  const [pyodideStatus, setPyodideStatus] = useState<PyodideStatus>({
    loading: false,
    ready: false,
    error: null,
    version: null,
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [terminalInitialCode, setTerminalInitialCode] = useState<string | undefined>(undefined);

  // Subscribe to Pyodide status and initiate background loading
  useEffect(() => {
    const unsubscribe = subscribePyodideStatus((status) => {
      setPyodideStatus(status);
    });

    // Warm up Pyodide in background
    initPyodide().catch(() => {
      // Ignored: fallback will handle it seamlessly
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Download calculadora.py
  const handleDownloadCode = () => {
    const blob = new Blob([PYTHON_SOURCE_CODE], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'calculadora.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenTerminalSnippet = (code: string) => {
    setTerminalInitialCode(code);
    setActiveTab('terminal');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadCode={handleDownloadCode}
        pyodideStatus={pyodideStatus}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'calculator' && (
          <VisualCalculator
            pyodideStatus={pyodideStatus}
            history={history}
            setHistory={setHistory}
            onOpenTerminalSnippet={handleOpenTerminalSnippet}
          />
        )}

        {activeTab === 'terminal' && (
          <PythonTerminal
            pyodideStatus={pyodideStatus}
            initialCode={terminalInitialCode}
          />
        )}

        {activeTab === 'code' && (
          <CodeViewer
            pyodideStatus={pyodideStatus}
            onDownloadCode={handleDownloadCode}
          />
        )}

        {activeTab === 'guide' && (
          <OperationsGuide />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/70 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Calculadora Python</span>
            <span>·</span>
            <span>Adição, Subtração, Multiplicação e Divisão</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Suporte a teclado numérico e atalhos</span>
            <span>·</span>
            <span>Tratamento de ZeroDivisionError</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
