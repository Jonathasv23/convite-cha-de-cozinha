# Convite Digital e Lista de Presentes para Chá de Cozinha
**Identidade Visual:** *Botanical Heritage Atelier*

Aplicação web estática, responsiva (*mobile-first*) e integrada ao banco de dados em nuvem **Firebase Firestore** (plano Spark), desenvolvida para a confirmação de presença (RSVP) e reserva de presentes sem duplicação de itens.

---

## 1. Stack Tecnológica & Arquitetura

- **Frontend:** HTML5 semântico, JavaScript moderno (Vanilla JS, ES6+ Modules) sem dependência de bundlers ou transpiladores (Zero Bundlers / Zero Dependências Pesadas).
- **Estilos:** CSS3 moderno utilizando Custom Properties baseadas nos tokens do `docs/DESIGN.md`, CSS Grid, Flexbox e `@media print`.
- **Persistência / Nuvem:** Firebase Firestore (plano gratuito Spark) e Firebase Auth (autenticação administrativa silenciosa vinculada ao PIN Mestre).
- **Tipografia:** Google Fonts com as famílias **EB Garamond** e **Manrope**.
- **Padrão Arquitetural:** MVC (*Model-View-Controller*) no lado do cliente (*client-side*).
- **Sem Backend Centralizado Próprio:** Toda a orquestração ocorre no cliente e as restrições de privacidade e acesso são garantidas pelas **Firestore Security Rules**.
- **Sem arquivos `.env`:** Parâmetros e credenciais públicas do Firebase são gerenciados no módulo `config/config.js`.

---

## 2. Estrutura do Projeto

```text
.
├── README.md                 # Instruções de configuração e deploy
├── index.html                # Ponto de entrada do convite (visão do convidado)
├── admin.html                # Ponto de entrada administrativo (painel da noiva)
├── AGENTS.md                 # Regras e contexto para agentes de IA
├── docs/                     # Documentações do projeto
│   ├── FSD.md                # Especificação Funcional e Técnica
│   ├── DESIGN.md             # Guia de design e tokens visuais
│   ├── INSUMOS.md            # Inventário de arquivos de apoio
│   ├── PLANO.md              # Plano de construção incremental
│   ├── STATUS.md             # Status de desenvolvimento e checklist
│   └── ERROS.md              # Registro de erros e soluções
├── config/                   # Configurações do evento e Firebase
│   ├── config.example.js
│   └── config.js
├── database/                 # Regras e migrações do Firestore
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   └── migrations/
├── app/                      # Código-fonte MVC
│   ├── models/
│   ├── views/
│   ├── controllers/
│   └── utils/
└── assets/                   # Estilos, ícones e scripts estáticos
    ├── css/
    ├── js/
    └── images/
```

---

## 3. Como Rodar em Desenvolvimento Local

1. Abra a pasta do projeto no **Visual Studio Code**.
2. Instale a extensão **Live Server** (caso ainda não a possua).
3. Clique no botão **"Go Live"** na barra inferior do VS Code (ou clique com o botão direito em `index.html` e selecione *"Open with Live Server"*).
4. O convite será aberto automaticamente em seu navegador padrão no endereço `http://127.0.0.1:5500/`.
5. Para testar o painel administrativo da noiva, acesse `http://127.0.0.1:5500/admin.html`.

*Alternativa via linha de comando:*
```bash
# Com Node.js instalado:
npx serve .

# Ou com Python 3 instalado:
python -m http.server 5500
```

---

## 4. Como Fazer o Deploy no GitHub Pages

1. Inicialize o repositório Git local e faça o commit dos arquivos:
   ```bash
   git init
   git add .
   git commit -m "feat: infraestrutura inicial e base do convite"
   ```
2. Crie um repositório no seu GitHub e vincule a branch principal (`main`):
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
   git branch -M main
   git push -u origin main
   ```
3. No GitHub, acesse: **Settings** -> **Pages**.
4. Em **Build and deployment** / **Branch**, selecione a branch `main` e a pasta `/ (root)`.
5. Clique em **Save**. Em instantes, o site estará publicado e acessível com certificado SSL/HTTPS gratuito.

---

## 5. Regras de Segurança e LGPD

- As regras declarativas de segurança estão definidas em `database/firestore.rules` e devem ser publicadas no Console do Firebase.
- A leitura da lista de confirmações de convidados é **estritamente bloqueada** para visitantes anônimos, impedindo extração ou mineração de dados confidenciais.
- A baixa de presentes físicos é feita com transações atômicas para evitar reservas duplicadas ou estoque negativo.
