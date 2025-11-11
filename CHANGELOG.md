# Changelog - FrontTCC

## [Data: 09/11/2025] - Melhorias de UI/UX e refatorações

### 🎯 Resumo Geral
- **16 arquivos modificados**
- **730 inserções**, **453 deleções**
- Melhorias significativas na interface de listagem de projetos
- Refatoração do componente de configurações (bolsas)
- Melhorias no formulário de projeto
- Remoção de componentes de debug não utilizados
- Aprimoramentos de estilos e responsividade

---

### ✨ Implementações

#### 1. **Melhorias no Componente de Listagem de Projetos**
- ✅ Implementado sistema de paginação responsivo com cálculo dinâmico de tamanho de página
- ✅ Adicionado scroll automático para o topo ao mudar de página ou filtrar
- ✅ Implementado sistema de menu dropdown para ações de projeto (Secretaria)
- ✅ Adicionado suporte para múltiplas ações: concluir, cancelar, tornar inadimplente
- ✅ Implementado cálculo e exibição de progresso de projetos (barra de progresso)
- ✅ Adicionado sistema de filtros por status (Todos, Em Execução, Concluídos)
- ✅ Melhorada exibição de notas e média de projetos
- ✅ Implementado sistema de hidratação de dados (alunos selecionados e notas)
- ✅ Adicionado suporte para diferentes modos de visualização (Secretaria, Orientador, Aluno)
- ✅ Melhorada responsividade com grid adaptativo (4 colunas → 2 → 1)
- ✅ Implementado controle de scrollbars (ocultação condicional)
- ✅ Adicionado sistema de debounce para filtros de busca

#### 2. **Refatoração do Componente de Configurações (Bolsas)**
- ✅ Refatorado método `cadastrarBolsaAluno()` para usar novo endpoint `POST /bolsas/`
- ✅ Implementado método `create()` no `BolsaService` para criação de bolsas
- ✅ Melhorado formulário de cadastro de bolsa com seleção de aluno e checkbox de status
- ✅ Adicionado feedback visual após criação de bolsa
- ✅ Melhorada função de filtro de bolsas com normalização de texto
- ✅ Implementado toggle otimista de status de bolsa (atualização imediata com rollback em caso de erro)
- ✅ Adicionada formatação `properCase` para nomes de alunos na listagem

#### 3. **Melhorias no Formulário de Projeto**
- ✅ Refatorado método `listarOrientadoresAprovados()` para usar endpoint específico
- ✅ Melhorado carregamento de projeto em modo de edição
- ✅ Adicionado suporte para exibição de notas do projeto (Nota 1, Nota 2, Nota Final)
- ✅ Implementado sistema de status visual para notas (Aprovado, Reprovado, Pendente)
- ✅ Melhorada validação de formulário com mensagens mais claras
- ✅ Adicionado suporte para diferentes modos de visualização (SECRETARIA, ORIENTADOR, ALUNO)
- ✅ Implementado controle de campos read-only baseado no modo de visualização

#### 4. **Serviço de Projeto (ProjetoService)**
- ✅ Adicionado método `listarOrientadoresAprovados()` para filtrar apenas orientadores aprovados
- ✅ Melhorado método `listarInscricoesPorProjeto()` com melhor tratamento de dados
- ✅ Refatorado método `cadastrarProjetoCompleto()` com validações aprimoradas
- ✅ Adicionado método `listarNotasDoProjeto()` para buscar notas de avaliação

#### 5. **Serviço de Bolsa (BolsaService)**
- ✅ Implementado método `create()` para criação de registro de bolsa
- ✅ Implementado método `setStatus()` para atualização de status de bolsa
- ✅ Interface `BolsaRow` movida para arquivo dedicado (`shared/interfaces/bolsa.ts`)

#### 6. **Melhorias de Estilos Globais**
- ✅ Adicionado suporte para estilos de scrollbar customizados
- ✅ Implementado sistema de ocultação de scrollbars (`.hide-scrollbars`)
- ✅ Melhorados estilos de selects nativos com seta SVG embutida
- ✅ Adicionado suporte para acessibilidade em selects (min-height em mobile)

---

### 🐛 Correções

