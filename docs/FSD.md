# DOCUMENTO DE ESPECIFICAÇÃO FUNCIONAL (FSD)

**Sistema:** Convite Digital e Lista de Presentes para Chá de Cozinha  
**Identidade Visual:** *Botanical Heritage Atelier*  
**Versão do Documento:** 1.0  
**Data:** 20/09/2026  
**Status:** Consolidado e Pronto para Implementação  

---

## 1. Visão Geral

### 1.1. Nome do Sistema
**Convite Digital e Lista de Presentes para Chá de Cozinha** (Sistema de RSVP e Reserva de Presentes *Botanical Heritage Atelier*).

### 1.2. Objetivo Principal
Proporcionar uma experiência interativa, sofisticada e acessível para que os convidados de um Chá de Cozinha visualizem todas as informações do evento, consultem a paleta de cores recomendada, confirmem presença (RSVP) e escolham presentes de uma lista dinâmica sem duplicação de itens. Simultaneamente, oferecer à noiva uma área de gestão administrativa ágil, segura e descomplicada para acompanhar contadores em tempo real, cadastrar presentes, gerenciar desistências, alterar prazos e exportar a lista final consolidada.

### 1.3. Resumo do Funcionamento
O sistema opera como uma aplicação web moderna, responsiva (*mobile-first*) e integrada a banco de dados em nuvem em tempo real (Firebase Firestore):
- **Visão Pública (Convidado):** Uma página única de convite contendo cabeçalho com nomes dos noivos, mensagem de acolhimento, contagem regressiva viva, endereço com redirecionamento ao Google Maps, adição do evento ao calendário pessoal, vitrine da paleta de cores sugerida e formulário integrado de RSVP. No formulário, o convidado digita seu nome, podendo escolher um presente físico ainda disponível (com decremento atômico de estoque), presentear via PIX (com exibição imediata da chave e botão de cópia) ou apenas confirmar presença. O sistema conta com validação amigável de nomes repetidos e bloqueio automático após a data limite configurada.
- **Visão Administrativa (Painel da Noiva):** Acessível por rota dedicada e protegida por barreira de validação com PIN / Senha Mestra. Apresenta dashboard com contadores consolidados, controle do prazo limite de confirmação, cadastro rápido de presentes, tabela de convidados e escolhas, recurso de reversão/liberação de presentes (devolvendo o item ao estoque em caso de desistência) e opções de exportação limpa para impressão/PDF e download em formato CSV.

### 1.4. Público Usuário
1. **Convidados:** Amigos e familiares dos noivos, com perfis variados de maturidade digital, utilizando majoritariamente smartphones a partir de links recebidos no WhatsApp.
2. **Noiva (Administradora):** Gestora do evento, necessitando de controle instantâneo, visualização transparente de confirmados e ferramentas práticas para fechamento de lista junto a fornecedores e buffet.

### 1.5. Contexto de Uso
A aplicação foi projetada para eliminar o atrito de confirmações manuais por mensagens de texto e evitar o constrangimento de presentes repetidos ou fora do estilo desejado pela noiva. Todo o processo de RSVP é executado em menos de um minuto, sem exigência de criação de conta, login ou download de aplicativos pelos convidados.

### 1.6. Observações Relevantes para Implementação
- A interface segue estritamente a identidade estética de papelaria fina artesanal definida no `docs/DESIGN.md` (*Botanical Heritage Atelier*).
- A aplicação adota arquitetura desacoplada no padrão MVC (*Model-View-Controller*) no lado do cliente (*client-side*).
- O deploy e hospedagem do sistema serão realizados exclusivamente no **GitHub Pages** (com desenvolvimento local no VS Code via Live Server), com persistência em nuvem gerenciada via Firebase Firestore no plano gratuito Spark. O projeto não utiliza XAMPP nem Hostnet.
- O armazenamento e a consulta de dados respeitam integralmente os preceitos da LGPD (Lei Geral de Proteção de Dados), impedindo a exposição pública da lista de convidados confirmados por meio de Regras de Segurança no banco de dados (*Firestore Security Rules*).

---

## 2. Documentos do Projeto para Implementação

Para a construção e validação do sistema, a IA codificadora e os desenvolvedores deverão utilizar exclusivamente os seguintes documentos oficiais:

1. **`docs/FSD.md`** (este documento): Especificação funcional, técnica, arquitetural e de regras de negócio consolidada, autossuficiente e mandatória.
2. **`docs/DESIGN.md`**: Guia de estilo, tokens de design (*Botanical Heritage Atelier*), paleta cromática, escala tipográfica, sombras, raios de borda e especificações de componentes visuais.

Todas as definições funcionais e técnicas necessárias para a entrega completa do sistema encontram-se unificadas diretamente nas seções deste FSD.

---

## 3. Stack Definida

### 3.1. Tecnologias Principais
- **Linguagem Frontend:** HTML5 semântico estruturado e JavaScript moderno (Vanilla JS, ES6+ Modules), sem dependência de transpiladores ou bundlers complexos.
- **Estilização:** CSS3 moderno utilizando Custom Properties (variáveis CSS alinhadas aos tokens do `docs/DESIGN.md`), CSS Grid, Flexbox e folha de estilos especializada para mídia de impressão (`@media print`).
- **Banco de Dados / Persistência:** **Firebase Firestore** (plano gratuito Spark), utilizando o Firebase Web SDK v10+ em formato modular carregado via CDN oficial ou cópia local vendorizada.
- **Ícones e Grafismos:** SVGs inline ou vetorizados locais, leves, com traços botânicos e elegantes.
- **Tipografia:** Google Fonts carregando as famílias **EB Garamond** (display, títulos e citações) e **Manrope** (textos corridos, formulários, botões e dados operacionais), com suporte a exibição local otimizada (`font-display: swap`).

### 3.2. Padrão Arquitetural
- **MVC (Model-View-Controller) Client-Side**:
  - **Models:** Classes ou módulos responsáveis pelo estado da aplicação, transações com o Firestore, validações de integridade, cálculos de estoque e contadores.
  - **Views:** Módulos dedicados à manipulação do DOM, renderização de templates HTML, aplicação de classes visuais e exibição de feedbacks (toasts, alertas e modais).
  - **Controllers:** Módulos que intermediam as ações do usuário (cliques, digitação e submissões), orquestram os models correspondentes e invocam as atualizações nas views.

### 3.3. Restrições Técnicas
- **Sem Backend Centralizado Próprio:** Toda a lógica de apresentação e orquestração roda no cliente, comunicando-se diretamente com o Firebase Firestore através de credenciais públicas controladas por regras rígidas de segurança na nuvem.
- **Sem Arquivo `.env`:** O projeto não utilizará arquivos `.env` para evitar riscos de exposição em servidores web. As configurações técnicas e chaves de identificação do Firebase são encapsuladas em arquivo de configuração JavaScript (`config/config.js`).
- **Zero Dependências Pesadas:** Não utilizar frameworks SPA pesados (como React, Angular ou Vue), mantendo o bundle leve, com carregamento instantâneo no celular.

---

## 4. Ambientes do Projeto

### 4.1. Desenvolvimento Local
- **Ferramentas:** Visual Studio Code com servidor estático local através da extensão *Live Server* (ou utilitário HTTP estático local equivalente via Node/Python). O projeto não utiliza XAMPP nem servidores Apache.
- **Execução:** O projeto é aberto diretamente no navegador a partir da porta local do servidor estático (ex: `http://127.0.0.1:5500/`).
- **Comunicação:** Conexão direta com a instância do Firebase Firestore configurada no projeto.

### 4.2. Testes e Homologação
- **Procedimento:** Execução dos testes de usabilidade, regras de negócio e responsividade no próprio navegador, utilizando a emulação de dispositivos móveis do DevTools (telas de 360px a 430px de largura para celulares, 768px a 1024px para tablets e resoluções desktop).
- **Validação de Impressão:** Emulação de mídia impressa no DevTools (`Rendering -> Emulate CSS media type -> print`) para checar a folha de estilos de impressão antes da publicação no GitHub.

### 4.3. Produção
- **Plataforma Exclusiva:** **GitHub Pages**. O deploy é realizado única e exclusivamente na infraestrutura do GitHub Pages, servindo a aplicação como site estático seguro por HTTPS com certificado TLS automatizado e distribuição global via CDN.
- **Sem Ambientes Legados:** O projeto não utilizará hospedagem Hostnet, servidores Apache tradicionais ou ambiente XAMPP. Todo o ciclo de publicação e hospedagem é concentrado no repositório GitHub.
- **Deploy:** Publicação automatizada a partir do branch do repositório GitHub (`main` ou `gh-pages`), servindo os arquivos estáticos diretamente da raiz do repositório.

---

## 5. Arquitetura do Sistema

