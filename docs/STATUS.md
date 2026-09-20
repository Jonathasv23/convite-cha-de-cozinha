# STATUS DO PROJETO

**Sistema:** Convite Digital e Lista de Presentes para Chá de Cozinha  
**Identidade Visual:** *Botanical Heritage Atelier*  
**Última Atualização:** 20/09/2026 - Conclusão da Fase 2 (Banco de Dados, Persistência, Regras de Segurança e Migrações)  

---

## 1. Estado Atual do Projeto

A camada de persistência e governança em nuvem foi implementada com absoluto sucesso na **Fase 2**:
- As regras declarativas de segurança do Firestore (`database/firestore.rules`) foram consolidadas e validadas contra vazamento de dados de convidados, garantindo total conformidade com a LGPD (listagem de confirmações restrita ao admin, verificação de homônimos via busca pontual por chave e baixa atômica de presentes no fluxo público).
- Os índices compostos de consulta foram consolidados em `database/firestore.indexes.json`.
- O módulo de inicialização modular do Firebase Web SDK v10+ (`app/utils/firebase.js`) foi criado, importando via CDN oficial sem necessidade de bundlers e com suporte gracioso a modo de demonstração local.
- O executor de migrações CLI (`database/migrations/run.js`) e os scripts versionados de schema inicial (`001_initial_schema.js`) e semente de catálogo com 20 presentes artesanais (`002_seed_presentes.js`) foram implementados com garantia de idempotência via coleção `_migrations` e testados com sucesso via Node.js.

O projeto encontra-se perfeitamente estabilizado e pronto para a construção da camada de Modelos (MVC) na **Fase 3**.

---

## 2. Visão Geral das Fases

| Fase | Descrição | Status |
| :--- | :--- | :---: |
| **Fase 1** | Infraestrutura, Estrutura Base, Design Tokens e Controle de Versão (Git/GitHub) | **Concluída** |
| **Fase 2** | Banco de Dados, Persistência, Regras de Segurança e Migrações | **Concluída** |
| **Fase 3** | Camada de Modelos (MVC) e Módulos Utilitários | *Pendente* |
| **Fase 4** | Módulo do Convite Digital Público (Visão do Convidado) | *Pendente* |
| **Fase 5** | Módulo do Painel Administrativo da Noiva | *Pendente* |
| **Fase 6** | Relatórios, Exportações (CSV e Impressão/PDF) e Acabamentos Finais | *Pendente* |
| **Fase 7** | Homologação, Testes Completos de Aceitação e Preparação para Deploy | *Pendente* |

---

## 3. Checklist Detalhado por Fase

### Fase 1 - Infraestrutura, Estrutura Base, Design Tokens e Controle de Versão
- [x] Árvore completa de pastas criada (`config/`, `database/migrations/`, `app/models/`, `app/views/`, `app/controllers/`, `app/utils/`, `assets/css/`, `assets/js/`, `assets/images/`).
- [x] `assets/css/variables.css` com a totalidade dos tokens de design (*Botanical Heritage Atelier*).
- [x] `assets/css/reset.css` com normalização de estilos modernos.
- [x] Esqueletos de folhas de estilo criados: `assets/css/main.css`, `assets/css/admin.css`, `assets/css/print.css`.
- [x] Arquivos de configuração criados: `config/config.example.js` e `config/config.js`.
- [x] Esqueletos semânticos de entrada criados: `index.html` e `admin.html`.
- [x] Arquivo de contexto e governança criado na raiz: `AGENTS.md`.
- [x] Documento de guia de execução criado: `README.md`.
- [x] Arquivos vivos criados: `docs/PLANO.md`, `docs/STATUS.md` e `docs/ERROS.md`.
- [x] Controle de versão Git inicializado e ramo principal definido como `main`.
- [x] Arquivo `.gitignore` configurado com regras de segurança estritas (protegendo credenciais, segredos, chaves de serviço, `.env`, logs e temporários).
- [x] Arquivo `.gitattributes` configurado com normalização de quebras de linha (`LF`) e tipagem binária.
- [x] Arquivos sensíveis auditados e protegidos contra versionamento acidental.
- [x] Primeiro commit realizado (`"Estrutura inicial do projeto"`).
- [ ] Repositório remoto no GitHub conectado (pendente de ação do usuário no GitHub).
- [ ] Primeiro push para o GitHub realizado (pendente da criação do repositório remoto).

