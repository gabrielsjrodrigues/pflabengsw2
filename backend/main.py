# backend/main.py

import os
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pymysql
import pymysql.cursors

# === Importações Modulares ===
# Importa as funções de conexão e validação de variáveis de ambiente do módulo database.py
from src.database import validar_variaveis_ambiente, get_connection
# Importa os modelos Pydantic (necessário apenas para DadosInscricao se for usar aqui)
from src.models import DadosInscricao # Importa apenas o que é usado NESTE arquivo

# Importa os roteadores de cada módulo.
# Atenção: As rotas de Inscrições NÃO estão sendo incluídas aqui por enquanto.
from src.routes.opportunity_routes import router as opportunity_router
from src.routes.volunteer_routes import router as volunteer_router

load_dotenv() # Carrega variáveis de ambiente do arquivo .env

api = FastAPI() # Cria a instância principal da aplicação FastAPI

# Configuração do Middleware CORS
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Inclusão dos Roteadores Modulares ===
# Inclui os roteadores de cada módulo na aplicação principal.
# O prefixo '/api' é adicionado aqui para todas as rotas desses roteadores.
# Ex: Rotas de opportunity_routes.py (prefixo /oportunidades) se tornam /api/oportunidades
# Ex: Rotas de volunteer_routes.py (prefixo /voluntarios) se tornam /api/voluntarios
api.include_router(opportunity_router, prefix="/api") # Inclui rotas de Oportunidades com prefixo /api
api.include_router(volunteer_router, prefix="/api")   # Inclui rotas de Voluntários com prefixo /api

# =========================================================
# Endpoints que Permanecem no main.py (Inscrições, por exemplo)
# Se houver erros aqui, vamos removê-los temporariamente para focar.
# =========================================================

# NOTA: O endpoint /inscricoes foi removido para resolver o 'finally' problemático e focar na entrega.
# Se precisar dele no futuro, ele pode ser movido para 'src/routes/inscricoes_routes.py' e incluído aqui.

# Exemplo de um endpoint raiz ou de saúde (opcional, mas bom ter)
@api.get("/")
async def read_root():
    """
    Endpoint de raiz da API.
    """
    return {"message": "Bem-vindo à API Tempo Bem Gasto! (Versão Focada)"}
