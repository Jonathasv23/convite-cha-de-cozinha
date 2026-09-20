# Decisões Técnicas do Projeto

**Projeto:** Convite Digital e Lista de Presentes para Chá de Cozinha (Site)  
**Status:** Consolidado e Pronto para Elaboração do FSD  
**Data:** 20/09/2026  

---

## 1. Contexto e Documentos de Referência

- **PRD.md:** Disponível e analisado integralmente. Serve como a fonte funcional oficial do que o site deve realizar.
- **DESIGN.md:** Disponível e analisado integralmente. Adotado como referência visual obrigatória (*Botanical Heritage Atelier*, tipografia EB Garamond + Manrope, paleta de tons *Heritage Olive*, *Warm Sage*, *Ivory Parchment* e acentos em *Champagne Gold*).

---

## 2. Decisões Técnicas Confirmadas

### 2.1. Stack Tecnológica e Arquitetura
- **Frontend / Linguagens:** HTML5 semântico, CSS3 moderno e JavaScript puro (Vanilla JS).
- **Padrão Arquitetural Obrigatório:** **MVC (Model-View-Controller)** adaptado para o lado do cliente:
  - **Models:** Gerenciam os dados de presentes, confirmações de presença e regras de negócio (cálculo de contadores, decremento de estoque e verificação de prazo limite).
  - **Views:** Responsáveis pela renderização dos componentes visuais do convite, do formulário de RSVP e do painel da noiva, seguindo rigorosamente os tokens do `DESIGN.md`.
  - **Controllers:** Orquestram os eventos de clique, submissão de formulários, validações em tela e a comunicação com a camada de persistência.

### 2.2. Hospedagem e Ambientes
- **Ambiente de Produção:** **GitHub Pages** (hospedagem estática gratuita, rápida e segura).
- **Ambiente de Desenvolvimento Local:** Editor **VS Code** com servidor estático local (como a extensão *Live Server* ou equivalente).
- **Ambiente de Testes / Homologação:** Não haverá ambiente formal de homologação na nuvem nesta versão. Todos os testes de layout, responsividade mobile-first e regras de negócio serão executados localmente no VS Code antes da publicação final no repositório.

### 2.3. Persistência de Dados (Banco de Dados em Nuvem)
- **Provedor:** **Firebase Firestore** (plano gratuito Spark).
- **Integração:** Conexão direta via SDK Web do Firebase no JavaScript do site.
- **Coleções Principais:**
  - `presentes`: Itens do chá com nome, quantidade total e quantidade disponível.
  - `confirmacoes`: Registros de confirmação de presença (nome do convidado, tipo de confirmação, ID do presente escolhido e data/hora).
  - `configuracoes`: Parâmetros globais do evento (data limite de confirmação, chave PIX e mensagem de boas-vindas).

### 2.4. Segurança e Conformidade com a LGPD (Lei Geral de Proteção de Dados)
- **Repositório GitHub 100% Livre de Dados Sensíveis:** O repositório conterá apenas o código-fonte da aplicação. Nenhum dado pessoal de convidado ou credencial privada será versionado no GitHub.
- **Segurança via Firestore Security Rules:** As chaves de configuração do Firebase expostas no código público atuam estritamente como identificadores do projeto. Toda a segurança e privacidade são garantidas pelas **Regras de Segurança (Security Rules)** configuradas no console do Firebase:
  - **Coleção `confirmacoes`:**
    - **Leitura (`read` / `list`):** Bloqueada para o público. Apenas sessões administrativas autorizadas podem consultar a lista de convidados. Isso garante que nenhum convidado ou terceiro consiga extrair a lista de nomes e contatos via requisições diretas ao banco.
    - **Criação (`create`):** Aberta para qualquer convidado enviar sua confirmação de presença (com validação dos campos obrigatórios).
    - **Alteração/Exclusão (`update` / `delete`):** Permitida exclusivamente para a administração (liberação de presentes ou exclusões).
  - **Coleção `presentes`:**
    - **Leitura (`read`):** Permitida para todos os visitantes visualizarem itens disponíveis (`quantidade_disponivel > 0`).
    - **Atualização de quantidade:** Permitida no momento do RSVP ou restrita a transações atômicas controladas pelas regras.
  - **Coleção `configuracoes`:**
    - **Leitura (`read`):** Aberta para que o convite público exiba a data limite, o recado dos noivos e a chave PIX.
    - **Escrita (`write`):** Restrita estritamente à administração.

### 2.5. Proteção de Acesso ao Painel da Noiva
- **Mecanismo:** Tela de bloqueio elegante (modal / gate de segurança) solicitando um **PIN / Senha Mestra pré-definida**.
- **Comportamento:** Sem necessidade de fluxo burocrático de criação de conta de e-mail ou recuperação de senha. O carregamento dos dados da lista de convidados e das ações administrativas só é liberado após a validação bem-sucedida do PIN, impedindo acessos curiosos à rota do painel.

