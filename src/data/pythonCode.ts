export const PYTHON_SOURCE_CODE = `"""
Calculadora com as Quatro Operações Matemáticas Básicas em Python.
Suporta execução direta via CLI, execução de testes unitários (--test)
ou importação como módulo.
"""

from typing import Union, List, Dict
import sys

Number = Union[int, float]


class Calculadora:
    """Classe responsável por gerenciar as 4 operações matemáticas e o histórico."""

    def __init__(self):
        self.historico: List[Dict[str, Union[str, Number]]] = []
        self.memoria: Number = 0

    @staticmethod
    def somar(a: Number, b: Number) -> Number:
        """Realiza a adição de dois números: a + b."""
        resultado = a + b
        return int(resultado) if isinstance(resultado, float) and resultado.is_integer() else resultado

    @staticmethod
    def subtrair(a: Number, b: Number) -> Number:
        """Realiza a subtração de dois números: a - b."""
        resultado = a - b
        return int(resultado) if isinstance(resultado, float) and resultado.is_integer() else resultado

    @staticmethod
    def multiplicar(a: Number, b: Number) -> Number:
        """Realiza a multiplicação de dois números: a * b."""
        resultado = a * b
        return int(resultado) if isinstance(resultado, float) and resultado.is_integer() else resultado

    @staticmethod
    def dividir(a: Number, b: Number) -> Number:
        """Realiza a divisão de dois números: a / b.
        
        Lança ZeroDivisionError caso o divisor seja zero.
        """
        if b == 0:
            raise ZeroDivisionError("Erro matemático: Divisão por zero não é permitida.")
        resultado = a / b
        return int(resultado) if isinstance(resultado, float) and resultado.is_integer() else resultado

    def calcular(self, operacao: str, a: Number, b: Number) -> Number:
        """Executa a operação especificada ('+', '-', '*', '/') e armazena no histórico."""
        op_map = {
            '+': (self.somar, "Adição"),
            '-': (self.subtrair, "Subtração"),
            '*': (self.multiplicar, "Multiplicação"),
            '/': (self.dividir, "Divisão"),
            'x': (self.multiplicar, "Multiplicação"),
            '÷': (self.dividir, "Divisão")
        }

        if operacao not in op_map:
            raise ValueError(f"Operação '{operacao}' inválida. Escolha entre: +, -, *, /")

        func, nome = op_map[operacao]
        resultado = func(a, b)

        simbolo = '*' if operacao == 'x' else ('/' if operacao == '÷' else operacao)
        registro = {
            "expressao": f"{a} {simbolo} {b}",
            "operacao": nome,
            "a": a,
            "b": b,
            "simbolo": simbolo,
            "resultado": resultado
        }
        self.historico.append(registro)
        return resultado

    def limpar_historico(self):
        """Limpa o registro de cálculos anteriores."""
        self.historico.clear()


# Funções diretas para uso rápido e importação simples
def somar(a: Number, b: Number) -> Number:
    return Calculadora.somar(a, b)

def subtrair(a: Number, b: Number) -> Number:
    return Calculadora.subtrair(a, b)

def multiplicar(a: Number, b: Number) -> Number:
    return Calculadora.multiplicar(a, b)

def dividir(a: Number, b: Number) -> Number:
    return Calculadora.dividir(a, b)


def executar_testes():
    """Executa testes unitários nas quatro operações."""
    calc = Calculadora()
    print("--- Executando Testes Unitários da Calculadora Python ---")

    # 1. Adição
    assert calc.somar(10, 5) == 15, "Falha na adição básica"
    assert calc.somar(-7, 3) == -4, "Falha na adição com negativos"
    assert calc.somar(0.1, 0.2) != 0, "Falha na adição de floats"
    print("✓ Adição: OK (10 + 5 = 15 | -7 + 3 = -4)")

    # 2. Subtração
    assert calc.subtrair(20, 8) == 12, "Falha na subtração básica"
    assert calc.subtrair(5, 15) == -10, "Falha na subtração com resultado negativo"
    assert calc.subtrair(-4, -4) == 0, "Falha na subtração com dois negativos"
    print("✓ Subtração: OK (20 - 8 = 12 | 5 - 15 = -10)")

    # 3. Multiplicação
    assert calc.multiplicar(6, 7) == 42, "Falha na multiplicação básica"
    assert calc.multiplicar(-3, 4) == -12, "Falha na multiplicação com negativo"
    assert calc.multiplicar(100, 0) == 0, "Falha na multiplicação por zero"
    print("✓ Multiplicação: OK (6 * 7 = 42 | -3 * 4 = -12 | 100 * 0 = 0)")

    # 4. Divisão
    assert calc.dividir(30, 5) == 6, "Falha na divisão exata"
    assert calc.dividir(7, 2) == 3.5, "Falha na divisão com decimal"
    try:
        calc.dividir(10, 0)
        assert False, "Deveria ter lançado ZeroDivisionError"
    except ZeroDivisionError:
        print("✓ Divisão por zero capturada com sucesso: OK")
    print("✓ Divisão: OK (30 / 5 = 6 | 7 / 2 = 3.5)")

    print("\\nTodos os testes unitários passaram com 100% de sucesso!")
`;

