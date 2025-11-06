# Etapa 1: build da aplicação Angular
FROM node:20-alpine AS build
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copia código e gera o build de produção
COPY . .
RUN npm run build -- --configuration=production

# Etapa 2: imagem final com Nginx
FROM nginx:1.27-alpine

# (opcional) utilitário para healthcheck http
RUN apk add --no-cache curl

# Config do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Artefatos do Angular (Angular 17+/CLI: dist/<app>/browser)
COPY --from=build /app/dist/FrontTCC/browser /usr/share/nginx/html

EXPOSE 80

# Healthcheck simples na raiz
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS http://localhost/ >/dev/null || exit 1
