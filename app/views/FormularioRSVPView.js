/**
 * Camada de Visualização: FormularioRSVPView
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsabilidades:
 * 1. Renderização do formulário integrado de confirmação (RSVP) e presentes.
 * 2. Manipulação reativa da opção "Apenas confirmar presença" (RN-03).
 * 3. Exibição amigável e não-bloqueante do alerta de homônimo (RN-05).
 * 4. Exibição do cartão de confirmação bem-sucedida e área de PIX com cópia instantânea (RN-04).
 * 5. Bloqueio automático gracioso em caso de prazo encerrado (RN-06).
 */

import { ToastView } from './ToastView.js';

export class FormularioRSVPView {
  /**
   * Renderiza a seção de confirmação de presença (RSVP).
   * 
   * @param {HTMLElement} containerElement
   * @param {object} params
   * @param {boolean} params.estaExpirado - Se o prazo final já expirou (RN-06)
   * @param {string} params.dataLimiteFormatada - Data limite formatada para exibição
   * @param {Array<object>} params.presentes - Lista de presentes com estoque disponível (RN-01)
   */
  static renderizar(containerElement, { estaExpirado, dataLimiteFormatada, presentes = [] }) {
    if (!containerElement) return;

    if (estaExpirado) {
      this.renderizarBloqueioExpirado(containerElement);
      return;
    }

    const optionsPresentesHtml = presentes.map((p) => {
      const qtdTexto = p.quantidade_disponivel === 1 ? '1 disponível' : `${p.quantidade_disponivel} disponíveis`;
      return `<option value="${p.id}" data-nome="${this._escaparHtml(p.nome)}">${this._escaparHtml(p.nome)} &bull; (${qtdTexto})</option>`;
    }).join('');

    containerElement.innerHTML = `
      <section class="rsvp-card-wrapper paper-texture" id="rsvp-card-container">
        <div class="rsvp-card__inner-border">
          <div class="section-title-wrap">
            <span class="eyebrow-tag">RSVP &bull; SUA PRESENÇA</span>
            <h2 class="section-title">Confirme sua Presença</h2>
            <p class="section-subtitle">
              Sua presença é o nosso maior presente! Por favor, confirme até 
              <strong>${this._escaparHtml(dataLimiteFormatada || 'a data limite')}</strong>
              para que possamos preparar tudo com muito amor.
            </p>
          </div>

          <form id="form-rsvp" class="rsvp-form" novalidate>
            <!-- Campo: Nome Completo -->
            <div class="form-group">
              <label for="input-nome-convidado" class="form-label">
                NOME COMPLETO <span class="form-required" aria-hidden="true">*</span>
              </label>
              <input 
                type="text" 
                id="input-nome-convidado" 
                name="nomeConvidado" 
                class="form-input" 
                placeholder="Ex: Maria Alice Ferreira" 
                required 
                minlength="2" 
                maxlength="100" 
                autocomplete="name"
              />
              <!-- Alerta Amigável de Homônimo (RN-05) -->
              <div id="alerta-homonimo" class="friendly-homonym-alert" hidden role="note">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div class="friendly-homonym-alert__text">
                  Já temos uma confirmação com esse nome! Se for outra pessoa, sugerimos adicionar o sobrenome ou apelido para identificarmos você direitinho.
                </div>
              </div>
            </div>

            <!-- Checkbox: Desejo apenas confirmar presença (RN-03) -->
            <div class="form-group form-group--checkbox">
              <label class="custom-checkbox-label" for="check-apenas-presenca">
                <input type="checkbox" id="check-apenas-presenca" name="apenasPresenca" class="custom-checkbox" />
                <span class="custom-checkbox-box" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span class="custom-checkbox-text">Desejo apenas confirmar presença (sem escolher presente físico agora)</span>
              </label>
            </div>

            <!-- Dropdown: Lista de Presentes Disponíveis (RN-01, RN-04) -->
            <div class="form-group" id="group-select-presente">
              <label for="select-presente" class="form-label">
                LISTA DE PRESENTES OU CONTRIBUIÇÃO <span class="form-required" id="presente-required-indicator" aria-hidden="true">*</span>
              </label>
              <div class="custom-select-wrapper">
                <select id="select-presente" name="presenteId" class="form-select">
                  <option value="">Selecione um presente da lista...</option>
                  <option value="pix_surpresa" class="select-option--highlight">
                    ✨ Presentear com PIX / Presente surpresa
                  </option>
                  ${optionsPresentesHtml}
                </select>
                <svg class="select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <p class="form-hint" id="select-hint">
                Os itens desta lista são atualizados em tempo real conforme são escolhidos por outros convidados.
              </p>
            </div>

            <!-- Botão de Submissão Primário -->
            <div class="form-actions">
              <button type="submit" id="btn-submit-rsvp" class="btn btn--primary btn--block">
                <span class="btn__spinner" aria-hidden="true" hidden></span>
                <span class="btn__text">Confirmar Presença</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  /**
   * Atualiza as opções do dropdown de presentes (ex: após recarregamento do estoque).
   * 
   * @param {Array<object>} presentes
   */
  static atualizarDropdownPresentes(presentes = []) {
    const select = document.getElementById('select-presente');
    if (!select) return;

    const valorSelecionado = select.value;

    const optionsHtml = `
      <option value="">Selecione um presente da lista...</option>
      <option value="pix_surpresa" class="select-option--highlight">
        ✨ Presentear com PIX / Presente surpresa
      </option>
      ${presentes.map((p) => {
        const qtdTexto = p.quantidade_disponivel === 1 ? '1 disponível' : `${p.quantidade_disponivel} disponíveis`;
        return `<option value="${p.id}" data-nome="${this._escaparHtml(p.nome)}">${this._escaparHtml(p.nome)} &bull; (${qtdTexto})</option>`;
      }).join('')}
    `;

    select.innerHTML = optionsHtml;
    select.value = valorSelecionado;
  }

  /**
   * Alterna o estado de ativação do seletor de presentes ao marcar/desmarcar "Apenas presenca".
   * 
   * @param {boolean} apenasPresenca
   */
  static alternarModoApenasPresenca(apenasPresenca) {
    const groupSelect = document.getElementById('group-select-presente');
    const select = document.getElementById('select-presente');
    const indicator = document.getElementById('presente-required-indicator');

    if (select) {
      select.disabled = apenasPresenca;
      if (apenasPresenca) {
        select.value = '';
      }
    }

    if (groupSelect) {
      if (apenasPresenca) {
        groupSelect.classList.add('form-group--disabled');
      } else {
        groupSelect.classList.remove('form-group--disabled');
      }
    }

    if (indicator) {
      indicator.style.display = apenasPresenca ? 'none' : 'inline';
    }
  }

  /**
   * Exibe ou oculta o alerta amigável de homônimo (RN-05).
   * 
   * @param {boolean} visivel
   */
  static exibirAlertaHomonimo(visivel) {
    const alerta = document.getElementById('alerta-homonimo');
    if (!alerta) return;

    if (visivel) {
      alerta.removeAttribute('hidden');
      alerta.classList.add('friendly-homonym-alert--visible');
    } else {
      alerta.setAttribute('hidden', '');
      alerta.classList.remove('friendly-homonym-alert--visible');
    }
  }

  /**
   * Altera o estado do botão de envio durante o processamento.
   * 
   * @param {boolean} enviando
   */
  static setEstadoEnviando(enviando) {
    const btn = document.getElementById('btn-submit-rsvp');
    if (!btn) return;

    const spinner = btn.querySelector('.btn__spinner');
    const texto = btn.querySelector('.btn__text');

    btn.disabled = enviando;

    if (enviando) {
      btn.classList.add('btn--loading');
      if (spinner) spinner.removeAttribute('hidden');
      if (texto) texto.textContent = 'Gravando confirmação...';
    } else {
      btn.classList.remove('btn--loading');
      if (spinner) spinner.setAttribute('hidden', '');
      if (texto) texto.textContent = 'Confirmar Presença';
    }
  }

  /**
   * Renderiza a tela de congratulações após envio bem-sucedido.
   * 
   * @param {HTMLElement} containerElement
   * @param {object} dados
   * @param {string} dados.nomeConvidado - Nome informado
   * @param {'presente_item'|'pix_surpresa'|'apenas_presenca'} dados.tipoEscolha - Modalidade
   * @param {string|null} [dados.nomePresente] - Nome do item reservado
   * @param {string} [dados.chavePix] - Chave PIX cadastrada
   * @param {Function} [dados.onNovaConfirmacao] - Callback para resetar o formulário
   */
  static renderizarSucesso(containerElement, {
    nomeConvidado,
    tipoEscolha,
    nomePresente = null,
    chavePix = null,
    onNovaConfirmacao = null
  }) {
    if (!containerElement) return;

    let blocoEscolhaHtml = '';

    if (tipoEscolha === 'presente_item' && nomePresente) {
      blocoEscolhaHtml = `
        <div class="success-gift-highlight">
          <span class="success-gift-icon" aria-hidden="true">🎁</span>
          <div class="success-gift-info">
            <span class="success-gift-label">PRESENTE ESCOLHIDO</span>
            <strong class="success-gift-name">${this._escaparHtml(nomePresente)}</strong>
            <p class="success-gift-desc">O item foi reservado exclusivamente no seu nome. Muito obrigado pelo carinho!</p>
          </div>
        </div>
      `;
    } else if (tipoEscolha === 'pix_surpresa') {
      blocoEscolhaHtml = `
        <div class="pix-card" id="pix-highlight-card">
          <div class="pix-card__header">
            <span class="pix-badge">PRESENTE VIA PIX</span>
            <p class="pix-card__lead">
              Agradecemos imensamente pela sua contribuição para a montagem do nosso novo lar!
              Utilize a chave PIX abaixo para transferir o valor que desejar:
            </p>
          </div>

          <div class="pix-key-box">
            <div class="pix-key-display">
              <span class="pix-key-label">CHAVE PIX:</span>
              <code class="pix-key-value" id="pix-key-value">${this._escaparHtml(chavePix || 'helena.gabriel.cha@email.com')}</code>
            </div>
            <button type="button" class="btn btn--secondary btn--icon btn--copy-pix" id="btn-copiar-pix" aria-label="Copiar chave PIX para a área de transferência">
              <svg class="copy-icon-default" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <svg class="copy-icon-success" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" hidden>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="btn-copy-text">Copiar Chave PIX</span>
            </button>
          </div>
        </div>
      `;
    } else {
      blocoEscolhaHtml = `
        <div class="success-presence-highlight">
          <span class="success-presence-icon" aria-hidden="true">🌿</span>
          <p class="success-presence-text">
            Sua presença está confirmadíssima! Será uma alegria enorme compartilhar este dia tão especial com você.
          </p>
        </div>
      `;
    }

    containerElement.innerHTML = `
      <section class="rsvp-card-wrapper rsvp-card-wrapper--success paper-texture" id="rsvp-success-card">
        <div class="rsvp-card__inner-border">
          <div class="success-seal" aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="var(--color-tertiary)" stroke-width="1.5" stroke-dasharray="3 3"/>
              <circle cx="32" cy="32" r="26" fill="var(--color-surface-container-low)" stroke="var(--color-primary)" stroke-width="1"/>
              <path d="M22 33L29 40L43 24" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <div class="section-title-wrap">
            <span class="eyebrow-tag">CONFIRMAÇÃO REGISTRADA</span>
            <h2 class="section-title">Presença Confirmada!</h2>
            <p class="section-subtitle">
              Querido(a) <strong>${this._escaparHtml(nomeConvidado)}</strong>, seu registro foi realizado com muito sucesso e carinho.
            </p>
          </div>

          ${blocoEscolhaHtml}

          <div class="success-footer-actions">
            <button type="button" class="btn btn--outline btn--sm" id="btn-novo-rsvp">
              Confirmar presença de outro convidado
            </button>
          </div>
        </div>
      </section>
    `;

    // Evento para cópia de chave PIX
    const btnCopiar = containerElement.querySelector('#btn-copiar-pix');
    if (btnCopiar && chavePix) {
      btnCopiar.addEventListener('click', () => {
        this._copiarChavePix(chavePix, btnCopiar);
      });
    }

    // Evento para nova confirmação
    const btnNovo = containerElement.querySelector('#btn-novo-rsvp');
    if (btnNovo && typeof onNovaConfirmacao === 'function') {
      btnNovo.addEventListener('click', () => {
        onNovaConfirmacao();
      });
    }

    // Rola suavemente até o cartão de confirmação
    containerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Copia a chave PIX para o Clipboard e altera o estado do botão temporariamente.
   * 
   * @param {string} chavePix
   * @param {HTMLElement} botao
   */
  static _copiarChavePix(chavePix, botao) {
    const textoBtn = botao.querySelector('.btn-copy-text');
    const iconeDefault = botao.querySelector('.copy-icon-default');
    const iconeSucesso = botao.querySelector('.copy-icon-success');

    const registrarCopiaSucesso = () => {
      botao.classList.add('btn--copied');
      if (textoBtn) textoBtn.textContent = 'Copiado!';
      if (iconeDefault) iconeDefault.setAttribute('hidden', '');
      if (iconeSucesso) iconeSucesso.removeAttribute('hidden');

      ToastView.sucesso('Chave PIX copiada para a área de transferência!');

      setTimeout(() => {
        botao.classList.remove('btn--copied');
        if (textoBtn) textoBtn.textContent = 'Copiar Chave PIX';
        if (iconeDefault) iconeDefault.removeAttribute('hidden');
        if (iconeSucesso) iconeSucesso.setAttribute('hidden', '');
      }, 3000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(chavePix)
        .then(registrarCopiaSucesso)
        .catch(() => {
          this._fallbackCopiarTexto(chavePix);
          registrarCopiaSucesso();
        });
    } else {
      this._fallbackCopiarTexto(chavePix);
      registrarCopiaSucesso();
    }
  }

  /**
   * Fallback tradicional via elemento temporário para navegadores antigos.
   * @param {string} texto
   */
  static _fallbackCopiarTexto(texto) {
    const input = document.createElement('textarea');
    input.value = texto;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.focus();
    input.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      console.warn('Falha no comando de cópia fallback.', e);
    }
    document.body.removeChild(input);
  }

  /**
   * Renderiza a mensagem de encerramento do prazo de confirmação (RN-06).
   * 
   * @param {HTMLElement} containerElement
   */
  static renderizarBloqueioExpirado(containerElement) {
    if (!containerElement) return;

    containerElement.innerHTML = `
      <section class="rsvp-card-wrapper rsvp-card-wrapper--expired paper-texture" id="rsvp-expired-card">
        <div class="rsvp-card__inner-border">
          <div class="expired-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="section-title-wrap">
            <span class="eyebrow-tag">CONFIRMAÇÕES ENCERRADAS</span>
            <h2 class="section-title">Prazo de Confirmação Finalizado</h2>
            <p class="section-subtitle">
              O prazo para confirmação de presença encerrou. Por favor, fale diretamente com a noiva.
            </p>
          </div>
          <p class="expired-note">
            Estamos finalizando a lista de convidados junto aos fornecedores e buffet. Agradecemos imensamente o seu carinho!
          </p>
        </div>
      </section>
    `;
  }

  /**
   * Sanitiza strings para o DOM.
   * @param {string} str
   * @returns {string}
   */
  static _escaparHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
