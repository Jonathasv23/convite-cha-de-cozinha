# STATUS DO PROJETO

**Sistema:** Convite Digital e Lista de Presentes para Chá de Cozinha  
**Identidade Visual:** *Botanical Heritage Atelier*  
**Última Atualização:** 20/09/2026 - Controle de versão Git configurado e pronto para envio ao GitHub  

---

## 1. Estado Atual do Projeto

O terreno do projeto foi preparado com sucesso. A estrutura base de pastas e arquivos foi criada rigorosamente conforme a Seção 5.2 do `docs/FSD.md` e os tokens de design do `docs/DESIGN.md`. Foram gerados o plano de construção incremental (`docs/PLANO.md`), o arquivo de contexto para agentes de IA (`AGENTS.md`), o registro vivo de status (`docs/STATUS.md`), o diário de erros (`docs/ERROS.md`), as folhas de estilo base com variáveis CSS táteis, os parâmetros de configuração e os esqueletos semânticos de entrada.

Adicionalmente, o controle de versão foi inicializado com Git (`branch -M main`), com arquivos `.gitignore` e `.gitattributes` estritamente alinhados à stack e às regras de segurança (bloqueando credenciais, chaves de serviço, arquivos `.env`, caches e logs). O primeiro commit estrutural foi realizado, aguardando a conexão do repositório remoto no GitHub para o envio (push) inicial.

Nenhuma funcionalidade de negócio principal foi implementada prematuramente nesta etapa, respeitando estritamente o isolamento da Fase 1.

---

## 2. Visão Geral das Fases

| Fase | Descrição | Status |
| :--- | :--- | :---: |
| **Fase 1** | Infraestrutura, Estrutura Base, Design Tokens e Controle de Versão (Git/GitHub) | **Concluída** |
| **Fase 2** | Banco de Dados, Persistência, Regras de Segurança e Migrações | *Pendente* |
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
- [ ] Implementação de `database/firestore.rules` com regras consolidadas do FSD Seção 11.3.
- [ ] Implementação de `database/firestore.indexes.json` com os índices compostos exigidos.
- [ ] Implementação do utilitário executor de migrações (`database/migrations/run.js`).
- [ ] Script de migração `database/migrations/001_initial_schema.js` (parâmetros do documento `configuracoes/geral`).
- [ ] Script de semente `database/migrations/002_seed_presentes.js` (catálogo inicial de presentes).
- [ ] Módulo de inicialização do cliente Firebase Web SDK v10+ modular (`app/utils/firebase.js`).

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

- **Fase 1 - Infraestrutura, Estrutura Base e Design Tokens** (Concluída).

---

## 5. Próximo Passo Recomendado

- **Iniciar a Fase 2:** Implementar a camada de persistência e segurança do Firestore (`database/firestore.rules`, `database/firestore.indexes.json`, `app/utils/firebase.js` e scripts versionados de migração em `database/migrations/`).