#### 1. **Componente de Configurações**
- ✅ Corrigido endpoint de criação de bolsa para usar `POST /bolsas/` ao invés de tipos
- ✅ Corrigido método `cadastrarBolsaAluno()` para usar `BolsaService.create()`
- ✅ Melhorado tratamento de erros com mensagens mais descritivas
- ✅ Corrigido reset de formulário após criação bem-sucedida

#### 2. **Listagem de Projetos**
- ✅ Corrigido cálculo de paginação para evitar páginas inválidas
- ✅ Corrigido scroll para topo ao mudar de página
- ✅ Corrigido fechamento de menu dropdown ao clicar fora
- ✅ Corrigido tratamento de projetos sem ID válido
- ✅ Melhorado tratamento de erros de carregamento com mensagens específicas

#### 3. **Formulário de Projeto**
- ✅ Corrigido carregamento de orientador em modo de edição
- ✅ Corrigido carregamento de campus em modo de edição
- ✅ Melhorado tratamento de projetos não encontrados

#### 4. **Rotas (app.routes.ts)**
- ✅ Removida rota de debug (`health`) não utilizada
- ✅ Mantidas rotas de reset de senha para diferentes perfis

---

### 🗑️ Remoções

#### 1. **Componente de Debug (Health)**
- ❌ Removido componente `health.component.ts` completamente
- ❌ Removido arquivo de teste `health.component.spec.ts`
- **Motivo**: Componente de debug não utilizado em produção
- **Impacto**: Nenhum, componente não estava sendo usado

#### 2. **Serviço de Configurações**
- ❌ Removidos métodos de tipos de bolsa não utilizados:
  - `listarTiposBolsa()`
  - `criarTipoBolsa()`
  - `excluirTipoBolsa()`
- **Motivo**: Funcionalidade de tipos de bolsa não está sendo utilizada
- **Nota**: Métodos podem ser restaurados se necessário no futuro

---

### 🎨 Melhorias de UI/UX

#### 1. **Listagem de Projetos**
- ✅ Design moderno com cards com gradientes e sombras
- ✅ Animações suaves de hover e transições
- ✅ Barra de progresso visual para status de preenchimento
- ✅ Menu dropdown elegante com ícones e cores semânticas
- ✅ Paginação fixa no rodapé com indicador de página atual
- ✅ Estados visuais claros (loading, erro, vazio, sem resultados)
- ✅ Responsividade completa (desktop, tablet, mobile)
- ✅ Grid adaptativo: 4 colunas → 2 colunas → 1 coluna

#### 2. **Formulário de Projeto**
- ✅ Seção de notas com cards individuais e status visual
- ✅ Indicadores de status (Aprovado ✓, Reprovado ✗, Pendente ⏳)
- ✅ Melhor organização visual de campos
- ✅ Feedback visual para campos desabilitados (read-only)

#### 3. **Configurações (Bolsas)**
- ✅ Formulário inline para cadastro rápido
- ✅ Feedback visual após criação de bolsa
- ✅ Toggle switch estilizado para status de bolsa
- ✅ Tabela responsiva com filtro em tempo real

---

### 🔄 Refatorações

#### 1. **Código**
- ✅ Refatorado componente de listagem de projetos com melhor separação de responsabilidades
- ✅ Extraída lógica de paginação para métodos privados
- ✅ Melhorada organização de métodos por funcionalidade
- ✅ Refatorado sistema de filtros com Subject e debounce
- ✅ Melhorada tipagem com interfaces específicas

#### 2. **Estrutura**
- ✅ Interface `BolsaRow` movida para `shared/interfaces/bolsa.ts`
- ✅ Melhorada organização de imports
- ✅ Removido código não utilizado

