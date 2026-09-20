# Documento de Requisitos do Produto (PRD)
## Sistema: Convite Digital e Lista de Presentes para Chá de Cozinha

---

## 1. Visão Geral do Produto

### 1.1. Contexto e Problema
A organização de um Chá de Cozinha envolve dois grandes desafios práticos:
1. **Para os convidados:** Dúvidas sobre o que comprar, risco de levar presentes repetidos e incerteza sobre cores, modelos e preferências estéticas da noiva.
2. **Para a noiva:** Controle manual cansativo de confirmações de presença (RSVP) e de presentes pelo WhatsApp, gerando desencontros de informações e retrabalho na contagem de convidados para o evento.

### 1.2. Proposta de Solução
Uma aplicação web elegante, simples e totalmente responsiva (focada em uso no celular) contendo:
- **Página Pública:** Convite digital interativo com todos os detalhes do evento, contagem regressiva, link para mapa, indicação visual da paleta de cores sugerida e um formulário integrado de confirmação de presença (RSVP) e seleção de presente via lista suspensa.
- **Painel Administrativo da Noiva:** Acessado por link secreto direto, permitindo cadastrar presentes, definir prazo limite de confirmação, acompanhar contadores em tempo real, gerenciar desistências e imprimir/salvar a lista.

---

## 2. Perfis de Usuário (Personas)

| Perfil | Descrição | Como Acessa | Principais Ações |
| :--- | :--- | :--- | :--- |
| **Convidado(a)** | Amigos e familiares convidados para o chá. | Link público do site (via celular/desktop). | - Visualiza detalhes do evento (data, hora, mapa).<br>- Consulta a paleta de cores sugerida.<br>- Adiciona a data ao calendário.<br>- Confirma presença informando seu nome.<br>- Escolhe um presente da lista suspensa, opta por PIX ou apenas confirma presença. |
| **Noiva (Administradora)** | Responsável pela gestão do evento e da lista. | Link secreto direto (salvo nos favoritos do navegador). | - Cadastra novos presentes (nome e quantidade).<br>- Define e altera a data limite de confirmação.<br>- Visualiza contadores de confirmados e presentes.<br>- Consulta a tabela completa de convidados e escolhas.<br>- Libera presentes de volta para a lista em caso de desistência.<br>- Imprime ou salva a lista final. |

---

## 3. Escopo do Produto

### 3.1. Funcionalidades Inclusas (Escopo Principal - MVP)

#### A. Página do Convite (Visão do Convidado)
1. **Cabeçalho Informativo:**
   - Nomes dos noivos em destaque.
   - Mensagem carinhosa de boas-vindas.
   - Data e horário do evento.
   - Contagem regressiva dinâmica até o dia e hora do chá.
   - Local com endereço completo e botão de redirecionamento para o Google Maps.
   - Botão para adicionar lembrete ao calendário do celular (Google Agenda / Apple Calendar).
2. **Seção "Paleta de Cores Sugerida":**
   - Bloco visual com amostras das cores e tons recomendados pela noiva para os presentes e utensílios.
3. **Formulário Integrado de Confirmação & Presente:**
   - Campo para digitação do **Nome do Convidado** (obrigatório).
   - Checkbox posicionado ao lado da lista suspensa: `[ ] Apenas confirmar presença` (ao marcar, a lista suspensa é desabilitada).
   - **Lista Suspensa (Dropdown) de Presentes:**
     - Exibe apenas os itens cadastrados com quantidade disponível maior que zero (`> 0`).
     - Opção especial fixa: `"Presentear com PIX / Presente surpresa"`.
   - **Validação Amigável de Nome Repetido:** Caso o nome digitado já conste na lista de confirmados, exibe um alerta gentil sugerindo adicionar o sobrenome ou apelido para evitar confusões, sem impedir o envio.
   - **Feedback Visual de Sucesso:**
     - Mensagem amigável na tela confirmando o registro do nome e o presente selecionado.
     - Se o convidado escolheu a opção de PIX, é exibida uma caixinha destacada com a chave PIX e o botão interativo **"Copiar Chave PIX"**.
4. **Bloqueio por Data Limite:**
   - Quando a data atual ultrapassar o prazo configurado pela noiva, o formulário de envio é bloqueado, exibindo a mensagem:  
     > *"O prazo para confirmação encerrou. Fale diretamente com a noiva."*

---

#### B. Painel da Noiva (Visão Administrativa)
1. **Acesso Direto e Secreto:**
   - Acesso por rota privada e direta (ex: `/admin-noiva`), sem formulário complexo de login com e-mail/recuperação de senha.
2. **Dashboard de Resumo (Contadores no Topo):**
   - Contador 1: *Total de Pessoas Confirmadas*.
   - Contador 2: *Total de Presentes Escolhidos*.
   - Contador 3: *Presentes Ainda Disponíveis*.
3. **Gestão do Prazo Limite:**
   - Campo seletor de data para a noiva definir/ajustar a data limite para confirmações de presença.
4. **Cadastro Rápido de Itens:**
   - Formulário minimalista com apenas 2 campos:
     - `Nome do Presente` (ex: "Jogo de Panelas").
     - `Quantidade Disponível` (ex: 2).
5. **Lista de Convidados e Presentes:**
   - Tabela organizada contendo:
     - Nome do convidado.
     - Tipo de confirmação (Presente escolhido, PIX/Presente surpresa ou Apenas Presença).
     - Data/hora do envio.
     - Ação: Botão **"Liberar Presente"** (reverte a escolha do convidado e devolve +1 unidade do item para a lista suspensa).
