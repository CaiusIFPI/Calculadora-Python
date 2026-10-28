import React, { useState } from 'react';
import { Download, Copy, Check, CheckCircle2, Play, AlertCircle, FileCode } from 'lucide-react';
import { PYTHON_SOURCE_CODE } from '../data/pythonCode';
import { runPythonTests, PyodideStatus } from '../services/pythonRunner';

interface CodeViewerProps {
  pyodideStatus: PyodideStatus;
  onDownloadCode: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  pyodideStatus,
  onDownloadCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_SOURCE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await runPythonTests();
      setTestOutput(res.output);
      setTestSuccess(res.success);
    } catch (err: any) {
      setTestOutput(err.message || 'Falha ao executar testes');
      setTestSuccess(false);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Código Fonte: calculadora.py
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Implementação modular em Python 3 com as 4 operações básicas, tipagem estática (Type Hints),
            tratamento de divisão por zero (<code className="text-amber-300">ZeroDivisionError</code>), histórico de cálculos e suíte de testes unitários.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleRunTests}
            disabled={isRunningTests}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            {isRunningTests ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Testando...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>Executar Testes Unitários</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="Copiar código para a área de transferência"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>

          <button
            onClick={onDownloadCode}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
            title="Baixar arquivo calculadora.py"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar .py</span>
          </button>
        </div>
      </div>

      {/* Test Output Box if executed */}
      {testOutput && (
        <div
          className={`p-4 rounded-xl border transition-all ${
            testSuccess
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/20 text-xs font-semibold">
            <div className="flex items-center gap-2">
              {testSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>
                {testSuccess
                  ? 'Todos os Testes Unitários Passaram com Sucesso (100%)'
                  : 'Falha na Execução dos Testes'}
              </span>
            </div>
            <button
              onClick={() => setTestOutput(null)}
              className="text-xs opacity-75 hover:opacity-100 underline"
            >
              Fechar
            </button>
          </div>
          <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed">
            {testOutput}
          </pre>
        </div>
      )}

      {/* Code Display with line numbers */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Top bar of the code block */}
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
            <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
            <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
            <span className="ml-2 font-mono text-slate-300">calculadora.py</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500 font-mono">Python 3.10+</span>
          </div>
          <span className="font-mono text-slate-500">UTF-8 · LF</span>
        </div>

        {/* Code Content */}
        <div className="p-4 sm:p-6 bg-slate-950/80 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed select-text">
          <pre className="text-slate-300">
            {PYTHON_SOURCE_CODE.split('\n').map((line, idx) => {
              // Simple aesthetic highlighting for comments, def, class, return
              let lineClass = 'text-slate-300';
              if (line.trim().startsWith('#')) lineClass = 'text-slate-500 italic';
              else if (line.trim().startsWith('"""') || line.trim().endsWith('"""') || line.includes('"""')) lineClass = 'text-emerald-400/90';
              else if (line.includes('def ') || line.includes('class ')) lineClass = 'text-amber-400 font-medium';
              else if (line.includes('return ') || line.includes('raise ') || line.includes('import ') || line.includes('from ')) lineClass = 'text-sky-400';
              else if (line.includes('assert ')) lineClass = 'text-purple-400';

              return (
                <div key={idx} className="table-row hover:bg-slate-900/50">
                  <span className="table-cell select-none text-right pr-4 text-slate-600 tabular-nums w-10">
                    {idx + 1}
                  </span>
                  <span className={`table-cell ${lineClass}`}>{line}</span>
                </div>
              );
            })}
          </pre>
        </div>

        {/* Code Footer with execution info */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>Como executar no seu terminal local: <code className="text-amber-300 font-mono">python3 calculadora.py</code></span>
          <span>Para rodar testes: <code className="text-amber-300 font-mono">python3 calculadora.py --test</code></span>
        </div>
      </div>
    </div>
  );
};
