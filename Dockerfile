# Etapa 1: build da aplicação Angular
FROM node:20-alpine AS build
WORKDIR /app

# Copia package.json e package-lock para instalar dependências
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copia o restante do código e gera o build de produção
COPY . .
RUN npm run build -- --configuration=production

# Etapa 2: imagem final baseada em Nginx
FROM nginx:1.27-alpine

# Copia configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os artefatos gerados na etapa de build
COPY --from=build /app/dist/FrontTCC /usr/share/nginx/html

# Exponha a porta padrão do Nginx
EXPOSE 80

# Healthcheck simples
HEALTHCHECK CMD wget --spider -q http://localhost/ || exit 1
