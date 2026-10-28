import { PYTHON_SOURCE_CODE } from '../data/pythonCode';

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
    pyodideInstance?: any;
  }
}

export interface PyodideStatus {
  loading: boolean;
  ready: boolean;
  error: string | null;
  version: string | null;
}

export interface ExecutionResult {
  success: boolean;
  result: number | null;
  expression: string;
  pyCode: string;
  output?: string;
  error?: string;
  executionTimeMs: number;
  engine: 'python-wasm' | 'native-js';
}

let pyodidePromise: Promise<any> | null = null;
let statusListeners: Array<(status: PyodideStatus) => void> = [];

let currentStatus: PyodideStatus = {
  loading: false,
  ready: false,
  error: null,
  version: null,
};

function notifyStatus() {
  statusListeners.forEach((listener) => listener({ ...currentStatus }));
}

export function subscribePyodideStatus(listener: (status: PyodideStatus) => void): () => void {
  statusListeners.push(listener);
  listener({ ...currentStatus });
  return () => {
    statusListeners = statusListeners.filter((l) => l !== listener);
  };
}

export async function initPyodide(): Promise<any> {
  if (currentStatus.ready && window.pyodideInstance) {
    return window.pyodideInstance;
  }

  if (pyodidePromise) {
    return pyodidePromise;
  }

  currentStatus = { ...currentStatus, loading: true, error: null };
  notifyStatus();

  pyodidePromise = (async () => {
    try {
      // Check if pyodide script already added
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Falha ao carregar script do Pyodide WebAssembly.'));
          document.head.appendChild(script);
        });
      }

      if (!window.loadPyodide) {
        throw new Error('Função loadPyodide não disponível.');
      }

      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      });

      // Write calculadora.py into Pyodide's virtual filesystem
      pyodide.FS.writeFile('/home/pyodide/calculadora.py', PYTHON_SOURCE_CODE);

      // Pre-import module
      await pyodide.runPythonAsync(`
import sys
import os
sys.path.insert(0, '/home/pyodide')
import calculadora
calc_global = calculadora.Calculadora()
`);

      const pyVersion = await pyodide.runPythonAsync(`
import sys
f"Python {sys.version.split()[0]}"
`);

      window.pyodideInstance = pyodide;
      currentStatus = {
        loading: false,
        ready: true,
        error: null,
        version: pyVersion || 'Python 3.12 (WASM)',
      };
      notifyStatus();
      return pyodide;
    } catch (err: any) {
      console.warn('Pyodide init error, falling back to JS calculator engine:', err);
      currentStatus = {
        loading: false,
        ready: false,
        error: err.message || 'Erro ao inicializar Pyodide',
        version: null,
      };
      notifyStatus();
      pyodidePromise = null;
      throw err;
    }
  })();

  return pyodidePromise;
}

/**
 * Computes calculation using genuine Python (Pyodide) or fallback JS
 */