#### 3. **Performance**
- ✅ Implementado debounce para filtros (120ms)
- ✅ Otimizado carregamento de dados com forkJoin
- ✅ Melhorado cálculo de paginação (evita recálculos desnecessários)
- ✅ Implementado trackBy para melhor performance do *ngFor

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados (16 arquivos)
- `src/app/app.routes.ts` - 9 linhas alteradas (remoção de rota de debug)
- `src/app/features/secretaria/configuracoes/configuracoes.component.html` - 46 linhas alteradas
- `src/app/features/secretaria/configuracoes/configuracoes.component.spec.ts` - 3 linhas alteradas
- `src/app/features/secretaria/configuracoes/configuracoes.component.ts` - 76 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.html` - 50 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.ts` - 73 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.css` - 246 linhas alteradas (redesign completo)
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.html` - 427 linhas alteradas (redesign completo)
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.spec.ts` - 27 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.ts` - 153 linhas alteradas
- `src/app/services/config.service.ts` - 3 linhas removidas (métodos não utilizados)
- `src/app/services/projeto.service.ts` - 28 linhas alteradas
- `src/app/shared/interfaces/bolsa.ts` - 8 linhas alteradas
- `src/styles.css` - 9 linhas adicionadas (scrollbars e selects)

#### Arquivos Removidos
- `src/app/debug/health.component.ts` - 8 linhas
- `src/app/debug/health.component.spec.ts` - 17 linhas

---

### 🚀 Melhorias de Performance

- ✅ Debounce em filtros de busca (120ms)
- ✅ Otimização de renderização com trackBy
- ✅ Lazy loading de dados com forkJoin
- ✅ Cálculo dinâmico de tamanho de página baseado em viewport
- ✅ Scroll otimizado com scrollIntoView

---

### 🔒 Melhorias de Segurança

- ✅ Validação aprimorada de IDs antes de requisições
- ✅ Tratamento de erros mais robusto
- ✅ Validação de permissões por perfil (Secretaria, Orientador, Aluno)

---

### 📝 Notas Técnicas

#### Novos Métodos e Funcionalidades
- `ListagemProjetosComponent.computePageSize()`: Calcula tamanho de página baseado em viewport
- `ListagemProjetosComponent.scrollToTopOfList()`: Scroll suave para o topo
- `ListagemProjetosComponent.hidratarSelecionados()`: Carrega alunos selecionados
- `ListagemProjetosComponent.hidratarNotas()`: Carrega notas de projetos
- `BolsaService.create()`: Cria registro de bolsa
- `BolsaService.setStatus()`: Atualiza status de bolsa
- `ProjetoService.listarOrientadoresAprovados()`: Lista apenas orientadores aprovados

#### Dependências
- Nenhuma nova dependência adicionada
- Nenhuma dependência removida

---

### ✅ Testes e Validações

- ✅ Testado fluxo de listagem de projetos com paginação
- ✅ Testado sistema de filtros e busca
- ✅ Testado cadastro de bolsa
- ✅ Testado toggle de status de bolsa
- ✅ Testado formulário de projeto em diferentes modos
- ✅ Testado responsividade em diferentes tamanhos de tela
- ✅ Testado scroll e navegação

---

### 🎯 Próximos Passos Sugeridos

1. Adicionar testes unitários para novos métodos implementados
2. Implementar cache para dados de projetos
3. Adicionar loading skeleton durante carregamento
4. Implementar infinite scroll como alternativa à paginação
5. Adicionar exportação de dados (Excel/PDF) para listagem de projetos

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 09 de Novembro de 2025  
**Branch:** `main`

---

## [Data: 08/11/2025] - Qualidade e automação de testes

### 🎯 Resumo Geral
- **31 arquivos de teste criados/modificados**
- **Novo serviço de senha implementado**
- **Refatoração do módulo de configurações**
- **Correção crítica de URLs de API**

---

### ✅ Qualidade e Testes

#### Testes de Componentes
- ✅ **AppComponent**: Testes de renderização e lógica de roteamento
- ✅ **HomeComponent**: Testes de componente principal
- ✅ **FooterComponent**: Testes de exibição condicional
- ✅ **HealthComponent**: Testes de verificação de rotas
- ✅ **LoginComponent**: Testes de autenticação e formulário
- ✅ **CadastroComponent**: Testes de registro de usuários
- ✅ **ResetPasswordComponent**: Testes de redefinição de senha
- ✅ **SidenavSecretariaComponent**: Testes de navegação lateral

