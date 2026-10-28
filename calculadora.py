"""
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
        # Retorna int se o número não tiver casas decimais significativas
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

    print("\nTodos os testes unitários passaram com 100% de sucesso!")


def menu_interativo():
    """Interface de linha de comando (CLI) interativa em Python."""
    calc = Calculadora()
    print("=" * 50)
    print("     CALCULADORA PYTHON - 4 OPERAÇÕES BÁSICAS     ")
    print("=" * 50)

    while True:
        print("\nEscolha a operação desejada:")
        print(" [1] Adição (+)")
        print(" [2] Subtração (-)")
        print(" [3] Multiplicação (*)")
        print(" [4] Divisão (/)")
        print(" [5] Ver Histórico")
        print(" [6] Executar Testes")
        print(" [0] Sair")

        escolha = input("\nDigite a opção desejada: ").strip()

        if escolha == '0':
            print("\nEncerrando a Calculadora. Até logo!")
            break
        elif escolha == '5':
            if not calc.historico:
                print("\n[Histórico vazio]")
            else:
                print("\n--- Histórico de Cálculos ---")
                for i, item in enumerate(calc.historico, 1):
                    print(f" {i}. {item['expressao']} = {item['resultado']} ({item['operacao']})")
            continue
        elif escolha == '6':
            executar_testes()
            continue
        elif escolha not in ('1', '2', '3', '4'):
            print("\n[Erro] Opção inválida. Por favor, escolha de 0 a 6.")
            continue

        op_simbolos = {'1': '+', '2': '-', '3': '*', '4': '/'}
        simbolo = op_simbolos[escolha]

        try:
            num1 = float(input("Digite o 1º número: ").replace(',', '.'))
            num2 = float(input("Digite o 2º número: ").replace(',', '.'))
            # Converte para int se for número inteiro
            n1 = int(num1) if num1.is_integer() else num1
            n2 = int(num2) if num2.is_integer() else num2

            res = calc.calcular(simbolo, n1, n2)
            print(f"\n=> Resultado em Python: {n1} {simbolo} {n2} = {res}")

        except ValueError as e:
            print(f"\n[Erro de Entrada]: Por favor, digite um número válido. ({e})")
        except ZeroDivisionError as e:
            print(f"\n[Erro de Divisão]: {e}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        executar_testes()
    else:
        menu_interativo()
