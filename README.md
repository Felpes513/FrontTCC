# FrontTCC

Aplicação Angular que concentra o fluxo de inscrições, acompanhamento e gestão do TCC. Este documento resume os comandos de desenvolvimento e destaca o que foi configurado para facilitar o deploy em uma VPS.

## Pré-requisitos
- Node.js 20 LTS
- NPM 10+

Após clonar o repositório instale as dependências:

```bash
npm install
```

## Servidor de desenvolvimento
Execute o projeto localmente com o proxy para o backend (FastAPI):

```bash
npm start
```

O comando acima executa `ng serve --proxy-config proxy.conf.json`. O proxy encaminha qualquer requisição que comece com `/api` para `http://localhost:8001`, simplificando o desenvolvimento local sem alterar o código fonte.

## Variáveis de ambiente
A pasta `src/environments` define duas configurações principais:

- `environment.ts` – usado em desenvolvimento. Define as URLs do backend (`apiBaseUrl`), do SSO corporativo (`ssoRedirectUrl`) e do serviço externo de e-mail.
- `environment.prod.ts` – substitui o arquivo anterior durante o build de produção. Ajuste os endpoints para o domínio público da VPS e, opcionalmente, configure `errorLoggingUrl` para enviar logs para Sentry/Logstash.

Sempre que precisar de um novo endpoint configure-o nos arquivos de ambiente e utilize o alias `@environments` dentro dos serviços.

## Build para produção
Gere os artefatos otimizados com:

```bash
npm run build
```

O output será criado em `dist/FrontTCC`. Os assets de `src/assets` e da pasta `public` são incluídos automaticamente com hash no nome para facilitar o cache busting.

> **Fontes externas**: o build de produção ignora o passo de _inline_ de fontes para evitar falhas em ambientes restritos (como esta sandbox). Em produção, o navegador continuará buscando `Roboto` e `Material Icons` via CDN do Google. Caso prefira hospedar as fontes junto da aplicação, copie os arquivos `.woff2` para `public/fonts` e referencie-os em `src/styles.css` com `@font-face`.

### Dicas para a VPS
1. Sirva os arquivos estáticos por Nginx ou Apache com compressão gzip/brotli habilitada.
2. Configure HTTPS terminando no proxy reverso e encaminhe `/api` para o backend FastAPI.
3. Garanta que as variáveis de ambiente apontam para os domínios corretos antes de gerar o build (ex.: `environment.prod.ts`).
4. Configure health-checks simples (ex.: `/index.html`) no load balancer/monitoring da VPS.
5. Opcional: exponha a rota configurada em `errorLoggingUrl` para coletar erros do `GlobalErrorHandler`.

### Deploy com Docker
O repositório inclui um `Dockerfile` multi-stage e uma configuração otimizada de Nginx. Para gerar a imagem de produção:

```bash
docker build -t fronttcc:latest .
```

Em seguida, execute o container mapeando a porta HTTP:

```bash
docker run -p 8080:80 --env VIRTUAL_HOST=fronttcc.local fronttcc:latest
```

> O `Dockerfile` executa `npm ci` e `npm run build --configuration=production` na etapa de build. Ajuste variáveis nos arquivos `environment.*` antes de gerar a imagem. O `nginx.conf` já aplica cache longo para assets versionados e fallback para `index.html`.

## Testes
A suíte de testes unitários continua disponível:

```bash
npm test
```

> Recomenda-se executar lint/test antes de cada deploy automatizado.

## Estrutura de código
- `src/app/services`: todos os serviços usam `environment.apiBaseUrl`, facilitando a troca de endpoints entre ambientes.
- `src/app/core/interceptor/auth.interceptor.ts`: interceptor HTTP que anexa o token e trata erros 401/403/500.
- `src/app/core/error/global-error-handler.ts`: centraliza a captura de erros e, em produção, permite enviar logs para um coletor externo.

Sinta-se à vontade para complementar esta documentação com detalhes do backend ou pipelines de CI/CD.
