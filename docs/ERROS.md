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


