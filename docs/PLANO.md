# Plano de Construção Incremental do Sistema

**Sistema:** Convite Digital e Lista de Presentes para Chá de Cozinha  
**Identidade Visual:** *Botanical Heritage Atelier*  
**Base de Especificação:** `docs/FSD.md` e `docs/DESIGN.md`  
**Data:** 20/09/2026  
**Status do Plano:** Aprovado e em Execução  

---

## Visão Geral da Estratégia de Construção

O desenvolvimento do sistema é organizado em fases sequenciais, modulares e testáveis, respeitando o padrão arquitetural **MVC Client-Side**, a política de **Zero Bundlers / Zero Dependências Pesadas** (HTML5, Vanilla JS ES6+, CSS3 com Custom Properties), persistência em tempo real via **Firebase Firestore** (plano Spark) e hospedagem estática exclusiva no **GitHub Pages** com desenvolvimento e testes locais no **VS Code**.

---

## Fases Incrementais de Implementação

```text
Fase 1 - Infraestrutura, Estrutura Base e Design Tokens
Fase 2 - Banco de Dados, Persistência, Regras de Segurança e Migrações
Fase 3 - Camada de Modelos (MVC) e Módulos Utilitários
Fase 4 - Módulo do Convite Digital Público (Visão do Convidado)
Fase 5 - Módulo do Painel Administrativo da Noiva
Fase 6 - Relatórios, Exportações (CSV e Impressão/PDF) e Acabamentos Finais
Fase 7 - Homologação, Testes Completos de Aceitação e Preparação para Deploy
```

---

### Fase 1 - Infraestrutura, Estrutura Base e Design Tokens

- **Objetivo da Fase:**
  Preparar todo o alicerce do projeto, criando a estrutura completa de pastas e arquivos base, configurando os tokens de design do *Botanical Heritage Atelier* em variáveis CSS (`assets/css/variables.css`), o reset de estilos (`assets/css/reset.css`), os esqueletos das folhas de estilo (`main.css`, `admin.css`, `print.css`), o arquivo de configuração estática e parâmetros do Firebase (`config/config.js` e `config/config.example.js`), os esqueletos HTML semânticos iniciais (`index.html` e `admin.html`) e a governança documental (`AGENTS.md`, `docs/PLANO.md`, `docs/STATUS.md`, `docs/ERROS.md`).

- **Checklist de Tarefas:**
  - [x] Criação da árvore de pastas: `config/`, `database/migrations/`, `app/models/`, `app/views/`, `app/controllers/`, `app/utils/`, `assets/css/`, `assets/js/`, `assets/images/`.
  - [x] Criação de `assets/css/variables.css` com a totalidade dos tokens de cor, tipografia (EB Garamond e Manrope), sombras táteis de papelaria, espaçamentos e raios de borda extraídos do `docs/DESIGN.md`.
  - [x] Criação de `assets/css/reset.css` com normalização moderna de elementos, `box-sizing: border-box` e acessibilidade.
  - [x] Criação de `assets/css/main.css`, `assets/css/admin.css` e `assets/css/print.css` como bases desacopladas de estilização.
  - [x] Criação de `config/config.example.js` e `config/config.js` com a estrutura de parâmetros estáticos do evento (nomes dos noivos, data, endereço, link Google Maps, paleta de cores, PIN mestre padrão, credencial admin e credenciais públicas do Firebase).
  - [x] Criação dos esqueletos semânticos de `index.html` e `admin.html` importando as fontes oficiais do Google Fonts (*EB Garamond* e *Manrope*) e vinculando os arquivos CSS correspondentes.
  - [x] Criação do `README.md` com guia de desenvolvimento local no VS Code (Live Server) e orientações de deploy no GitHub Pages.
  - [x] Criação do arquivo de contexto `AGENTS.md` com regras de segurança, protocolo de arquivos vivos e caminhos portáveis.
  - [x] Criação dos arquivos vivos `docs/PLANO.md`, `docs/STATUS.md` e `docs/ERROS.md`.

- **Critérios de Pronto:**
  - Árvore de diretórios estruturada conforme a Seção 5.2 do `docs/FSD.md`.
  - Folha de variáveis CSS (`variables.css`) 100% alinhada ao `docs/DESIGN.md`.
  - Páginas `index.html` e `admin.html` abrindo no navegador sem erros de sintaxe ou de importação 404.
  - Nenhuma credencial privada versionada no repositório.
  - `AGENTS.md` contendo apenas caminhos relativos portáveis.

- **Arquivos e Pastas Alterados/Criados:**
  - `AGENTS.md`
  - `README.md`
  - `index.html`
  - `admin.html`
  - `docs/PLANO.md`
  - `docs/STATUS.md`
  - `docs/ERROS.md`
  - `config/config.example.js`
  - `config/config.js`
  - `assets/css/variables.css`
  - `assets/css/reset.css`
  - `assets/css/main.css`
  - `assets/css/admin.css`
  - `assets/css/print.css`
  - Pastas em `app/`, `database/` e `assets/`