6. **Exportação / Impressão:**
   - Botão para imprimir ou salvar a lista final de convidados e presentes de forma limpa e formatada.

---

### 3.2. Informações Fixas (Definidas na Configuração Inicial)
Por decisão de projeto, as seguintes informações serão fixas no site para manter a arquitetura simples e estável:
- Nomes dos noivos.
- Data e horário do chá.
- Local e link do Google Maps.
- Chave PIX da noiva.
- Paleta visual de cores sugerida.

---

### 3.3. Fora do Escopo Inicial
- Integração de compra com links ou carrinhos de lojas externas (Amazon, Magalu, etc.).
- Envio automatizado de mensagens via WhatsApp/SMS por APIs pagas.
- Sistema de login e cadastro de contas para convidados.
- Upload dinâmico de fotos e galerias pesadas.

---

## 4. Regras de Negócio (RN)

| Identificador | Regra | Descrição |
| :--- | :--- | :--- |
| **RN-01** | **Visibilidade de Presentes** | Apenas presentes com quantidade disponível maior que zero (`quantidade_disponivel > 0`) aparecem na lista suspensa do convidado. |
| **RN-02** | **Reserva e Baixa Automática** | Ao enviar o formulário com um presente selecionado, o sistema reduz em 1 a quantidade disponível daquele item. Se a quantidade atingir 0, o item sai automaticamente da lista suspensa para os próximos acessos. |
| **RN-03** | **Apenas Confirmar Presença** | Ao marcar o checkbox *"Apenas confirmar presença"*, a lista suspensa de presentes fica desabilitada e o convidado é registrado apenas como presença confirmada (sem presente associado). |
| **RN-04** | **Presente PIX / Surpresa** | Se a opção especial *"Presentear com PIX / Presente surpresa"* for selecionada, nenhum presente físico do inventário tem sua quantidade reduzida. A confirmação é salva e a tela exibe a chave PIX com botão para copiar. |
| **RN-05** | **Alerta Amigável de Nome Duplicado** | Caso o nome digitado já exista na lista de confirmações, o sistema exibe um aviso amigável: *"Já temos uma confirmação com esse nome! Se for outra pessoa, sugerimos adicionar o sobrenome ou apelido."* O envio não é bloqueado. |
| **RN-06** | **Bloqueio por Data Limite** | Se a data corrente do sistema for posterior à data limite definida pela noiva, o formulário de confirmação fica inoperante e exibe a mensagem de prazo encerrado. |
| **RN-07** | **Liberação de Presente** | No painel da noiva, acionar o botão *"Liberar Presente"* em uma confirmação remove a associação do presente com aquele convidado e soma +1 na quantidade disponível do item no inventário, recolocando-o na lista suspensa pública. |
| **RN-08** | **Cálculo dos Contadores** | O total de confirmados corresponde à contagem total de registros de presença. O total de presentes corresponde à contagem de presentes físicos reservados mais os indicados com PIX/Surpresa. |

---

## 5. Modelo Conceitual de Dados

*(Informações lógicas que serão armazenadas pelo sistema).*

### 5.1. Entidade: Presente (Item)
- `id`: Identificador único do presente.
- `nome`: Título do item (ex: "Faqueiro Inox").
- `quantidade_total`: Quantidade original cadastrada pela noiva.
- `quantidade_disponivel`: Quantidade restante que ainda pode ser selecionada.
- `criado_em`: Data e hora do cadastro do item.

### 5.2. Entidade: Confirmação (Convidado)
- `id`: Identificador único da confirmação.
- `nome_convidado`: Nome informado pelo usuário.
- `tipo_escolha`: `"presente_item"`, `"pix_surpresa"` ou `"apenas_presenca"`.
- `presente_id`: Referência ao item escolhido (nulo caso tenha optado por PIX ou apenas presença).
- `data_confirmacao`: Data e hora em que a confirmação foi enviada.

### 5.3. Entidade: Configurações Gerais
- `data_limite_confirmacao`: Data final configurada pela noiva para aceitar confirmações.

---

## 6. Requisitos Não Funcionais (Usabilidade e Qualidade)

1. **Responsividade Mobile-First:** Como a maioria dos convidados abrirá o convite no smartphone pelo WhatsApp, a interface deve ser impecável em telas pequenas.
2. **Tempo de Carregamento Rápido:** Página extremamente leve e fluida, sem lentidão no carregamento.
3. **Zero Atrito para o Convidado:** Sem necessidade de cadastro, login, senhas ou preenchimento de campos excessivos.
4. **Feedback Imediato (UX):** Mensagem de confirmação visível na hora e feedback ao clicar em "Copiar Chave PIX".
5. **Privacidade do Painel:** Sem botões ou pistas da área administrativa na página pública do convite; acesso exclusivo por link direto salvo pela noiva.

---

## 7. Próximos Passos

1. **Definição da Arquitetura e Tecnologias:** Escolher a stack mais ágil e fácil de hospedar gratuitamente (ex: HTML/CSS/JS com backend leve ou banco direto como Firebase/Supabase/LocalStorage com exportação).
2. **Criação do Plano de Implementação:** Detalhar a ordem de construção das telas e regras.
3. **Desenvolvimento e Testes:** Codificar e validar os fluxos no desktop e no celular.