### 5.1. Diretório do Projeto e Ambientes
A referência principal de organização de todo o código-fonte é o:
`[Diretório do Projeto - Repositório]`

Este diretório corresponde à raiz versionada no repositório GitHub. O deploy é executado diretamente no **GitHub Pages**, onde o `[Diretório do Projeto - Repositório]` atua como a própria raiz servida pelo domínio ou subcaminho do repositório (`https://usuario.github.io/nome-do-repositorio/`). O projeto não utiliza XAMPP, Hostnet ou estruturas legadas de pastas como `htdocs` ou `www`. Todos os caminhos de assets e scripts são estruturados de forma relativa à raiz do repositório no GitHub.

### 5.2. Estrutura de Diretórios Proposta

```text
[Diretório do Projeto - Repositório]/
├── README.md                 # Instruções de configuração do projeto e deploy no GitHub Pages
├── index.html                # Ponto de entrada público do Convite Digital (visão do convidado)
├── admin.html                # Ponto de entrada administrativo do Painel da Noiva
├── docs/                     # Documentações do projeto
│   ├── FSD.md                # Este documento de especificação funcional
│   └── DESIGN.md             # Guia de design e tokens visuais
├── config/                   # Configurações gerais e parâmetros da aplicação
│   └── config.js             # Arquivo em código com parâmetros estáticos e credenciais públicas do Firebase
├── database/                 # Estruturas e rotinas de banco de dados
│   ├── migrations/           # Scripts versionados de inicialização e carga de dados do Firestore
│   │   ├── 001_initial_schema.js
│   │   └── 002_seed_presentes.js
│   ├── firestore.rules       # Regras de segurança declarativas para o console do Firestore
│   └── firestore.indexes.json# Definições de índices compostos para o Firestore
├── app/                      # Código-fonte da aplicação desacoplado em MVC
│   ├── models/               # Camada de Dados e Regras de Negócio
│   │   ├── PresenteModel.js  # Gestão de estoque, listagem e baixa de presentes
│   │   ├── ConfirmacaoModel.js # Registro, contagem e liberação de confirmações
│   │   └── ConfiguracaoModel.js# Gestão do prazo limite, chave PIX e boas-vindas
│   ├── views/                # Camada de Apresentação e Manipulação de DOM
│   │   ├── ConviteView.js    # Renderização da vitrine, countdown, calendário e paleta
│   │   ├── FormularioRSVPView.js # Manipulação do formulário, validações e feedback PIX
│   │   ├── PainelNoivaView.js# Renderização do dashboard, contadores e tabela de convidados
│   │   └── ToastView.js      # Notificações visuais e mensagens amigáveis
│   ├── controllers/          # Camada de Controle e Orquestração
│   │   ├── ConviteController.js # Orquestração da página pública e submissão de RSVP
│   │   └── AdminController.js   # Orquestração do painel administrativo e validação de PIN
│   └── utils/                # Funções utilitárias e auxiliares
│       ├── calendar.js       # Gerador de links para Google Calendar e arquivo .ics
│       ├── export.js         # Utilitário de geração e download de arquivo CSV
│       └── logger.js         # Módulo de registro de logs de erro e segurança
└── assets/                   # Recursos estáticos acessíveis publicamente
    ├── css/
    │   ├── variables.css     # Tokens do DESIGN.md (cores, tipografia, espaçamentos)
    │   ├── reset.css         # Normalização de estilos padrão
    │   ├── main.css          # Estilos gerais do convite público
    │   ├── admin.css         # Estilos específicos do painel da noiva
    │   └── print.css         # Regras especializadas para impressão limpa (@media print)
    ├── js/                   # Scripts auxiliares ou bibliotecas locais vendorizadas (se aplicável)
    └── images/               # Grafismos botânicos, monogramas e favicons
```

### 5.3. Proteção de Arquivos Internos e Camada de Segurança
1. **Ambiente Estático no GitHub Pages (Sem Servidor Apache):** Como o deploy é realizado exclusivamente no GitHub Pages, a infraestrutura é estática e não utiliza Apache nem arquivos `.htaccess`. Nenhuma lógica de segurança deve depender de diretivas de servidor web local.
2. **Proteção de Dados Pessoais e LGPD no Client-Side:**
   - O repositório no GitHub armazena apenas arquivos estáticos e lógica de frontend. Nenhuma credencial secreta de backend ou dado pessoal de convidado é versionado no repositório.
   - As credenciais contidas no `config/config.js` são unicamente as chaves de projeto públicas do Firebase (`apiKey`, `projectId`, etc.), que atuam estritamente como identificadores do cliente.
   - **Toda a segurança, privacidade e restrição de acesso a dados confidenciais são asseguradas pelas Regras de Segurança do Firestore (`firestore.rules`)** executadas na nuvem do Google, as quais bloqueiam expressamente consultas não autorizadas à coleção de confirmações.
3. **Ponto de Entrada:**
   - O acesso dos convidados é centralizado em `index.html`.
   - O acesso administrativo da noiva ocorre em `admin.html`.

---

## 6. Escopo Funcional da Primeira Versão

### 6.1. Módulo do Convite Digital (Visão do Convidado)

#### 6.1.1. Cabeçalho Informativo e Hero
- **Objetivo:** Apresentar a celebração com elegância e fornecer todos os dados práticos de dia, horário e localização.
- **Usuários Envolvidos:** Convidados.
- **Ações Permitidas:**
  - Leitura dos nomes dos noivos e da mensagem de acolhimento.
  - Acompanhamento da contagem regressiva viva (dias, horas, minutos e segundos restantes até o início do chá).
  - Clique no botão **"Como Chegar" / "Ver no Google Maps"**: Abre o endereço exato do evento diretamente no aplicativo ou site do Google Maps.
  - Clique no botão **"Adicionar à Agenda"**: Permite ao convidado salvar o evento instantaneamente no Google Agenda ou baixar o arquivo `.ics` para Apple Calendar / Outlook.
- **Resultado Esperado:** O convidado compreende quando e onde o evento ocorrerá e adiciona o compromisso à sua rotina com um clique.

#### 6.1.2. Seção "Paleta de Cores Sugerida"
- **Objetivo:** Orientar os convidados sobre as tonalidades e a atmosfera estética preferidas pela noiva para os presentes, utensílios e decoração.
- **Usuários Envolvidos:** Convidados.
- **Comportamento:** Exibição de cartões circulares ou blocos retangulares delicados contendo as amostras de cor fiéis à identidade visual (tons de *Heritage Olive*, *Warm Sage*, *Champagne Gold*, *Ivory Parchment* e neutros terrosos) com seus respectivos nomes descritivos.

#### 6.1.3. Formulário Integrado de Confirmação (RSVP) e Presente
- **Objetivo:** Coletar o nome do convidado e associar sua presença à reserva de um item da lista, à escolha de PIX ou ao registro exclusivo de presença.
- **Usuários Envolvidos:** Convidados.
- **Ações Permitidas:**
  - Preenchimento do campo obrigatório **"Nome Completo"**.
  - Marcação opcional da caixa de seleção `[ ] Apenas confirmar presença`: Ao ser marcada, a lista suspensa de presentes é desabilitada imediatamente.
  - Seleção de item na **Lista Suspensa (Dropdown) de Presentes**:
    - Exibe exclusivamente os itens que possuem `quantidade_disponivel > 0`.
    - Apresenta como primeira ou última opção destacada: `"Presentear com PIX / Presente surpresa"`.
  - Submissão do formulário via botão proeminente **"Confirmar Presença"**.
- **Resultado Esperado:** Gravação da confirmação no banco de dados e atualização imediata do estoque do presente físico (quando selecionado).

#### 6.1.4. Validação Amigável de Nome Repetido
- **Objetivo:** Evitar homônimos confusos sem criar atrito ou bloquear o envio.
- **Regra de Negócio (RN-05):** Se o nome digitado já constar no registro de confirmados, o sistema exibe imediatamente abaixo do campo um aviso amigável:  
  *"Já temos uma confirmação com esse nome! Se for outra pessoa, sugerimos adicionar o sobrenome ou apelido para identificarmos você direitinho."*  
  O envio **não é impedido**, permitindo que familiares com nomes parecidos concluam sua confirmação.
- **Mecanismo Técnico em Conformidade com a LGPD:** Como a listagem pública da coleção `confirmacoes` é estritamente bloqueada para proteger os dados pessoais dos convidados, a verificação de homônimos não realiza varreduras abertas na coleção principal. Em vez disso, o sistema utiliza a coleção auxiliar de índice público `nomes_confirmados/{nome_normalizado}` (com permissão de leitura restrita a busca pontual por chave: `allow get: if true; allow list: if request.auth != null;`). Ao perder o foco do campo (`blur`) ou após pausa na digitação (*debounce*), o script consulta unicamente aquele documento específico via `getDoc()`. Se o documento existir, a mensagem amigável é ativada. Na submissão bem-sucedida, o nome normalizado é registrado nesse índice. Dessa forma, garante-se a checagem individual sem que nenhum visitante consiga minerar ou listar os convidados do evento.

