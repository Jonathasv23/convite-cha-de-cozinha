# STATUS DO PROJETO

**Sistema:** Convite Digital e Lista de Presentes para Chá de Cozinha  
**Identidade Visual:** *Botanical Heritage Atelier*  
**Noivos:** Hevelyn & Jonathas  
**Última Atualização:** 20/09/2026 - Conclusão da Fase 4 (Módulo do Convite Digital Público - Visão do Convidado)  

---

## 1. Estado Atual do Projeto

A camada visual e de orquestração do convite público (`index.html`) foi implementada e testada com 100% de sucesso na **Fase 4**:
- **Identidade e Nomes Atualizados:** Casal definido oficialmente como **Hevelyn & Jonathas**.
- `app/views/ToastView.js`: Componente singleton para feedback visual instantâneo (sucesso, aviso, erro, cópia) com estética de papelaria fina e sanitização contra XSS.
- `app/views/ConviteView.js`: Renderização do Hero Card com monograma botânico refinado em SVG ("H & J"), nomes dos noivos em *EB Garamond Display*, data/local, contagem regressiva viva calculada a cada segundo, ações logísticas (Google Maps e menu de calendário para Google Agenda e download de `.ics` via RFC 5545) e vitrine da paleta de cores sugerida.
- `app/views/FormularioRSVPView.js`: Formulário integrado de RSVP com suporte a presentes físicos (com estoque disponível), opção de contribuição via PIX e confirmação exclusiva de presença; checagem amigável de homônimos em tempo real (RN-05); feedback comemorativo nominal e caixa de chave PIX com botão de cópia instantânea integrado à Clipboard API; e bloqueio gracioso por prazo expirado (RN-06).
- `app/controllers/ConviteController.js`: Orquestrador MVC da visão pública, integrando os dados dinâmicos do Firestore/fallback, temporizador do countdown, tratamento de envio e recuperação graciosa de concorrência (`ESGOTADO`).
- `assets/css/main.css`: Estilização completa e refinada seguindo rigorosamente os tokens de `assets/css/variables.css` (*Botanical Heritage Atelier*), com sombras táteis, pseudo-bordas de papelaria e total responsividade *mobile-first* (360px a 1120px).
- `index.html`: Marcação semântica HTML5 acessível com integração modular ES6.
- Todos os 30 testes automatizados (21 da Fase 3 + 9 da Fase 4) foram aprovados com 100% de êxito (`npm test`).

O projeto encontra-se pronto para a implementação da **Fase 5 - Módulo do Painel Administrativo da Noiva**.

---

## 2. Visão Geral das Fases

| Fase | Descrição | Status |
| :--- | :--- | :---: |
| **Fase 1** | Infraestrutura, Estrutura Base, Design Tokens e Controle de Versão (Git/GitHub) | **Concluída** |
| **Fase 2** | Banco de Dados, Persistência, Regras de Segurança e Migrações | **Concluída** |
| **Fase 3** | Camada de Modelos (MVC) e Módulos Utilitários | **Concluída** |
| **Fase 4** | Módulo do Convite Digital Público (Visão do Convidado) | **Concluída** |
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

- **Fase 4 - Módulo do Convite Digital Público (Visão do Convidado)** (Concluída com Sucesso).

---

## 5. Próximo Passo Recomendado

- **Iniciar a Fase 5:** Construir o Módulo do Painel Administrativo da Noiva (`admin.html`, `app/views/PainelNoivaView.js`, `app/controllers/AdminController.js` e `assets/css/admin.css`).

