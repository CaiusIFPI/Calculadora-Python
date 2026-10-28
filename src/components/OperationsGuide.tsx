import React, { useState } from 'react';
import { OPERATIONS_GUIDE, OperationDetail } from '../data/pythonCode';
import { calculatePython } from '../services/pythonRunner';
import { Sparkles, ArrowRight, BookOpen, AlertTriangle } from 'lucide-react';

interface OperationsGuideProps {
  onSendToCalculator?: (a: number, b: number, op: '+' | '-' | '*' | '/') => void;
}

export const OperationsGuide: React.FC<OperationsGuideProps> = ({
  onSendToCalculator,
}) => {
  const [selectedOp, setSelectedOp] = useState<OperationDetail>(OPERATIONS_GUIDE[0]);
  const [valA, setValA] = useState<number>(selectedOp.sampleA);
  const [valB, setValB] = useState<number>(selectedOp.sampleB);
  const [result, setResult] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [calcTime, setCalcTime] = useState<number | null>(null);

  // Recalculate when selectedOp, valA, or valB change
  React.useEffect(() => {
    let isCancelled = false;
    const run = async () => {
      const opSymbol = selectedOp.id === 'adicao' ? '+' : selectedOp.id === 'subtracao' ? '-' : selectedOp.id === 'multiplicacao' ? '*' : '/';
      const exec = await calculatePython(opSymbol, valA, valB);
      if (!isCancelled) {
        if (exec.success && exec.result !== null) {
          setResult(exec.result);
          setErrorMsg(null);
        } else {
          setResult(null);
          setErrorMsg(exec.error || 'Erro');
        }
        setCalcTime(exec.executionTimeMs);
      }
    };
    run();
    return () => {
      isCancelled = true;
    };
  }, [selectedOp, valA, valB]);

  const handleSelectOperation = (op: OperationDetail) => {
    setSelectedOp(op);
    setValA(op.sampleA);
    setValB(op.sampleB);
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Guia Didático: As 4 Operações Matemáticas Básicas em Python
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Entenda como a linguagem Python processa adição, subtração, multiplicação e divisão, 
          incluindo promoção automática de tipos numéricos, precedência de operadores e tratamento de exceções.
        </p>

        {/* 4 Operations Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {OPERATIONS_GUIDE.map((op) => {
            const isSelected = selectedOp.id === op.id;
            return (
              <button
                key={op.id}
                onClick={() => handleSelectOperation(op)}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800 border-amber-400/80 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {op.symbol}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Py: {op.pySymbol}
                  </span>
                </div>
                <div className="font-semibold text-sm text-white">{op.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate font-mono">
                  {op.syntaxExample}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Exploration Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Sandbox for Current Operation */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                Laboratório Interativo
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 font-mono">
                {selectedOp.name} ({selectedOp.pySymbol})
              </span>
            </div>

            {calcTime !== null && (
              <span className="text-xs font-mono text-slate-500">
                {calcTime}ms de execução
              </span>
            )}
          </div>

          {/* Interactive Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 font-mono">
                Valor A (1º Operando):
              </label>
              <input
                type="number"
                step="any"
                value={valA}
                onChange={(e) => setValA(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400/80 rounded-xl px-4 py-2.5 font-mono text-white text-base outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 font-mono">
                Valor B (2º Operando):
              </label>
              <input
                type="number"
                step="any"
                value={valB}
                onChange={(e) => setValB(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400/80 rounded-xl px-4 py-2.5 font-mono text-white text-base outline-none transition-colors"
              />
            </div>
          </div>

          {/* Preset Buttons for edge cases */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Testar casos especiais:</span>
            {selectedOp.id === 'divisao' ? (
              <>
                <button
                  onClick={() => { setValA(100); setValB(0); }}
                  className="px-2.5 py-1 bg-red-950/60 text-red-300 border border-red-800/60 rounded hover:bg-red-900/60 transition-colors font-mono"
                >
                  Dividir por Zero (b = 0)
                </button>
                <button
                  onClick={() => { setValA(7); setValB(2); }}
                  className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors font-mono"
                >
                  Decimal (7 / 2 = 3.5)
                </button>
              </>
            ) : selectedOp.id === 'adicao' ? (
              <>
                <button
                  onClick={() => { setValA(0.1); setValB(0.2); }}
                  className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors font-mono"
                >
                  Float (0.1 + 0.2)
                </button>
                <button
                  onClick={() => { setValA(-50); setValB(80); }}
                  className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors font-mono"
                >
                  Negativo (-50 + 80)
                </button>
              </>
            ) : selectedOp.id === 'subtracao' ? (
              <>
                <button
                  onClick={() => { setValA(15); setValB(30); }}
                  className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors font-mono"
                >
                  Resultado Negativo (15 - 30)
                </button>
                <button
                  onClick={() => { setValA(-10); setValB(-10); }}
                  className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors font-mono"
                >
                  Subtrair Negativos
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setValA(999); setValB(0); }}
                  className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors font-mono"
                >
                  Multiplicação por 0
                </button>
                <button
                  onClick={() => { setValA(-8); setValB(12); }}
                  className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors font-mono"
                >
                  Regra de Sinais (-8 * 12)
                </button>
              </>
            )}
          </div>

          {/* Live Result Box */}
          <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Expressão Python Avaliada:</span>
              <span>
                Tipo retornado:{' '}
                <strong className="text-amber-300">
                  {errorMsg ? 'Exceção' : Number.isInteger(result) ? 'int' : 'float'}
                </strong>
              </span>
            </div>

            <div className="bg-slate-900/90 rounded-lg p-3 font-mono text-sm border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">
                {valA} {selectedOp.pySymbol} {valB}
              </span>
              <span className="text-amber-400 font-bold text-lg">
                {errorMsg ? 'ZeroDivisionError' : `= ${result}`}
              </span>
            </div>

            {errorMsg ? (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-red-300">Exceção Lançada:</span>
                  <p className="font-mono mt-0.5">{errorMsg}</p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Função: <code className="text-slate-300">{selectedOp.pythonFunction}</code></span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Explanatory Nuances & Best Practices */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-white font-semibold text-sm">
              Particularidades em Python: {selectedOp.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{selectedOp.description}</p>
          </div>

          <div className="space-y-3">
            {selectedOp.nuances.map((nuance, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{nuance}</p>
              </div>
            ))}
          </div>

          {/* Division specials info if division */}
          {selectedOp.id === 'divisao' && (
            <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <span className="text-amber-400 font-semibold block mb-1">
                Operadores de Divisão em Python 3:
              </span>
              <div><code className="text-slate-200">/</code> : Divisão real (retorna float, ex: 10 / 2 = 5.0)</div>
              <div><code className="text-slate-200">//</code>: Divisão inteira piso (ex: 7 // 2 = 3)</div>
              <div><code className="text-slate-200">%</code> : Módulo ou resto da divisão (ex: 7 % 2 = 1)</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
