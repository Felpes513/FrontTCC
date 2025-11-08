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

## Deploy com Docker
### Gerar imagem
```bash
docker build -t fronttcc:latest .
```

### Executar container
```bash
docker run --name fronttcc -p 8080:80 fronttcc:latest
```

A aplicação estará disponível em http://localhost:8080

# Autor
Felipe Souza Moreira
Desenvolvedor Full Stack | Q.A | DevOps
Sistema de Gerenciamento de Projetos de Iniciação Científica - SGPIC USCS