import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, 
  Trash2, 
  RotateCcw, 
  Copy, 
  Check, 
  Cpu, 
  AlertCircle,
  HelpCircle,
  CornerDownLeft
} from 'lucide-react';
import { calculatePython, ExecutionResult, PyodideStatus } from '../services/pythonRunner';

export interface HistoryItem {
  id: string;
  a: number;
  b: number;
  op: '+' | '-' | '*' | '/';
  opName: string;
  result: number | null;
  pyCode: string;
  timestamp: string;
  error?: string;
  timeMs: number;
  engine: 'python-wasm' | 'native-js';
}

interface VisualCalculatorProps {
  pyodideStatus: PyodideStatus;
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  onOpenTerminalSnippet?: (code: string) => void;
}

export const VisualCalculator: React.FC<VisualCalculatorProps> = ({
  pyodideStatus,
  history,
  setHistory,
  onOpenTerminalSnippet,
}) => {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<'+' | '-' | '*' | '/' | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [lastExecution, setLastExecution] = useState<ExecutionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [forceJsMode, setForceJsMode] = useState<boolean>(false);

  // Clear all
  const handleClearAll = () => {
    setDisplayValue('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setErrorMessage(null);
  };

  // Backspace
  const handleBackspace = () => {
    if (errorMessage) {
      handleClearAll();
      return;
    }
    if (waitingForOperand) return;
    if (displayValue.length === 1 || (displayValue.length === 2 && displayValue.startsWith('-'))) {
      setDisplayValue('0');
    } else {
      setDisplayValue(displayValue.slice(0, -1));
    }
  };

  // Toggle positive/negative
  const handleToggleSign = () => {
    if (errorMessage) return;
    const current = parseFloat(displayValue);
    if (current === 0) return;
    setDisplayValue(String(-current));
  };

  // Input digit
  const handleInputDigit = (digit: string) => {
    setErrorMessage(null);
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      if (displayValue === '0' && digit !== '.') {
        setDisplayValue(digit);
      } else if (displayValue.length < 16) {
        setDisplayValue(displayValue + digit);
      }
    }
  };

  // Input decimal dot
  const handleInputDot = () => {
    setErrorMessage(null);
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  // Percent operation (a / 100)
  const handlePercent = async () => {
    const val = parseFloat(displayValue);
    if (isNaN(val)) return;
    setIsCalculating(true);
    const exec = await calculatePython('/', val, 100, forceJsMode);
    setIsCalculating(false);
    if (exec.success && exec.result !== null) {
      setDisplayValue(String(exec.result));
      setLastExecution(exec);
    }
  };

  // Handle operation selection (+, -, *, /)
  const handleSelectOperator = async (nextOperator: '+' | '-' | '*' | '/') => {
    setErrorMessage(null);
    const inputValue = parseFloat(displayValue);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator && !waitingForOperand) {
      // Execute intermediate calculation
      setIsCalculating(true);
      const exec = await calculatePython(operator, previousValue, inputValue, forceJsMode);
      setIsCalculating(false);

      if (!exec.success || exec.result === null) {
        setErrorMessage(exec.error || 'Erro na operação');
        setDisplayValue('Erro');
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(true);
        return;
      }

      setDisplayValue(String(exec.result));
      setPreviousValue(exec.result);
      setLastExecution(exec);

      // Add to history
      const item: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        a: previousValue,
        b: inputValue,
        op: operator,
        opName: operator === '+' ? 'Adição' : operator === '-' ? 'Subtração' : operator === '*' ? 'Multiplicação' : 'Divisão',
        result: exec.result,
        pyCode: exec.pyCode,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timeMs: exec.executionTimeMs,
        engine: exec.engine,
      };
      setHistory((prev) => [item, ...prev].slice(0, 30));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  // Perform Equals calculation
  const handleCalculateEquals = useCallback(async () => {
    if (previousValue === null || operator === null) return;

    const currentValue = parseFloat(displayValue);
    if (isNaN(currentValue)) return;

    setIsCalculating(true);
    const exec = await calculatePython(operator, previousValue, currentValue, forceJsMode);
    setIsCalculating(false);

    setLastExecution(exec);

    if (!exec.success || exec.result === null) {
      setErrorMessage(exec.error || 'Erro na operação');
      setDisplayValue('Erro');
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);

      const errItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        a: previousValue,
        b: currentValue,
        op: operator,
        opName: operator === '+' ? 'Adição' : operator === '-' ? 'Subtração' : operator === '*' ? 'Multiplicação' : 'Divisão',
        result: null,
        pyCode: exec.pyCode,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        error: exec.error,
        timeMs: exec.executionTimeMs,
        engine: exec.engine,
      };
      setHistory((prev) => [errItem, ...prev].slice(0, 30));
      return;
    }

    setDisplayValue(String(exec.result));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);

    const successItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      a: previousValue,
      b: currentValue,
      op: operator,
      opName: operator === '+' ? 'Adição' : operator === '-' ? 'Subtração' : operator === '*' ? 'Multiplicação' : 'Divisão',
      result: exec.result,
      pyCode: exec.pyCode,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timeMs: exec.executionTimeMs,
      engine: exec.engine,
    };
    setHistory((prev) => [successItem, ...prev].slice(0, 30));
  }, [displayValue, forceJsMode, operator, previousValue, setHistory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when focusing on an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleInputDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        handleInputDot();
      } else if (e.key === '+') {
        handleSelectOperator('+');
      } else if (e.key === '-') {
        handleSelectOperator('-');
      } else if (e.key === '*' || e.key === 'x') {
        handleSelectOperator('*');
      } else if (e.key === '/') {
        e.preventDefault();
        handleSelectOperator('/');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculateEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayValue, previousValue, operator, waitingForOperand, handleCalculateEquals]);

  // Memory functions
  const handleMemoryAdd = () => {
    const val = parseFloat(displayValue);
    if (!isNaN(val)) setMemory((m) => m + val);
  };
  const handleMemorySub = () => {
    const val = parseFloat(displayValue);
    if (!isNaN(val)) setMemory((m) => m - val);
  };
  const handleMemoryRecall = () => {
    setDisplayValue(String(memory));
    setWaitingForOperand(false);
  };
  const handleMemoryClear = () => {
    setMemory(0);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getOperatorDisplay = (op: '+' | '-' | '*' | '/' | null) => {
    if (!op) return '';
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left/Main Column: Calculator Interface */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Main Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          
          {/* Top Engine & Setting bar */}
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Motor de Execução:</span>
              <button
                onClick={() => setForceJsMode(!forceJsMode)}
                className={`px-2.5 py-1 rounded transition-colors text-xs font-mono font-medium ${
                  forceJsMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
                title="Clique para alternar entre CPython WebAssembly e Motor Nativo"
              >
                {forceJsMode ? 'JavaScript Fallback' : 'CPython (WebAssembly)'}
              </button>
            </div>

            <div className="text-slate-400 text-xs font-mono">
              {memory !== 0 && (
                <span className="text-amber-400 font-semibold mr-2">[M = {memory}]</span>
              )}
              <span>Teclado ativo</span>
            </div>
          </div>

          {/* Calculator Screen / Display */}
          <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-5 mb-5 flex flex-col justify-between min-h-[120px] transition-all">
            {/* Top row: Operation expression trail */}
            <div className="flex items-center justify-between text-slate-400 font-mono text-sm tracking-wide h-6">
              <span>
                {previousValue !== null && (
                  <>
                    <span className="text-slate-300">{previousValue}</span>{' '}
                    <span className="text-amber-400 font-bold">{getOperatorDisplay(operator)}</span>
                  </>
                )}
              </span>
              {isCalculating && (
                <span className="text-xs text-amber-400 font-mono animate-pulse">
                  Executando em Python...
                </span>
              )}
            </div>

            {/* Main display number */}
            <div className="text-right overflow-x-auto no-scrollbar py-1">
              <span 
                className={`font-mono font-semibold tracking-tight text-white select-all tabular-nums transition-all ${
                  displayValue.length > 12 ? 'text-2xl sm:text-3xl' : displayValue.length > 8 ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'
                } ${errorMessage ? 'text-red-400' : ''}`}
              >
                {displayValue}
              </span>
            </div>

            {/* Bottom info row in display */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs font-mono text-slate-500">
              <span className="truncate max-w-[280px]">
                {lastExecution ? (
                  <span className="text-slate-400">
                    Py: <code className="text-amber-300/90">{lastExecution.pyCode}</code>
                  </span>
                ) : (
                  <span>Pronto para calcular</span>
                )}
              </span>
              {lastExecution && (
                <span className="text-slate-500 shrink-0">
                  {lastExecution.executionTimeMs}ms · {lastExecution.engine === 'python-wasm' ? 'Python WASM' : 'JS'}
                </span>
              )}
            </div>
          </div>

          {/* Error Banner if ZeroDivisionError or error occurs */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-lg flex items-start gap-3 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-red-300">Exceção em Python:</span>
                <p className="font-mono mt-0.5">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-200 text-xs underline shrink-0"
              >
                Dispensar
              </button>
            </div>
          )}

          {/* Memory Bar */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button
              onClick={handleMemoryClear}
              className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono rounded transition-colors"
              title="Limpar Memória (MC)"
            >
              MC
            </button>
            <button
              onClick={handleMemoryRecall}
              className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono rounded transition-colors"
              title="Recuperar da Memória (MR)"
            >
              MR
            </button>
            <button
              onClick={handleMemoryAdd}
              className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono rounded transition-colors"
              title="Adicionar à Memória (M+)"
            >
              M+
            </button>
            <button
              onClick={handleMemorySub}
              className="py-1.5 px-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono rounded transition-colors"
              title="Subtrair da Memória (M-)"
            >
              M-
            </button>
          </div>

          {/* Calculator Keypad */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
            {/* Row 1 */}
            <button
              onClick={handleClearAll}
              className="h-14 sm:h-16 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-rose-400 font-semibold text-base sm:text-lg transition-all active:scale-95 shadow-sm"
              title="Limpar tudo (Esc)"
            >
              AC
            </button>
            <button
              onClick={handleBackspace}
              className="h-14 sm:h-16 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-medium text-sm sm:text-base transition-all active:scale-95 shadow-sm"
              title="Apagar dígito (Backspace)"
            >
              DEL
            </button>
            <button
              onClick={handleToggleSign}
              className="h-14 sm:h-16 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-medium text-base sm:text-lg transition-all active:scale-95 shadow-sm font-mono"
              title="Inverter Sinal (±)"
            >
              ±
            </button>
            <button
              onClick={() => handleSelectOperator('/')}
              className={`h-14 sm:h-16 rounded-xl font-semibold text-xl sm:text-2xl transition-all active:scale-95 shadow-sm ${
                operator === '/'
                  ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-400'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30'
              }`}
              title="Divisão em Python (/)"
            >
              ÷
            </button>

            {/* Row 2 */}
            <button
              onClick={() => handleInputDigit('7')}
              className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-lg sm:text-xl transition-all active:scale-95 shadow-sm font-mono"
            >
              7
            </button>
            <button
              onClick={() => handleInputDigit('8')}
              className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-lg sm:text-xl transition-all active:scale-95 shadow-sm font-mono"
            >
              8
            </button>
            <button
              onClick={() => handleInputDigit('9')}
              className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-lg sm:text-xl transition-all active:scale-95 shadow-sm font-mono"
            >
              9
            </button>
            <button
              onClick={() => handleSelectOperator('*')}
              className={`h-14 sm:h-16 rounded-xl font-semibold text-xl sm:text-2xl transition-all active:scale-95 shadow-sm ${
                operator === '*'
                  ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-400'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30'
              }`}
              title="Multiplicação em Python (*)"
            >
              ×
            </button>

            {/* Row 3 */}
            <button
              onClick={() => handleInputDigit('4')}
              className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-lg sm:text-xl transition-all active:scale-95 shadow-sm font-mono"
            >
              4
            </button>
            <button
              onClick={() => handleInputDigit('5')}
              className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-lg sm:text-xl transition-all active:scale-95 shadow-sm font-mono"
            >
              5
            </button>
            <button
              onClick={() => handleInputDigit('6')}
              className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-lg sm:text-xl transition-all active:scale-95 shadow-sm font-mono"
            >
              6
            </button>
            <button
              onClick={() => handleSelectOperator('-')}
              className={`h-14 sm:h-16 rounded-xl font-semibold text-xl sm:text-2xl transition-all active:scale-95 shadow-sm ${
                operator === '-'
                  ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-400'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30'
              }`}
              title="Subtração em Python (-)"
            >
              −
            </button>

            {/* Row 4 */}
            <button
              onClick={() => handleInputDigit('1')}
              className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-lg sm:text-xl transition-all active:scale-95 shadow-sm font-mono"
            >
              1
            </button>
            <button
              onClick={() => handleInputDigit('2')}
              className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-lg sm:text-xl transition-all active:scale-95 shadow-sm font-mono"
            >
              2
            </button>
            <button
              onClick={() => handleInputDigit('3')}
              className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-lg sm:text-xl transition-all active:scale-95 shadow-sm font-mono"
            >
              3
            </button>
            <button
              onClick={() => handleSelectOperator('+')}
              className={`h-14 sm:h-16 rounded-xl font-semibold text-xl sm:text-2xl transition-all active:scale-95 shadow-sm ${
                operator === '+'
                  ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-400'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30'
              }`}
              title="Adição em Python (+)"
            >
              +
            </button>

            {/* Row 5 */}
            <button
              onClick={handlePercent}
              className="h-14 sm:h-16 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-medium text-base sm:text-lg transition-all active:scale-95 shadow-sm font-mono"
              title="Porcentagem (%)"
            >
              %
            </button>
            <button
              onClick={() => handleInputDigit('0')}
              className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-lg sm:text-xl transition-all active:scale-95 shadow-sm font-mono"
            >
              0
            </button>
            <button
              onClick={handleInputDot}
              className="h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-lg sm:text-xl transition-all active:scale-95 shadow-sm font-mono"
              title="Ponto decimal (.)"
            >
              .
            </button>
            <button
              onClick={handleCalculateEquals}
              className="h-14 sm:h-16 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-2xl transition-all active:scale-95 shadow-md flex items-center justify-center"
              title="Calcular resultado (= ou Enter)"
            >
              <CornerDownLeft className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Python Inspector Callout */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-400 font-medium">Equivalente em Código Python:</span>
            <code className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-amber-300 font-mono">
              {lastExecution ? lastExecution.pyCode : 'calculadora.somar(a, b)'}
            </code>
          </div>

          {lastExecution && onOpenTerminalSnippet && (
            <button
              onClick={() => onOpenTerminalSnippet(`import calculadora\ncalc = calculadora.Calculadora()\nresultado = ${lastExecution.pyCode}\nprint(f"Resultado: {resultado}")`)}
              className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 shrink-0 transition-colors"
            >
              Executar no Terminal REPL →
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Real-time History & Python Operations Feed */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[560px]">
          {/* Header of History */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <History className="w-4 h-4 text-amber-400" />
              <span>Histórico de Operações</span>
              <span className="text-xs text-slate-500 font-normal">({history.length})</span>
            </div>

            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
                title="Limpar histórico"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <RotateCcw className="w-8 h-8 mb-2 stroke-1 text-slate-600" />
                <p className="text-sm font-medium text-slate-400">Nenhum cálculo registrado ainda</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Faça operações de adição, subtração, multiplicação ou divisão para ver a execução aqui.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3 transition-colors flex flex-col gap-1.5 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">
                      {item.opName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {item.timestamp} · {item.timeMs}ms
                    </span>
                  </div>

                  {/* Mathematical Expression & Result */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-slate-200">
                      {item.a} {item.op === '*' ? '×' : item.op === '/' ? '÷' : item.op} {item.b}
                    </span>
                    <span className="font-mono text-base font-semibold text-amber-400">
                      = {item.result !== null ? item.result : 'Erro'}
                    </span>
                  </div>

                  {/* Python code line with copy & load button */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px] font-mono text-slate-400">
                    <code className="text-slate-400 truncate max-w-[220px]">
                      {item.pyCode}
                    </code>

                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.result !== null && (
                        <button
                          onClick={() => {
                            setDisplayValue(String(item.result));
                            setWaitingForOperand(false);
                          }}
                          className="hover:text-amber-300 text-slate-400 transition-colors"
                          title="Usar este resultado na calculadora"
                        >
                          Usar
                        </button>
                      )}
                      <button
                        onClick={() => copyToClipboard(item.result !== null ? String(item.result) : item.pyCode, item.id)}
                        className="hover:text-slate-200 text-slate-400 transition-colors"
                        title="Copiar resultado"
                      >
                        {copiedIndex === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Info Footer in History Card */}
          <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Operações: +, -, *, /</span>
            <span>Tratamento nativo de float e int</span>
          </div>
        </div>
      </div>
    </div>
  );
};