#### Testes de Funcionalidades da Secretaria
- ✅ **ConfiguracoesComponent**: Testes de CRUD de campus, cursos e bolsas
- ✅ **CadastrosComponent**: Testes de gerenciamento de cadastros
- ✅ **ListagemAlunosComponent**: Testes de listagem e seleção de alunos
- ✅ **ListagemAvaliadoresComponent**: Testes de gerenciamento de avaliadores
- ✅ **ListagemProjetosComponent**: Testes de listagem de projetos
- ✅ **FormularioProjetoComponent**: Testes de formulário de projeto
- ✅ **FormularioAvaliadorComponent**: Testes de formulário de avaliador
- ✅ **RelatoriosComponent**: Testes de relatórios mensais
- ✅ **NotificacoesComponent**: Testes de notificações
- ✅ **EnvioDeEmailComponent**: Testes de envio de e-mails
- ✅ **DashboardComponent**: Testes de dashboard
- ✅ **EnviarAvaliacoesModal**: Testes de modal de avaliações

#### Testes de Funcionalidades do Orientador
- ✅ **RelatorioFormComponent**: Testes de formulário de relatório

#### Testes de Funcionalidades do Avaliador Externo
- ✅ **FormularioAvaliacaoComponent**: Testes de formulário de avaliação externa

#### Testes de Serviços HTTP
- ✅ **AuthService**: Testes de autenticação e autorização
- ✅ **LoginService**: Testes de login e SSO
- ✅ **CadastroService**: Testes de cadastro de usuários
- ✅ **ProjetoService**: Testes de CRUD de projetos, serialização de payloads e tratamento de erros
- ✅ **InscricoesService**: Testes de gerenciamento de inscrições
- ✅ **RelatorioService**: Testes de relatórios mensais
- ✅ **NotificacaoService**: Testes de notificações
- ✅ **ConfigService**: Testes de configurações (campus, cursos, bolsas)
- ✅ **BolsaService**: Testes de gerenciamento de bolsas

#### Cobertura de Testes
- ✅ Testes unitários para todos os componentes standalone
- ✅ Testes de integração para serviços HTTP
- ✅ Validação de serialização correta de payloads
- ✅ Tratamento de erros em todos os serviços
- ✅ Testes de renderização e lógica de componentes
- ✅ Testes de roteamento e navegação

---

### ✨ Implementações

#### 1. **Novo Serviço de Senha (PasswordService)**
- ✅ Criado serviço dedicado para gerenciamento de senhas
- ✅ Implementado método `forgotPassword()` para envio de e-mail de redefinição
- ✅ Implementado método `resetPassword()` para confirmação de redefinição via token
- ✅ Localização: `src/app/services/password.service.ts`

#### 2. **Refatoração do Componente de Configurações**
- ✅ Integrado CRUD de Tipos de Bolsa no componente de configurações
- ✅ Implementada listagem de alunos para atribuição de bolsas
- ✅ Adicionado filtro de busca por nome ou e-mail para bolsas
- ✅ Implementado toggle de status de bolsa por aluno
- ✅ Adicionada formatação `properCase` para nomes de alunos
- ✅ Implementada normalização de texto (remoção de acentos) para buscas
- ✅ Melhorada interface de usuário com tabs do Material Design

#### 3. **Serviço de Configurações (ConfigService)**
- ✅ Adicionados métodos para CRUD de Tipos de Bolsa:
  - `listarTiposBolsa()`: Lista todos os tipos de bolsa
  - `criarTipoBolsa(body: { nome: string })`: Cria novo tipo de bolsa
  - `excluirTipoBolsa(id_bolsa: number)`: Exclui tipo de bolsa
- ✅ Endpoints configurados para `/bolsas/tipos`

#### 4. **Serviço de Bolsas (BolsaService)**
- ✅ Implementado método `listar()` para listar alunos com status de bolsa
- ✅ Implementado método `setStatus()` para atualizar status de bolsa de aluno
- ✅ Interface `BolsaRow` definida com campos: `id_aluno`, `nome_completo`, `email`, `possui_bolsa`

#### 5. **Melhorias no Serviço de Notificações**
- ✅ Refatorado método `getNotificacoes()` para usar paginação padrão
- ✅ Melhorado método `marcarTodasComoLidas()` com parâmetros corretos
- ✅ Ajustada estrutura de resposta da API

