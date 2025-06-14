# backend/src/database.py

import os
import pymysql
import pymysql.cursors
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
# from dotenv import load_dotenv # Comentado, conforme sua versão

# Definição das variáveis de ambiente do MySQL
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")
# Certifique-se de que a porta aqui é 3306 para a conexão INTERNA
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306)) # Mude o default para 3306

# ---------------------------------------------------------------------
# Configuração do SQLAlchemy
# ---------------------------------------------------------------------
SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@"
    f"{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
)

# Cria o motor de banco de dados
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Configura a sessão de banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base declarativa para seus modelos
Base = declarative_base()

# Função para obter uma conexão PyMySQL direta (se ainda usa em algum lugar)
def get_connection():
    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT, # Use a variável já definida
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE,
            cursorclass=pymysql.cursors.DictCursor
        )
        return conn
    except Exception as e:
        print(f"Erro ao conectar ao banco de dados (get_connection): {e}")
        raise e

# Função para obter uma sessão do SQLAlchemy (para uso com dependências no FastAPI)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()