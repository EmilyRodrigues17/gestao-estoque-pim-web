# EstoquePIM - Interface de Gestão de Estoque

[![Angular Version](https://img.shields.io/badge/angular-21.2-dd0031.svg)](https://angular.dev/)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-4.1-38b2ac.svg)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9-blue.svg)](https://www.typescriptlang.org/)

Portal web moderno e responsivo desenvolvido para a gestão de estoque de insumos industriais no **Polo Industrial de Manaus (PIM)**. Esta interface consome a API do EstoquePIM para fornecer visibilidade em tempo real e controle operacional aos almoxarifes e gestores.

## Sobre o Projeto

O frontend do **EstoquePIM** foi projetado com foco em **experiência do usuário (UX)** e **desempenho**. Utilizando as funcionalidades mais recentes do Angular, o sistema oferece uma interface fluida, com atualizações reativas e uma navegação intuitiva, garantindo que o controle de materiais seja feito de forma rápida e livre de erros.

## Tecnologias Utilizadas

- **Framework:** Angular 21.2 (utilizando Signals para gerenciamento de estado reativo)
- **Estilização:** Tailwind CSS 4.1 (design system personalizado)
- **Ícones:** Material Symbols Outlined
- **Tipografia:** Inter (Google Fonts)
- **Testes:** Vitest e JSDOM
- **Segurança:** 
  - Guards de rotas baseados em permissões (Gestor/Almoxarife)
  - Interceptors para injeção automática de tokens JWT
  - Fluxo de Refresh Token transparente para o usuário

## Personas

O sistema foi desenhado para atender dois perfis principais do Polo Industrial:

*   **Almoxarife:** O usuário operacional que realiza o recebimento e a baixa de materiais. Precisa de agilidade no registro e precisão nos saldos para evitar paradas na linha.
*   **Gestor de Produção:** O usuário estratégico que monitora a saúde do estoque. Utiliza o dashboard para antecipar compras e analisa o histórico para planejamento de demanda.

## Requisitos Atendidos

O projeto cumpre integralmente os requisitos definidos no PRD para a versão MVP:

### Requisitos Funcionais (RF)

| ID | Requisito | Prioridade | Status |
|:---:|:---|:---:|:---:|
| RF01 | Autenticar usuários por e-mail e senha, gerando token JWT. | Alta | ✅ Atendido |
| RF02 | Redirecionar rotas protegidas para /login sem token válido. | Alta | ✅ Atendido |
| RF03 | Registrar movimentações com tipo, motivo, quantidade e timestamp. | Alta | ✅ Atendido |
| RF04 | Atualização de estoque_atual em transação SQL atômica. | Alta | ✅ Atendido |
| RF05 | Bloquear saídas (erro 422) se quantidade > estoque_atual. | Alta | ✅ Atendido |
| RF06 | Exibir saldo previsto na tela de movimentação antes de confirmar. | Alta | ✅ Atendido |
| RF07 | Cadastrar, editar, listar e desativar insumos com todos os campos. | Alta | ✅ Atendido |
| RF08 | Dashboard com indicadores de críticos, zerados e estatísticas do dia. | Alta | ✅ Atendido |
| RF09 | Lista de críticos ordenada por percentual do mínimo atingido. | Média | ✅ Atendido |
| RF10 | Filtrar histórico por período, insumo, tipo e motivo. | Média | ✅ Atendido |
| RF11 | Insumos inativos não devem aparecer na nova movimentação. | Média | ✅ Atendido |
| RF12 | Observação obrigatória para motivos "ajuste" ou "perda". | Média | ✅ Atendido |
| RF13 | Exibir consumo médio mensal no detalhe do insumo (trio). | Baixa | ⏳ Pendente |
| RF14 | Fluxo de solicitação de reposição e aprovação (trio). | Baixa | ⏳ Pendente |

### Requisitos Não Funcionais (RNF)

| ID | Requisito | Prioridade | Status |
|:---:|:---|:---:|:---:|
| RNF01 | Atomicidade entre registro de movimentação e saldo (transação). | Alta | ✅ Atendido |
| RNF02 | Armazenamento de senhas com hash bcrypt. | Alta | ✅ Atendido |
| RNF03 | Proteção de rotas da API com token JWT válido. | Alta | ✅ Atendido |
| RNF04 | Proibição de update direto no campo estoque_atual. | Alta | ✅ Atendido |
| RNF05 | Frontend responsivo e adaptável. | Média | ✅ Atendido |
| RNF06 | Código no GitHub com README de instalação e execução. | Média | ✅ Atendido |
| RNF07 | Variáveis sensíveis em arquivo .env fora do versionamento. | Alta | ✅ Atendido |
| RNF08 | Tratamento de erros 401 (redirecionar) e 500 (amigável). | Média | ✅ Atendido |

## Funcionalidades Principais

- **Dashboard de Indicadores:** Visualização rápida de insumos críticos, itens zerados e movimentações recentes.
- **Catálogo de Insumos:** Listagem com busca global, filtros por categoria e status de estoque (crítico, atenção, normal).
- **Registro de Movimentação:** Formulário inteligente com busca preditiva de insumos e **preview de saldo** em tempo real.
- **Histórico Auditável:** Consulta completa de todas as entradas e saídas com filtros por período e motivo.
- **Gestão de Usuários:** Interface administrativa para controle de acessos e ativação/desativação de contas.
- **Perfil do Usuário:** Área personalizada para edição de dados cadastrais e troca de senha.

## Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v20+)
- [Angular CLI](https://angular.dev/tools/cli) (`npm install -g @angular/cli`)

### Passo a Passo

1.  **Clonar o repositório:**
    ```bash
    git clone https://github.com/EmilyRodrigues17/gestao-estoque-pim-web.git
    cd gestao-estoque-pim-web
    ```

2.  **Instalar dependências:**
    ```bash
    npm install
    ```

3.  **Configurar o Ambiente:**
    Certifique-se de que a API backend está rodando. Se necessário, ajuste a URL da API no arquivo:
    `src/environments/environment.ts`
    ```typescript
    export const environment = {
      production: false,
      apiUrl: 'http://localhost:6060/api'
    };
    ```

4.  **Iniciar o Servidor de Desenvolvimento:**
    ```bash
    npm start
    ```
    Acesse `http://localhost:4200` no seu navegador.

## Estrutura do Projeto

A aplicação segue uma arquitetura modular organizada por domínios:

- `src/app/core/`: Serviços globais, modelos de dados, guards e interceptors (Singleton).
- `src/app/shared/`: Componentes reutilizáveis (Data Tables, Modais, Inputs personalizados).
- `src/app/features/`: Módulos de funcionalidades (Dashboard, Insumos, Categorias, Movimentações, Usuários).
- `src/app/layout/`: Componentes de estrutura (Sidebar, Header, Layout principal).

---
Desenvolvido como projeto final para o curso de **Dev Full Stack - INDT**.