### 2.6. Configurações Globais Dinâmicas
- O painel administrativo permitirá à noiva atualizar em tempo real:
  1. **Data Limite de Confirmação:** Ao expirar, bloqueia o envio do formulário de RSVP.
  2. **Chave PIX:** Chave exibida aos convidados que optarem por presentear com PIX.
  3. **Mensagem de Boas-Vindas:** Recado carinhoso aos convidados na página inicial.
- As informações estruturais e estéticas do evento (nomes dos noivos, local físico/Google Maps e amostras da paleta de cores) permanecem configuradas de forma centralizada e estável no arquivo de configuração estático da aplicação.

### 2.7. Relatórios e Exportações
- O painel da noiva terá dois recursos de exportação da lista:
  1. **Impressão / Salvar em PDF:** Acionamento via `window.print()` associado a uma folha de estilo CSS para impressão (`@media print`), removendo menus, botões e elementos operacionais, gerando uma folha limpa e diagramada.
  2. **Exportação CSV:** Botão dedicado que gera e faz o download imediato de um arquivo `.csv` formatado (Nome, Tipo de Escolha, Presente Selecionado, Data/Hora).

### 2.8. Uploads e Arquivos
- **Status:** Confirmado expressamente como **FORA DE ESCOPO**. O site não terá upload dinâmico de fotos ou envio de anexos por convidados ou pela noiva, mantendo a arquitetura ultra leve e segura.

---

## 3. Padrões Adotados

1. **Separação MVC no Client-Side:**
   - Pasta/módulos organizados para isolar regras de negócio e dados (`models/`), interface e manipulação de DOM (`views/`) e lógica de controle e eventos (`controllers/`).
2. **Design System:**
   - Cumprimento rigoroso dos tokens de cor, tipografia e espaçamento definidos no `DESIGN.md`.
3. **Princípio da Menor Exposição (LGPD):**
   - Nenhuma listagem pública de convidados confirmados.
   - Restrição estrita de leitura de confirmações exclusivamente ao painel autenticado.

---

## 4. Lacunas Técnicas Resolvidas

| Lacuna Identificada | Resolução Adotada |
| :--- | :--- |
| **Ausência de Backend no GitHub Pages** | Uso do Firebase Firestore diretamente no client-side para persistência em tempo real, sem custo de hospedagem. |
| **Exposição de Dados Pessoais no Repositório (LGPD)** | Repositório no GitHub armazena apenas arquivos estáticos; dados sensíveis residem no Firestore protegidos por regras de segurança na nuvem. |
| **Acesso Desprotegido à Rota Secreta da Noiva** | Implementação de barreira de acesso via PIN / Senha Mestra pré-definida, impedindo visualização de nomes por terceiros. |
| **Controle de Dados Fixos vs. Dinâmicos** | Data limite, chave PIX e mensagem de boas-vindas tornaram-se dinâmicas no painel; dados essenciais do evento ficam centralizados em arquivo estático. |

---

## 5. Pendências Técnicas Não Bloqueantes

- Definição do valor padrão do PIN / Senha Mestra inicial da noiva durante a configuração do ambiente.
- Definição das credenciais de configuração pública do Firebase (`firebaseConfig`) no momento do deploy.

---

## 6. Alertas Importantes para o FSD

- **Especificação das Regras do Firestore:** O FSD deve conter uma seção dedicada detalhando a sintaxe exata das *Firestore Security Rules* para orientar a configuração segura no console do Firebase.
- **Transações Atômicas no Decremento de Presentes:** O FSD deve especificar o uso de transações do Firestore (`runTransaction`) ao reservar um presente, garantindo que dois convidados simultâneos não retirem a mesma última unidade de um item (prevenção de concorrência).
- **CSS de Impressão:** O FSD deve detalhar os critérios da folha de estilos `@media print` para assegurar que a lista impressa/salva em PDF oculte os elementos de navegação e botões do painel.

---

## 7. Itens que NÃO Devem Ser Inventados

- Não inventar sistema complexo de login com e-mail, senha e recuperação de senha.
- Não inventar integração com APIs pagas de envio automático de WhatsApp/SMS.
- Não inventar upload de fotos ou galeria dinâmica.
- Não inventar integração com carrinhos de lojas de e-commerce externas.
- Não inventar cadastro de contas para convidados.

---

## 8. Pontos que o FSD Deverá Detalhar

1. **Estrutura de Arquivos e Pastas:** Organização detalhada dos arquivos seguindo a arquitetura MVC no repositório.
2. **Estrutura de Dados no Firestore:** Nomes exatos dos campos, tipos de dados e coleções.
3. **Regras de Segurança do Firebase:** Declaração completa das regras para as coleções `presentes`, `confirmacoes` e `configuracoes`.
4. **Fluxos de Interação:** Fluxo de RSVP do convidado e fluxo operacional do painel da noiva (com validação do PIN).
5. **Especificação de Componentes de Interface:** Comportamento dos seletores, alerta de nome repetido, contagem regressiva e feedback de cópia da chave PIX em conformidade com o `DESIGN.md`.
