/**
 * Camada de Visualização: ConviteView
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsabilidades:
 * 1. Renderização do Hero Card com monograma botânico, nomes e dados do evento.
 * 2. Atualização contínua da Contagem Regressiva Viva (dias, horas, minutos e segundos).
 * 3. Renderização dos blocos logísticos ("Como Chegar" e "Adicionar à Agenda").
 * 4. Exibição da Vitrine de Paleta de Cores Sugerida com amostras fiéis ao docs/DESIGN.md.
 */

import { createGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar.js';

export class ConviteView {
  /**
   * Renderiza a estrutura do Hero Card com identidade Botanical Heritage Atelier.
   * 
   * @param {HTMLElement} containerElement
   * @param {object} dados
   * @param {object} dados.evento - Dados estruturais do evento
   * @param {string} dados.mensagemBoasVindas - Texto de acolhimento
   */
  static renderizarHero(containerElement, { evento, mensagemBoasVindas }) {
    if (!containerElement) return;

    containerElement.innerHTML = `
      <div class="hero-card paper-texture">
        <div class="hero-card__inner-border">
          <!-- Monograma Botânico Centralizado -->
          <div class="botanical-monogram" aria-hidden="true">
            <svg class="botanical-monogram__wreath" viewBox="0 0 160 160" width="140" height="140" fill="none">
              <!-- Círculo Guia Delicado -->
              <circle cx="80" cy="80" r="70" stroke="var(--color-border-linen)" stroke-width="1" stroke-dasharray="3 3" />
              <circle cx="80" cy="80" r="66" stroke="var(--color-tertiary)" stroke-width="0.75" stroke-opacity="0.6" />
              
              <!-- Folhagens e Ramos Botânicos Esquerda -->
              <path d="M40 110 C30 85 45 55 70 30 C65 45 50 65 48 85 C46 100 42 106 40 110Z" fill="var(--color-secondary)" fill-opacity="0.25" />
              <path d="M40 110 Q50 90 62 76 Q52 70 44 76" stroke="var(--color-primary)" stroke-width="1.2" stroke-linecap="round" />
              <path d="M48 95 Q38 88 34 94 Q42 100 48 95" fill="var(--color-secondary)" fill-opacity="0.4" stroke="var(--color-primary)" stroke-width="0.8" />
              <path d="M58 80 Q52 68 45 74 Q52 82 58 80" fill="var(--color-secondary)" fill-opacity="0.4" stroke="var(--color-primary)" stroke-width="0.8" />
              <path d="M68 64 Q66 52 56 56 Q60 66 68 64" fill="var(--color-secondary)" fill-opacity="0.4" stroke="var(--color-primary)" stroke-width="0.8" />
              
              <!-- Folhagens e Ramos Botânicos Direita -->
              <path d="M120 110 C130 85 115 55 90 30 C95 45 110 65 112 85 C114 100 118 106 120 110Z" fill="var(--color-secondary)" fill-opacity="0.25" />
              <path d="M120 110 Q110 90 98 76 Q108 70 116 76" stroke="var(--color-primary)" stroke-width="1.2" stroke-linecap="round" />
              <path d="M112 95 Q122 88 126 94 Q118 100 112 95" fill="var(--color-secondary)" fill-opacity="0.4" stroke="var(--color-primary)" stroke-width="0.8" />
              <path d="M102 80 Q108 68 115 74 Q108 82 102 80" fill="var(--color-secondary)" fill-opacity="0.4" stroke="var(--color-primary)" stroke-width="0.8" />
              <path d="M92 64 Q94 52 104 56 Q100 66 92 64" fill="var(--color-secondary)" fill-opacity="0.4" stroke="var(--color-primary)" stroke-width="0.8" />

              <!-- Pequenos Acentos Florais -->
              <circle cx="80" cy="24" r="2.5" fill="var(--color-tertiary)" />
              <circle cx="75" cy="26" r="1.5" fill="var(--color-secondary)" />
              <circle cx="85" cy="26" r="1.5" fill="var(--color-secondary)" />
              <circle cx="80" cy="136" r="2.5" fill="var(--color-tertiary)" />
            </svg>
            <span class="botanical-monogram__initials">H &amp; J</span>
          </div>

          <!-- Cabeçalho Tipográfico -->
          <div class="hero-card__header">
            <span class="eyebrow-tag">CHÁ DE COZINHA</span>
            <h1 class="couple-title">${this._escaparHtml(evento.noivos || 'Hevelyn & Jonathas')}</h1>
            <div class="botanical-divider" aria-hidden="true">
              <span class="divider-line"></span>
              <svg class="divider-leaf" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C7 7 4 14 12 22C20 14 17 7 12 2Z" fill="var(--color-tertiary)" fill-opacity="0.7"/>
                <path d="M12 2V22" stroke="var(--color-primary)" stroke-width="1"/>
              </svg>
              <span class="divider-line"></span>
            </div>
            <p class="hero-message">${this._escaparHtml(mensagemBoasVindas)}</p>
            ${evento.dataHoraFormatada ? `
              <div class="hero-date-badge">
                <svg class="hero-date-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span class="hero-date-text">${this._escaparHtml(evento.dataHoraFormatada)}</span>
              </div>
            ` : ''}
          </div>

          <!-- Detalhes Nobres do Evento: Data, Horário e Local -->
          <div class="event-details-card">
            <div class="event-details-card__inner">
              <div class="event-detail-column">
                <span class="event-detail-tag">QUANDO</span>
                <p class="event-detail-main">${this._escaparHtml(evento.dataHoraFormatada || '10 de Outubro de 2026')}</p>
                <span class="event-detail-sub">Sábado às 14:30</span>
              </div>
              <div class="event-detail-divider" aria-hidden="true">
                <span class="event-detail-divider__line"></span>
                <svg class="event-detail-divider__icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C7 7 4 14 12 22C20 14 17 7 12 2Z" fill="var(--color-tertiary)" fill-opacity="0.6"/>
                </svg>
                <span class="event-detail-divider__line"></span>
              </div>
              <div class="event-detail-column">
                <span class="event-detail-tag">ONDE</span>
                <p class="event-detail-main">${this._escaparHtml(evento.local || 'Espaço Jardim das Camélias')}</p>
                <span class="event-detail-sub">${this._escaparHtml(evento.enderecoCompleto || 'Rua das Flores, 120')}</span>
              </div>
            </div>
          </div>

          <!-- Ações do Hero: Como Chegar & Adicionar à Agenda -->
          <div class="hero-actions">
            <a href="${this._escaparHtml(evento.googleMapsUrl || '#')}" target="_blank" rel="noopener noreferrer" class="btn btn--secondary btn--icon" id="btn-ver-mapa">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Ver no Google Maps</span>
            </a>

            <div class="dropdown-calendar">
              <button type="button" class="btn btn--secondary btn--icon" id="btn-agenda-toggle" aria-expanded="false" aria-haspopup="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Adicionar à Agenda</span>
                <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div class="dropdown-calendar__menu" id="calendar-menu" hidden>
                <a href="${createGoogleCalendarUrl(evento)}" target="_blank" rel="noopener noreferrer" class="dropdown-calendar__item" id="btn-google-calendar">
                  <span>Google Agenda</span>
                </a>
                <button type="button" class="dropdown-calendar__item" id="btn-download-ics">
                  <span>Baixar Arquivo (.ics / Apple / Outlook)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this._vincularEventosAgenda(evento);
  }

  /**
   * Vincula os eventos do dropdown e download do calendário.
   * @param {object} evento
   */
  static _vincularEventosAgenda(evento) {
    if (typeof document === 'undefined') return;
    const toggleBtn = document.getElementById('btn-agenda-toggle');
    const menu = document.getElementById('calendar-menu');
    const downloadIcsBtn = document.getElementById('btn-download-ics');

    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = menu.hasAttribute('hidden');
        if (isHidden) {
          menu.removeAttribute('hidden');
          toggleBtn.setAttribute('aria-expanded', 'true');
        } else {
          menu.setAttribute('hidden', '');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Fecha dropdown se clicar fora
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== toggleBtn) {
          menu.setAttribute('hidden', '');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (downloadIcsBtn) {
      downloadIcsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        downloadIcsFile(evento, `cha_de_cozinha_${evento.noivos ? evento.noivos.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'evento'}.ics`);
        if (menu) {
          menu.setAttribute('hidden', '');
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /**
   * Renderiza a estrutura da Contagem Regressiva Viva.
   * @param {HTMLElement} containerElement
   */
  static renderizarCountdown(containerElement) {
    if (!containerElement) return;

    containerElement.innerHTML = `
      <section class="countdown-section" aria-label="Contagem Regressiva para o Chá">
        <div class="countdown-header">
          <span class="label-countdown">FALTAM APENAS</span>
        </div>
        <div class="countdown-timer" id="countdown-timer">
          <div class="countdown-card">
            <span class="countdown-num" id="countdown-dias">00</span>
            <span class="countdown-label">DIAS</span>
          </div>
          <span class="countdown-separator">:</span>
          <div class="countdown-card">
            <span class="countdown-num" id="countdown-horas">00</span>
            <span class="countdown-label">HORAS</span>
          </div>
          <span class="countdown-separator">:</span>
          <div class="countdown-card">
            <span class="countdown-num" id="countdown-minutos">00</span>
            <span class="countdown-label">MINUTOS</span>
          </div>
          <span class="countdown-separator">:</span>
          <div class="countdown-card">
            <span class="countdown-num" id="countdown-segundos">00</span>
            <span class="countdown-label">SEGUNDOS</span>
          </div>
        </div>
        <p class="countdown-live-status" id="countdown-status-msg" aria-live="polite"></p>
      </section>
    `;
  }

  /**
   * Atualiza os números da contagem regressiva viva com base na data do evento.
   * 
   * @param {string|Date} dataHoraEvento
   * @returns {{dias: number, horas: number, minutos: number, segundos: number, encerrado: boolean}}
   */
  static atualizarContagem(dataHoraEvento) {
    const alvo = (dataHoraEvento instanceof Date) ? dataHoraEvento : new Date(dataHoraEvento);
    const agora = new Date();
    const diferencaMs = alvo.getTime() - agora.getTime();

    const elDias = typeof document !== 'undefined' ? document.getElementById('countdown-dias') : null;
    const elHoras = typeof document !== 'undefined' ? document.getElementById('countdown-horas') : null;
    const elMin = typeof document !== 'undefined' ? document.getElementById('countdown-minutos') : null;
    const elSeg = typeof document !== 'undefined' ? document.getElementById('countdown-segundos') : null;
    const elStatus = typeof document !== 'undefined' ? document.getElementById('countdown-status-msg') : null;

    if (diferencaMs <= 0) {
      if (elDias) elDias.textContent = '00';
      if (elHoras) elHoras.textContent = '00';
      if (elMin) elMin.textContent = '00';
      if (elSeg) elSeg.textContent = '00';
      if (elStatus) elStatus.textContent = 'Chegou o grande dia! Estamos comemorando nosso Chá de Cozinha com muito carinho.';
      return { dias: 0, horas: 0, minutos: 0, segundos: 0, encerrado: true };
    }

    const segundosTotais = Math.floor(diferencaMs / 1000);
    const dias = Math.floor(segundosTotais / 86400);
    const horas = Math.floor((segundosTotais % 86400) / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    const segundos = segundosTotais % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (elDias) elDias.textContent = pad(dias);
    if (elHoras) elHoras.textContent = pad(horas);
    if (elMin) elMin.textContent = pad(minutos);
    if (elSeg) elSeg.textContent = pad(segundos);

    return { dias, horas, minutos, segundos, encerrado: false };
  }

  /**
   * Renderiza a Vitrine da Paleta de Cores Sugerida.
   * 
   * @param {HTMLElement} containerElement
   * @param {Array<object>} paleta - Lista de cores com nome, hex e descrição
   */
  static renderizarPaletaCores(containerElement, paleta = []) {
    if (!containerElement) return;

    const swatchesHtml = paleta.map((cor) => `
      <div class="palette-card">
        <div class="palette-swatch-wrapper">
          <div class="palette-swatch" style="background-color: ${cor.hex}; background: ${cor.background || cor.hex};" aria-hidden="true"></div>
        </div>
        <div class="palette-info">
          <strong class="palette-name">${this._escaparHtml(cor.nome)}</strong>
        </div>
      </div>
    `).join('');

    containerElement.innerHTML = `
      <section class="palette-section" aria-label="Paleta de Cores Recomendada">
        <div class="section-title-wrap">
          <span class="eyebrow-tag">HARMONIA ESTÉTICA</span>
          <h2 class="section-title">Paleta de Cores Sugerida</h2>
          <p class="section-subtitle">
            Preparamos esta paleta com as tonalidades preferidas para o nosso novo lar.
            Sinta-se livre para se inspirar nestes tons ao escolher presentes, utensílios e decorações!
          </p>
        </div>

        <div class="palette-grid">
          ${swatchesHtml}
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
