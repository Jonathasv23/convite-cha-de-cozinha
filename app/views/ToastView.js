/**
 * Camada de Visualização: ToastView
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsabilidade:
 * Renderizar feedbacks instantâneos, acolhedores e elegantes no DOM,
 * respeitando a paleta de cores e tipografia de papelaria fina.
 */

export class ToastView {
  static containerId = 'toast-container';
  static defaultDuration = 4000;

  /**
   * Garante a existência do elemento container no DOM.
   * @returns {HTMLElement}
   */
  static _obterOuCriarContainer() {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Exibe uma notificação toast na tela.
   * 
   * @param {string} mensagem - Texto a ser exibido
   * @param {'success'|'error'|'warning'|'info'} [tipo='info'] - Categoria visual
   * @param {number} [duracaoMs=4000] - Tempo de exibição em milissegundos
   * @returns {HTMLElement|null} Elemento do toast criado
   */
  static exibir(mensagem, tipo = 'info', duracaoMs = this.defaultDuration) {
    if (typeof document === 'undefined') return null;

    const container = this._obterOuCriarContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast--${tipo}`;
    toast.setAttribute('role', tipo === 'error' ? 'alert' : 'status');

    // Ícone SVG inline correspondente ao tipo
    const iconeSvg = this._obterIconeSvg(tipo);

    toast.innerHTML = `
      <div class="toast__icon" aria-hidden="true">${iconeSvg}</div>
      <div class="toast__content">
        <p class="toast__message">${this._escaparHtml(mensagem)}</p>
      </div>
      <button type="button" class="toast__close" aria-label="Fechar notificação">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    const closeBtn = toast.querySelector('.toast__close');
    let timeoutId = null;

    const fechar = () => {
      if (timeoutId) clearTimeout(timeoutId);
      toast.classList.add('toast--hiding');
      toast.addEventListener('transitionend', () => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, { once: true });
    };

    if (closeBtn) {
      closeBtn.addEventListener('click', fechar);
    }

    if (duracaoMs > 0) {
      timeoutId = setTimeout(fechar, duracaoMs);
    }

    container.appendChild(toast);

    // Dispara animação de entrada
    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    return toast;
  }

  static sucesso(mensagem, duracaoMs) {
    return this.exibir(mensagem, 'success', duracaoMs);
  }

  static erro(mensagem, duracaoMs) {
    return this.exibir(mensagem, 'error', duracaoMs || 5000);
  }

  static aviso(mensagem, duracaoMs) {
    return this.exibir(mensagem, 'warning', duracaoMs);
  }

  static info(mensagem, duracaoMs) {
    return this.exibir(mensagem, 'info', duracaoMs);
  }

  /**
   * Retorna os grafismos SVGs refinados para cada estado.
   * @param {string} tipo
   * @returns {string}
   */
  static _obterIconeSvg(tipo) {
    switch (tipo) {
      case 'success':
        return `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        `;
      case 'error':
        return `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        `;
      case 'warning':
        return `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        `;
      case 'info':
      default:
        return `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        `;
    }
  }

  /**
   * Sanitiza strings para evitar injeção XSS nas mensagens.
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
