# backend/src/database.py

import os
import pymysql
import pymysql.cursors
from dotenv import load_dotenv

# load_dotenv() # Garante que as variáveis de ambiente sejam carregadas, mesmo que este módulo seja importado separadamente.
# Comentar load_dotenv() pois o Railway já injeta as variáveis. Pode causar conflito.

def validar_variaveis_ambiente():
    """
    Verifica se todas as variáveis de ambiente necessárias para a conexão com o banco de dados estão definidas.
    Levanta uma exceção se alguma variável estiver faltando.
    """
    # Mude os nomes das variáveis para os que o Railway fornece (MYSQL_...)
    required_vars = ["MYSQL_HOST", "MYSQL_PORT", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE"]
    for var in required_vars:
        if not os.getenv(var):
            raise Exception(f"Variável de ambiente {var} não definida")

def get_connection():
    """
    Retorna uma conexão PyMySQL com o banco de dados configurado nas variáveis de ambiente.
    Usa DictCursor para que os resultados das consultas (fetchall, fetchone) sejam dicionários (chave-valor).
    """
    # Remova ou comente esta linha se a validação estiver causando problemas no Railway.
    # Vamos focar em fazer a conexão principal funcionar primeiro.
    # validar_variaveis_ambiente() 

    try:
        # Certifique-se de que o host está sendo lido diretamente de MYSQL_HOST
        db_host = os.getenv("MYSQL_HOST")
        # Altera o valor padrão para 1986, a porta real do MySQL no Railway
        db_port = int(os.getenv("MYSQL_PORT", 1986)) 
        db_user = os.getenv("MYSQL_USER")
        db_password = os.getenv("MYSQL_PASSWORD")
        db_name = os.getenv("MYSQL_DATABASE")

        # Verifica se alguma variável crítica ainda é None
        if not all([db_host, db_user, db_password, db_name]):
            raise Exception("Uma ou mais variáveis de ambiente do MySQL (host, user, password, database) não foram encontradas ou estão vazias.")

        conn = pymysql.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database=db_name,
            cursorclass=pymysql.cursors.DictCursor
        )
        return conn
    except Exception as e:
        # Imprime o erro para que você possa vê-lo nos logs do Railway
        print(f"Erro ao conectar ao banco de dados: {e}")
        # É importante relançar a exceção para que o FastAPI saiba que houve um problema
        raise e
