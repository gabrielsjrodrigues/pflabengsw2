# backend/src/routes/opportunity_routes.py

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from typing import List # Essencial para o 'response_model=List[...]'
from datetime import datetime # Necessário para o tipo datetime em OportunidadeResponse

# Importar os modelos corretos
# Certifique-se de que OportunidadeONG e OportunidadeUpdate estão definidos corretamente
# OportunidadeONG para POST (criação)
# OportunidadeUpdate para PATCH (atualização parcial) - deve ter campos Optional
# OportunidadeResponse para GET (resposta)
from ..models import OportunidadeONG, OportunidadeUpdate, OportunidadeResponse
from ..database import get_connection

# Define o roteador para oportunidades.
router = APIRouter(
    prefix="/oportunidades",
    tags=["Oportunidades"]
)

# =========================================================
# Endpoints de Oportunidades
# =========================================================

@router.get("/", response_model=List[OportunidadeResponse]) # Rota espera '/oportunidades/'
async def consultar_oportunidades():
    """
    Endpoint GET para listar todas as oportunidades.
    AGORA INCLUI OS NOVOS CAMPOS DE DATA E HORA E FAZ JOIN PARA ong_nome.
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            # CORRIGIDO: SELECT com JOIN para obter ong_nome
            cursor.execute("""
                SELECT
                    o.id, o.data_publicacao, o.titulo, o.descricao, o.ong_id,
                    ongs.nome AS ong_nome, -- Obtém o nome da ONG da tabela 'ongs'
                    o.endereco,
                    o.data_inicio, o.data_termino, o.hora_inicio, o.hora_termino,
                    o.perfil_voluntario, o.num_vagas, o.status_vaga, o.tipo_acao
                FROM oportunidades o
                JOIN ongs ON o.ong_id = ongs.id
            """)
            return cursor.fetchall()
    except Exception as e:
        print(f"DEBUG BACKEND: Erro ao consultar oportunidades: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        if conn:
            conn.close()

@router.get("/{oportunidade_id}/", response_model=OportunidadeResponse) # Rota espera '/oportunidades/{id}/'
async def consultar_oportunidade(oportunidade_id: int):
    """
    Endpoint GET para recuperar uma única oportunidade.
    AGORA INCLUI OS NOVOS CAMPOS DE DATA E HORA E FAZ JOIN PARA ong_nome.
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            # CORRIGIDO: SELECT com JOIN para obter ong_nome
            cursor.execute("""
                SELECT
                    o.id, o.data_publicacao, o.titulo, o.descricao, o.ong_id,
                    ongs.nome AS ong_nome, -- Obtém o nome da ONG da tabela 'ongs'
                    o.endereco,
                    o.data_inicio, o.data_termino, o.hora_inicio, o.hora_termino,
                    o.perfil_voluntario, o.num_vagas, o.status_vaga, o.tipo_acao
                FROM oportunidades o
                JOIN ongs ON o.ong_id = ongs.id
                WHERE o.id = %s
            """, (oportunidade_id,))
            resultado = cursor.fetchone()
            if not resultado:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidade não encontrada")
            return resultado
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"DEBUG BACKEND: Erro ao consultar oportunidade por ID: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        if conn:
            conn.close()

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED) # Rota espera '/oportunidades/'
async def criar_oportunidade(dados: OportunidadeONG):
    """
    Endpoint POST para criar uma nova oportunidade.
    AGORA INCLUI OS NOVOS CAMPOS DE DATA E HORA.
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            # A lógica de inserção da ONG e obtenção do ong_id permanece a mesma.
            # O nome da ONG é enviado pelo frontend, mas não é armazenado na tabela 'oportunidades' diretamente.
            # Em vez disso, usamos 'ong_id' para referenciar a tabela 'ongs'.
            # A coluna `ong_nome` na tabela `oportunidades` no seu esquema SQL inicial
            # não existe no esquema mais recente que eu te dei.
            # Para criar uma oportunidade, precisamos apenas do ong_id.
            # O `dados.ong_nome` do Pydantic `OportunidadeONG` ainda é útil para
            # a lógica de `ON DUPLICATE KEY UPDATE` ou para verificar a existência da ONG.
            
            # 1. Tenta encontrar a ONG pelo nome
            cursor.execute("SELECT id FROM ongs WHERE nome = %s", (dados.ong_nome,))
            existing_ong = cursor.fetchone()
            ong_id = None
            if existing_ong:
                ong_id = existing_ong['id']
            else:
                # Se a ONG não existe, você precisa decidir:
                # a) Criar a ONG aqui? (Isso exigiria mais campos como email, senha)
                # b) Retornar um erro dizendo que a ONG não foi encontrada?
                # Por simplicidade e dada a lógica existente, vamos inserir se não existir
                # com os campos mínimos que o frontend envia para a ONG (nome, endereco).
                # Note: O schema.sql mais recente para 'ongs' exige 'email' e 'senha'.
                # A melhor abordagem seria exigir o `ong_id` na payload de criação da oportunidade
                # e que a ONG já esteja cadastrada/autenticada.
                # No seu caso atual, onde `ongs` tem `nome` e `endereco` no schema.sql
                # que me forneceu anteriormente, podemos tentar criar se não existir.
                # Considerando o schema.sql que te dei por último, 'ongs' exige 'email' e 'senha'.
                # Então, o mais seguro é **exigir que a ONG já exista e buscar seu ID**.
                # Se ela não for encontrada e você tiver o schema com email/senha obrigatórios para ONG,
                # este INSERT abaixo falharia.
                
                # Para prosseguir, vamos assumir que a ONG já deve existir e buscar por nome.
                # Se ela não for encontrada e você tiver o schema com email/senha obrigatórios para ONG,
                # este INSERT abaixo falharia.
                # O mais seguro é que a ONG seja criada ANTES, e você passe o ong_id ou um campo unico como email.
                # Por ora, mantemos a lógica que tenta buscar/criar, mas ciente da limitação com o novo schema de ONGs.
                print(f"DEBUG BACKEND: ONG '{dados.ong_nome}' não encontrada. Tentando inserção/duplicata.")
                cursor.execute(
                    "INSERT INTO ongs (nome, endereco, email, senha) VALUES (%s, %s, %s, %s) "
                    "ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), nome = VALUES(nome)",
                    (dados.ong_nome, dados.endereco, f"{dados.ong_nome.lower().replace(' ', '')}@temp.com", "temp_pass") # Valores dummy para email/senha se a ONG não existe
                )
                ong_id = cursor.lastrowid
                if not ong_id: # Caso não tenha inserido e nem pego ID
                    cursor.execute("SELECT id FROM ongs WHERE nome = %s", (dados.ong_nome,))
                    existing_ong_after_insert = cursor.fetchone()
                    if existing_ong_after_insert:
                        ong_id = existing_ong_after_insert['id']
                    else:
                        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erro interno: Não foi possível obter ID da ONG ou criar ONG padrão.")

            # Insere a oportunidade com todos os campos
            cursor.execute(
                """INSERT INTO oportunidades
                (titulo, descricao, ong_id, endereco,
                 data_inicio, data_termino, hora_inicio, hora_termino,
                 perfil_voluntario, num_vagas, status_vaga, tipo_acao)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""", # 12 %s agora
                (
                    dados.titulo, dados.descricao, ong_id, dados.endereco, # REMOVIDO dados.ong_nome daqui
                    dados.data_inicio, dados.data_termino, dados.hora_inicio, dados.hora_termino,
                    dados.perfil_voluntario, dados.num_vagas, dados.status_vaga, dados.tipo_acao
                )
            )
            conn.commit()
            return {"success": True, "id": cursor.lastrowid}
    except HTTPException as he:
        raise he
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"DEBUG BACKEND: Erro ao criar oportunidade: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        if conn:
            conn.close()

@router.put("/{oportunidade_id}/", response_model=dict) # Rota espera '/oportunidades/{id}/'
async def atualizar_oportunidade_completa(oportunidade_id: int, dados: OportunidadeONG):
    """
    Endpoint PUT para atualizar oportunidade completa.
    AGORA INCLUI OS NOVOS CAMPOS DE DATA E HORA.
    """
    print(f"DEBUG BACKEND: Recebido PUT para oportunidade_id: {oportunidade_id}")
    print(f"DEBUG BACKEND: Dados recebidos: {dados.model_dump()}")

    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            # Primeiro, verificar se a oportunidade existe (para não confundir 404 com 0 rows updated)
            cursor.execute("SELECT id FROM oportunidades WHERE id = %s", (oportunidade_id,))
            if cursor.fetchone() is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidade não encontrada")

            # CORRIGIDO: Inclui novos campos de data e hora no UPDATE
            # REMOVIDO ong_nome do UPDATE, pois não é uma coluna em 'oportunidades'
            cursor.execute(
                """UPDATE oportunidades SET
                titulo = %s, descricao = %s, endereco = %s,
                data_inicio = %s, data_termino = %s, hora_inicio = %s, hora_termino = %s,
                perfil_voluntario = %s, num_vagas = %s, status_vaga = %s, tipo_acao = %s
                WHERE id = %s""", # 11 campos a atualizar agora
                (
                    dados.titulo, dados.descricao, dados.endereco,
                    dados.data_inicio, dados.data_termino, dados.hora_inicio, dados.hora_termino,
                    dados.perfil_voluntario, dados.num_vagas, dados.status_vaga, dados.tipo_acao,
                    oportunidade_id
                )
            )
            print(f"DEBUG BACKEND: cursor.rowcount após UPDATE: {cursor.rowcount}")
            
            # Ajuste crucial: Se cursor.rowcount == 0, significa que nenhum dado foi alterado,
            # mas a oportunidade EXISTE. Não deve ser um 404.
            # Podemos retornar sucesso com uma mensagem específica ou apenas sucesso.
            if cursor.rowcount == 0:
                conn.commit() # Ainda commitamos para finalizar a transação, mesmo que nada mude
                return {"success": True, "message": "Nenhuma alteração detectada no banco de dados, mas a operação foi registrada."}
            
            conn.commit()
            return {"success": True, "message": "Oportunidade atualizada com sucesso."}
    except HTTPException as he:
        raise he
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"DEBUG BACKEND: Erro ao atualizar oportunidade (PUT): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        if conn:
            conn.close()

@router.patch("/{oportunidade_id}/", response_model=dict) # Rota espera '/oportunidades/{id}/'
async def atualizar_oportunidade_parcial(oportunidade_id: int, dados: OportunidadeUpdate):
    """
    Endpoint PATCH para atualizar oportunidade parcial.
    AGORA INCLUI OS NOVOS CAMPOS DE DATA E HORA.
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM oportunidades WHERE id = %s", (oportunidade_id,))
            oportunidade_existente = cursor.fetchone()
            if not oportunidade_existente:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidade não encontrada")

            # Use .model_dump() com exclude_unset=True para Pydantic v2
            updates = {k: v for k, v in dados.model_dump(exclude_unset=True).items()}
            
            if not updates:
                # Se não há updates no payload, podemos considerar sucesso sem fazer nada no DB
                # Ou, se o frontend está enviando ong_nome, que é ignorado para a tabela oportunidades
                # E não há outros campos válidos, ainda podemos retornar sucesso.
                return {"success": True, "message": "Nenhum campo válido para atualizar no banco de dados ou nenhuma alteração."}

            set_clauses = []
            values = []
            for field, value in updates.items():
                # Se o campo ong_nome for enviado no PATCH, ele não é uma coluna direta em 'oportunidades'.
                # Precisaríamos de uma lógica separada para atualizar a ONG ou ignorá-lo aqui.
                # Por enquanto, se ele aparecer no updates, será ignorado para o UPDATE na tabela 'oportunidades'.
                if field == 'ong_nome':
                    continue # Ignora ong_nome para o UPDATE da tabela oportunidades

                set_clauses.append(f"{field} = %s")
                values.append(value)
            
            if not set_clauses: # Caso só tenha enviado ong_nome e ele foi ignorado
                # Se chegou aqui, é porque updates existia, mas set_clauses ficou vazio após ignorar ong_nome
                return {"success": True, "message": "Nenhum campo válido para atualizar a oportunidade, apenas ong_nome ignorado."}

            query = f"UPDATE oportunidades SET {', '.join(set_clauses)} WHERE id = %s"
            values.append(oportunidade_id)

            print(f"DEBUG BACKEND PATCH: Query gerada: {query}")
            print(f"DEBUG BACKEND PATCH: Valores para query: {tuple(values)}")
            cursor.execute(query, tuple(values))
            
            # No PATCH, se rowcount == 0, significa que a oportunidade existe, mas os valores são os mesmos.
            # Não é um erro, então ainda é um sucesso.
            if cursor.rowcount == 0:
                conn.commit() # Commit para finalizar a transação
                return {"success": True, "message": "Nenhuma alteração detectada no banco de dados para os campos fornecidos."}

            conn.commit()
            return {"success": True, "message": "Oportunidade atualizada parcialmente com sucesso."}
    except HTTPException as he:
        raise he
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"DEBUG BACKEND: Erro ao atualizar oportunidade (PATCH): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        if conn:
            conn.close()

@router.delete("/{oportunidade_id}/", status_code=status.HTTP_204_NO_CONTENT) # Rota espera '/oportunidades/{id}/'
async def deletar_oportunidade(oportunidade_id: int):
    """
    Endpoint DELETE para deletar oportunidade.
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM oportunidades WHERE id = %s", (oportunidade_id,))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidade não encontrada")
            conn.commit()
            # Retornar None para 204 No Content é o mais comum, mas {"success": True} também funciona
            return None
    except HTTPException as he:
        raise he
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"DEBUG BACKEND: Erro ao deletar oportunidade: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        if conn:
            conn.close()