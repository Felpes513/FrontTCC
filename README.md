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

---

## 📝 Changelog

### [Hoje] - Melhorias no Formulário de Projetos e Serviços

#### ✨ Novas Funcionalidades
- **Código de Projeto**: Adicionado suporte para `cod_projeto` nas interfaces e formulários
  - Geração automática de código no formato `P-{ANO}-{SUFIXO}` quando não informado
  - Campo opcional no formulário de cadastro e edição
- **Upload de Documento Inicial**: Implementado suporte para envio de documento inicial (.docx) em Base64
  - Campo `ideia_inicial_b64` adicionado à interface `ProjetoRequest`
  - Validação obrigatória do documento inicial no cadastro
  - Processamento automático de Base64 com remoção de prefixo data-url

#### 🔧 Melhorias
- **Formulário de Projeto** (`formulario-projeto.component.ts`):
  - Refatoração completa do componente com melhor organização do código
  - Melhorias na validação de formulário
  - Suporte aprimorado para upload de documentos (DOCX e PDF)
  - Implementação de histórico de documentos por etapa (IDEIA, PARCIAL, FINAL)
  - Sistema de avanço de etapas com validações
  - Melhor tratamento de erros e feedback ao usuário
- **Serviço de Projeto** (`projeto.service.ts`):
  - Adicionado método `gerarCodProjeto()` para geração automática de códigos
  - Adicionado método `stripDataUrl()` para limpeza de Base64
  - Melhorias no método `cadastrarProjetoCompleto()` com validação de Base64
  - Adicionado stub para `atualizarProjeto()` (aguardando endpoint PUT no backend)
  - Melhorias no método `processarDadosECadastrar()` com suporte a Base64
- **Interfaces** (`projeto.ts`):
  - Adicionado campo `cod_projeto` nas interfaces `ProjetoRequest`, `ProjetoFormulario` e `ProjetoCadastro`
  - Adicionado campo `ideia_inicial_b64` na interface `ProjetoRequest`

#### 🐛 Correções
- Correção na validação de documentos obrigatórios no cadastro
- Melhor tratamento de erros no upload de arquivos
- Correção na lógica de carregamento de projetos em modo de edição

#### 📊 Estatísticas
- **4 arquivos modificados**
- **478 inserções, 247 deleções**
- Arquivos principais: `formulario-projeto.component.ts`, `formulario-projeto.component.html`, `projeto.service.ts`, `projeto.ts`

---

# Autor
Felipe Souza Moreira
Desenvolvedor Full Stack | Q.A | DevOps
Sistema de Gerenciamento de Projetos de Iniciação Científica - SGPIC USCS