# backend/src/routes/volunteer_routes.py

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from ..database import get_connection # Importa função de conexão
# from ..models import DadosInscricao # Não usado aqui, pode ser removido

router = APIRouter(
    prefix="/voluntarios", # Prefixo para todas as rotas de voluntários
    tags=["Voluntários"]
)

# =========================================================
# Endpoints de Voluntários
# =========================================================

@router.get("/") # Rota: /voluntarios/
async def consultar_voluntarios():
    """
    Endpoint GET para listar todos os voluntários cadastrados.
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM voluntarios")
            return cursor.fetchall()
    except Exception as e:
        print(f"DEBUG BACKEND: Erro ao consultar voluntários: {e}")
        return JSONResponse({"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    finally:
        if conn:
            conn.close()

@router.get("/{voluntario_id}") # Rota: /voluntarios/{voluntario_id}
async def consultar_voluntario(voluntario_id: int):
    """
    Endpoint GET para retornar um único voluntário pelo ID.
    Retorna os detalhes do voluntário se encontrado, ou HTTP 404 se não existir.
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM voluntarios WHERE id = %s", (voluntario_id,))
            resultado = cursor.fetchone()
            if not resultado:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voluntário não encontrado")
            return resultado
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"DEBUG BACKEND: Erro ao consultar voluntário por ID: {e}")
        return JSONResponse({"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    finally:
        if conn:
            conn.close()

@router.get("/{voluntario_id}/inscricoes") # Rota: /voluntarios/{voluntario_id}/inscricoes
async def consultar_inscricoes_por_voluntario(voluntario_id: int):
    """
    Endpoint GET para retornar todas as inscrições de um voluntário específico.
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            sql = """
                SELECT
                    i.id AS inscricao_id,
                    i.oportunidade_id,
                    o.titulo AS oportunidade_titulo,
                    i.data_inscricao,
                    i.status
                FROM inscricoes i
                JOIN oportunidades o ON i.oportunidade_id = o.id
                WHERE i.voluntario_id = %s
                ORDER BY i.data_inscricao DESC
            """
            cursor.execute(sql, (voluntario_id,))
            return cursor.fetchall()
    except Exception as e:
        print(f"DEBUG BACKEND: Erro ao consultar inscrições por voluntário: {e}")
        return JSONResponse({"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    finally:
        if conn:
            conn.close()