- **Observações de Dependência:**
  - Fase fundacional. Não possui dependências prévias.

---

### Fase 2 - Banco de Dados, Persistência, Regras de Segurança e Migrações

- **Objetivo da Fase:**
  Configurar a camada declarativa de persistência no Firebase Firestore, implementar as regras estritas de segurança em conformidade com a LGPD e atomicidade (`database/firestore.rules`), definir os índices compostos de consulta (`database/firestore.indexes.json`) e criar os scripts versionados e idempotentes de migração/semente de dados (`database/migrations/`).

- **Checklist de Tarefas:**
  - [x] Implementação de `database/firestore.rules` com regras consolidadas da Seção 11.3 do FSD (bloqueio público de listagem de confirmações, criação validada, consulta unitária ao índice `nomes_confirmados`, decremento atômico de presentes e controle de escrita restrito à noiva).
  - [x] Implementação de `database/firestore.indexes.json` com os índices compostos de `presentes` (`ativo` ASC + `quantidade_disponivel` DESC + `nome` ASC) e `confirmacoes` (`tipo_escolha` ASC + `criado_em` DESC).
  - [x] Implementação do executor de migrações (`database/migrations/run.js`) compatível com Node.js para setup inicial e carga controlada.
  - [x] Criação do script de schema e parâmetros iniciais (`database/migrations/001_initial_schema.js`) para popular o documento `configuracoes/geral` com idempotência via coleção `_migrations`.
  - [x] Criação do script de semente de presentes (`database/migrations/002_seed_presentes.js`) para cadastrar a lista inicial de itens domésticos do chá em `presentes`.
  - [x] Criação de módulo de inicialização do cliente Firebase SDK Web v10+ em formato modular (`app/utils/firebase.js`).

- **Critérios de Pronto:**
  - Regras do Firestore prontas e validadas contra vazamento de dados de convidados.
  - Scripts de migração gravando e respeitando a coleção `_migrations` para impedir duplicidades.
  - Conexão funcional com a instância do Firestore.

- **Arquivos e Pastas Alterados/Criados:**
  - `database/firestore.rules`
  - `database/firestore.indexes.json`
  - `database/migrations/run.js`
  - `database/migrations/001_initial_schema.js`
  - `database/migrations/002_seed_presentes.js`
  - `app/utils/firebase.js`

- **Observações de Dependência:**
  - Depende da Fase 1 (estrutura de diretórios e `config/config.js`).

---

### Fase 3 - Camada de Modelos (MVC) e Módulos Utilitários

- **Objetivo da Fase:**
  Construir as classes e módulos de domínio (Models) responsáveis pelo estado, regras de negócio e transações no Firestore, além dos utilitários centrais de logging, formatação de datas e manipulação de calendários.

- **Checklist de Tarefas:**
  - [x] Implementação de `app/utils/logger.js`: captura de exceções em `localStorage` sob as chaves `_app_error_logs` e `_app_sec_logs`.
  - [x] Implementação de `app/utils/calendar.js`: gerador de link para Google Agenda e gerador de arquivo padronizado `.ics` (iCalendar / Apple / Outlook).
  - [x] Implementação de `app/models/ConfiguracaoModel.js`: leitura de parâmetros gerais do evento, verificação de expiração de prazo (`data_limite_confirmacao`) e fallback para constantes de `config.js`.
  - [x] Implementação de `app/models/PresenteModel.js`: listagem de presentes ativos com estoque (`quantidade_disponivel > 0`), cadastro de novos itens e transação atômica (`runTransaction`) para decremento unitário seguro contra concorrência.
  - [x] Implementação de `app/models/ConfirmacaoModel.js`: persistência de confirmação de presença (com opções `presente_item`, `pix_surpresa`, `apenas_presenca`), indexação segura em `nomes_confirmados`, checagem pontual de homônimos via `getDoc()` e liberação/estorno de itens.


- **Critérios de Pronto:**
  - Models realizam operações CRUD e transações atômicas com tratamento rigoroso de erros.
  - Consulta de homônimos operando via chave pontual sem expor a lista de convidados (LGPD).
  - Utilitários de calendário e log testados e operacionais.

- **Arquivos e Pastas Alterados/Criados:**
  - `app/utils/logger.js`
  - `app/utils/calendar.js`
  - `app/models/ConfiguracaoModel.js`
  - `app/models/PresenteModel.js`
  - `app/models/ConfirmacaoModel.js`

- **Observações de Dependência:**
  - Depende da Fase 2 (Firestore inicializado e regras configuradas).

---

