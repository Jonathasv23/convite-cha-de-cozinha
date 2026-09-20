# Convite Digital e Lista de Presentes para Chá de Cozinha
**Conceito Visual:** *Botanical Heritage Atelier*  
**Noivos:** Hevelyn & Jonathas  
**Status do Projeto:** Homologado e Pronto para Publicação (Fase 7 Concluída)

Aplicação web estática moderna, responsiva (*mobile-first*) e integrada ao banco de dados em nuvem **Firebase Firestore** (plano gratuito Spark) e **Firebase Auth**, desenvolvida para a confirmação de presença (RSVP) e reserva de presentes sem duplicação de itens, estorno transparente e total conformidade com a LGPD.

---

## 1. Stack Tecnológica e Arquitetura

- **Frontend:** HTML5 semântico, JavaScript moderno (Vanilla JS ES6+ Modules) sem dependência de transpilação ou empacotamento (*Zero Bundlers / Zero Dependências Pesadas*).
- **Compatibilidade Universal:** Possui bundles autônomos (`assets/js/app.bundle.js` e `assets/js/admin.bundle.js`) que garantem carregamento perfeito inclusive em duplo clique local (`file:///`) sem erros de CORS.
- **Estilização:** CSS3 moderno utilizando Custom Properties (variáveis CSS extraídas de `docs/DESIGN.md`), CSS Grid, Flexbox e folha especializada para impressão (`@media print`). Sem Tailwind, sem Bootstrap.
- **Banco de Dados / Nuvem:** **Firebase Firestore** (plano Spark) com transações atômicas (`runTransaction`) e regras declarativas de segurança.
- **Autenticação Administrativa:** Firebase Auth com login administrativo silencioso vinculado ao PIN Mestre da noiva (`request.auth != null`).
- **Tipografia:** Google Fonts carregando as famílias **EB Garamond** (display, títulos e citações) e **Manrope** (textos corridos, formulários e botões) com `font-display: swap`.
- **Padrão Arquitetural:** **MVC (Model-View-Controller) Client-Side** desacoplado:
  - `app/models/`: Estado, validações de integridade, transações atômicas e regras de negócio.
  - `app/views/`: Manipulação do DOM, renderização de templates, estados visuais e toasts/feedbacks.
  - `app/controllers/`: Intermediação de eventos, orquestração de models e views.
  - `app/utils/`: Utilitários isolados (calendários Google e `.ics`, exportador CSV com UTF-8 BOM, logger local).
- **Sem Backend Centralizado Próprio:** Toda a orquestração roda no navegador, servida estaticamente pelo GitHub Pages.
- **Sem Arquivo `.env`:** Parâmetros estruturais e credenciais públicas do Firebase gerenciados no módulo `config/config.js`.

---

## 2. Estrutura de Diretórios Portável

```text
.
├── README.md                 # Este guia de configuração, desenvolvimento e deploy
├── index.html                # Ponto de entrada público do convite (visão do convidado)
├── admin.html                # Ponto de entrada administrativo (painel da noiva)
├── AGENTS.md                 # Regras e governança para agentes de IA
├── package.json              # Scripts de testes e migrações
├── docs/                     # Documentações de engenharia e governança
│   ├── FSD.md                # Especificação Funcional e Técnica (fonte primária da verdade)
│   ├── DESIGN.md             # Guia de design e tokens visuais (Botanical Heritage Atelier)
│   ├── INSUMOS.md            # Inventário de insumos e arquivos de apoio
│   ├── PLANO.md              # Plano de construção incremental por fases
│   ├── STATUS.md             # Arquivo vivo de status e progresso
│   └── ERROS.md              # Diário de erros encontrados e lições aprendidas
├── config/                   # Configurações do evento e Firebase
│   ├── config.example.js     # Modelo de configuração sem credenciais
│   └── config.js             # Parâmetros oficiais do evento e credenciais públicas
├── database/                 # Persistência e regras de nuvem do Firestore
│   ├── firestore.rules       # Regras declarativas de segurança (LGPD e atomicidade)
│   ├── firestore.indexes.json# Definições de índices compostos
│   └── migrations/           # Scripts versionados e idempotentes de inicialização
│       ├── run.js            # Utilitário Node.js para execução das migrações
│       ├── 001_initial_schema.js
│       └── 002_seed_presentes.js
├── app/                      # Código-fonte MVC Client-Side
│   ├── models/               # ConfiguracaoModel, PresenteModel, ConfirmacaoModel
│   ├── views/                # ConviteView, FormularioRSVPView, PainelNoivaView, ToastView
│   ├── controllers/          # ConviteController, AdminController
│   └── utils/                # calendar.js, export.js, logger.js, firebase.js
├── assets/                   # Recursos estáticos servidos publicamente
│   ├── css/                  # variables.css, reset.css, main.css, admin.css, print.css
│   ├── js/                   # app.bundle.js, admin.bundle.js
│   └── images/               # Ícones botânicos e grafismos vetorizados
└── tests/                    # Suítes de testes automatizados das Fases 3 a 7
    ├── fase3_tests.js        # Modelos e Utilitários (21 testes)
    ├── fase4_tests.js        # Convite Público e RSVP (9 testes)
    ├── fase5_tests.js        # Painel da Noiva e PIN (8 testes)
    ├── fase6_tests.js        # CSV, Impressão e Acabamentos (8 testes)
    └── fase7_tests.js        # Homologação dos 14 Critérios do FSD (15 testes)
```

