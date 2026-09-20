# STATUS DO PROJETO

**Sistema:** Convite Digital e Lista de Presentes para Chá de Cozinha  
**Identidade Visual:** *Botanical Heritage Atelier*  
**Última Atualização:** 20/09/2026 - Conclusão da Fase 3 (Camada de Modelos e Módulos Utilitários)  

---

## 1. Estado Atual do Projeto

A camada de domínio e utilitários da arquitetura MVC client-side foi implementada e testada com 100% de sucesso na **Fase 3**:
- `app/utils/logger.js`: Módulo de logging de erros operacionais (`_app_error_logs`) e eventos de segurança (`_app_sec_logs`) com limite FIFO de 50 registros e fallback seguro em memória.
- `app/utils/calendar.js`: Gerador de URLs padronizadas para Google Agenda, gerador de arquivos iCalendar RFC 5545 (`.ics`) para Apple Calendar e Outlook, além de formatadores de data para português do Brasil.
- `app/models/ConfiguracaoModel.js`: Gerenciamento do documento `configuracoes/geral`, verificação de expiração de prazo (`data_limite_confirmacao` - RN-06), fallback transparente para `config/config.js` e persistência de alterações da noiva.
- `app/models/PresenteModel.js`: Listagem de presentes ativos com estoque (`quantidade_disponivel > 0` - RN-01), cadastro de itens com validação, reserva atômica via `runTransaction` prevenindo estoque negativo (RN-02), estorno/devolução de itens (+1) e soft delete.
- `app/models/ConfirmacaoModel.js`: Normalização de nomes, verificação amigável de homônimos via busca pontual em conformidade estrita com a LGPD (RN-05), submissão de confirmações nas 3 modalidades (presente físico, PIX/surpresa e apenas presença), liberação de presentes com devolução ao inventário (RN-07) e consolidação em tempo real das métricas do dashboard (RN-08).
- Todos os 21 testes unitários automatizados cobrindo a totalidade dos models e utilitários passaram com êxito (`npm test`).

O projeto encontra-se perfeitamente estruturado e pronto para a construção do Módulo do Convite Digital Público (Visão do Convidado) na **Fase 4**.

---

## 2. Visão Geral das Fases

| Fase | Descrição | Status |
| :--- | :--- | :---: |
| **Fase 1** | Infraestrutura, Estrutura Base, Design Tokens e Controle de Versão (Git/GitHub) | **Concluída** |
| **Fase 2** | Banco de Dados, Persistência, Regras de Segurança e Migrações | **Concluída** |
| **Fase 3** | Camada de Modelos (MVC) e Módulos Utilitários | **Concluída** |
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
- [x] Implementação de `app/utils/logger.js` (logs de erros e segurança em `localStorage` com limite de 50 registros e fallback em memória).
- [x] Implementação de `app/utils/calendar.js` (links Google Agenda, download `.ics` RFC 5545 e formatação em PT-BR).
- [x] Implementação de `app/models/ConfiguracaoModel.js` (leitura de prazos, verificação de expiração RN-06 e fallback para `config.js`).
- [x] Implementação de `app/models/PresenteModel.js` (listagem disponível RN-01, cadastro com validações e reserva atômica via `runTransaction` RN-02).
- [x] Implementação de `app/models/ConfirmacaoModel.js` (normalização de nomes, verificação amigável de homônimos via busca pontual sem expor convidados RN-05, confirmação nas 3 modalidades, liberação de presentes RN-07 e métricas RN-08).
- [x] Suite de testes unitários automatizados com 21 asserções cobrindo todos os métodos e cenários de erro (`npm test`).

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

- **Fase 3 - Camada de Modelos (MVC) e Módulos Utilitários** (Concluída com Sucesso).

---

## 5. Próximo Passo Recomendado

- **Iniciar a Fase 4:** Construir o Módulo do Convite Digital Público (Visão do Convidado) (`app/views/ToastView.js`, `app/views/ConviteView.js`, `app/views/FormularioRSVPView.js`, `app/controllers/ConviteController.js`, `assets/css/main.css` e integração em `index.html`).

