import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Copy, Check, Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import { runCustomPython, PyodideStatus } from '../services/pythonRunner';

interface PythonTerminalProps {
  pyodideStatus: PyodideStatus;
  initialCode?: string;
}

const PRESET_SNIPPETS = [
  {
    title: '4 Operações Básicas',
    code: `# Importa as funções da calculadora
from calculadora import somar, subtrair, multiplicar, dividir

a = 48
b = 12

print("=== As Quatro Operações Matemáticas Básicas ===")
print(f"1. Adição:       {a} + {b} = {somar(a, b)}")
print(f"2. Subtração:    {a} - {b} = {subtrair(a, b)}")
print(f"3. Multiplicação:{a} * {b} = {multiplicar(a, b)}")
print(f"4. Divisão:      {a} / {b} = {dividir(a, b)}")
`,
  },
  {
    title: 'Divisão por Zero (try/except)',
    code: `from calculadora import dividir

numeros = [(100, 4), (50, 2), (30, 0), (75, 5)]

for x, y in numeros:
    try:
        resultado = dividir(x, y)
        print(f"Divisão: {x} / {y} = {resultado}")
    except ZeroDivisionError as err:
        print(f"ALERTA ao dividir {x} por {y}: {err}")
`,
  },
  {
    title: 'Classe Calculadora & Histórico',
    code: `from calculadora import Calculadora

calc = Calculadora()

# Executando sequência de operações
calc.calcular('+', 150, 50)
calc.calcular('-', 200, 35)
calc.calcular('*', 12, 8)
calc.calcular('/', 144, 12)

print("--- Histórico de Cálculos Armazenados ---")
for i, item in enumerate(calc.historico, 1):
    print(f"[{i}] {item['operacao']}: {item['expressao']} = {item['resultado']}")
`,
  },
  {
    title: 'Cálculo com Decimais (Floats)',
    code: `from calculadora import somar, subtrair, multiplicar, dividir

preco_unitario = 19.99
quantidade = 3
desconto = 5.50
taxa_entrega = 12.00

# Subtotal
subtotal = multiplicar(preco_unitario, quantidade)
com_desconto = subtrair(subtotal, desconto)
total = somar(com_desconto, taxa_entrega)

print(f"Subtotal (19.99 * 3):  R$ {subtotal:.2f}")
print(f"Com desconto (- 5.50): R$ {com_desconto:.2f}")
print(f"Total final (+ 12.00): R$ {total:.2f}")
`,
  },
];

export const PythonTerminal: React.FC<PythonTerminalProps> = ({
  pyodideStatus,
  initialCode,
}) => {
  const [code, setCode] = useState<string>(
    initialCode || PRESET_SNIPPETS[0].code
  );
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const res = await runCustomPython(code);
      setOutput(res.output);
      setError(res.error);
      setExecutionTime(res.timeMs);
    } catch (err: any) {
      setError(err.message || 'Erro de execução');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
    // Handle tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Banner / Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-semibold text-sm flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-amber-400" />
            <span>Terminal Interativo Python (REPL)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Execute código Python real diretamente no navegador com acesso às funções da calculadora.
          </p>
        </div>

        {/* Preset snippet selector buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1 hidden sm:inline">Exemplos:</span>
          {PRESET_SNIPPETS.map((snippet) => (
            <button
              key={snippet.title}
              onClick={() => {
                setCode(snippet.code);
                setError(null);
              }}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 transition-colors whitespace-nowrap"
            >
              {snippet.title}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left: Code Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400 font-medium">script.py</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500 font-mono">Pressione Ctrl+Enter para rodar</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                title="Copiar código"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
              <button
                onClick={() => setCode('')}
                className="text-slate-400 hover:text-slate-200 transition-colors ml-2"
                title="Limpar editor"
              >
                Limpar
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={15}
            spellCheck={false}
            className="flex-1 w-full bg-slate-950 text-slate-200 font-mono text-xs sm:text-sm p-4 rounded-xl border border-slate-800/80 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 outline-none resize-none leading-relaxed"
            placeholder="# Digite seu código Python aqui..."
          />

          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-800">
            <span className="text-xs text-slate-500 font-mono">
              {pyodideStatus.ready ? 'Ambiente CPython ativo' : 'Carregando CPython...'}
            </span>

            <button
              onClick={handleRun}
              disabled={isRunning || !code.trim()}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:hover:bg-amber-400 rounded-lg shadow-md transition-all active:scale-95"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Executando...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Executar Código</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Console Output */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400 font-medium">Saída do Console (stdout/stderr)</span>
              {executionTime !== null && (
                <span className="text-slate-500 font-mono">· {executionTime}ms</span>
              )}
            </div>

            <button
              onClick={() => {
                setOutput('');
                setError(null);
                setExecutionTime(null);
              }}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Saída</span>
            </button>
          </div>

          <div className="flex-1 min-h-[320px] bg-slate-950 rounded-xl p-4 border border-slate-800/80 font-mono text-xs overflow-y-auto leading-relaxed select-text">
            {!output && !error && !isRunning && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center py-10">
                <Sparkles className="w-6 h-6 mb-2 stroke-1 text-slate-500" />
                <p>O resultado da execução do Python aparecerá aqui.</p>
                <p className="text-[11px] text-slate-600 mt-1">Clique em "Executar Código" para testar.</p>
              </div>
            )}

            {isRunning && (
              <div className="flex items-center gap-2 text-amber-400">
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Processando interpretação Python...</span>
              </div>
            )}

            {output && (
              <pre className="text-emerald-300/90 whitespace-pre-wrap">{output}</pre>
            )}

            {error && (
              <div className="mt-2 text-rose-400 whitespace-pre-wrap border-t border-rose-900/50 pt-2">
                <span className="font-bold">Traceback / Erro:</span>
                <pre className="mt-1">{error}</pre>
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Módulo: calculadora.py disponível para import</span>
            <span>sys.stdout capturado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
