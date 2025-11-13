# 🧭 FrontTCC — Sistema de Gestão de TCC (Frontend)

Aplicação **Angular** responsável pelo fluxo de **inscrições, acompanhamento e gestão de projetos de TCC**.  
O projeto utiliza **proxy local** para integração com o backend **FastAPI**, e conta com **build Dockerizado** para deploy em **VPS** via **Nginx**.

---

## ⚙️ Pré-requisitos

- **Node.js** 20 LTS  
- **NPM** 10+  
- **Docker** e **Docker Compose** (para produção)

---

## 🚀 Ambiente de Desenvolvimento

Após clonar o repositório, instale as dependências:

```bash
npm install
```

Execute o servidor local com proxy para o backend (FastAPI):
```bash
npm start
```

## Build de Produção
```bash
npm run build
```

## 🐳 Deploy com Docker

### Opção 1: Docker Compose (Recomendado)

A forma mais simples de executar o frontend é usando o Docker Compose:

```bash
# Build e executar o container
docker compose up --build

# Executar em background
docker compose up -d --build

# Ver logs
docker compose logs -f

# Parar o container
docker compose down
```

A aplicação estará disponível em **http://localhost:8080**

### Opção 2: Docker Build Manual

#### Gerar imagem
```bash
docker build -t fronttcc:latest .
```

#### Executar container
```bash
docker run --name fronttcc -p 8080:80 fronttcc:latest
```

### Configuração do Backend

O Nginx está configurado para fazer proxy das requisições `/api/` para o backend. Por padrão, o backend deve estar rodando em:
- **Windows/Mac**: `host.docker.internal:8001`
- **Linux**: Você pode precisar ajustar o `nginx.conf` para usar o IP do host

Para alterar a configuração do backend, edite o arquivo `nginx.conf`:

```nginx
location /api/ {
  proxy_pass http://host.docker.internal:8001;
  # ou use o IP do host: http://172.17.0.1:8001
}
```

### Healthcheck

O container inclui um healthcheck que verifica se o frontend está respondendo corretamente. Você pode verificar o status com:

```bash
docker compose ps
```

# Autor
Felipe Souza Moreira
Desenvolvedor Full Stack | Q.A | DevOps
Sistema de Gerenciamento de Projetos de Iniciação Científica - SGPIC USCS