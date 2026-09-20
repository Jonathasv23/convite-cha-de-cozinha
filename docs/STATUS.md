# STATUS DO PROJETO

**Sistema:** Convite Digital e Lista de Presentes para Chá de Cozinha  
**Identidade Visual:** *Botanical Heritage Atelier*  
**Noivos:** Hevelyn & Jonathas  
**Última Atualização:** 20/09/2026 - Conclusão da Fase 5 (Módulo do Painel Administrativo da Noiva)  

---

## 1. Estado Atual do Projeto

O módulo administrativo completo foi implementado e testado com 100% de sucesso na **Fase 5**:
- **Gate de Acesso por PIN Mestre:** Tela de bloqueio estilizada em alta papelaria com solicitação do PIN Mestre (`2026`), proteção contra força bruta (bloqueio temporário de 5 minutos após 5 tentativas incorretas com contagem regressiva) e auditoria de segurança (`logSecurity`).
- **Autenticação e Sessão Segura:** Sessão volátil salva em `sessionStorage` (expira ao fechar a aba) e autenticação silenciosa no Firebase Auth (`signInWithEmailAndPassword`) vinculada às regras declarativas do Firestore.
- **Dashboard de Métricas em Tempo Real (RN-08):** 3 cartões elegantes com números proeminentes em *EB Garamond* e rótulos em *Manrope* (Total de Confirmados, Presentes Escolhidos e Itens Ainda Disponíveis).
- **Gestão Operacional de Prazos e Parâmetros:** Formulário com seletor `datetime-local` para prorrogar/antecipar o prazo limite de RSVP, alteração da chave PIX e edição da mensagem de boas-vindas com persistência dinâmica (`ConfiguracaoModel.salvarConfiguracoes()`).
- **Cadastro Rápido de Novos Presentes:** Inclusão instantânea de novos itens com nome e quantidade inicial, recalculando imediatamente os contadores e disponibilizando o item no convite.
- **Tabela de Convidados Confirmados e Estorno Atômico (RN-07):** Listagem com badges refinados de modalidade, data/hora da confirmação e botão "Liberar Item", acionando modal de confirmação, devolvendo `+1` unidade ao estoque e preservando a presença histórica do convidado como `apenas_presenca`.
- **Estilização Refinada (`assets/css/admin.css`):** 100% alinhada aos tokens do `docs/DESIGN.md` (*Botanical Heritage Atelier*), com suporte *mobile-first* (360px a 1120px) e acabamento tátil de papelaria fina.
- **Compatibilidade Universal:** `admin.html` estruturado com suporte modular ES6 e bundle autônomo `assets/js/admin.bundle.js` para funcionamento tanto em servidores estáticos/GitHub Pages quanto em duplo clique local (`file:///`).
- **Testes Automatizados:** Todos os 38 testes automatizados (21 da Fase 3 + 9 da Fase 4 + 8 da Fase 5) foram aprovados com 100% de êxito (`npm test`).

O projeto encontra-se pronto para a implementação da **Fase 6 - Relatórios, Exportações (CSV e Impressão/PDF) e Acabamentos Finais**.

---

## 2. Visão Geral das Fases

| Fase | Descrição | Status |
| :--- | :--- | :---: |
| **Fase 1** | Infraestrutura, Estrutura Base, Design Tokens e Controle de Versão (Git/GitHub) | **Concluída** |
| **Fase 2** | Banco de Dados, Persistência, Regras de Segurança e Migrações | **Concluída** |
| **Fase 3** | Camada de Modelos (MVC) e Módulos Utilitários | **Concluída** |
| **Fase 4** | Módulo do Convite Digital Público (Visão do Convidado) | **Concluída** |
| **Fase 5** | Módulo do Painel Administrativo da Noiva | **Concluída** |
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
- [x] Arquivo `.gitignore` configurado com regras de segurança estritas.
- [x] Arquivo `.gitattributes` configurado com normalização de quebras de linha (`LF`).
- [x] Primeiro commit realizado (`"Estrutura inicial do projeto"`).

