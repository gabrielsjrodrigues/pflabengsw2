# ───────────────────────────────────────────────────────────────────────────────
#   Etapa 1: Base Python e instalação de dependências
# ───────────────────────────────────────────────────────────────────────────────
FROM python:3.10-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o script wait-for-it.sh e o torna executável (COMENTADO TEMPORARIAMENTE PARA DEBUG)
# COPY wait-for-it.sh /usr/local/bin/wait-for-it.sh
# RUN chmod +x /usr/local/bin/wait-for-it.sh

# Copia somente o requirements.txt e instala as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ───────────────────────────────────────────────────────────────────────────────
#   Etapa 2: Copia o código-fonte do backend
# ───────────────────────────────────────────────────────────────────────────────
# Copia o main.py e a pasta src explicitamente
COPY main.py .
COPY src ./src 

# Expõe a porta que o Uvicorn usará para atender as requisições
EXPOSE 8000

# Comando padrão para iniciar o FastAPI no container
# USANDO `/bin/sh -c` para permitir a expansão da variável $PORT
CMD /bin/sh -c "uvicorn main:api --host 0.0.0.0 --port $PORT"