# Diário de Erros e Soluções (ERROS.md)

Este documento destina-se a registrar erros, falhas inesperadas de execução, inconsistências técnicas ou problemas de integração identificados ao longo do desenvolvimento deste sistema, bem como a causa raiz apurada, a solução aplicada e a diretriz para prevenir reincidências.

---

## Modelo de Registro Padrão

Sempre que um erro for solucionado, adicione um novo registro no final deste documento seguindo rigorosamente o seguinte modelo:

```text
## <data> - <título curto do erro>

- Sintoma:
- Causa:
- Solução aplicada:
- Como evitar no futuro:
```

---

## Histórico de Ocorrências

## 20/09/2026 - Persistência volátil em ambiente de testes CLI/Node sem objeto window

- Sintoma: Na primeira execução dos testes unitários da Fase 3 (`node tests/fase3_tests.js`), chamadas subsequentes aos métodos `PresenteModel.reservarPresenteAtomicamente` e `ConfirmacaoModel.verificarHomonimo` falhavam com erro `PRESENTE_NAO_ENCONTRADO` e retorno falso de existência, respectivamente.
- Causa: Em ambiente CLI (Node.js), `typeof window === 'undefined'`, fazendo com que as leituras de dados de demonstração retornassem novas instâncias sem preservar os itens gravados em memória entre uma chamada e outra. Adicionalmente, o teste de mensagem curta utilizou a palavra `'Curta'` que possuía exatamente 5 caracteres, não disparando a validação `< 5`.
- Solução aplicada: Centralizou-se o gerenciamento de armazenamento local na abstração `demoStore` em `app/utils/firebase.js`, mantendo um mapa em memória (`inMemoryStorage`) sincronizado automaticamente com `localStorage` quando o objeto `window` estiver presente e preservando o estado em memória quando em ambiente Node.js. Ajustou-se a palavra de teste para `'Oi'` (2 caracteres).
- Como evitar no futuro: Sempre utilizar abstrações de armazenamento isomórficas (`demoStore`) que funcionem de forma idêntica tanto em navegadores quanto em ambientes headless/CLI para testes automatizados.

---

## 20/09/2026 - Acesso a document global em métodos de View durante testes automatizados Node.js

- Sintoma: Na execução inicial de `node tests/fase4_tests.js`, os testes de cálculo de contagem regressiva e renderização de Hero Card lançavam `ReferenceError: document is not defined`.
- Causa: Os métodos `ConviteView.atualizarContagem` e `ConviteView._vincularEventosAgenda` tentavam acessar diretamente o objeto global `document` sem verificar se a execução ocorria em ambiente de navegador ou em ambiente CLI/Node.js.
- Solução aplicada: Adicionou-se a guarda `if (typeof document !== 'undefined')` antes de consultar ou manipular elementos do DOM no `ConviteView.js`, garantindo que o cálculo de tempo e a renderização de strings HTML permaneçam isomórficos e funcionem perfeitamente tanto no browser quanto nos testes de terminal.
- Como evitar no futuro: Em classes de View ou utilitários que geram HTML e calculam dados, sempre condicionar interações diretas com o DOM à verificação de `typeof document !== 'undefined'`.

---

## 20/09/2026 - Bloqueio nativo de módulos ES6 em protocolo file:/// (abertura via duplo clique)

- Sintoma: Ao abrir o `index.html` diretamente por duplo clique no Windows Explorer (`file:///C:/.../index.html`), o convite permanecia estático com as mensagens de placeholder *"Carregando convite especial..."* e *"Carregando lista de presentes e confirmação..."*.
- Causa: Por restrição de segurança da especificação do protocolo `file:///` em navegadores Chromium (Chrome, Edge) e Firefox, a origem local é considerada `null`, bloqueando tags `<script type="module" src="...">` por política de CORS. Além disso, no `ConviteController.js`, o listener de `DOMContentLoaded` não disparava caso o módulo avaliasse após o documento já ter sido carregado.
- Solução aplicada: 
  1. Alterou-se a inicialização no `ConviteController.js` para checar `document.readyState !== 'loading'`.
  2. Implementou-se em `assets/js/app.bundle.js` um carregamento autossuficiente e universal que assume graciosamente a inicialização caso os módulos ES6 sejam bloqueados pelo protocolo `file:///`.
---

## 20/09/2026 - Divergência de aliases em ToastView e unificação de contrato em ConfirmacaoModel

- Sintoma: Na primeira execução de `node tests/fase5_tests.js`, as asserções de validação de PIN e fluxo integrado de reserva física falharam com `TypeError: ToastView.exibirAviso is not a function` e retorno `undefined` para `rsvp.nomeConvidado`.
- Causa: 
  1. A classe `ToastView` expunha os métodos utilitários abreviados (`ToastView.aviso`, `ToastView.erro`, `ToastView.sucesso`, `ToastView.info`), enquanto o `AdminController` invocava as assinaturas expandidas (`exibirAviso`, `exibirErro`, etc.).
  2. Ao submeter confirmação com presente físico, `ConfirmacaoModel.confirmarPresenca` delegava diretamente o retorno a `PresenteModel.reservarPresenteAtomicamente`, que retornava metadados do item sem replicar os campos `nomeConvidado` e `tipoEscolha` presentes nas demais modalidades.
- Solução aplicada: 
  1. Adicionaram-se aliases estáticos semânticos (`exibirSucesso`, `exibirErro`, `exibirAviso`, `exibirInfo` e `inicializar`) em `ToastView.js` para garantir compatibilidade plena em qualquer padrão de chamada.
  2. Ajustou-se `ConfirmacaoModel.confirmarPresenca` para encapsular a resposta da reserva atômica mesclando `{ ...resultadoReserva, nomeConvidado, tipoEscolha }`, unificando a estrutura do objeto retornado em todas as 3 modalidades.