---

## 3. Como Rodar em Desenvolvimento Local

Você pode executar a aplicação de três formas práticas:

### Modo A: Abertura Direta (Duplo Clique)
Dê um duplo clique diretamente no arquivo `index.html` ou `admin.html` no Windows Explorer / Gerenciador de Arquivos. A aplicação conta com bundles autônomos que carregam imediatamente via protocolo `file:///`, dispensando qualquer servidor web para testes visuais rápidos.

### Modo B: Extensão Live Server no VS Code (Recomendado)
1. Abra a pasta do projeto no **VS Code**.
2. Clique no botão **"Go Live"** na barra inferior (ou clique com o botão direito em `index.html` -> *"Open with Live Server"*).
3. O convite abrirá em `http://127.0.0.1:5500/`.
4. O painel administrativo da noiva estará acessível em `http://127.0.0.1:5500/admin.html`.

### Modo C: Servidor Estático via Terminal (Node ou Python)
```bash
# Com Node.js instalado:
npx serve .

# Ou com Python 3 instalado:
python -m http.server 5500
```

> **Credencial de Acesso Administrativo para Teste Local:**  
> **PIN Mestre Padrão:** `0523`

---

## 4. Bateria de Testes Automatizados

O sistema conta com **61 asserções de testes automatizados** distribuídas em 5 suítes cobrindo todas as camadas do sistema, regras de negócio e critérios de aceitação:

```bash
# Executar a bateria completa de todas as fases (61 testes):
npm test

# Executar individualmente por fase:
npm run test:fase3   # Testes unitários de Models e Utils (21 testes)
npm run test:fase4   # Testes do Convite Público e RSVP (9 testes)
npm run test:fase5   # Testes do Painel da Noiva e Gate de PIN (8 testes)
npm run test:fase6   # Testes de Exportação CSV e Impressão (8 testes)
npm run test:fase7   # Testes de Homologação dos 14 Critérios do FSD (15 testes)
```

---

## 5. Configuração no Firebase (Produção)

Para conectar o site à sua base de dados oficial no Firebase:

1. **Criar Projeto:** Acesse o [Firebase Console](https://console.firebase.google.com/) e crie um novo projeto no plano gratuito Spark.
2. **Criar Banco Cloud Firestore:**
   - No menu lateral, acesse **Build** -> **Firestore Database** -> **Criar banco de dados**.
   - Selecione o local mais próximo (ex: `southamerica-east1` em São Paulo).
   - Inicie em **Modo Produção**.
3. **Publicar Regras de Segurança:**
   - Acesse a aba **Regras** no Firestore e cole integralmente o conteúdo de `database/firestore.rules`.
   - Clique em **Publicar**.
4. **Criar Índices Compostos:**
   - Acesse a aba **Índices** ou importe as definições contidas em `database/firestore.indexes.json`.
5. **Ativar Firebase Auth:**
   - Acesse **Build** -> **Authentication** -> **Começar**.
   - Na aba **Sign-in method**, ative o provedor **E-mail/senha**.
   - Na aba **Users**, cadastre a conta da administradora definida em `config/config.js` (`adminAuth.email`: `admin@convitedigital.local`) com a senha igual ao PIN mestre (`0523`).
6. **Inserir Credenciais Públicas:**
   - Nas configurações do projeto (**Configurações do Projeto** -> **Geral** -> **Seus aplicativos** -> adicione um app Web `</>`).
   - Copie o objeto `firebaseConfig` e cole no arquivo `config/config.js`.
7. **Executar Migrações Iniciais:**
   ```bash
   # Executar carga inicial do documento de configurações e dos 20 presentes:
   npm run migrate
   ```

---

## 6. Como Fazer o Deploy no GitHub Pages

O projeto foi arquitetado especificamente para hospedagem estática direta no **GitHub Pages** a partir da raiz do repositório:

1. **Commit das Alterações no Git:**
   ```bash
   git add .
   git commit -m "Fase 7: Homologação completa, testes de aceitação e preparação para deploy"
   ```
2. **Vincular ao Repositório Remoto no GitHub:**
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git branch -M main
   git push -u origin main
   ```
3. **Ativar o GitHub Pages:**
   - No GitHub, abra seu repositório e acesse: **Settings** -> **Pages**.
   - Na seção **Build and deployment**, selecione:
     - **Source:** *Deploy from a branch*.
     - **Branch:** `main`.
     - **Folder:** `/ (root)`.
   - Clique em **Save**.
4. Em cerca de 1 a 2 minutos, seu convite estará no ar com certificado TLS/HTTPS gratuito no endereço:
   `https://SEU_USUARIO.github.io/SEU_REPOSITORIO/`

---

## 7. Matriz de Homologação dos 14 Critérios de Aceitação (FSD Seção 26)

| # | Critério de Aceitação do FSD | Status | Como foi Homologado |
|---|---|:---:|---|
| **1** | **Aderência ao Design System** | Aprovado | Paleta *Botanical Heritage Atelier*, tipografia EB Garamond e Manrope e sombras táteis em `variables.css`. |
| **2** | **Arquitetura MVC Client-Side** | Aprovado | Separação estrita de Models, Views, Controllers e Utils sem mistura de responsabilidades. |
| **3** | **Responsividade Mobile-First** | Aprovado | Ergonomia e media queries otimizadas para smartphones (360px a 430px), tablets e computadores. |
| **4** | **Baixa e Reversão Atômica** | Aprovado | Decremento unitário seguro via `runTransaction`, bloqueio contra estoque negativo e estorno no painel. |
| **5** | **Fluxo Alternativo de PIX** | Aprovado | Modalidade PIX sem impacto em presentes físicos, exibição da chave e botão de cópia na área de transferência. |
| **6** | **Opção "Apenas Confirmar Presença"** | Aprovado | Desabilitação dinâmica do dropdown e gravação de presença sem vincular itens ao estoque. |
| **7** | **Alerta Amigável de Homônimo** | Aprovado | Busca pontual em `nomes_confirmados/{nome_normalizado}` (`getDoc`), exibindo aviso sem travar o envio. |
| **8** | **Bloqueio por Data Limite** | Aprovado | Ocultação automática do formulário e exibição de mensagem serena quando o prazo configurado tiver expirado. |
| **9** | **Painel Administrativo Protegido** | Aprovado | Gate com PIN Mestre (`0523`), bloqueio contra força bruta por 5 minutos e sessão volátil em `sessionStorage`. |
| **10** | **Segurança e LGPD** | Aprovado | Leitura direta de `confirmacoes` bloqueada para anônimos nas regras do Firestore; dados de outros convidados protegidos. |
| **11** | **Exportações Funcionais** | Aprovado | Planilha CSV em UTF-8 BOM com delimitador `;` para Excel e folha limpa de impressão (`@media print`). |
| **12** | **Deploy Exclusivo no GitHub Pages** | Aprovado | Estrutura estática pura servida na raiz do repositório, caminhos relativos e ausência de servidores locais. |
| **13** | **Configuração em Código Sem `.env`** | Aprovado | Arquivo `config/config.js` com identificadores públicos, fallback dinâmico e sem segredos de backend. |
| **14** | **Migrations Versionadas** | Aprovado | Scripts idempotentes com controle de duplicidade na coleção `_migrations` do Firestore. |

---

## 8. Segurança e Conformidade com a LGPD

- **Privacidade de Dados:** A listagem geral de confirmações só pode ser realizada após a autenticação administrativa (`request.auth != null`). Nenhum visitante consegue inspecionar ou raspar a lista de convidados a partir do console do navegador.
- **Validação Segura de Homônimos:** Feita por busca pontual de documento único (`getDoc`) na coleção `nomes_confirmados`, cuja regra proíbe consultas abertas (`allow list: if request.auth != null;`).
- **Resistência contra Ataques de Força Bruta:** O painel administrativo bloqueia automaticamente o acesso local por 5 minutos após 5 tentativas incorretas consecutivas do PIN, registrando log de auditoria em `localStorage`.
- **Prevenção de XSS:** Toda e qualquer entrada de dados de usuário é rigorosamente sanitizada e manipulada através de `textContent` ou rotinas de escape antes da renderização.