### Fase 2 - Banco de Dados, Persistência, Regras de Segurança e Migrações
- [x] Implementação de `database/firestore.rules` com regras consolidadas do FSD Seção 11.3.
- [x] Implementação de `database/firestore.indexes.json` com os índices compostos exigidos.
- [x] Implementação do utilitário executor de migrações (`database/migrations/run.js`).
- [x] Script de migração `database/migrations/001_initial_schema.js`.
- [x] Script de semente `database/migrations/002_seed_presentes.js`.
- [x] Módulo de inicialização do cliente Firebase Web SDK v10+ modular (`app/utils/firebase.js`).
- [x] Execução e teste de idempotência dos scripts de migração via Node.js CLI.

### Fase 3 - Camada de Modelos (MVC) e Módulos Utilitários
- [x] Implementação de `app/utils/logger.js` (logs de erros e segurança em `localStorage`).
- [x] Implementação de `app/utils/calendar.js` (links Google Agenda, download `.ics` RFC 5545 e formatação em PT-BR).
- [x] Implementação de `app/models/ConfiguracaoModel.js` (leitura de prazos, verificação de expiração RN-06 e fallback para `config.js`).
- [x] Implementação de `app/models/PresenteModel.js` (listagem disponível RN-01, cadastro com validações e reserva atômica via `runTransaction` RN-02).
- [x] Implementação de `app/models/ConfirmacaoModel.js` (normalização de nomes, verificação amigável de homônimos via busca pontual sem expor convidados RN-05, confirmação nas 3 modalidades, liberação de presentes RN-07 e métricas RN-08).
- [x] Suite de testes unitários automatizados cobrindo todos os métodos e cenários de erro (`node tests/fase3_tests.js`).

### Fase 4 - Módulo do Convite Digital Público (Visão do Convidado)
- [x] Implementação de `app/views/ToastView.js` (notificações visuais elegantes, acessíveis e seguras contra XSS).
- [x] Implementação de `app/views/ConviteView.js` (hero card com monograma botânico "H & J", contagem regressiva viva, links de mapa e agenda, vitrine da paleta de cores).
- [x] Implementação de `app/views/FormularioRSVPView.js` (campo de nome, alerta amigável de homônimo RN-05, toggle apenas presença RN-03, dropdown de presentes RN-01, feedback com chave PIX e botão de cópia com Clipboard API RN-04, bloqueio por encerramento de prazo RN-06).
- [x] Implementação de `app/controllers/ConviteController.js` (orquestração da interface pública, contagem regressiva viva e submissão com concorrência).
- [x] Estilização completa do convite em `assets/css/main.css` (*Botanical Heritage Atelier*, responsivo para mobile 360px a desktop).
- [x] Integração final de marcação semântica em `index.html`.
- [x] Suite de testes automatizados com 9 asserções cobrindo views, templates, contagem, sanitização e concorrência (`node tests/fase4_tests.js`).

### Fase 5 - Módulo do Painel Administrativo da Noiva
- [x] Gate de autenticação por PIN Mestre com proteção contra força bruta e sessão em `sessionStorage`.
- [x] Autenticação administrativa silenciosa no Firebase Auth (`signInWithEmailAndPassword`).
- [x] Implementação de `app/views/PainelNoivaView.js` (dashboard, contadores, formulário de prazos, cadastro de itens e tabela).
- [x] Implementação de `app/controllers/AdminController.js` (orquestração do painel, estorno atômico de presentes e salvamento).
- [x] Estilização completa do painel em `assets/css/admin.css` (*Botanical Heritage Atelier*).
- [x] Integração final em `admin.html` com suporte a ES6 Modules e fallback universal `admin.bundle.js`.
- [x] Suíte de testes automatizados com 8 asserções cobrindo PIN, força bruta, métricas, novo presente e estorno atômico (`node tests/fase5_tests.js`).

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

- **Fase 5 - Módulo do Painel Administrativo da Noiva** (Concluída com Sucesso).

---

## 5. Próximo Passo Recomendado

- **Iniciar a Fase 6:** Relatórios, Exportações (CSV e Impressão/PDF) e Acabamentos Finais (`app/utils/export.js`, `assets/css/print.css`, refinamentos táteis).