### Fase 4 - Módulo do Convite Digital Público (Visão do Convidado)

- **Objetivo da Fase:**
  Implementar a interface e os controladores do convite digital público em `index.html`, apresentando a estética *Botanical Heritage Atelier*, contagem regressiva viva, botões de mapa e agenda, vitrine da paleta de cores e formulário integrado de RSVP com decremento atômico de presentes e suporte a PIX.

- **Checklist de Tarefas:**
  - [ ] Implementação de `app/views/ToastView.js`: renderização de alertas amigáveis e notificações visuais na interface.
  - [ ] Implementação de `app/views/ConviteView.js`:
    - Renderização do Hero Card com monograma botânico, nomes dos noivos, data e mensagem de acolhimento.
    - Contagem regressiva viva (dias, horas, minutos, segundos) atualizada a cada segundo.
    - Botões interativos "Como Chegar / Ver no Google Maps" e "Adicionar à Agenda".
    - Vitrine da paleta de cores com amostras e rótulos do guia de design.
  - [ ] Implementação de `app/views/FormularioRSVPView.js`:
    - Campo de nome com validação amigável de homônimo (RN-05).
    - Checkbox "Apenas confirmar presença" com desabilitação dinâmica da lista suspensa (RN-03).
    - Dropdown dinâmico de presentes disponíveis (`quantidade_disponivel > 0`) e opção destacada "Presentear com PIX / Presente surpresa" (RN-01, RN-04).
    - Cartão de sucesso após envio e área de destaque com chave PIX e botão de cópia com feedback (Clipboard API).
    - Mensagem de bloqueio serena quando a data limite tiver expirado (RN-06).
  - [ ] Implementação de `app/controllers/ConviteController.js`: orquestração dos eventos de interação, submissão de RSVP, verificação de prazos e acionamento dos models e views.
  - [ ] Montagem final do `index.html` com marcação semântica, integração aos módulos ES6 e folha de estilos `assets/css/main.css`.

- **Critérios de Pronto:**
  - Convidado consegue visualizar os dados do chá, contagem regressiva e paleta no celular e no desktop.
  - Formulário de RSVP permite confirmação com presente físico (decrementando estoque atomicamente), com PIX (exibindo chave e botão de cópia) ou com presença exclusiva.
  - Validação amigável de homônimo funciona sem bloquear o envio.
  - Formulário é bloqueado automaticamente caso o prazo configurado tenha expirado.
  - Interface visual 100% aderente ao `docs/DESIGN.md`.

- **Arquivos e Pastas Alterados/Criados:**
  - `index.html`
  - `assets/css/main.css`
  - `app/views/ToastView.js`
  - `app/views/ConviteView.js`
  - `app/views/FormularioRSVPView.js`
  - `app/controllers/ConviteController.js`

- **Observações de Dependência:**
  - Depende das Fases 1, 2 e 3.

---

### Fase 5 - Módulo do Painel Administrativo da Noiva

- **Objetivo da Fase:**
  Construir a área administrativa do sistema em `admin.html`, incluindo barreira de segurança por PIN Mestre, autenticação silenciosa no Firebase, dashboard com contadores consolidados em tempo real, controle dinâmico do prazo de RSVP, cadastro rápido de presentes e tabela de convidados com estorno/liberação de itens.

- **Checklist de Tarefas:**
  - [ ] Implementação do Gate de Acesso por PIN Mestre: tela de bloqueio em `admin.html`, verificação do PIN definido em `config.js`, autenticação silenciosa no Firebase Auth (`signInWithEmailAndPassword`), gravação em `sessionStorage` e bloqueio de força bruta após 5 tentativas consecutivas.
  - [ ] Implementação de `app/views/PainelNoivaView.js`:
    - Barra de navegação com título e botão de encerramento de sessão ("Sair / Bloquear").
    - Cards de resumo (contadores: Total de Confirmados, Total de Presentes Escolhidos, Presentes Disponíveis).
    - Formulário de ajuste do prazo limite (`datetime-local`), chave PIX e mensagem de boas-vindas.
    - Formulário de cadastro rápido de novos presentes (nome e quantidade total).
    - Tabela de convidados confirmados com ordenação por data, indicação de escolha e botão "Liberar Presente".
    - Estado vazio estilizado para a tabela de convidados.
  - [ ] Implementação de `app/controllers/AdminController.js`:
    - Validação de sessão e PIN Mestre.
    - Carregamento e atualização dos contadores em tempo real.
    - Gravação de alterações de prazo, PIX e mensagem no Firestore.
    - Cadastro de novos itens no catálogo de presentes.
    - Execução da liberação de presente com confirmação em modal, estornando `+1` na `quantidade_disponivel` e alterando o registro do convidado para "apenas_presenca" com carimbo em `liberado_em` (RN-07).
  - [ ] Montagem final de `admin.html` e folha de estilos `assets/css/admin.css`.

