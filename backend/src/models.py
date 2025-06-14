# backend/src/models.py

from pydantic import BaseModel, Field
from typing import Optional # Keep Optional for nullable fields
from datetime import datetime # Import datetime for data_publicacao type hint

class DadosInscricao(BaseModel):
    nome: str
    nascimento: str
    cpf: str
    mensagem: str
    oportunidade_id: int

# Modelo de Oportunidade (AGORA COM NOVOS CAMPOS DE DATA E HORA)
class OportunidadeONG(BaseModel):
    id: Optional[int] = None # Adicionar id opcional para quando a vaga já existe
    titulo: str
    descricao: str
    ong_nome: str
    endereco: str
    # REMOVIDOS data_atuacao e carga_horaria
    # NOVOS CAMPOS DE DATA E HORA
    data_inicio: Optional[str] = None  # Formato DD/MM/AAAA
    data_termino: Optional[str] = None # Formato DD/MM/AAAA
    hora_inicio: Optional[str] = None  # Formato HH:MM
    hora_termino: Optional[str] = None # Formato HH:MM
    perfil_voluntario: Optional[str] = None
    num_vagas: Optional[int] = None
    status_vaga: str = Field("ativa", pattern="^(ativa|inativa|encerrada|em_edicao)$")
    tipo_acao: str # O campo 'tipo_acao' continua aqui
    # data_pub: Optional[str] = None # Isso deveria ser datetime no Response model, não no create/base
    data_publicacao: Optional[datetime] = None # Renomeado e tipado para corresponder ao schema.sql, e opcional para PUT/PATCH

# Modelo para Edição Parcial de Oportunidade (AGORA COM NOVOS CAMPOS DE DATA E HORA)
class OportunidadeUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    endereco: Optional[str] = None
    # REMOVIDOS data_atuacao e carga_horaria
    # NOVOS CAMPOS DE DATA E HORA PARA ATUALIZAÇÃO
    data_inicio: Optional[str] = None
    data_termino: Optional[str] = None
    hora_inicio: Optional[str] = None
    hora_termino: Optional[str] = None
    perfil_voluntario: Optional[str] = None
    num_vagas: Optional[int] = None
    status_vaga: Optional[str] = Field(None, pattern="^(ativa|inativa|encerrada|em_edicao)$")
    tipo_acao: Optional[str] = None # O campo 'tipo_acao' continua aqui para updates

# --- Adicionei um modelo de Resposta para Oportunidade para melhor clareza (boas práticas) ---
# Este modelo será usado para o que a API devolve ao frontend, garantindo que o `id` e `data_publicacao` sejam sempre presentes.
class OportunidadeResponse(OportunidadeONG):
    id: int # ID é obrigatório no retorno
    data_publicacao: datetime # data_publicacao é obrigatória e tipada como datetime no retorno

    class Config:
        # Pydantic v2 uses `from_attributes = True`
        # Pydantic v1 uses `orm_mode = True`
        # Check your Pydantic version if you get an error
        from_attributes = True
        # or orm_mode = True # Uncomment if you are using Pydantic v1