export async function calculatePython(
  op: '+' | '-' | '*' | '/' | 'x' | '÷',
  a: number,
  b: number,
  forceJs = false
): Promise<ExecutionResult> {
  const normalizedOp = op === 'x' ? '*' : op === '÷' ? '/' : op;
  const pyCode = `calc_global.calcular('${normalizedOp}', ${a}, ${b})`;
  const start = performance.now();

  if (!forceJs && (currentStatus.ready || currentStatus.loading)) {
    try {
      const pyodide = window.pyodideInstance || (await initPyodide());
      const pyExec = `
try:
    res = ${pyCode}
    output = f"{res}"
    err = None
except Exception as e:
    res = None
    output = None
    err = f"{type(e).__name__}: {str(e)}"
`;
      await pyodide.runPythonAsync(pyExec);
      const resVal = pyodide.globals.get('res');
      const errVal = pyodide.globals.get('err');
      const end = performance.now();

      if (errVal) {
        return {
          success: false,
          result: null,
          expression: `${a} ${normalizedOp} ${b}`,
          pyCode,
          error: String(errVal),
          executionTimeMs: Math.max(0.1, Number((end - start).toFixed(2))),
          engine: 'python-wasm',
        };
      }

      const numResult = typeof resVal === 'number' ? resVal : Number(resVal);

      return {
        success: true,
        result: Number.isFinite(numResult) ? numResult : null,
        expression: `${a} ${normalizedOp} ${b}`,
        pyCode,
        executionTimeMs: Math.max(0.1, Number((end - start).toFixed(2))),
        engine: 'python-wasm',
      };
    } catch (wasmErr: any) {
      console.warn('Python WASM execution issue, calculating via pure logic:', wasmErr);
    }
  }

  // Pure JavaScript simulation that strictly mimics Python's mathematical operations
  const end = performance.now();
  let result: number | null = null;
  let error: string | undefined = undefined;

  if (normalizedOp === '/' && b === 0) {
    error = 'ZeroDivisionError: Erro matemático: Divisão por zero não é permitida.';
  } else {
    switch (normalizedOp) {
      case '+':
        result = a + b;
        break;
      case '-':
        result = a - b;
        break;
      case '*':
        result = a * b;
        break;
      case '/':
        result = a / b;
        break;
    }
    // Clean floating point artifacts like 0.1 + 0.2 = 0.30000000000000004
    if (result !== null) {
      result = Math.round((result + Number.EPSILON) * 1e12) / 1e12;
    }
  }

  return {
    success: error === undefined,
    result,
    expression: `${a} ${normalizedOp} ${b}`,
    pyCode,
    error,
    executionTimeMs: Math.max(0.05, Number((end - start).toFixed(2))),
    engine: 'native-js',
  };
}

/**
 * Executes arbitrary Python script in the WebAssembly environment and captures stdout/stderr
 */
export async function runCustomPython(script: string): Promise<{ output: string; error: string | null; timeMs: number }> {
  const start = performance.now();
  try {
    const pyodide = window.pyodideInstance || (await initPyodide());
    
    // Redirect stdout and stderr to Python StringIO
    const runnerCode = `
import sys
import io

_stdout_buffer = io.StringIO()
_stderr_buffer = io.StringIO()
_old_stdout = sys.stdout
_old_stderr = sys.stderr

sys.stdout = _stdout_buffer
sys.stderr = _stderr_buffer

_custom_err = None
try:
    exec(${JSON.stringify(script)})
except Exception as e:
    _custom_err = f"{type(e).__name__}: {str(e)}"
finally:
    sys.stdout = _old_stdout
    sys.stderr = _old_stderr

_out = _stdout_buffer.getvalue()
_err = _stderr_buffer.getvalue()
`;
    await pyodide.runPythonAsync(runnerCode);
    const out = pyodide.globals.get('_out') || '';
    const stdErr = pyodide.globals.get('_err') || '';
    const customErr = pyodide.globals.get('_custom_err');
    const end = performance.now();

    const fullError = customErr ? `${customErr}${stdErr ? '\n' + stdErr : ''}` : stdErr || null;

    return {
      output: out,
      error: fullError,
      timeMs: Math.max(0.1, Number((end - start).toFixed(2))),
    };
  } catch (err: any) {
    const end = performance.now();
    return {
      output: '',
      error: err.message || 'Erro de execução Python',
      timeMs: Math.max(0.1, Number((end - start).toFixed(2))),
    };
  }
}

/**
 * Runs unit test suite inside Pyodide
 */
export async function runPythonTests(): Promise<{ output: string; success: boolean; timeMs: number }> {
  const testScript = `
import calculadora
calculadora.executar_testes()
`;
  const res = await runCustomPython(testScript);
  return {
    output: res.output || (res.error ? `Erro ao executar testes: ${res.error}` : ''),
    success: !res.error && res.output.includes('100% de sucesso'),
    timeMs: res.timeMs,
  };
}
