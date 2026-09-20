# AGENTS.md - Diretrizes de Contexto para Agentes de IA

Este documento define as regras, a arquitetura, os padrões de segurança e os protocolos de trabalho mandatórios para qualquer agente de IA que atue no desenvolvimento e manutenção deste projeto.

---

## 1. Idioma e Comunicação

- **Regra Fundamental:** Responder **sempre em português do Brasil**.
- Adotar tom profissional, colaborativo e técnico, alinhado ao papel de arquiteto(a) de software cuidadoso(a).

---

## 2. Stack Tecnológica e Arquitetura

O sistema é um **Convite Digital e Lista de Presentes para Chá de Cozinha** baseado no conceito visual *Botanical Heritage Atelier*.

- **Frontend:** HTML5 semântico e JavaScript moderno puro (Vanilla JS, ES6+ Modules). Não utilizar transpiladores, empacotadores (bundlers) ou frameworks SPA pesados (sem React, Vue, Angular).
- **Estilização:** CSS3 moderno utilizando Custom Properties (variáveis CSS extraídas de `docs/DESIGN.md`), CSS Grid, Flexbox e folha especializada para impressão (`@media print`). Não utilizar Tailwind, Bootstrap ou frameworks CSS externos.
- **Banco de Dados / Nuvem:** **Firebase Firestore** (plano gratuito Spark) e Firebase Auth para autenticação administrativa silenciosa vinculada ao PIN Mestre. SDK Web v10+ modular carregado via CDN oficial ou cópia vendorizada.
- **Ícones e Grafismos:** SVGs inline ou vetorizados locais leves, elegantes e com estética botânica.
- **Tipografia:** Google Fonts carregando **EB Garamond** (títulos, hero, contadores, citações) e **Manrope** (textos corridos, formulários, botões e dados operacionais), com `font-display: swap`.
- **Padrão Arquitetural:** **MVC (Model-View-Controller) Client-Side** desacoplado:
  - `app/models/`: Estado, validações de integridade, transações atômicas com Firestore e regras de negócio.
  - `app/views/`: Manipulação do DOM, renderização de templates, estados visuais e toasts/feedbacks.
  - `app/controllers/`: Intermediação de eventos, orquestração de models e views.
  - `app/utils/`: Utilitários isolados (gerador de calendários, exportador CSV, logger).
- **Restrições Técnicas Importantes:**
  - Sem backend centralizado próprio (Node/Express, PHP, Python, etc.).
  - Sem arquivos `.env` para evitar riscos de exposição. As configurações técnicas e chaves públicas do Firebase ficam em `config/config.js`.
  - Sem PHP, sem XAMPP, sem Apache, sem Hostnet e sem arquivos `.htaccess`.

---

## 3. Ambientes do Projeto

- **Ambiente de Desenvolvimento:** Editor **VS Code** com servidor estático local via extensão *Live Server* (ex: `http://127.0.0.1:5500/`) ou utilitário HTTP estático local equivalente (`npx serve .` ou `python -m http.server 5500`).
- **Ambiente de Testes e Validação:** Navegador web com DevTools para emulação de dispositivos móveis (*mobile-first*, 360px a 430px de largura), tablets (768px a 1024px), telas desktop e emulação de mídia impressa (`Rendering -> Emulate CSS media type -> print`).
- **Ambiente de Produção:** **GitHub Pages**. Deploy exclusivo como site estático servido via HTTPS diretamente a partir da raiz do repositório no GitHub.

---

## 4. Estrutura de Diretórios Portável

A organização do repositório adota caminhos estritamente relativos à raiz do projeto:

```text
.
├── README.md                 # Guia de configuração, desenvolvimento local e deploy no GitHub Pages
├── index.html                # Ponto de entrada público do convite (visão do convidado)
├── admin.html                # Ponto de entrada administrativo (painel da noiva)
├── AGENTS.md                 # Este documento de contexto e governança para IAs
├── docs/                     # Documentações do projeto
│   ├── FSD.md                # Especificação Funcional e Técnica (fonte primária da verdade)
│   ├── DESIGN.md             # Guia de design e tokens visuais (Botanical Heritage Atelier)
│   ├── INSUMOS.md            # Inventário de insumos e arquivos de apoio
│   ├── PLANO.md              # Plano de construção incremental por fases
│   ├── STATUS.md             # Arquivo vivo de status, progresso e próxima fase
│   └── ERROS.md              # Arquivo vivo de registro de erros e lições aprendidas
├── config/                   # Configurações gerais e parâmetros da aplicação
│   ├── config.example.js     # Modelo de configuração sem segredos
│   └── config.js             # Parâmetros estáticos do evento e credenciais públicas do Firebase
├── database/                 # Persistência e regras do Firestore
│   ├── firestore.rules       # Regras declarativas de segurança para a nuvem
│   ├── firestore.indexes.json# Índices compostos de consulta
│   └── migrations/           # Scripts versionados e idempotentes de inicialização
│       ├── run.js            # Utilitário Node.js para execução das migrações
│       ├── 001_initial_schema.js
│       └── 002_seed_presentes.js
├── app/                      # Código-fonte da aplicação (MVC Client-Side)
│   ├── models/               # Modelos de domínio (ConfiguracaoModel, PresenteModel, ConfirmacaoModel)
│   ├── views/                # Camada visual (ConviteView, FormularioRSVPView, PainelNoivaView, ToastView)
│   ├── controllers/          # Controladores (ConviteController, AdminController)
│   └── utils/                # Módulos utilitários (calendar.js, export.js, logger.js)
└── assets/                   # Recursos estáticos servidos publicamente
    ├── css/                  # Folhas de estilo (variables.css, reset.css, main.css, admin.css, print.css)
    ├── js/                   # Scripts auxiliares e bibliotecas vendorizadas (se aplicável)
    └── images/               # Ícones botânicos, monogramas e favicons
```

---

## 5. Comandos Principais

- **Rodar em Desenvolvimento Local:**
  - Abrir o projeto no VS Code e clicar em **"Go Live"** (extensão *Live Server*).
  - Ou executar via terminal na raiz: `npx serve .` ou `python -m http.server 5500`.
- **Testar Responsividade e Impressão:**
  - Abrir `http://127.0.0.1:5500/` ou `http://127.0.0.1:5500/admin.html` no Google Chrome / Edge.
  - Pressionar `F12` -> Ativar *Device Toolbar* (`Ctrl + Shift + M`).
  - Abrir o menu *Rendering* (`Ctrl + Shift + P` -> digitar `Rendering`) -> selecionar `Emulate CSS media type: print` para inspecionar `print.css`.
- **Executar Migrações do Firestore:**
  - Executar via CLI do Node.js: `node database/migrations/run.js`.

---

## 6. Regras de Segurança e Conformidade (Stack Específica)

Como a aplicação roda no cliente com deploy no GitHub Pages e banco no Firebase Firestore, as regras de segurança aplicáveis são:

1. **Privacidade e LGPD (Lei Geral de Proteção de Dados):**
   - A leitura e listagem direta da coleção `confirmacoes` é **estritamente bloqueada** para acessos anônimos nas Firestore Security Rules (`allow read: if request.auth != null;`). Visitantes não conseguem ler nem minerar a relação de convidados.
2. **Validação Amigável de Homônimos Segura (RN-05):**
   - Não realiza buscas abertas em `confirmacoes`. A consulta ocorre exclusivamente por busca pontual de documento único (`getDoc`) na coleção indexada `nomes_confirmados/{nome_normalizado}`, cuja regra de segurança permite leitura por chave (`allow get: if true;`), mas proíbe a listagem completa (`allow list: if request.auth != null;`).
3. **Prevenção de Injeção e Cross-Site Scripting (XSS):**
   - Todos os dados inseridos por usuários (nome do convidado, cadastro de novos presentes, mensagens) devem ser higienizados e inseridos no DOM via propriedades seguras (`textContent`) ou funções de escape de caracteres HTML antes de qualquer renderização.