---

### 🐛 Correções

#### 1. **Correção Crítica de URLs de API (Environment)**
- ✅ **Problema**: `ERR_CONNECTION_REFUSED` ao servir o frontend em portas não padrão
- ✅ **Solução**: Implementada função `resolveUrl()` que calcula automaticamente URLs baseadas no `window.location.origin`
- ✅ **Arquivos Afetados**:
  - `src/environments/environment.ts`
- ✅ **URLs Corrigidas**:
  - `apiBaseUrl`: Agora resolve automaticamente baseado na origem atual
  - `ssoRedirectUrl`: Resolve automaticamente para evitar CORS
  - `emailApiBaseUrl`: Resolve automaticamente através do proxy
- ✅ **Benefícios**:
  - Elimina erros de conexão em diferentes portas
  - Funciona automaticamente em desenvolvimento e produção
  - Suporta URLs absolutas (http/https) e relativas
  - Compatível com proxy local

#### 2. **Correção no Componente de Reset de Senha**
- ✅ Integrado com novo `PasswordService`
- ✅ Melhorado tratamento de erros
- ✅ Validação de tokens aprimorada

#### 3. **Correção na Sidenav**
- ✅ Removido link para componente `atribuir-bolsas` (removido)
- ✅ Adicionado link para configurações com gerenciamento de bolsas integrado

---

### 🗑️ Remoções

#### 1. **Componente Atribuir Bolsas**
- ❌ Removido componente `atribuir-bolsas` completamente:
  - `atribuir-bolsas.component.ts`
  - `atribuir-bolsas.component.html`
  - `atribuir-bolsas.component.css`
  - `atribuir-bolsas.component.spec.ts`
- **Motivo**: Funcionalidade integrada ao componente de configurações para melhor organização
- **Migração**: Todas as funcionalidades foram movidas para `configuracoes.component`

---

### 🚨 Bugs Conhecidos

#### 1. **Bug na Criação de Bolsa** ⚠️
- **Status**: 🔴 **EM INVESTIGAÇÃO**
- **Descrição**: Erro ao tentar criar uma nova bolsa através do formulário de configurações
- **Localização**: `src/app/features/secretaria/configuracoes/configuracoes.component.ts`
- **Método Afetado**: `cadastrarTipoBolsa()`
- **Possíveis Causas**:
  - Incompatibilidade com endpoint do backend (`/bolsas/tipos`)
  - Formato de payload incorreto
  - Validação no backend rejeitando requisição
  - Problema de CORS ou autenticação
- **Endpoint**: `POST ${apiBaseUrl}/bolsas/tipos`
- **Payload Esperado**: `{ nome: string }`
- **Ação Necessária**: 
  - Verificar se o endpoint do backend está correto
  - Validar formato de resposta do backend
  - Verificar logs de erro no console do navegador
  - Testar requisição diretamente via Postman/Insomnia
- **Workaround Temporário**: Usar interface de administração do backend diretamente

---

### 🛠️ Ferramentas e Configuração

#### Testes
- ✅ Configurado Karma como test runner
- ✅ Configurado Jasmine como framework de testes
- ✅ Configurado ChromeHeadless para execução em CI/CD
- ✅ **Nota**: Definir `CHROME_BIN` no ambiente CI/CD para execução automática
- ✅ Cobertura de testes para todos os serviços HTTP
- ✅ Mocks e stubs configurados para testes isolados

#### Ambiente de Desenvolvimento
- ✅ Proxy configurado para desenvolvimento local
- ✅ URLs resolvidas automaticamente baseadas no ambiente
- ✅ Suporte a diferentes portas de desenvolvimento

---

### 📊 Estatísticas de Alterações

