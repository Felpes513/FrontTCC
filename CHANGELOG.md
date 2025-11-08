# Changelog - FrontTCC

## [Data: 08/11/2025] - Qualidade e automação de testes

### ✅ Qualidade e Testes
- Adicionados testes unitários e de integração para todos os componentes standalone do portal (login, cadastros, secretaria, orientador, avaliador externo, dashboards e utilitários).
- Criados testes para todos os serviços HTTP garantindo serialização correta de payloads e tratamento de erros (projetos, inscrições, relatórios, notificações, cadastros, bolsas, autenticação).
- Cobertura para componentes auxiliares como `app.component`, `home`, `footer` e `health` assegurando renderização e lógica de roteamento.

### 🐛 Correções
- Ajustado o cálculo da `apiBaseUrl`, `ssoRedirectUrl` e `emailApiBaseUrl` considerando automaticamente host/porta ativos, eliminando `ERR_CONNECTION_REFUSED` ao servir o frontend em portas não padrão.

### 🛠️ Ferramentas
- Documentado que a suíte utiliza `ChromeHeadless` (definir `CHROME_BIN` no ambiente CI/CD para execução automática).

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

