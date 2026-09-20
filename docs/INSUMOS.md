# Inventário de Insumos do Projeto

Este documento registra o inventário de todos os arquivos de apoio e documentação presentes no projeto, identificando sua finalidade e a necessidade de serem copiados para a área pública de *assets* durante a fase de construção.

> **Nota de Arquitetura:** A pasta `docs/` é uma pasta estritamente documental e de governança técnica. Nenhum arquivo contido em `docs/` deve ser servido como rota pública direta em produção. Quaisquer recursos visuais necessários em tempo de execução serão gerados ou migrados para `assets/` na etapa de codificação, conforme especificado no `docs/FSD.md`.

---

## Inventário de Insumos do Projeto

| Arquivo | O que é | Usado pelo sistema em execução? | Onde será usado | Observações |
|---|---|---|---|---|
| `docs/FSD.md` | Documento de Especificação Funcional e Técnica (FSD v1.0) | Não | Documentação | Fonte da verdade técnica, arquitetural, regras de negócio e modelo de dados. |
| `docs/DESIGN.md` | Guia de Design e Design System (*Botanical Heritage Atelier*) | Não | Referência visual / Documentação | Define tokens de cores, tipografia, elevação, espaçamentos e componentes. |
| `docs/INSUMOS.md` | Inventário de insumos e arquivos do projeto | Não | Documentação | Mapeamento e governança de arquivos da pasta `docs/`. |

---

## Observações sobre Recursos e Assets em Tempo de Execução

1. **Recursos Visuais e Gráficos:**
   - O projeto adota uma estética minimalista e elegante baseada em tipografia fina e gráficos leves.
   - Os ícones (como alianças, taças, calendário, mapa, cópia de PIX e impressora) e grafismos botânicos serão implementados como **SVGs inline / vetorizados locais**, residindo diretamente no código ou na futura pasta `assets/images/`, sem dependência de imagens rasterizadas pesadas (PNG/JPG).
   - Não há imagens fotográficas, PDFs ou artes binárias pré-existentes na pasta `docs/`.

2. **Tipografia:**
   - As famílias tipográficas **EB Garamond** e **Manrope** serão importadas diretamente via Google Fonts em tempo de execução (`index.html` e `admin.html`), garantindo alta legibilidade e leveza.

3. **Arquivos Complementares na Raiz do Projeto:**
   - `PRD.md`: Documento de Requisitos do Produto (visão funcional inicial).
   - `DECISOES_TECNICAS.md`: Registro das decisões técnicas consolidadas pré-FSD.
   - `DESIGN.md`: Espelho do guia de design na raiz do projeto.