#### Arquivos de Teste Criados/Modificados (31 arquivos)
- `src/app/app.component.spec.ts` - Modificado
- `src/app/components/home/home.component.spec.ts` - Modificado
- `src/app/components/footer/footer.component.spec.ts` - Criado
- `src/app/debug/health.component.spec.ts` - Criado
- `src/app/shared/login/login.component.spec.ts` - Criado
- `src/app/shared/cadastro/cadastro.component.spec.ts` - Criado
- `src/app/shared/reset-password/reset-password.component.spec.ts` - Criado
- `src/app/shared/sidenav/sidenav-secretaria.component.spec.ts` - Modificado
- `src/app/services/auth.service.spec.ts` - Criado
- `src/app/services/login.service.spec.ts` - Criado
- `src/app/services/cadastro.service.spec.ts` - Criado
- `src/app/services/projeto.service.spec.ts` - Criado
- `src/app/services/inscricoes.service.spec.ts` - Criado
- `src/app/services/relatorio.service.spec.ts` - Criado
- `src/app/services/notificacao.service.spec.ts` - Criado
- `src/app/services/config.service.spec.ts` - Modificado
- `src/app/services/bolsa.service.spec.ts` - Criado
- `src/app/features/secretaria/configuracoes/configuracoes.component.spec.ts` - Modificado
- `src/app/features/secretaria/cadastros/cadastros.component.spec.ts` - Modificado
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.spec.ts` - Modificado
- `src/app/features/secretaria/listagem-avaliadores/listagem-avaliadores.component.spec.ts` - Modificado
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.spec.ts` - Criado
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.spec.ts` - Criado
- `src/app/features/secretaria/formulario-avaliador/formulario-avaliador.component.spec.ts` - Criado
- `src/app/features/secretaria/relatorios/relatorios.component.spec.ts` - Criado
- `src/app/features/secretaria/notificacoes/notificacoes.component.spec.ts` - Criado
- `src/app/features/secretaria/envio-de-email/envio-de-email.component.spec.ts` - Criado
- `src/app/features/secretaria/dashboard/dashboard.component.spec.ts` - Criado
- `src/app/features/secretaria/listagem-avaliadores/enviar-avaliacoes.modal.spec.ts` - Criado
- `src/app/features/orientador/relatorio-form/relatorio-form.component.spec.ts` - Criado
- `src/app/features/avaliador-externo/formulario-avaliacao/formulario-avaliacao.component.spec.ts` - Criado

#### Arquivos de Código Modificados
- `src/app/services/password.service.ts` - **NOVO** (25 linhas)
- `src/app/services/config.service.ts` - Modificado (adição de métodos de bolsa)
- `src/app/services/bolsa.service.ts` - Modificado
- `src/app/services/notificacao.service.ts` - Modificado
- `src/app/features/secretaria/configuracoes/configuracoes.component.ts` - Modificado (integração de bolsas)
- `src/app/features/secretaria/configuracoes/configuracoes.component.html` - Modificado
- `src/app/features/secretaria/configuracoes/configuracoes.component.css` - Modificado
- `src/app/shared/reset-password/reset-password.component.ts` - Modificado
- `src/app/shared/sidenav/sidenav-secretaria.component.html` - Modificado
- `src/app/shared/sidenav/sidenav-secretaria.component.ts` - Modificado
- `src/environments/environment.ts` - Modificado (correção de URLs)

#### Arquivos Removidos
- `src/app/features/secretaria/atribuir-bolsas/atribuir-bolsas.component.ts` - Removido
- `src/app/features/secretaria/atribuir-bolsas/atribuir-bolsas.component.html` - Removido
- `src/app/features/secretaria/atribuir-bolsas/atribuir-bolsas.component.css` - Removido
- `src/app/features/secretaria/atribuir-bolsas/atribuir-bolsas.component.spec.ts` - Removido

---

### 🎯 Próximos Passos

#### Prioridade Alta
1. 🔴 **Corrigir bug na criação de bolsa**
   - Investigar endpoint do backend
   - Validar formato de requisição
   - Testar integração completa
   - Adicionar tratamento de erros mais robusto

#### Prioridade Média
2. Adicionar testes de integração end-to-end
3. Melhorar cobertura de testes para componentes complexos
4. Documentar APIs de serviços
5. Adicionar validação de formulários mais robusta

#### Prioridade Baixa
6. Otimizar performance de testes
7. Adicionar testes de acessibilidade
8. Implementar testes visuais (screenshot testing)

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 08 de Novembro de 2025  
**Branch:** `codex/create-frontend-quality-tests-and-changelog`

## [Data: 08/11/2025]

### 🎯 Resumo Geral
- **24 arquivos modificados**
- **1.090 inserções**, **696 deleções**
- Correções de fluxos da secretaria, melhorias de UX e refatorações importantes

---

## ✨ Implementações

### 🔧 Componentes e Funcionalidades

#### 1. **Componente de Debug (Health Check)**
- ✅ Adicionado novo componente `health.component.ts` para verificação de roteamento
- Localização: `src/app/debug/health.component.ts`
- Funcionalidade: Verifica se o sistema de rotas está funcionando corretamente

#### 2. **Melhorias no Formulário de Projeto**
- ✅ Implementado sistema de upload de documentos (DOCX e PDF) com ViewChild
- ✅ Adicionado controle de histórico de documentos por etapa (IDEIA, PARCIAL, FINAL)
- ✅ Implementada validação de código de projeto (`cod_projeto`)
- ✅ Adicionado suporte para Base64 de documento inicial (`ideia_inicial_b64`)
- ✅ Melhorado controle de estado de documentos com status de envio
- ✅ Implementada lógica de validação para avanço de etapas

#### 3. **Melhorias no Componente de Relatórios**
- ✅ Implementada função `properCase` para formatação correta de nomes próprios
- ✅ Adicionado tratamento de palavras minúsculas em nomes (de, da, do, das, dos, e, di)
- ✅ Melhorada exibição de nomes de orientadores nos relatórios mensais
- ✅ Aprimorada formatação de dados recebidos e pendentes

#### 4. **Melhorias no Formulário de Relatório**
- ✅ Refatorado parser de observações para melhor legibilidade
- ✅ Melhorada formatação de regex para extração de dados
- ✅ Adicionado HostListener para melhor interação
- ✅ Aprimorada hidratação do formulário com valores padrão

#### 5. **Melhorias no Componente de Cadastros**
- ✅ Implementada normalização de texto com remoção de acentos para busca
- ✅ Melhorada função de busca com suporte a caracteres especiais
- ✅ Adicionado suporte para campo `nome_completo` além de `nome`
- ✅ Aprimorada correspondência de termos de busca

---

## 🐛 Correções

### 1. **Rotas e Navegação**
- ✅ Corrigido redirecionamento no `LandingRedirectGuard`
- ✅ Ajustadas rotas para diferentes perfis (SECRETARIA, ORIENTADOR, ALUNO)
- ✅ Corrigida estrutura de rotas no `app.routes.ts`

### 2. **Serviços**

#### ProjetoService
- ✅ Refatorado método `cadastrarProjetoCompleto` para suportar Base64
- ✅ Adicionada função `stripDataUrl` para processamento de Base64
- ✅ Implementada geração automática de código de projeto
- ✅ Melhorado tratamento de erros e validações
- ✅ Corrigida normalização de projetos e projetos detalhados
- ✅ Ajustado método `listarInscricoesPorProjeto` para melhor compatibilidade

#### InscricoesService
- ✅ Removido método `excluirEmLote` (não utilizado)
- ✅ Limpeza de código obsoleto

### 3. **Interfaces**
- ✅ Atualizada interface `ProjetoRequest` para incluir:
  - `cod_projeto?: string`
  - `ideia_inicial_b64?: string` (obrigatório no POST)
- ✅ Melhorada tipagem de projetos

### 4. **Componentes**

#### AppComponent
- ✅ Ajustada lógica de exibição do footer
- ✅ Melhorado controle de rotas para exibição condicional

#### Sidenav Secretaria
- ✅ Ajustes de CSS para melhor layout
- ✅ Melhorias visuais na navegação

---

## 🗑️ Remoções

### 1. **Componente Navbar**
- ❌ Removido componente `navbar` completamente:
  - `navbar.component.ts`
  - `navbar.component.html`
  - `navbar.component.css`
- **Motivo**: Componente não utilizado, substituído por sidenav

---

## 🎨 Melhorias de UI/UX

### 1. **Estilos e Layout**
- ✅ Melhorias no CSS do componente de relatórios
- ✅ Ajustes visuais no formulário de relatório
- ✅ Melhorias no layout de cadastros
- ✅ Ajustes na sidenav da secretaria

### 2. **Formulários**
- ✅ Melhorada experiência de upload de arquivos
- ✅ Adicionados indicadores visuais de status de documentos
- ✅ Melhorada validação de formulários

---

## 🔄 Refatorações

### 1. **Código**
- ✅ Refatoração de métodos de normalização de texto
- ✅ Melhoria na organização de tipos e interfaces
- ✅ Limpeza de código não utilizado
- ✅ Melhorada legibilidade de código complexo

### 2. **Estrutura**
- ✅ Reorganização de imports
- ✅ Melhoria na organização de componentes
- ✅ Ajustes na estrutura de pastas

---

## 📊 Estatísticas de Alterações

### Arquivos Modificados
- `src/app/app.component.html` - 7 linhas alteradas
- `src/app/app.component.ts` - 19 linhas alteradas
- `src/app/app.routes.ts` - 59 linhas alteradas
- `src/app/core/guards/landing-redirect.guard.ts` - 11 linhas alteradas
- `src/app/features/orientador/relatorio-form/relatorio-form.component.css` - 87 linhas alteradas
- `src/app/features/orientador/relatorio-form/relatorio-form.component.html` - 44 linhas alteradas
- `src/app/features/orientador/relatorio-form/relatorio-form.component.ts` - 61 linhas alteradas
- `src/app/features/secretaria/cadastros/cadastros.component.css` - 51 linhas alteradas
- `src/app/features/secretaria/cadastros/cadastros.component.html` - 48 linhas alteradas
- `src/app/features/secretaria/cadastros/cadastros.component.ts` - 14 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.html` - 133 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.ts` - 426 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.ts` - 25 linhas alteradas
- `src/app/features/secretaria/relatorios/relatorios.component.css` - 198 linhas alteradas
- `src/app/features/secretaria/relatorios/relatorios.component.html` - 165 linhas alteradas
- `src/app/features/secretaria/relatorios/relatorios.component.ts` - 40 linhas alteradas
- `src/app/services/inscricoes.service.ts` - 7 linhas removidas
- `src/app/services/projeto.service.ts` - 140 linhas alteradas
- `src/app/shared/interfaces/projeto.ts` - 3 linhas alteradas
- `src/app/shared/sidenav/sidenav-secretaria.component.css` - 26 linhas alteradas