### Fase 2 - Banco de Dados, Persistência, Regras de Segurança e Migrações
- [x] Implementação de `database/firestore.rules` com regras consolidadas do FSD Seção 11.3.
- [x] Implementação de `database/firestore.indexes.json` com os índices compostos exigidos.
- [x] Implementação do utilitário executor de migrações (`database/migrations/run.js`).
- [x] Script de migração `database/migrations/001_initial_schema.js` (parâmetros do documento `configuracoes/geral`).
- [x] Script de semente `database/migrations/002_seed_presentes.js` (catálogo inicial de 20 presentes finos).
- [x] Módulo de inicialização do cliente Firebase Web SDK v10+ modular (`app/utils/firebase.js`).
- [x] Execução e teste de idempotência dos scripts de migração via Node.js CLI.

### Fase 3 - Camada de Modelos (MVC) e Módulos Utilitários
- [ ] Implementação de `app/utils/logger.js` (logs em `localStorage`).
- [ ] Implementação de `app/utils/calendar.js` (links Google Agenda e download `.ics`).
- [ ] Implementação de `app/models/ConfiguracaoModel.js` (leitura, verificação de prazo e fallback).
- [ ] Implementação de `app/models/PresenteModel.js` (leitura, listagem disponível e reserva atômica via `runTransaction`).
- [ ] Implementação de `app/models/ConfirmacaoModel.js` (registro de RSVP, índice em `nomes_confirmados` e liberação/estorno).

### Fase 4 - Módulo do Convite Digital Público (Visão do Convidado)
- [ ] Implementação de `app/views/ToastView.js` (notificações visuais e mensagens amigáveis).
- [ ] Implementação de `app/views/ConviteView.js` (hero card, contagem regressiva viva, mapa, agenda, paleta de cores).
- [ ] Implementação de `app/views/FormularioRSVPView.js` (validações, homônimos amigáveis, dropdown dinâmico, feedback e cópia de PIX).
- [ ] Implementação de `app/controllers/ConviteController.js` (orquestração do convite público).
- [ ] Estilização completa do convite em `assets/css/main.css`.
- [ ] Integração final em `index.html`.

### Fase 5 - Módulo do Painel Administrativo da Noiva
- [ ] Gate de autenticação por PIN Mestre com proteção contra força bruta e sessão em `sessionStorage`.
- [ ] Autenticação administrativa silenciosa no Firebase Auth.
- [ ] Implementação de `app/views/PainelNoivaView.js` (dashboard, contadores, formulário de prazos, cadastro de itens e tabela).
- [ ] Implementação de `app/controllers/AdminController.js` (orquestração do painel, estorno atômico de presentes e salvamento).
- [ ] Estilização completa do painel em `assets/css/admin.css`.
- [ ] Integração final em `admin.html`.

### Fase 6 - Relatórios, Exportações (CSV e Impressão/PDF) e Acabamentos Finais
- [ ] Implementação de `app/utils/export.js` (geração e download de CSV com UTF-8 BOM).
- [ ] Implementação de `assets/css/print.css` especializada para impressão sem elementos operacionais.
- [ ] Integração dos botões de exportação e impressão no painel administrativo.
- [ ] Refinamentos de transições táteis, elevação de cartões e responsividade.

### Fase 7 - Homologação, Testes Completos de Aceitação e Preparação para Deploy
- [ ] Teste em dispositivos móveis (360px a 430px) e computadores.
- [ ] Teste de reserva concorrente e atomicidade no Firestore.
- [ ] Teste do fluxo alternativo de PIX e cópia no clipboard.
- [ ] Teste da opção "Apenas confirmar presença".
- [ ] Teste da validação amigável de homônimos (RN-05).
- [ ] Teste do bloqueio por data limite expirada (RN-06).
- [ ] Teste de proteção de dados e conformidade com LGPD nas regras do Firestore.
- [ ] Teste de impressão e exportação CSV no Excel.
- [ ] Homologação de todos os 14 critérios de aceitação da Seção 26 do `docs/FSD.md`.
- [ ] Finalização do `README.md` e preparação do repositório para deploy no GitHub Pages.

---

## 4. Fase Atual

- **Fase 2 - Banco de Dados, Persistência, Regras de Segurança e Migrações** (Concluída com Sucesso).

---

## 5. Próximo Passo Recomendado

- **Iniciar a Fase 3:** Construir a Camada de Modelos (MVC) e Módulos Utilitários (`app/utils/logger.js`, `app/utils/calendar.js`, `app/models/ConfiguracaoModel.js`, `app/models/PresenteModel.js` e `app/models/ConfirmacaoModel.js`).