- **Critérios de Pronto:**
  - Rota `admin.html` completamente inacessível sem a digitação do PIN correto.
  - Noiva visualiza os contadores corretos calculados a partir dos dados do Firestore (RN-08).
  - Noiva consegue prorrogar o prazo, cadastrar novos presentes e estornar itens liberando-os de volta para a lista do convite.
  - Sessão administrativa expira ao fechar a aba ou ao clicar em sair.

- **Arquivos e Pastas Alterados/Criados:**
  - `admin.html`
  - `assets/css/admin.css`
  - `app/views/PainelNoivaView.js`
  - `app/controllers/AdminController.js`

- **Observações de Dependência:**
  - Depende das Fases 1, 2 e 3.

---

### Fase 6 - Relatórios, Exportações (CSV e Impressão/PDF) e Acabamentos Finais

- **Objetivo da Fase:**
  Implementar os recursos de exportação e impressão de dados do painel da noiva, garantindo download de planilha CSV com suporte a caracteres da língua portuguesa (UTF-8 BOM) e folha de impressão limpa e diagramada (`@media print`), além de refinamentos visuais e transições sutis.

- **Checklist de Tarefas:**
  - [ ] Implementação de `app/utils/export.js`: rotina para compilação da lista de convidados em formato CSV delimitado por ponto e vírgula (`;`), com cabeçalho UTF-8 BOM (`\uFEFF`) e disparo de download automático de `lista_convidados_cha_[DATA].csv`.
  - [ ] Implementação completa de `assets/css/print.css`:
    - Ocultação de menus, botões operacionais, contadores interativos, formulários e gate de PIN.
    - Cabeçalho limpo com nomes dos noivos e data de emissão.
    - Tabela diagramada em preto e tons de cinza elegantes com `page-break-inside: avoid`.
    - Resumo final impresso com totais de confirmações.
  - [ ] Integração dos botões "Imprimir / Salvar em PDF" e "Baixar Planilha (CSV)" no `admin.html` e no `AdminController.js`.
  - [ ] Refinamentos visuais em `assets/css/main.css` e `assets/css/admin.css` (transições táteis, elevações suaves, foco nos inputs e responsividade fina).

- **Critérios de Pronto:**
  - Clique em "Exportar CSV" baixa planilha legível perfeitamente no Excel sem falhas de acentuação.
  - Acionamento de `window.print()` exibe folha de impressão diagramada e livre de botões ou controles operacionais.

- **Arquivos e Pastas Alterados/Criados:**
  - `app/utils/export.js`
  - `assets/css/print.css`
  - `assets/css/admin.css`
  - `admin.html`

- **Observações de Dependência:**
  - Depende da Fase 5 (dados de convidados e painel implementados).

---

### Fase 7 - Homologação, Testes Completos de Aceitação e Preparação para Deploy

- **Objetivo da Fase:**
  Executar a bateria completa de validações funcionais, de concorrência, responsividade mobile-first e conformidade com a LGPD contra os critérios de aceitação da Seção 26 do `docs/FSD.md`, finalizando a documentação para deploy estático no GitHub Pages.

- **Checklist de Tarefas:**
  - [ ] Teste de responsividade mobile-first emulando dispositivos de 360px a 430px (smartphones), 768px a 1024px (tablets) e telas desktop.
  - [ ] Teste da concorrência na reserva de presentes (transação atômica e prevenção de estoque negativo).
  - [ ] Teste da opção "Apenas confirmar presença" e do fluxo de contribuição via PIX (cópia no clipboard).
  - [ ] Teste do aviso de homônimo amigável sem bloqueio de envio.
  - [ ] Teste do bloqueio automático por data limite expirada.
  - [ ] Teste do gate de PIN, bloqueio de força bruta e encerramento de sessão administrativa.
  - [ ] Teste de estorno de presente e devolução automática ao catálogo público.
  - [ ] Teste de segurança: verificação de que chamadas diretas de leitura à coleção `confirmacoes` sem autenticação são bloqueadas pelo Firestore.
  - [ ] Atualização final de `README.md` com instruções detalhadas de publicação no GitHub Pages e configuração do console do Firebase.
  - [ ] Atualização de encerramento em `docs/STATUS.md`.

- **Critérios de Pronto:**
  - Todos os 14 critérios de aceitação da Seção 26 do `docs/FSD.md` cumpridos com 100% de êxito.
  - Repositório pronto para publicação direta no GitHub Pages.

- **Arquivos e Pastas Alterados/Criados:**
  - `README.md`
  - `docs/STATUS.md`
  - `docs/ERROS.md`

- **Observações de Dependência:**
  - Depende da conclusão de todas as fases anteriores (Fases 1 a 6).