#### 6.1.5. Feedback Visual e Área de PIX
- **Objetivo:** Confirmar de forma inequívoca o sucesso do envio e facilitar a contribuição financeira quando selecionada.
- **Comportamento:**
  - O formulário é substituído por um cartão elegante de confirmação (*"Presença Confirmada com Sucesso!"*), citando o nome do convidado e a opção escolhida.
  - Caso o convidado tenha selecionado a opção de PIX, exibe-se um painel em destaque com a chave PIX da noiva e um botão interativo **"Copiar Chave PIX"**. Ao clicar, o sistema copia a chave para a área de transferência do celular/computador e exibe o feedback visual momentâneo (*"Chave copiada com sucesso!"*).

#### 6.1.6. Bloqueio Automático por Prazo Limite
- **Objetivo:** Respeitar o planejamento da noiva e evitar confirmações tardias que prejudiquem a contagem do buffet.
- **Comportamento:** Se a data atual for superior à data e hora limite configuradas pela noiva, o formulário de confirmação é substituído por uma mensagem informativa serena:  
  > *"O prazo para confirmação de presença encerrou. Por favor, fale diretamente com a noiva."*

---

### 6.2. Módulo do Painel Administrativo da Noiva

#### 6.2.1. Bloqueio de Segurança por PIN Mestre (Gate de Acesso)
- **Objetivo:** Proteger a privacidade da noiva e os dados pessoais dos convidados na rota `admin.html`.
- **Comportamento:** Ao abrir o painel, uma tela de bloqueio com estética de papelaria solicita a digitação de um **PIN / Senha Mestra pré-definida** (configurada no `config/config.js`). Nenhuma chamada de leitura aos dados de convidados é executada antes da inserção e validação do PIN correto.

#### 6.2.2. Dashboard de Resumo (Contadores em Tempo Real)
- **Objetivo:** Oferecer uma visão instantânea do status do chá.
- **Contadores Exibidos no Topo:**
  1. **Total de Pessoas Confirmadas:** Soma total de registros de presença realizados.
  2. **Total de Presentes Escolhidos:** Soma de presentes físicos reservados somados às confirmações via PIX/Surpresa.
  3. **Presentes Ainda Disponíveis:** Total de unidades físicas de presentes que ainda constam no inventário com `quantidade_disponivel > 0`.

#### 6.2.3. Gestão do Prazo Limite de Confirmação
- **Objetivo:** Permitir à noiva prorrogar ou antecipar o fechamento do RSVP.
- **Ações Permitidas:** Campo com seletor de data e hora (`datetime-local`) permitindo salvar a nova data limite diretamente no Firestore.

#### 6.2.4. Cadastro Rápido de Presentes
- **Objetivo:** Adicionar novos itens à lista suspensa com máxima simplicidade.
- **Campos do Formulário:**
  - `Nome do Presente` (texto obrigatório, ex: "Jogo de Taças de Sobremesa").
  - `Quantidade Total` (numérico inteiro maior que zero, ex: `2`).
- **Comportamento:** O sistema grava o item atribuindo inicialmente `quantidade_disponivel = quantidade_total`. O item torna-se imediatamente elegível para seleção na página pública.

#### 6.2.5. Tabela de Convidados e Liberação de Presentes
- **Objetivo:** Listar individualmente quem confirmou presença e possibilitar o estorno de itens em caso de desistência.
- **Colunas da Tabela:**
  - Nome do Convidado.
  - Opção Escolhida (Nome do Presente, "PIX / Presente Surpresa" ou "Apenas Presença").
  - Data e Hora da Confirmação.
  - Ações: Botão **"Liberar Presente"** (ativo apenas para registros que possuem presente físico associado).
- **Regra de Liberação:** Ao clicar em "Liberar Presente" e confirmar a caixa de diálogo, o sistema remove o vínculo do presente daquele registro e incrementa em `+1` a `quantidade_disponivel` do item correspondente no inventário, fazendo com que ele reapareça automaticamente na lista suspensa pública.

#### 6.2.6. Exportação e Impressão
- **Objetivo:** Facilitar o compartilhamento da lista impressa ou em planilha com fornecedores e familiares.
- **Ações Disponíveis:**
  - Botão **"Imprimir / Salvar em PDF"**: Dispara `window.print()` aplicando a folha de estilo `print.css`, ocultando botões operacionais, contadores interativos e formulários, gerando uma folha elegante e tabulada.
  - Botão **"Exportar CSV"**: Gera e baixa instantaneamente um arquivo `.csv` codificado em UTF-8 com BOM, contendo as colunas: `Nome do Convidado;Tipo de Confirmação;Presente Escolhido;Data e Hora`.

---

## 7. Fora de Escopo

Os seguintes recursos foram analisados e classificados expressamente como **fora de escopo** para a primeira versão da aplicação:

1. **Telas Tradicionais de Login, Cadastro de Usuários e Recuperação de Senha:** Não haverá fluxo burocrático de criação de contas de e-mail por convidados, login social (OAuth) ou telas de recuperação de senhas esquecidas. O acesso administrativo é simplificado para a noiva via PIN Mestre, que dispara internamente e de forma transparente a autenticação administrativa no Firebase Auth (`signInWithEmailAndPassword`) para autorizar as operações protegidas no Firestore.
2. **Cadastro e Login de Convidados:** O convidado não cria conta nem senha para confirmar presença.
3. **Integração com APIs Pagas de WhatsApp / SMS:** O sistema não enviará mensagens automatizadas por provedores externos de mensageria (ex: Twilio ou Z-API).
4. **Integração com Carrinhos de E-commerce Externos:** Não haverá vinculação automática com carrinhos ou estoques de lojas como Amazon, Magazine Luiza ou Tok&Stok.
5. **Gateway de Pagamento / Checkout Online de PIX:** O sistema não gerará QR Codes dinâmicos com confirmação de pagamento bancário (via webhook). A contribuição via PIX é baseada estritamente na exibição e cópia da chave PIX da noiva (*PIX estático*).
6. **Upload Dinâmico de Fotos ou Galerias de Imagens:** Não haverá funcionalidade de upload de imagens por convidados ou noiva para o servidor ou Firebase Storage, mantendo a aplicação leve e imune a abusos de armazenamento.

---

## 8. Perfis de Usuário e Permissões

### 8.1. Perfis Mapeados

| Perfil | Identificação | Método de Acesso | Responsabilidades e Limites |
| :--- | :--- | :--- | :--- |
| **Convidado(a)** | Público geral | Acesso direto via URL pública (`index.html`). | Visualiza dados do evento, paleta e itens disponíveis. Pode criar confirmações e decrementar estoque de itens. Não visualiza a lista de outros convidados. |
| **Noiva (Administradora)** | Administradora única do evento | Acesso via URL do painel (`admin.html`) com validação de PIN Mestre. | Acesso completo a contadores, listagem integral de convidados, cadastro de presentes, liberação de itens, alteração de parâmetros e exportações. |

### 8.2. Matriz de Permissões Funcionais

| Funcionalidade / Operação | Convidado | Noiva (Autenticada por PIN) |
| :--- | :---: | :---: |
| Visualizar detalhes do evento, mapa e paleta | Sim | Sim |
| Visualizar presentes disponíveis (`qtd > 0`) | Sim | Sim |
| Submeter confirmação de presença (RSVP) | Sim | Não aplicável |
| Visualizar chave PIX e copiar | Sim | Sim |
| Acessar rota do painel administrativo (`admin.html`) | Bloqueado por PIN | Sim |
| Visualizar lista completa de convidados confirmados | **Bloqueado (LGPD)** | Sim |
| Cadastrar novos presentes na lista | Não | Sim |
| Alterar configurações gerais (prazo limite, chave PIX e mensagem de boas-vindas) | Não | Sim |
| Liberar presente de convidado (estorno de estoque) | Não | Sim |
| Exportar lista para CSV ou Imprimir / PDF | Não | Sim |

---

## 9. Recursos Estruturais do Sistema

### 9.1. Autenticação e Gate de Segurança
- **Implementação:** Barreira de autenticação client-side baseada em PIN Mestre pré-definido.
- **Comportamento:** Ao carregar `admin.html`, o sistema exibe um modal ou tela de sobreposição que bloqueia a visualização e a inicialização dos controladores de dados. Ao digitar o PIN correto, a chave de sessão é gravada em `sessionStorage` e o painel é renderizado. Ao fechar a aba do navegador, a sessão expira automaticamente.