export interface OperationDetail {
  id: 'adicao' | 'subtracao' | 'multiplicacao' | 'divisao';
  name: string;
  symbol: string;
  pySymbol: string;
  pythonFunction: string;
  syntaxExample: string;
  description: string;
  nuances: string[];
  sampleA: number;
  sampleB: number;
}

export const OPERATIONS_GUIDE: OperationDetail[] = [
  {
    id: 'adicao',
    name: 'Adição',
    symbol: '+',
    pySymbol: '+',
    pythonFunction: 'def somar(a, b): return a + b',
    syntaxExample: 'resultado = a + b',
    description: 'Combina dois valores numéricos em uma soma total.',
    nuances: [
      'Em Python, int + int retorna int, mas se qualquer operando for float, o resultado é promovido para float.',
      'Suporta inteiros arbitrariamente grandes sem estouro de pilha (overflow).',
      'Cuidado: o operador + também concatena strings e listas, por isso deve-se converter entradas com float() ou int().'
    ],
    sampleA: 142.5,
    sampleB: 57.5,
  },
  {
    id: 'subtracao',
    name: 'Subtração',
    symbol: '-',
    pySymbol: '-',
    pythonFunction: 'def subtrair(a, b): return a - b',
    syntaxExample: 'resultado = a - b',
    description: 'Calcula a diferença entre o minuendo e o subtraendo.',
    nuances: [
      'Também atua como operador unário de negação (-x) para inverter o sinal.',
      'Suporta resultados negativos naturalmente em todos os tipos numéricos.',
      'Segue a representação padrão IEEE 754 para números de ponto flutuante.'
    ],
    sampleA: 250,
    sampleB: 85,
  },
  {
    id: 'multiplicacao',
    name: 'Multiplicação',
    symbol: '×',
    pySymbol: '*',
    pythonFunction: 'def multiplicar(a, b): return a * b',
    syntaxExample: 'resultado = a * b',
    description: 'Calcula o produto de dois fatores ou repetição de parcelas iguais.',
    nuances: [
      'O símbolo padrão em Python é o asterisco (*).',
      'Multiplicação por 0 sempre resulta em 0.',
      'Tem maior precedência matemática que a adição e a subtração em expressões complexas.'
    ],
    sampleA: 16,
    sampleB: 24,
  },
  {
    id: 'divisao',
    name: 'Divisão',
    symbol: '÷',
    pySymbol: '/',
    pythonFunction: 'def dividir(a, b):\\n    if b == 0:\\n        raise ZeroDivisionError("Divisão por zero")\\n    return a / b',
    syntaxExample: 'resultado = a / b',
    description: 'Distribui um dividendo pelo divisor, gerando o quociente.',
    nuances: [
      'Em Python 3, o operador / realiza divisão real e sempre retorna um float (ex: 4 / 2 retorna 2.0).',
      'Divisão inteira pode ser feita com // (ex: 7 // 2 = 3) e o resto com % (ex: 7 % 2 = 1).',
      'Divisão por zero lança a exceção ZeroDivisionError, que deve ser tratada com bloco try/except.'
    ],
    sampleA: 100,
    sampleB: 4,
  },
];
