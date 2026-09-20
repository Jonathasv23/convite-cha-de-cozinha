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