- Como evitar no futuro: Padronizar interfaces de componentes com aliases semânticos e garantir contratos de retorno estritamente simétricos entre diferentes ramos de execução condicional em models de domínio.

---

## 20/09/2026 - Erro de sintaxe no admin.bundle.js e bloqueio de acesso ao painel no protocolo file:///

- Sintoma: Ao abrir o `admin.html` diretamente por duplo clique no navegador Edge/Chrome via protocolo `file:///C:/.../admin.html`, digitar o PIN mestre e clicar no botão "Acessar Painel", a interface permanecia estática e não avançava para o painel da noiva.
- Causa: 
  1. Durante a adição de helpers de exportação CSV na Fase 6, a chave de encerramento da função `formatarParaInputDatetime` em `assets/js/admin.bundle.js` foi omitida, gerando `SyntaxError: Unexpected token ')'` que impedia o motor JavaScript do navegador de compilar e executar o bundle autônomo.
  2. Como o protocolo `file:///` bloqueia tags `<script type="module">` por política nativa de CORS em navegadores Chromium, a falha de compilação do bundle deixava o formulário estático sem manipuladores de evento ativos.
- Solução aplicada: 
  1. Restaurou-se o fechamento da função `formatarParaInputDatetime` no `assets/js/admin.bundle.js`, validando com `node -c assets/js/admin.bundle.js` (exit code 0).
  2. Reforçou-se a vinculação de eventos no formulário e no botão `#btn-entrar-pin` em ambos os controladores.
  3. Atualizou-se o PIN Mestre padrão do sistema de `2026` para `0523` em `config/config.js`, `config/config.example.js`, `app/controllers/AdminController.js`, `assets/js/admin.bundle.js` e na suíte de testes.
- Como evitar no futuro: Sempre executar a verificação estática de sintaxe (`node -c <arquivo>`) após edições em bundles ou scripts compilados e testar a abertura em protocolo `file:///` além do Live Server.

---

## 20/09/2026 - Interface de MockElement em testes de Views isomórficas na Fase 7

- Sintoma: Na primeira execução de `node tests/fase7_tests.js`, os testes dos Critérios 5 e 6 falharam com `TypeError: containerElement.querySelector is not a function`.
- Causa: Os métodos de renderização de telas de sucesso (`FormularioRSVPView.renderizarSucesso`) esperavam um nó do DOM capaz de vincular manipuladores de evento de clique em botões internos (`querySelector('#btn-copiar-pix')`). O teste inicial passou um objeto literal raso `{ innerHTML: '' }` desprovido de suporte aos seletores da API DOM.
- Solução aplicada: Reutilizou-se a classe `MockElement` (já validada na Fase 4) com implementação dummy de `querySelector`, `querySelectorAll`, `addEventListener` e `classList`, permitindo a execução pura e desacoplada em ambiente headless Node.js sem necessidade de bibliotecas de emulação pesadas como JSDOM.
- Como evitar no futuro: Padronizar o mock de nós do DOM em suites de teste Node.js sempre instanciando `MockElement` unificado em vez de objetos literais rasos.

---

## 20/09/2026 - Incompatibilidade de tamanho de senha no Firebase Auth e concorrência modular/bundle

- Sintoma: Rejeição no Firebase Authentication ao tentar cadastrar o usuário administrativo com o PIN de 4 dígitos (`auth/weak-password`), quebra de permissões (`permission-denied`) no Firestore e risco de contagem duplicada de tentativas de PIN por concorrência de scripts modular e bundle em ambiente HTTP.
- Causa: 
  1. O Firebase Authentication rejeita senhas com menos de 6 caracteres. O PIN padrão do sistema possui 4 dígitos (`0523`), gerando incompatibilidade com a autenticação silenciosa necessária para satisfazer a regra `request.auth != null` no Firestore.
  2. O script de migrações (`run.js`) enviava requisições REST sem token `Authorization: Bearer`, sendo bloqueado pelo Firestore em ambiente de nuvem real.
  3. A presença simultânea da tag `<script type="module">` e da inclusão direta de bundles poderia disparar dupla execução de manipuladores de eventos em navegadores com comportamento não-padrão.
  4. Campos de exportação CSV não continham proteção contra injeção de fórmulas (DDE Injection).
- Solução aplicada:
  1. Implementou-se suporte a `config.adminAuth.password` (mínimo 6 caracteres) com derivação automática (`${pin}_admin_auth`), mantendo a usabilidade simples do PIN de 4 dígitos para a noiva.
  2. Implementou-se helper REST para obtenção de `idToken` via Identity Toolkit em `database/migrations/run.js`, injetando `Authorization: Bearer ${idToken}` nas operações de banco.
  3. Adicionaram-se travas de instância única (singleton guards) em `AdminController` e `ConviteController`, e condicionou-se a ativação de bundles estritamente ao protocolo `file:///` ou fallback de erro.
  4. Adicionou-se sanitização contra injeção de fórmulas em `app/utils/export.js`, remoção de delimitadores de tags `<>` em `ConfirmacaoModel` e `PresenteModel`, e limite de tamanho de strings (`size() <= 100`) em `database/firestore.rules`.
- Como evitar no futuro: Sempre alinhar as restrições mínimas de provedores de autenticação (OAuth/Firebase) com os mecanismos de UX locais, proteger saídas tabulares contra interpretação de fórmulas e manter idempotência estrita em pontos de entrada do DOM.