4. **Reserva Concorrente e Atomicidade:**
   - A baixa de presentes físicos no momento da confirmação é realizada obrigatoriamente através de **Transações Atômicas do Firestore (`runTransaction`)**. Se dois convidados tentarem reservar o último item simultaneamente, apenas um terá sucesso e o outro receberá notificação imediata para escolher outro presente, prevenindo estoque negativo.
5. **Proteção do Painel Administrativo:**
   - Acesso em `admin.html` protegido por tela de bloqueio com PIN Mestre pré-configurado em `config/config.js`.
   - Autenticação silenciosa no Firebase Auth (`signInWithEmailAndPassword`) para habilitar o estado `request.auth != null` exigido pelas regras do Firestore.
   - Estado de autenticação salvo exclusivamente em `sessionStorage` (armazenamento volátil que expira ao fechar a aba).
   - Bloqueio automático contra força bruta por 5 minutos após 5 tentativas consecutivas incorretas do PIN.
6. **Isolamento de Credenciais e Zero Arquivo `.env`:**
   - As credenciais contidas em `config/config.js` são as chaves públicas de identificação do Firebase (`apiKey`, `projectId`, etc.), que não conferem privilégios administrativos sem a validação das regras de segurança na nuvem.
   - Nenhuma chave secreta de serviço (`serviceAccountKey.json`) ou senha pessoal deve ser versionada no repositório.
7. **Tratamento de Exceções e Logs:**
   - Mensagens de erro exibidas ao usuário devem ser acolhedoras e elegantes, nunca expondo stack traces ou detalhes técnicos.
   - Logs operacionais de erro e eventos de segurança devem ser armazenados localmente em `localStorage` sob as chaves `_app_error_logs` e `_app_sec_logs` pelo utilitário `app/utils/logger.js`.

---

## 7. Protocolo Mandatório dos Arquivos Vivos

Todo agente de IA que atuar neste projeto deve seguir rigorosamente o seguinte ciclo de trabalho:

### Antes de Iniciar Qualquer Trabalho:
1. Ler `docs/FSD.md`.
2. Ler `docs/DESIGN.md`.
3. Ler `docs/INSUMOS.md`.
4. Ler `docs/PLANO.md`.
5. Ler `docs/STATUS.md`.
6. Ler `docs/ERROS.md`.

> **Aviso de Portabilidade:**
> - Use sempre caminhos relativos à raiz do projeto.
> - Não transformar estes caminhos em links absolutos.
> - Não usar links no formato `file:///`.
> - Não registrar caminhos locais específicos da máquina atual (como `C:\...` ou `/home/...`) em nenhum arquivo do projeto.

### Ao Terminar Qualquer Trabalho:
1. Atualizar `docs/STATUS.md` com o estado real do projeto e o checklist da fase correspondente.
2. Registrar erros encontrados e soluções aplicadas em `docs/ERROS.md`, caso ocorram.
3. Informar claramente ao usuário o que foi feito.
4. Informar ao usuário como testar ou validar a entrega.

---

## 8. Padrões de Código e Boas Práticas

- **Responsabilidade Única:** Módulos e funções enxutos, focados e com nomes descritivos.
- **Padrão MVC Client-Side:** Nunca misturar chamadas ao Firestore diretamente dentro de componentes de View. Toda persistência passa por Models; toda manipulação de DOM passa por Views; toda orquestração de eventos passa por Controllers.
- **Comentários de Código:** Incluir comentários úteis em português do Brasil apenas quando agregarem valor a regras não óbvias. Evitar comentários redundantes.
- **Adesão ao Escopo:** Não inventar funcionalidades fora do `docs/FSD.md`. Não implementar funcionalidades marcadas como fora de escopo (como uploads de fotos, login burocrático de convidados, gateways pagos de PIX ou APIs pagas de WhatsApp).
- **Interface e Design:** Seguir fielmente as especificações de `docs/DESIGN.md` (paleta *Botanical Heritage Atelier*, tipografia EB Garamond e Manrope, sombras táteis de papelaria e espaçamentos harmônicos).
