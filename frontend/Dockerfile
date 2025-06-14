# ───────────────────────────────────────────────────────────────────────────────
# Etapa 1: Build da aplicação React
# Usa uma imagem Node.js para instalar dependências e compilar o React.
# ───────────────────────────────────────────────────────────────────────────────
FROM node:18 as build-stage
WORKDIR /app

# Copia package.json e package-lock.json para aproveitar o cache do Docker
# Se estes arquivos não mudarem, as dependências não serão reinstaladas.
COPY package*.json ./

# Instala as dependências do Node.js
# 'npm ci' é mais rigoroso e recomendado em ambientes CI/CD ou Docker builds,
# pois usa package-lock.json para instalações exatas.
# Se preferir 'npm install' para mais flexibilidade (como tínhamos antes), pode usar.
# Manterei 'npm install' para consistência com o que estávamos fazendo.
RUN npm install

# Copia todo o resto do código da aplicação
COPY . .

# Executa o build da aplicação React
# CI=false ignora warnings como erros durante o build.
RUN CI=false npm run build

# ───────────────────────────────────────────────────────────────────────────────
# Etapa 2: Serve os arquivos estáticos com Nginx
# Usa uma imagem Nginx leve e copia apenas os arquivos compilados da etapa anterior.
# ───────────────────────────────────────────────────────────────────────────────
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Copia os arquivos gerados na etapa de build para o diretório de serviço do Nginx
COPY --from=build-stage /app/build .

# Copia a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o Nginx em foreground
CMD ["nginx", "-g", "daemon off;"]