### Arquivos Removidos
- `src/app/components/navbar/navbar.component.css` - 167 linhas
- `src/app/components/navbar/navbar.component.html` - 29 linhas
- `src/app/components/navbar/navbar.component.ts` - 18 linhas

### Arquivos Criados
- `src/app/debug/health.component.ts` - 8 linhas

---

## 🚀 Melhorias de Performance

- ✅ Otimização de queries e requisições
- ✅ Melhoria na normalização de dados
- ✅ Redução de código não utilizado

---

## 🔒 Melhorias de Segurança

- ✅ Validação aprimorada de dados de entrada
- ✅ Melhor tratamento de erros

---

## 📝 Notas Técnicas

### Tipos e Interfaces
- Adicionado tipo `EtapaDocumento` ('IDEIA' | 'PARCIAL' | 'FINAL')
- Adicionado tipo `StatusEnvio` ('ENVIADO' | 'NAO_ENVIADO')
- Adicionada interface `DocumentoHistorico`
- Estendida interface `ProjetoCadastroExt` com novos campos

### Dependências
- Nenhuma nova dependência adicionada
- Nenhuma dependência removida

---

## ✅ Testes e Validações

- ✅ Testado fluxo de cadastro de projetos
- ✅ Testado upload de documentos
- ✅ Testado geração de relatórios
- ✅ Testado busca e filtros de cadastros
- ✅ Testado redirecionamento de rotas

---

## 🎯 Próximos Passos Sugeridos

1. Testes automatizados para novos componentes
2. Documentação de APIs atualizadas
3. Validação de integração com backend
4. Testes de carga para upload de arquivos

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 08 de Novembro de 2025  
**Branch:** `codex/perform-thorough-project-scan-and-diagnosis`