### 9.2. Proteção de Dados e LGPD (Lei Geral de Proteção de Dados)
- **Princípio da Menor Exposição:** Nenhum dado pessoal (nome completo ou horário de confirmação de outros convidados) é exposto na página pública ou trafegado em requisições abertas.
- **Regras do Firestore:** A leitura da coleção `confirmacoes` é bloqueada para requisições anônimas diretas através de regras declarativas no Firebase, garantindo conformidade mesmo que o usuário inspecione o código-fonte da página.

### 9.3. Reserva Concorrente e Atomicidade
- **Problema Prevenido:** Dois convidados abrindo o site simultaneamente e tentando reservar a última unidade disponível de um mesmo presente.
- **Solução:** A baixa de presentes é executada por meio de **Transações Atômicas do Firestore (`runTransaction`)**. A transação lê a quantidade disponível atual diretamente do servidor e só concretiza a gravação da confirmação se a quantidade for estritamente superior a zero (`quantidade_disponivel > 0`), decrementando-a em 1 de forma indivisível. Caso o item tenha se esgotado no milissegundo anterior, a transação aborta e o convidado recebe um alerta para escolher outro item.

### 9.4. Soft Delete e Liberação de Presentes
- A remoção de vínculos de presentes não destrói o registro da presença do convidado. O sistema atualiza o status da confirmação para `"apenas_presenca"` ou desvincula o `presente_id`, preservando a auditoria histórica da confirmação da pessoa enquanto devolve o item físico ao inventário.

---

## 10. Entidades do Sistema

### 10.1. Entidade: Presente (`presentes`)
- **Finalidade:** Representa os itens de utilidade doméstica que compõem a lista de presentes do chá.
- **Atributos:**
  - `id`: Identificador único (alfanumérico gerado pelo Firestore).
  - `nome`: Descrição clara do item (ex: "Faqueiro Inox 24 Peças").
  - `quantidade_total`: Quantidade total cadastrada originalmente pela noiva (inteiro ≥ 1).
  - `quantidade_disponivel`: Quantidade restante disponível para escolha (inteiro ≥ 0).
  - `criado_em`: Timestamp de criação do registro.
  - `ativo`: Booleano indicando se o item está ativo no catálogo (padrão `true`).
- **Regras:** Quando `quantidade_disponivel == 0`, o item deixa de ser exibido na lista suspensa do convidado, mas permanece visível no inventário da noiva.

### 10.2. Entidade: Confirmação (`confirmacoes`)
- **Finalidade:** Armazena o registro de RSVP de cada convidado e sua respectiva escolha de presente ou modalidade.
- **Atributos:**
  - `id`: Identificador único do registro de confirmação.
  - `nome_convidado`: Nome informado pelo usuário no formulário (string higienizada).
  - `tipo_escolha`: Indicador textual da escolha (`"presente_item"`, `"pix_surpresa"` ou `"apenas_presenca"`).
  - `presente_id`: Referência ao ID do documento na coleção `presentes` (nulo caso tenha optado por PIX ou apenas presença).
  - `nome_presente_snapshot`: Nome do presente no momento da escolha (para preservação histórica mesmo em caso de alteração no cadastro).
  - `criado_em`: Timestamp do momento exato do envio da confirmação.
  - `liberado_em`: Timestamp indicando quando o presente foi desvinculado pela noiva (caso ocorra).

### 10.3. Entidade: Configurações Gerais (`configuracoes`)
- **Finalidade:** Parâmetros operacionais dinâmicos gerenciados pela noiva através do painel.
- **Atributos (Documento único `geral`):**
  - `data_limite_confirmacao`: String em formato ISO 8601 ou Timestamp indicando o encerramento do RSVP.
  - `chave_pix`: Chave PIX cadastrada pela noiva para recebimento de contribuições.
  - `mensagem_boas_vindas`: Texto introdutório carinhoso exibido no cabeçalho do convite.
  - `atualizado_em`: Timestamp da última modificação efetuada no painel.

### 10.4. Entidade: Migração Executada (`_migrations`)
- **Finalidade:** Tabela/coleção de controle de scripts de banco de dados executados, garantindo idempotência e prevenindo execuções duplicadas.
- **Atributos:**
  - `id`: Identificador ou número da migração (ex: `"001_initial_schema"`).
  - `executado_em`: Timestamp do momento de execução.
  - `status`: String indicando o resultado (`"sucesso"` ou `"falha"`).

### 10.5. Entidade: Índice de Nomes Confirmados (`nomes_confirmados`)
- **Finalidade:** Coleção de suporte leve e segura para a validação de homônimos (RN-05). Permite consultar a existência de um nome digitado sem violar a LGPD e sem dar acesso de leitura à lista geral de convidados.
- **Atributos:**
  - `id`: Nome normalizado em minúsculas e sem acentos (ex: `"maria-silva"`).
  - `nome_original`: Grafia original informada pelo convidado.
  - `criado_em`: Timestamp do registro.

---

## 11. Modelo de Dados Proposto

### 11.1. Estrutura de Coleções no Firestore

```text
DATABASE: (default)
├── configuracoes/
│   └── geral/
│       ├── data_limite_confirmacao: timestamp
│       ├── chave_pix: string
│       ├── mensagem_boas_vindas: string
│       └── atualizado_em: timestamp
├── presentes/
│   └── {presenteId}/
│       ├── nome: string
│       ├── quantidade_total: number (integer)
│       ├── quantidade_disponivel: number (integer)
│       ├── ativo: boolean
│       └── criado_em: timestamp
├── confirmacoes/
│   └── {confirmacaoId}/
│       ├── nome_convidado: string
│       ├── tipo_escolha: string ("presente_item" | "pix_surpresa" | "apenas_presenca")
│       ├── presente_id: string | null
│       ├── nome_presente_snapshot: string | null
│       ├── criado_em: timestamp
│       └── liberado_em: timestamp | null
├── nomes_confirmados/
│   └── {nomeNormalizado}/
│       ├── nome_original: string
│       └── criado_em: timestamp
└── _migrations/
    └── {migrationId}/
        ├── executado_em: timestamp
        └── status: string
```

### 11.2. Índices Compostos do Firestore (`firestore.indexes.json`)
Para consultas otimizadas e ordenação sem lentidão, os seguintes índices devem ser previstos:
1. **Coleção `presentes`**:
   - Campos: `ativo` (Ascendente) + `quantidade_disponivel` (Descendente) + `nome` (Ascendente).
2. **Coleção `confirmacoes`**:
   - Campos: `tipo_escolha` (Ascendente) + `criado_em` (Descendente). *(Campos de igualdade precedem campos de ordenação).*

