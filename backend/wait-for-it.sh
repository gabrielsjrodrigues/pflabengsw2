#!/usr/bin/env bash
# wait-for-it.sh

# Baseado em: https://github.com/vishnubob/wait-for-it
# Adaptado para o seu cenário Docker Compose

# Uso: ./wait-for-it.sh host:port [-t timeout] [-- command args]

# Variáveis de ambiente padrão
WAITFORIT_HOST=${1%:*}
WAITFORIT_PORT=${1#*:}
WAITFORIT_TIMEOUT=15 # Tempo máximo de espera (em segundos)
WAITFORIT_COMMAND=""

# Processa argumentos
while [[ $# -gt 0 ]]
do
    key="$1"
    case $key in
        -t|--timeout)
        WAITFORIT_TIMEOUT="$2"
        shift # past argument
        shift # past value
        ;;
        --)
        shift # past --
        WAITFORIT_COMMAND="$@"
        break
        ;;
        *)    # unknown option
        ;;
    esac
done

echo "Aguardando ${WAITFORIT_HOST}:${WAITFORIT_PORT} por até ${WAITFORIT_TIMEOUT} segundos..."

start_ts=$(date +%s)
while :
do
    (echo > /dev/tcp/${WAITFORIT_HOST}/${WAITFORIT_PORT}) >/dev/null 2>&1
    result=$?
    if [[ $result -eq 0 ]]; then
        echo "${WAITFORIT_HOST}:${WAITFORIT_PORT} está disponível!"
        break
    fi
    sleep 1
    current_ts=$(date +%s)
    if [[ $((current_ts - start_ts)) -ge ${WAITFORIT_TIMEOUT} ]]; then
        echo "Timeout: ${WAITFORIT_HOST}:${WAITFORIT_PORT} não está disponível após ${WAITFORIT_TIMEOUT} segundos."
        exit 1
    fi
done

# Executa o comando original (o que inicia o FastAPI)
exec ${WAITFORIT_COMMAND}