### 11.3. Regras Declarativas de Segurança (`database/firestore.rules`)
As seguintes regras devem ser publicadas no console do Firebase. Elas asseguram a inviolabilidade dos dados, conformidade com a LGPD e plena operacionalidade do painel da noiva no GitHub Pages via autenticação administrativa silenciosa vinculada ao PIN Mestre (`request.auth != null`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Configurações: Leitura aberta a todos; Escrita restrita à noiva autenticada
    match /configuracoes/{documento} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Presentes: Leitura pública; Criação/deleção para admin; Baixa atômica no RSVP (-1) por visitantes ou edição/estorno (+1) pelo admin
    match /presentes/{presenteId} {
      allow read: if true;
      allow create, delete: if request.auth != null;
      allow update: if request.auth != null
                    || (request.resource.data.quantidade_disponivel >= 0
                        && request.resource.data.quantidade_disponivel == resource.data.quantidade_disponivel - 1
                        && request.resource.data.nome == resource.data.nome
                        && request.resource.data.quantidade_total == resource.data.quantidade_total
                        && request.resource.data.ativo == resource.data.ativo);
    }
    
    // Confirmações: Leitura, alteração e exclusão exclusivas para a noiva autenticada (LGPD); Criação pública validada
    match /confirmacoes/{confirmacaoId} {
      allow read, update, delete: if request.auth != null;
      allow create: if request.resource.data.nome_convidado is string
                    && request.resource.data.nome_convidado.size() >= 2
                    && request.resource.data.tipo_escolha in ['presente_item', 'pix_surpresa', 'apenas_presenca'];
    }

    // Índice de Homônimos: Verificação pontual aberta (get); Listagem e exclusão restritas à administração (LGPD); Escrita/atualização de índice pública
    match /nomes_confirmados/{nomeNormalizado} {
      allow get: if true;
      allow list: if request.auth != null;
      allow create, update: if true;
      allow delete: if request.auth != null;
    }
    
    // Migrações internas: Totalmente bloqueadas para acesso público
    match /_migrations/{migrationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 11.4. Arquitetura e Controle de Migrations
1. **Conceito e Finalidade:** As migrations garantem que o banco de dados NoSQL do Firestore seja inicializado com a coleção de configurações, valores padrão e lista inicial de presentes sem intervenção manual no console.
2. **Pasta Interna Protegida:** Localizada em `database/migrations/` dentro do `[Diretório do Projeto - Repositório]`. Essa pasta é puramente estrutural e não deve ser servida diretamente como página pública.
3. **Mecanismo de Execução e Prevenção de Duplicidade:**
   - Cada script de migração (ex: `001_initial_schema.js`, `002_seed_presentes.js`) verifica previamente se o seu identificador já existe na coleção `_migrations`.
   - Se já constar como `"sucesso"`, o script encerra a execução sem alterar dados existentes.
   - Caso contrário, executa as gravações em lote (*WriteBatch* do Firestore) e registra o documento de controle em `_migrations`.
4. **Modo de Execução:** A execução ocorre via script utilitário de terminal Node.js (`node database/migrations/run.js`) durante o setup inicial ou por rotina interna protegida, nunca por URL aberta no navegador.

---

## 12. Módulos e Telas

### 12.1. Tela do Convite Digital Público (`index.html`)
- **Objetivo:** Exibir os dados do evento e coletar as confirmações dos convidados.
- **Componentes Visuais (Conforme `docs/DESIGN.md`):**
  - **Hero Card (*Invitation Hero Card*):** Fundo em pergaminho marfim (`#F8F7F2`), monograma botânico centralizado em círculo, nomes dos noivos em *EB Garamond Display*, data, horário e mensagem de boas-vindas.
  - **Módulo de Contagem Regressiva:** Quatro caixas estilizadas (*Dias, Horas, Minutos, Segundos*) com tipografia Garamond e rótulos discretos em Manrope caixa alta.
  - **Bloco Logístico (*Como Chegar & Calendário*):**
    - Endereço completo formatado com ícone delicado.
    - Botão Secundário: *"Ver no Google Maps"*.
    - Botão Secundário: *"Adicionar à Agenda"*.
  - **Vitrine da Paleta de Cores (*Color Palette Swatches*):** Bloco estético exibindo amostras circulares/retangulares com as cores recomendadas (*Heritage Olive*, *Warm Sage*, *Champagne Gold*, *Flax*, etc.) e textos orientativos.
  - **Formulário de Confirmação & Presente (*RSVP Form*):**
    - Input de texto: *"Seu Nome Completo"*, com foco suave em tom oliva.
    - Checkbox estilizado: `[ ] Desejo apenas confirmar presença (sem escolher presente)`.
    - Dropdown seletor: Lista de presentes com unidades disponíveis e a opção destacada *"Presentear com PIX / Presente surpresa"*.
    - Botão Primário: *"Confirmar Presença"* (fundo `#3D4A36`, texto claro, hover com elevação suave).
  - **Área de Feedback e Modal PIX:** Cartão de congratulações após envio. Se PIX, exibe a chave em destaque e o botão *"Copiar Chave PIX"*.
  - **Alerta de Bloqueio por Prazo:** Cartão informativo que substitui o formulário caso a data limite tenha sido atingida.

### 12.2. Tela do Painel Administrativo da Noiva (`admin.html`)
- **Objetivo:** Gestão completa do evento, lista de convidados e inventário.
- **Componentes Visuais:**
  - **Gate / Modal de PIN Mestre:** Sobreposição limpa com campo de senha numérica/alfanumérica e botão *"Entrar no Painel"*.
  - **Barra Superior de Navegação:** Título do painel (*"Gestão do Chá de Cozinha"*), botão de recarregar e botão *"Sair / Bloquear"*.
  - **Cards de Métricas (Dashboard):** Três cartões com contadores amplos em Garamond e rótulos em Manrope:
    1. Confirmados.
    2. Presentes Escolhidos.
    3. Presentes Disponíveis.
  - **Barra de Gestão de Prazo e Configurações:** Campo de data/hora para o prazo limite e campo da chave PIX com botão *"Salvar Configurações"*.
  - **Formulário de Cadastro de Presentes:** Inputs de nome e quantidade total com botão *"Adicionar Item"*.
  - **Tabela de Convidados Confirmados:**
    - Cabeçalho elegante com ordenação por data de envio.
    - Linhas com nome, escolha e botão de ação *"Liberar Presente"*.
    - Estado vazio (*"Nenhum convidado confirmado até o momento"*).
  - **Barra de Ferramentas de Exportação:**
    - Botão *"Imprimir / Salvar em PDF"* com ícone de impressora.
    - Botão *"Baixar Planilha (CSV)"* com ícone de download.

---

## 13. Fluxos Funcionais

### 13.1. Fluxo 1: Visualização do Convite e Informações do Chá
- **Perfil:** Convidado.
- **Pré-condições:** Acesso ao link público da aplicação via navegador.
- **Passo a Passo:**
  1. O convidado acessa a URL pública (`index.html`).
  2. O sistema carrega as configurações dinâmicas e estáticas (nomes dos noivos, data, local, boas-vindas).
  3. A contagem regressiva inicia sua atualização contínua em segundos.
  4. O convidado pode clicar em *"Ver no Google Maps"* para abrir a rota em nova aba ou em *"Adicionar à Agenda"* para sincronizar a data no celular.
- **Resultado Esperado:** Informações consumidas com total clareza e carregamento instantâneo.

### 13.2. Fluxo 2: Confirmação com Escolha de Presente Físico
- **Perfil:** Convidado.
- **Pré-condições:** Prazo limite não expirado; lista de presentes com itens disponíveis.
- **Passo a Passo:**
  1. O convidado digita seu nome completo no campo do formulário.
  2. Caso o nome já conste na lista, o aviso amigável de homônimo é exibido abaixo do campo, sem travar o envio.
  3. O convidado abre o dropdown de presentes e seleciona um item (ex: *"Jogo de Panelas"*).
  4. Clica no botão *"Confirmar Presença"*.
  5. O `ConviteController` aciona o `PresenteModel` para executar a transação atômica no Firestore:
     - Lê o documento do presente.
     - Verifica se `quantidade_disponivel > 0`.
     - Decrementa `quantidade_disponivel` em 1.
     - Grava o documento em `confirmacoes` com `tipo_escolha: "presente_item"` e o `presente_id`.
  6. A tela oculta o formulário e apresenta a mensagem de confirmação bem-sucedida (*"Sua presença e seu presente foram registrados com muito carinho!"*).
- **Resultado Esperado:** Presente reservado, estoque decrementado e confirmação persistida com segurança.
- **Tratamento de Concorrência:** Se no instante do clique o item esgotou, o sistema reverte a transação, exibe aviso (*"Puxa, esse item acabou de ser escolhido por outro convidado! Por favor, selecione outro da lista."*) e atualiza o dropdown.

### 13.3. Fluxo 3: Confirmação com Opção PIX / Presente Surpresa
- **Perfil:** Convidado.
- **Passo a Passo:**
  1. O convidado preenche seu nome completo.
  2. No dropdown de presentes, seleciona a opção *"Presentear com PIX / Presente surpresa"*.
  3. Clica em *"Confirmar Presença"*.
  4. O sistema grava a confirmação em `confirmacoes` com `tipo_escolha: "pix_surpresa"` e `presente_id: null` (nenhum item físico tem estoque alterado).
  5. A tela exibe a confirmação de presença acompanhada de um bloco de destaque contendo a chave PIX da noiva e o botão interativo *"Copiar Chave PIX"*.
  6. Ao clicar no botão, a chave é copiada para o clipboard e o texto do botão muda temporariamente para *"Copiado!"*.
- **Resultado Esperado:** Presença garantida e facilidade de transferência financeira sem atrito.

### 13.4. Fluxo 4: Confirmação Exclusiva de Presença (Sem Presente)
- **Perfil:** Convidado.
- **Passo a Passo:**
  1. O convidado digita seu nome completo.
  2. Marca a caixa de seleção `[x] Desejo apenas confirmar presença`.
  3. A lista suspensa de presentes torna-se imediatamente desabilitada e limpa.
  4. Clica em *"Confirmar Presença"*.
  5. O sistema grava a confirmação com `tipo_escolha: "apenas_presenca"` e `presente_id: null`.
  6. A tela exibe mensagem carinhosa confirmando a presença.
- **Resultado Esperado:** Presença contabilizada sem reservas indevidas no inventário de presentes.

### 13.5. Fluxo 5: Acesso ao Convite após Expiração do Prazo
- **Perfil:** Convidado.
- **Pré-condições:** Data/hora do sistema superior à `data_limite_confirmacao`.
- **Passo a Passo:**
  1. O convidado acessa a página do convite.
  2. O controlador compara o horário atual com o prazo configurado.
  3. O bloco do formulário de RSVP não é carregado; em seu lugar, surge a mensagem: *"O prazo para confirmação de presença encerrou. Por favor, fale diretamente com a noiva."*
- **Resultado Esperado:** Nenhuma nova confirmação é permitida após a data estipulada.

### 13.6. Fluxo 6: Acesso e Validação do Painel da Noiva
- **Perfil:** Noiva (Administradora).
- **Passo a Passo:**
  1. A noiva acessa a URL `admin.html`.
  2. O sistema exibe o modal de segurança solicitando o PIN Mestre.
  3. A noiva digita o PIN correto e clica em *"Acessar"*.
  4. O sistema armazena a credencial em `sessionStorage` e inicializa o `AdminController`.
  5. Os dados de contadores, presentes cadastrados, lista de convidados e configurações são carregados do Firestore e renderizados na tela.
- **Resultado Esperado:** Área administrativa liberada exclusivamente para quem detém a senha mestre.

### 13.7. Fluxo 7: Liberação / Estorno de Presente por Desistência
- **Perfil:** Noiva (Administradora).
- **Pré-condições:** Convidado confirmado com item de presente associado.
- **Passo a Passo:**
  1. No painel, a noiva localiza a linha do convidado na tabela e clica no botão *"Liberar Presente"*.
  2. O sistema exibe uma caixa de diálogo de confirmação: *"Deseja liberar o presente deste convidado e devolver a unidade à lista disponível?"*.
  3. A noiva confirma a operação.
  4. O `ConfirmacaoModel` e `PresenteModel` executam a atualização atômica:
     - Incrementam em `+1` a `quantidade_disponivel` do presente correspondente.
     - Atualizam a confirmação do convidado, alterando `tipo_escolha` para `"apenas_presenca"` e registrando a data em `liberado_em`.
  5. A tabela é atualizada em tempo real e o contador de presentes disponíveis é recalculado.
- **Resultado Esperado:** O presente retorna imediatamente à lista pública de escolhas para outros convidados, enquanto a presença da pessoa continua registrada.

### 13.8. Fluxo 8: Exportação da Lista (Impressão/PDF e CSV)
- **Perfil:** Noiva (Administradora).
- **Passo a Passo:**
  - **Para Impressão:** Ao clicar em *"Imprimir / Salvar em PDF"*, o navegador abre a tela nativa de impressão. A folha `print.css` oculta a barra de PIN, botões de ação e campos de edição, apresentando um relatório limpo e sofisticado com cabeçalho botânico e a relação de convidados.
  - **Para CSV:** Ao clicar em *"Baixar Planilha (CSV)"*, o módulo utilitário compila todos os registros em formato tabular com delimitador ponto e vírgula (`;`), adiciona o cabeçalho UTF-8 BOM e inicia o download automático do arquivo `lista_cha_cozinha.csv`.

### 13.9. Fluxo 9: Cadastro Rápido de Novo Presente no Inventário
- **Perfil:** Noiva (Administradora).
- **Pré-condições:** Sessão administrativa ativa no painel (`admin.html`).
- **Passo a Passo:**
  1. A noiva localiza a seção *"Cadastrar Novo Presente"* no painel.
  2. Preenche o campo *"Nome do Presente"* (ex: "Faqueiro Inox 24 Peças") e o campo *"Quantidade Total"* (ex: 2).
  3. Clica no botão *"Adicionar Presente"*.
  4. O `AdminController` valida os campos (nome com no mínimo 3 caracteres, quantidade inteira positiva ≥ 1) e aciona o `PresenteModel`.
  5. O sistema grava o novo documento na coleção `presentes` com:
     - `nome`: string informada;
     - `quantidade_total`: número inteiro informado;
     - `quantidade_disponivel`: mesmo valor de `quantidade_total`;
     - `ativo`: `true`;
     - `criado_em`: timestamp atual.
  6. O formulário de cadastro é limpo e um feedback de sucesso (*"Presente adicionado com sucesso!"*) é exibido via toast.
  7. O contador *"Presentes Ainda Disponíveis"* é recalculado e o item torna-se imediatamente elegível para seleção na página pública do convite.
- **Resultado Esperado:** Novo item incorporado ao inventário e visível no dropdown do convite.

### 13.10. Fluxo 10: Atualização das Configurações do Evento (Prazo, PIX e Boas-Vindas)
- **Perfil:** Noiva (Administradora).
- **Pré-condições:** Sessão administrativa ativa no painel (`admin.html`).
- **Passo a Passo:**
  1. Na seção de configurações do painel, a noiva ajusta os valores desejados:
     - Seletor de data e hora do prazo limite (`data_limite_confirmacao`);
     - Campo de texto da chave PIX (`chave_pix`);
     - Área de texto da mensagem de boas-vindas (`mensagem_boas_vindas`).
  2. Clica no botão *"Salvar Configurações"*.
  3. O `AdminController` aciona o `ConfiguracaoModel`, persistindo as alterações no documento `configuracoes/geral` com o timestamp `atualizado_em`.
  4. Um aviso amigável de sucesso (*"Configurações atualizadas com sucesso!"*) é exibido na tela.
  5. As novas configurações entram em vigor instantaneamente no convite público para os próximos acessos.
- **Resultado Esperado:** Prazos, mensagens e dados de contribuição financeira atualizados sem necessidade de alterar código ou refazer deploy.

---

## 14. Validações e Regras de Negócio

### 14.1. Mapeamento Consolidado de Regras de Negócio (RN)

| ID | Regra | Especificação Técnica e Comportamental |
| :--- | :--- | :--- |
| **RN-01** | **Visibilidade de Presentes** | Apenas presentes com `quantidade_disponivel > 0` e `ativo == true` são incluídos no seletor dropdown da página pública do convite. |
| **RN-02** | **Reserva e Baixa Atômica** | A reserva de presente físico reduz estritamente em 1 a `quantidade_disponivel` do item via transação atômica (`runTransaction`). Se a quantidade atingir 0, o item é removido do dropdown nos acessos subsequentes. |
| **RN-03** | **Apenas Confirmar Presença** | Ao marcar o checkbox `"Apenas confirmar presença"`, o campo dropdown de presentes é desabilitado e limpo. A confirmação é gravada com `tipo_escolha = "apenas_presenca"` e `presente_id = null`. |
| **RN-04** | **Presente PIX / Surpresa** | Ao selecionar `"Presentear com PIX / Presente surpresa"`, nenhum item do inventário sofre decremento de estoque. A confirmação é gravada com `tipo_escolha = "pix_surpresa"` e o sistema exibe a chave PIX e o botão de cópia na tela de sucesso. |
| **RN-05** | **Alerta Amigável de Homônimo** | Caso o nome digitado já conste no índice `nomes_confirmados`, o sistema exibe mensagem orientando a adição de sobrenome/apelido, mas **não bloqueia** o envio nem constrange o convidado. |
| **RN-06** | **Bloqueio por Data Limite** | Se o timestamp atual for posterior ao configurado em `data_limite_confirmacao`, o envio de qualquer confirmação é impedido, ocultando o formulário e exibindo mensagem de prazo encerrado. |
| **RN-07** | **Liberação de Presente** | A ação de liberar presente no painel remove a associação do item da confirmação do convidado e soma `+1` na `quantidade_disponivel` do presente no Firestore, recolocando o item na vitrine pública. |
| **RN-08** | **Cálculo dos Contadores** | - *Total Confirmados*: Contagem de todos os documentos em `confirmacoes`.<br>- *Total Presentes*: Soma das confirmações com `tipo_escolha == "presente_item"` + `tipo_escolha == "pix_surpresa"`.<br>- *Presentes Disponíveis*: Soma das unidades de `quantidade_disponivel` de todos os presentes ativos. |

### 14.2. Validações de Formulário
- **Nome do Convidado:** Obrigatório, tamanho mínimo de 2 caracteres e máximo de 100 caracteres. Espaços duplicados e caracteres de controle devem ser higienizados antes do envio.
- **Seleção de Opção:** É mandatório que o usuário ou marque o checkbox de presença exclusiva, ou selecione uma opção válida no dropdown de presentes (item físico ou PIX).
- **Cadastro de Novo Presente no Painel:** O nome do presente deve ter entre 3 e 80 caracteres. A quantidade inicial deve ser um número inteiro positivo entre 1 e 99.

---

## 15. Autenticação e Sessão

### 15.1. Mecanismo de Autenticação
O sistema utiliza controle de acesso simplificado via **PIN Mestre / Senha Administrativa**, sem fricção de formulários tradicionais com recuperação de senha por e-mail:
- O valor do PIN Mestre e a conta administrativa associada são definidos centralizadamente no arquivo de configuração em código (`config/config.js`).
- O acesso à página pública (`index.html`) é totalmente anônimo e aberto para envio de RSVP.
- O acesso aos recursos da página administrativa (`admin.html`) exige a validação do PIN Mestre.

### 15.2. Ciclo de Vida da Sessão Administrativa e Integração com Firebase
1. **Entrada e Autenticação Silenciosa no Firebase:** A noiva digita o PIN no modal de segurança. Ao validar o PIN correto, o `AdminController` efetua a autenticação administrativa no Firebase Auth em segundo plano (via `signInWithEmailAndPassword(auth, config.adminAuth.email, pin)` ou credencial administrativa dedicada). Esse processo é transparente para a noiva e gera o estado `request.auth != null` exigido pelas regras de segurança do Firestore para liberar consultas e edições.
2. **Armazenamento Seguro:** O status de autenticação e o carimbo de data/hora são gravados em `sessionStorage` (armazenamento volátil da aba).
3. **Persistência:** A sessão permanece ativa enquanto a aba do navegador estiver aberta. Se a página for recarregada na mesma aba, o estado logado é restaurado automaticamente.
4. **Encerramento:** Ao fechar a aba ou clicar no botão *"Sair / Bloquear"*, o `AdminController` executa `signOut(auth)`, limpa o `sessionStorage` e exibe novamente o modal de PIN.
5. **Proteção contra Força Bruta:** Caso ocorram mais de 5 tentativas consecutivas incorretas do PIN, o sistema bloqueia novas tentativas no navegador por 5 minutos, registrando um evento no log de segurança local.

---

## 16. Controle de Acesso

### 16.1. Matriz de Acesso e Rotas

| Rota / Arquivo | Público Permitido | Proteção Aplicada |
| :--- | :--- | :--- |
| `index.html` | Todos (Convidados e Noiva) | Acesso público irrestrito. |
| `admin.html` | Apenas a Noiva | Barreira visual de PIN + bloqueio de inicialização de controllers. |
| `config/config.js` | Público (código frontend) | Apenas parâmetros públicos do Firebase; sem credenciais de backend. |
| `database/` | Desenvolvedores / Setup | Scripts de setup executados localmente via CLI Node.js; regras e schemas declarativos não expõem dados sensíveis. |

### 16.2. Proteção de Dados Sensíveis no Backend (Firestore)
Mesmo que um usuário mal-intencionado tente executar comandos via Console do DevTools para ler a coleção `confirmacoes`, as **Firestore Security Rules** descritas na Seção 11 rejeitarão a requisição com erro de `permission-denied`, resguardando a privacidade da noiva e a lista de convidados contra raspagem de dados.

---

## 17. Auditoria e Histórico

### 17.1. Rastreabilidade de Operações
O sistema preserva histórico operacional direto nos documentos das coleções principais:
- **Confirmação:** Armazena `criado_em` (data/hora exata do envio) e `nome_presente_snapshot` (para saber o que havia sido reservado mesmo se o item for renomeado).
- **Liberação de Presente:** Ao ser estornado, o registro não é deletado; preenche-se o campo `liberado_em` com o timestamp da ação, mantendo a presença da pessoa no histórico de convidados.
- **Configurações:** O documento de parâmetros gerais mantém o campo `atualizado_em` para controle de alterações recentes.

---

## 18. Soft Delete e Exclusões

### 18.1. Política de Exclusão de Registros
- **Presentes:** Itens do catálogo não sofrem deleção física durante o ciclo de uso para não corromper associações históricas. Itens que a noiva decida remover do catálogo têm sua propriedade `ativo` alterada para `false` (*soft delete*), saindo imediatamente de qualquer exibição pública sem perder os vínculos já reservados.
- **Convidados:** A primeira versão do sistema não possui funcionalidade de exclusão física nem de arquivamento de confirmações de convidados, mantendo a contagem total de presenças íntegra para o controle do buffet. A única ação disponível é o botão *"Liberar Presente"*, que desvincula o presente físico do convidado (estornando `+1` unidade ao estoque disponível no inventário) e converte o status da escolha para *"Apenas Presença"*, gravando o carimbo de data/hora no campo `liberado_em`.

---

## 19. Logs

### 19.1. Log de Erros
- **Ocorrências Monitoradas:** Erros de runtime JavaScript, falhas de comunicação com a API do Firestore, rejeições de permissão e erros de transação concorrente.
- **Mensagem Amigável ao Usuário:** Em caso de falha crítica na interface, o usuário visualiza um aviso claro e acolhedor (ex: *"Tivemos uma pequena instabilidade de conexão. Por favor, tente novamente em instantes."*), sem expor stack traces ou detalhes técnicos de sistema.
- **Mecanismo de Contingência:** O módulo utilitário `app/utils/logger.js` captura as exceções e as grava em `localStorage` sob a chave `_app_error_logs` (limitado aos últimos 50 registros) para diagnóstico técnico caso a conexão com a nuvem esteja indisponível.

### 19.2. Log de Segurança
- **Eventos Monitorados:**
  - Tentativas consecutivas inválidas de inserção de PIN no painel da noiva.
  - Tentativas anômalas de submissão com dados inválidos.
- **Armazenamento:** Registrados no console do desenvolvedor em modo debug e armazenados localmente no navegador em `localStorage` sob a chave `_app_sec_logs`.

---

## 20. Configurações Globais

### 20.1. Parâmetros Estáticos do Evento (`config/config.js`)
As definições estruturais do evento são estabelecidas diretamente no código-fonte no arquivo `config/config.js`:
- Nomes dos Noivos: Ex: *"Helena & Gabriel"*.
- Data e Horário Oficial do Chá: Ex: *"24 de Outubro de 2026 às 16:00"*.
- Endereço Completo do Evento.
- Link de Redirecionamento para o Google Maps.
- Lista de Cores da Paleta Sugerida (códigos hexadecimais e rótulos descritivos fiéis ao `docs/DESIGN.md`).
- PIN Mestre Padrão de Acesso Administrativo.
- Identificador da Conta Administrativa (`adminAuth`: email administrativo configurado no Firebase Auth para autorizar as operações do painel mediante validação do PIN).
- Objeto de Configuração do Firebase Web SDK (`firebaseConfig`: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).

### 20.2. Parâmetros Dinâmicos (Gerenciados pela Noiva no Firestore)
Os seguintes parâmetros podem ser modificados dinamicamente no painel administrativo sem necessidade de novo deploy de código:
1. `data_limite_confirmacao`: Prazo final para recebimento de confirmações no site.
2. `chave_pix`: Chave informada aos convidados que optarem por presente em PIX.
3. `mensagem_boas_vindas`: Mensagem de acolhimento personalizada exibida no topo do convite.

### 20.3. Estratégia de Fallback
Caso o documento dinâmico do Firestore esteja indisponível ou inacessível no momento do carregamento, a aplicação utiliza automaticamente como valor padrão (*fallback*) as constantes estáticas definidas no `config/config.js`, garantindo que o convite permaneça funcional e com visual íntegro em qualquer circunstância.

---

## 21. Uploads, Anexos e Arquivos

- **Status da Funcionalidade:** Confirmada expressamente como **FORA DE ESCOPO** para a primeira versão da aplicação.
- **Justificativa:** O projeto visa a máxima leveza, custo zero de hospedagem e simplicidade operacional. A interface utilizará elementos visuais vetorizados (SVGs) e composições tipográficas elegantes, eliminando os custos, riscos de segurança e complexidades de gerenciamento associados a uploads de fotos por convidados ou pela noiva.

---

## 22. Relatórios, Consultas e Exportações

### 22.1. Impressão / Salvar em PDF (`print.css`)
- **Objetivo:** Fornecer um documento físico ou arquivo PDF diagramado com perfeição para planejamento e checagem no dia do chá.
- **Formatação de Impressão:**
  - Ocultação automática de botões, inputs, painel de PIN, caixas de diálogo e elementos de navegação através da regra `@media print`.
  - Exibição de cabeçalho limpo com nomes dos noivos e a data de emissão da lista.
  - Tabela formatada em preto e tons de cinza elegantes, com bordas finas e quebras de página controladas (`page-break-inside: avoid`).
  - Resumo final com a contagem total de confirmados e presentes.

### 22.2. Exportação de Planilha (CSV)
- **Objetivo:** Permitir a importação da lista de convidados em softwares como Microsoft Excel, Google Planilhas ou Apple Numbers.
- **Especificações Técnicas do Arquivo:**
  - Formato: Arquivo de texto delimitado por ponto e vírgula (`;`).
  - Codificação: `UTF-8 with BOM` (Byte Order Mark: `\uFEFF`), garantindo que acentuações e caracteres da língua portuguesa abram perfeitamente no Excel sem distorção.
  - Nomenclatura do Arquivo: `lista_convidados_cha_[DATA].csv`.
  - Colunas Exportadas:
    1. `Nome do Convidado`
    2. `Tipo de Confirmação` (*Presente Físico*, *PIX / Presente Surpresa* ou *Apenas Presença*)
    3. `Presente Escolhido` (Nome do item ou indicação de PIX/Presença)
    4. `Data e Hora da Confirmação` (Formatada em `DD/MM/AAAA HH:mm:ss`)

---

## 23. APIs e Integrações Externas

1. **Google Maps:** Link direto de redirecionamento (`https://www.google.com/maps/search/?api=1&query=...`) contendo o endereço codificado, acionado pelo botão da interface.
2. **Calendário Pessoal (Google Calendar / Apple Calendar):**
   - Link formatado para inclusão direta no Google Agenda (`https://calendar.google.com/calendar/render?action=TEMPLATE&text=...`).
   - Geração dinâmica client-side de arquivo padrão `.ics` via Blob para download imediato em dispositivos Apple/iOS e computadores.
3. **Área de Transferência (Clipboard API):** Utilização nativa de `navigator.clipboard.writeText()` para cópia instantânea da chave PIX no celular do convidado, com fallback tradicional (`document.execCommand('copy')`) para navegadores mais antigos.
4. **Sem Dependência de APIs Pagas:** Não há integração com serviços de pagamento bancário ou gateways de mensagens.

---

## 24. Segurança Funcional

1. **Proteção Contra Ataques XSS (Cross-Site Scripting):** Toda entrada de texto proveniente do usuário (campo de nome de convidado e cadastro de presentes) é sanitizada rigorosamente antes de ser injetada no DOM, utilizando propriedades seguras como `textContent` ou rotinas de escape de tags HTML.
2. **Proteção de Dados Pessoais (LGPD):** Conforme garantido pelas *Firestore Security Rules*, requisições públicas anônimas não conseguem listar a coleção `confirmacoes`, impedindo que terceiros obtenham a lista de convidados do evento.
3. **Isolamento de Credenciais Sensíveis:** Nenhuma chave secreta de servidor é embutida no projeto. O arquivo `config/config.js` contém apenas chaves públicas de identificação do Firebase, as quais não conferem privilégios sem a validação das regras de segurança na nuvem.
4. **Resistência a Concorrência:** Uso de transações atômicas para que o estoque de presentes nunca fique negativo, mesmo sob múltiplos acessos simultâneos.

---

## 25. Organização Sugerida da Implementação

A implementação pela IA codificadora e equipe técnica deve ser executada nas seguintes etapas ordenadas e testáveis:

1. **Estruturação do Repositório:** Configuração da árvore de diretórios a partir do `[Diretório do Projeto - Repositório]`.
2. **Camada de Estilo e Design Tokens:** Criação dos arquivos CSS (`variables.css`, `reset.css`, `main.css`, `admin.css`, `print.css`) incorporando rigorosamente as cores, tipografia e espaçamentos do `docs/DESIGN.md`.
3. **Arquivo de Configuração em Código:** Criação do `config/config.js` com os dados estáticos do casal, parâmetros do evento e identificadores públicos do Firebase.
4. **Regras de Segurança e Migrations:**
   - Elaboração do arquivo declarativo `database/firestore.rules`.
   - Criação dos scripts versionados em `database/migrations/` para semear os presentes iniciais e configurações padrão.
   - Configuração da coleção de controle `_migrations`.
5. **Implementação da Camada de Modelos (MVC):**
   - `ConfiguracaoModel.js`: Leitura e atualização de prazos e mensagens.
   - `PresenteModel.js`: Listagem com filtro `quantidade_disponivel > 0` e baixa atômica via `runTransaction`.
   - `ConfirmacaoModel.js`: Gravação de presenças e reversão de itens.
6. **Implementação da Camada de Visualização (MVC):**
   - `ConviteView.js`: Hero card, countdown regressivo, botões de mapa e agenda, paleta de cores.
   - `FormularioRSVPView.js`: Validações de campos, manipulação do dropdown, feedback de homônimo e cópia de chave PIX.
   - `PainelNoivaView.js`: Renderização de contadores, tabela de convidados e modal de PIN.
   - `ToastView.js`: Notificações visuais e mensagens amigáveis de feedback.
7. **Implementação dos Controladores (MVC):**
   - `ConviteController.js`: Orquestração de submissões públicas e bloqueio por prazo.
   - `AdminController.js`: Gestão de PIN em `sessionStorage`, estorno de itens e cadastro de novos presentes.
8. **Módulos Utilitários:**
   - `calendar.js`: Geração de links e arquivo `.ics`.
   - `export.js`: Rotina de exportação CSV com UTF-8 BOM.
   - `logger.js`: Gestão de logs em `localStorage`.
9. **Construção das Páginas HTML:**
   - Montagem de `index.html` (Convite Público).
   - Montagem de `admin.html` (Painel Administrativo da Noiva).
10. **Testes e Validação:**
    - Teste de responsividade mobile-first e emulação de tela pequena.
    - Teste de reserva de presentes e concorrência simultânea.
    - Teste de bloqueio de prazo expirado.
    - Teste de validação e bloqueio por PIN Mestre.
    - Teste da folha de impressão (`window.print()`) e download do CSV.

---

## 26. Critérios de Aceitação Técnica e Funcional

Para que o sistema seja considerado aprovado e pronto para entrega, os seguintes critérios devem ser integralmente atendidos:

- [ ] **Aderência ao Design System:** Toda a interface reflete fielmente as fontes (EB Garamond e Manrope), cores (*Heritage Olive*, *Warm Sage*, *Champagne Gold*, *Ivory Parchment*) e sombras do `docs/DESIGN.md`.
- [ ] **Arquitetura MVC no Client-Side:** Clara separação de responsabilidades entre Models, Views e Controllers no código JavaScript.
- [ ] **Responsividade Mobile-First:** O convite funciona com fluidez e ergonomia perfeita em telas de smartphones (360px a 430px) e computadores.
- [ ] **Baixa e Reversão Atômica de Estoque:** Presentes físicos reservados têm sua quantidade decrementada de forma segura (`runTransaction`) e itens esgotados somem da lista suspensa.
- [ ] **Fluxo Alternativo de PIX:** Opção de presentear via PIX exibe a chave cadastrada e permite a cópia com um clique, sem alterar o estoque físico.
- [ ] **Opção "Apenas Confirmar Presença":** Desabilita a lista suspensa e grava a confirmação sem reservar presentes.
- [ ] **Alerta Amigável de Nome Duplicado:** Exibe aviso amigável sem impedir o envio.
- [ ] **Bloqueio por Data Limite:** Formulário de envio bloqueado automaticamente após a data estipulada pela noiva.
- [ ] **Painel Administrativo Protegido:** Rota `admin.html` inacessível sem a digitação correta do PIN Mestre, com sessão temporária em `sessionStorage`.
- [ ] **Segurança e LGPD:** Lista de convidados protegida contra leitura pública através das regras do Firestore.
- [ ] **Exportações Funcionais:** Botão de impressão com folha limpa sem elementos operacionais e botão de CSV baixando planilha formatada com acentos corretos (UTF-8 BOM).
- [ ] **Deploy Exclusivo no GitHub Pages:** Publicação direta no GitHub Pages a partir do repositório Git, sem dependência de XAMPP, Hostnet ou pastas legadas como `public_html`, `htdocs` ou `www`.
- [ ] **Configuração em Código Sem `.env`:** Arquivo `config/config.js` utilizado para parâmetros e credenciais públicas do Firebase.
- [ ] **Migrations Versionadas:** Scripts de criação de dados iniciais e controle de execução duplicada via coleção `_migrations`.

---

## 27. Pontos Pendentes e Decisões Futuras

Não foram identificadas pendências para iniciar a codificação com base neste FSD.

Todas as decisões arquiteturais, funcionais, de segurança e de interface encontram-se plenamente alinhadas e consolidadas. Possíveis extensões futuras (como galeria de fotos pós-evento ou envio automático de lembretes) poderão ser avaliadas para uma versão 2.0 após a realização do chá.

---

## 28. Conclusão

Este Documento de Especificação Funcional (FSD) consolida integralmente todos os requisitos, regras de negócio, modelos de dados, decisões técnicas e orientações visuais necessárias para a implementação completa e segura do sistema de **Convite Digital e Lista de Presentes para Chá de Cozinha**.

O projeto está pronto para ser desenvolvido pela IA codificadora e equipe técnica utilizando exclusivamente:
- **`docs/FSD.md`**
- **`docs/DESIGN.md`**

Nenhum documento prévio adicional deve ser consultado para a execução do código. A implementação pode ser iniciada imediatamente seguindo a organização sugerida na Seção 25.
