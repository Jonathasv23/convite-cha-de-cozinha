/**
 * Script Unificado Autossuficiente para Compatibilidade Universal
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Finalidade:
 * Permite que a aplicação funcione perfeitamente TANTO quando servida via HTTP/HTTPS
 * (Live Server, npx serve, GitHub Pages) QUANTO quando aberta diretamente via duplo clique
 * no Windows Explorer (protocolo file:///), onde navegadores baseados em Chromium bloqueiam
 * nativamente módulos ES6 externos por política de CORS em origin "null".
 */

(function () {
  // Se os módulos ES6 já foram carregados com sucesso pelo navegador (via HTTP/HTTPS), não duplica a inicialização
  if (window.__conviteIniciado) {
    return;
  }

  /* --------------------------------------------------------------------------
     1. Configuração do Evento
     -------------------------------------------------------------------------- */
  const config = {
    evento: {
      noivos: 'Hevelyn & Jonathas',
      titulo: 'Chá de Cozinha de Hevelyn & Jonathas',
      subtitulo: 'Um momento de celebração e carinho para preparar o novo lar',
      dataHoraISO: '2026-10-10T14:30:00',
      dataHoraFormatada: 'Sábado, 10 de Outubro de 2026 às 14:30',
      local: 'Espaço Jardim das Camélias',
      enderecoCompleto: 'Rua das Flores, 120 - Jardim Primavera, São Paulo - SP',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Espa%C3%A7o+Jardim+das+Cam%C3%A9lias+Rua+das+Flores+120',
    },
    paletaCores: [
      { nome: 'Branco', hex: '#FFFFFF', descricao: 'Luminoso, puro e atemporal' },
      { nome: 'Preto', hex: '#1A1A1A', descricao: 'Moderno, marcante e sofisticado' },
      { nome: 'Inox', hex: '#9DA3A6', background: 'linear-gradient(135deg, #B5B9BC 0%, #FFFFFF 30%, #9DA3A8 55%, #E2E5E8 85%, #8C9298 100%)', descricao: 'Aço escovado e contemporâneo' },
      { nome: 'Cinza', hex: '#6B7075', descricao: 'Neutro nobre, versátil e equilibrado' },
      { nome: 'Bege', hex: '#E8D5BF', descricao: 'Aconchegante, suave e natural' }
    ],
    fallbackDinamicos: {
      dataLimiteConfirmacao: '2026-10-04T23:59:59',
      chavePix: 'hevelyn.jonathas.cha@email.com',
      mensagemBoasVindas: 'É com imensa alegria que convidamos você para compartilhar este momento tão especial conosco. Venha celebrar o amor e o início da nossa nova história!'
    }
  };

  /* --------------------------------------------------------------------------
     2. Catálogo Inicial de Presentes
     -------------------------------------------------------------------------- */
  const catalogoPresentesInicial = [
    { nome: "Jogo de Panelas Antiaderentes", quantidade: 1 },
    { nome: "Faqueiro Inox 24 Peças", quantidade: 2 },
    { nome: "Aparelho de Jantar Porcelana 16 Peças", quantidade: 1 },
    { nome: "Jogo de Copos de Cristal Ecológico", quantidade: 2 },
    { nome: "Jogo de Taças para Vinho e Champanhe", quantidade: 2 },
    { nome: "Travessa Refratária Cerâmica Grande", quantidade: 2 },
    { nome: "Tábua de Corte em Madeira Nobre Teca", quantidade: 2 },
    { nome: "Conjunto de Potes Herméticos de Vidro", quantidade: 3 },
    { nome: "Liquidificador Potente com Jarra de Vidro", quantidade: 1 },
    { nome: "Batedeira Planetária", quantidade: 1 },
    { nome: "Cafeteira Elétrica Programável", quantidade: 1 },
    { nome: "Chaleira Elétrica Inox", quantidade: 1 },
    { nome: "Torradeira Elétrica Inox", quantidade: 1 },
    { nome: "Kit de Utensílios de Silicone com Cabo de Bambu", quantidade: 2 },
    { nome: "Escorredor de Louças Moderno Inox", quantidade: 1 },
    { nome: "Porta-Temperos Giratório Inox", quantidade: 2 },
    { nome: "Balança Digital de Precisão para Cozinha", quantidade: 2 },
    { nome: "Kit de Formas Antiaderentes para Bolos e Tortas", quantidade: 2 },
    { nome: "Jogo de Toalhas de Mesa em Linho", quantidade: 2 },
    { nome: "Conjunto de Panos de Prato Artesanais em Algodão", quantidade: 3 }
  ];

  /* --------------------------------------------------------------------------
     3. Armazenamento Local e Utilitários de Logging
     -------------------------------------------------------------------------- */
  const inMemoryStorage = new Map();

  const demoStore = {
    get(key, defaultValue = null) {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const raw = window.localStorage.getItem(key);
          if (raw !== null) {
            const parsed = JSON.parse(raw);
            inMemoryStorage.set(key, parsed);
            return parsed;
          }
        } catch (e) {}
      }
      if (inMemoryStorage.has(key)) {
        return inMemoryStorage.get(key);
      }
      if (defaultValue !== null) {
        inMemoryStorage.set(key, defaultValue);
      }
      return defaultValue;
    },
    set(key, value) {
      inMemoryStorage.set(key, value);
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {}
      }
    }
  };

  function logError(contexto, erro) {
    console.error(`[AppError] [${contexto}]`, erro);
  }

  /* --------------------------------------------------------------------------
     4. Utilitários de Calendário e Datas
     -------------------------------------------------------------------------- */
  function formatUtcCalendarString(data) {
    const d = (typeof data === 'string') ? new Date(data) : data;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  }

  function escapeIcsText(texto) {
    if (!texto) return '';
    return String(texto).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }

  function createGoogleCalendarUrl(ev) {
    const dataInicio = new Date(ev.dataHoraISO || '2026-10-10T14:30:00');
    const dataFim = new Date(dataInicio.getTime() + 4 * 60 * 60 * 1000);
    const startUtc = formatUtcCalendarString(dataInicio);
    const endUtc = formatUtcCalendarString(dataFim);
    const titulo = encodeURIComponent(ev.titulo || 'Chá de Cozinha');
    const desc = encodeURIComponent(`${ev.subtitulo || ''}\n\nEsperamos você com muito amor!`.trim());
    const loc = encodeURIComponent([ev.local, ev.enderecoCompleto].filter(Boolean).join(' - '));
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${startUtc}/${endUtc}&details=${desc}&location=${loc}`;
  }

  function downloadIcsFile(ev, nomeArquivo = 'cha_de_cozinha.ics') {
    const dataInicio = new Date(ev.dataHoraISO || '2026-10-10T14:30:00');
    const dataFim = new Date(dataInicio.getTime() + 4 * 60 * 60 * 1000);
    const agora = new Date();
    const startUtc = formatUtcCalendarString(dataInicio);
    const endUtc = formatUtcCalendarString(dataFim);
    const stampUtc = formatUtcCalendarString(agora);
    const uid = `cha-cozinha-${dataInicio.getTime()}@botanicalheritage.atelier`;

    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Botanical Heritage Atelier//Convite Cha de Cozinha//PT-BR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stampUtc}`,
      `DTSTART:${startUtc}`,
      `DTEND:${endUtc}`,
      `SUMMARY:${escapeIcsText(ev.titulo || 'Chá de Cozinha')}`,
      `DESCRIPTION:${escapeIcsText(ev.subtitulo || '')}`,
      `LOCATION:${escapeIcsText([ev.local, ev.enderecoCompleto].filter(Boolean).join(' - '))}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function formatarDataExtenso(dataIso) {
    if (!dataIso) return '';
    const d = new Date(dataIso);
    if (isNaN(d.getTime())) return String(dataIso);
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function normalizarNome(nome) {
    if (!nome || typeof nome !== 'string') return '';
    return nome
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function escaparHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* --------------------------------------------------------------------------
     5. Models (Camada de Dados Demo Local)
     -------------------------------------------------------------------------- */
  const STORAGE_DEMO_PRESENTES = '_demo_presentes';
  const STORAGE_DEMO_CONFIRMACOES = '_demo_confirmacoes';
  const STORAGE_DEMO_NOMES = '_demo_nomes_confirmados';
  const STORAGE_DEMO_CONFIG = '_demo_configuracoes';

  function readDemoPresentes() {
    const data = demoStore.get(STORAGE_DEMO_PRESENTES);
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    const inicial = catalogoPresentesInicial.map((item, index) => ({
      id: `demo_pres_${index + 1}`,
      nome: item.nome,
      quantidade_total: item.quantidade,
      quantidade_disponivel: item.quantidade,
      ativo: true,
      criado_em: new Date().toISOString()
    }));
    demoStore.set(STORAGE_DEMO_PRESENTES, inicial);
    return inicial;
  }

  const ConfiguracaoModel = {
    async obterConfiguracoes() {
      const demoData = demoStore.get(STORAGE_DEMO_CONFIG);
      const dataLimite = demoData?.dataLimiteConfirmacao || config.fallbackDinamicos.dataLimiteConfirmacao;
      const chavePix = demoData?.chavePix || config.fallbackDinamicos.chavePix;
      const mensagemBoasVindas = demoData?.mensagemBoasVindas || config.fallbackDinamicos.mensagemBoasVindas;

      const estaExpirado = Date.now() > new Date(dataLimite).getTime();

      return {
        dataLimiteConfirmacao: dataLimite,
        chavePix,
        mensagemBoasVindas,
        estaExpirado,
        evento: { ...config.evento },
        paletaCores: [...config.paletaCores]
      };
    }
  };

  const PresenteModel = {
    async listarDisponiveis() {
      const lista = readDemoPresentes();
      return lista
        .filter((p) => p.ativo !== false && p.quantidade_disponivel > 0)
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    },
    async obterPorId(id) {
      const lista = readDemoPresentes();
      return lista.find((p) => p.id === id) || null;
    }
  };

  const ConfirmacaoModel = {
    async verificarHomonimo(nome) {
      const nomeNorm = normalizarNome(nome);
      if (!nomeNorm || nomeNorm.length < 2) return { existe: false };
      const demoNomes = demoStore.get(STORAGE_DEMO_NOMES, {});
      if (demoNomes && demoNomes[nomeNorm]) {
        return { existe: true, nomeNormalizado: nomeNorm };
      }
      return { existe: false, nomeNormalizado: nomeNorm };
    },
    async confirmarPresenca({ nomeConvidado, tipoEscolha, presenteId, nomePresenteSnapshot }) {
      if (!nomeConvidado || nomeConvidado.trim().length < 2) {
        throw new Error('Por favor, informe seu nome completo.');
      }
      const nomeHigienizado = nomeConvidado.trim();
      const nomeNorm = normalizarNome(nomeHigienizado);
      const agora = new Date().toISOString();

      if (tipoEscolha === 'presente_item') {
        const lista = readDemoPresentes();
        const index = lista.findIndex((p) => p.id === presenteId);
        if (index === -1) throw new Error('Presente não encontrado.');
        const pres = lista[index];
        if (pres.quantidade_disponivel <= 0) {
          const err = new Error('ESGOTADO');
          err.code = 'ESGOTADO';
          throw err;
        }
        pres.quantidade_disponivel -= 1;
        demoStore.set(STORAGE_DEMO_PRESENTES, lista);

        const confId = `conf_${Date.now()}`;
        const confs = demoStore.get(STORAGE_DEMO_CONFIRMACOES, []);
        confs.push({
          id: confId,
          nome_convidado: nomeHigienizado,
          tipo_escolha: 'presente_item',
          presente_id: presenteId,
          nome_presente_snapshot: nomePresenteSnapshot || pres.nome,
          criado_em: agora
        });
        demoStore.set(STORAGE_DEMO_CONFIRMACOES, confs);

        const nomes = demoStore.get(STORAGE_DEMO_NOMES, {});
        nomes[nomeNorm] = { nome_original: nomeHigienizado, criado_em: agora };
        demoStore.set(STORAGE_DEMO_NOMES, nomes);

        return { confirmacaoId: confId, nomePresente: pres.nome };
      }

      // PIX ou apenas presença
      const confId = `conf_${Date.now()}`;
      const confs = demoStore.get(STORAGE_DEMO_CONFIRMACOES, []);
      confs.push({
        id: confId,
        nome_convidado: nomeHigienizado,
        tipo_escolha: tipoEscolha,
        presente_id: null,
        criado_em: agora
      });
      demoStore.set(STORAGE_DEMO_CONFIRMACOES, confs);

      const nomes = demoStore.get(STORAGE_DEMO_NOMES, {});
      nomes[nomeNorm] = { nome_original: nomeHigienizado, criado_em: agora };
      demoStore.set(STORAGE_DEMO_NOMES, nomes);

      return { confirmacaoId: confId };
    }
  };

  /* --------------------------------------------------------------------------
     6. Views
     -------------------------------------------------------------------------- */
  const ToastView = {
    exibir(mensagem, tipo = 'info') {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
      const toast = document.createElement('div');
      toast.className = `toast toast--${tipo}`;
      toast.innerHTML = `
        <div class="toast__content"><p class="toast__message">${escaparHtml(mensagem)}</p></div>
        <button type="button" class="toast__close">&times;</button>
      `;
      const fechar = () => {
        toast.classList.add('toast--hiding');
        setTimeout(() => toast.remove(), 250);
      };
      toast.querySelector('.toast__close').addEventListener('click', fechar);
      setTimeout(fechar, 4000);
      container.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('toast--visible'));
    },
    sucesso(msg) { this.exibir(msg, 'success'); },
    aviso(msg) { this.exibir(msg, 'warning'); },
    erro(msg) { this.exibir(msg, 'error'); }
  };

  const ConviteView = {
    renderizarHero(container, { evento, mensagemBoasVindas }) {
      if (!container) return;
      container.innerHTML = `
        <div class="hero-card paper-texture">
          <div class="hero-card__inner-border">
            <div class="botanical-monogram" aria-hidden="true">
              <svg class="botanical-monogram__wreath" viewBox="0 0 160 160" width="140" height="140" fill="none">
                <circle cx="80" cy="80" r="70" stroke="var(--color-border-linen)" stroke-width="1" stroke-dasharray="3 3" />
                <circle cx="80" cy="80" r="66" stroke="var(--color-tertiary)" stroke-width="0.75" stroke-opacity="0.6" />
                <path d="M40 110 C30 85 45 55 70 30 C65 45 50 65 48 85 C46 100 42 106 40 110Z" fill="var(--color-secondary)" fill-opacity="0.25" />
                <path d="M40 110 Q50 90 62 76 Q52 70 44 76" stroke="var(--color-primary)" stroke-width="1.2" stroke-linecap="round" />
                <path d="M48 95 Q38 88 34 94 Q42 100 48 95" fill="var(--color-secondary)" fill-opacity="0.4" stroke="var(--color-primary)" stroke-width="0.8" />
                <path d="M58 80 Q52 68 45 74 Q52 82 58 80" fill="var(--color-secondary)" fill-opacity="0.4" stroke="var(--color-primary)" stroke-width="0.8" />
                <path d="M68 64 Q66 52 56 56 Q60 66 68 64" fill="var(--color-secondary)" fill-opacity="0.4" stroke="var(--color-primary)" stroke-width="0.8" />
                <path d="M120 110 C130 85 115 55 90 30 C95 45 110 65 112 85 C114 100 118 106 120 110Z" fill="var(--color-secondary)" fill-opacity="0.25" />
                <path d="M120 110 Q110 90 98 76 Q108 70 116 76" stroke="var(--color-primary)" stroke-width="1.2" stroke-linecap="round" />
                <path d="M112 95 Q122 88 126 94 Q118 100 112 95" fill="var(--color-secondary)" fill-opacity="0.4" stroke="var(--color-primary)" stroke-width="0.8" />
                <path d="M102 80 Q108 68 115 74 Q108 82 102 80" fill="var(--color-secondary)" fill-opacity="0.4" stroke="var(--color-primary)" stroke-width="0.8" />
                <path d="M92 64 Q94 52 104 56 Q100 66 92 64" fill="var(--color-secondary)" fill-opacity="0.4" stroke="var(--color-primary)" stroke-width="0.8" />
                <circle cx="80" cy="24" r="2.5" fill="var(--color-tertiary)" />
                <circle cx="75" cy="26" r="1.5" fill="var(--color-secondary)" />
                <circle cx="85" cy="26" r="1.5" fill="var(--color-secondary)" />
                <circle cx="80" cy="136" r="2.5" fill="var(--color-tertiary)" />
              </svg>
              <span class="botanical-monogram__initials">H &amp; J</span>
            </div>

            <div class="hero-card__header">
              <span class="eyebrow-tag">CHÁ DE COZINHA</span>
              <h1 class="couple-title">${escaparHtml(evento.noivos || 'Hevelyn & Jonathas')}</h1>
              <div class="botanical-divider" aria-hidden="true">
                <span class="divider-line"></span>
                <svg class="divider-leaf" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C7 7 4 14 12 22C20 14 17 7 12 2Z" fill="var(--color-tertiary)" fill-opacity="0.7"/>
                  <path d="M12 2V22" stroke="var(--color-primary)" stroke-width="1"/>
                </svg>
                <span class="divider-line"></span>
              </div>
              <p class="hero-message">${escaparHtml(mensagemBoasVindas)}</p>
              ${evento.dataHoraFormatada ? `
                <div class="hero-date-badge">
                  <svg class="hero-date-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span class="hero-date-text">${escaparHtml(evento.dataHoraFormatada)}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    },

    renderizarCountdown(container) {
      if (!container) return;
      container.innerHTML = `
        <section class="countdown-section">
          <div class="countdown-header"><span class="label-countdown">FALTAM APENAS</span></div>
          <div class="countdown-timer">
            <div class="countdown-card"><span class="countdown-num" id="countdown-dias">00</span><span class="countdown-label">DIAS</span></div>
            <span class="countdown-separator">:</span>
            <div class="countdown-card"><span class="countdown-num" id="countdown-horas">00</span><span class="countdown-label">HORAS</span></div>
            <span class="countdown-separator">:</span>
            <div class="countdown-card"><span class="countdown-num" id="countdown-minutos">00</span><span class="countdown-label">MINUTOS</span></div>
            <span class="countdown-separator">:</span>
            <div class="countdown-card"><span class="countdown-num" id="countdown-segundos">00</span><span class="countdown-label">SEGUNDOS</span></div>
          </div>
          <p class="countdown-live-status" id="countdown-status-msg"></p>
        </section>
      `;
    },

    atualizarContagem(dataHoraEvento) {
      const alvo = new Date(dataHoraEvento);
      const agora = new Date();
      const dif = alvo.getTime() - agora.getTime();

      const elD = document.getElementById('countdown-dias');
      const elH = document.getElementById('countdown-horas');
      const elM = document.getElementById('countdown-minutos');
      const elS = document.getElementById('countdown-segundos');
      const elMsg = document.getElementById('countdown-status-msg');

      if (dif <= 0) {
        if (elD) elD.textContent = '00';
        if (elH) elH.textContent = '00';
        if (elM) elM.textContent = '00';
        if (elS) elS.textContent = '00';
        if (elMsg) elMsg.textContent = 'É hoje! Estamos celebrando nosso chá!';
        return;
      }

      const totalSeg = Math.floor(dif / 1000);
      const dias = Math.floor(totalSeg / 86400);
      const horas = Math.floor((totalSeg % 86400) / 3600);
      const min = Math.floor((totalSeg % 3600) / 60);
      const seg = totalSeg % 60;
      const pad = (n) => String(n).padStart(2, '0');

      if (elD) elD.textContent = pad(dias);
      if (elH) elH.textContent = pad(horas);
      if (elM) elM.textContent = pad(min);
      if (elS) elS.textContent = pad(seg);
    },

    renderizarPaleta(container, paleta) {
      if (!container) return;
      const cards = paleta.map((cor) => `
        <div class="palette-card">
          <div class="palette-swatch-wrapper">
            <div class="palette-swatch" style="background-color: ${cor.hex}; background: ${cor.background || cor.hex};"></div>
          </div>
          <div class="palette-info">
            <strong class="palette-name">${escaparHtml(cor.nome)}</strong>
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <section class="palette-section">
          <div class="section-title-wrap">
            <span class="eyebrow-tag">HARMONIA ESTÉTICA</span>
            <h2 class="section-title">Paleta de Cores Sugerida</h2>
            <p class="section-subtitle">
              Sinta-se livre para se inspirar nestes tons acolhedores ao escolher presentes e utensílios:
            </p>
          </div>
          <div class="palette-grid">${cards}</div>
        </section>
      `;
    }
  };

  const FormularioRSVPView = {
    renderizar(container, { estaExpirado, dataLimiteFormatada, presentes = [] }) {
      if (!container) return;

      if (estaExpirado) {
        container.innerHTML = `
          <div class="rsvp-card-wrapper paper-texture">
            <div class="rsvp-card__inner-border" style="text-align: center; padding: 2rem 1rem;">
              <span class="eyebrow-tag">CONFIRMAÇÕES ENCERRADAS</span>
              <h2 class="section-title">Prazo de Confirmação Finalizado</h2>
              <p class="section-subtitle">O prazo para confirmação de presença encerrou. Por favor, fale diretamente com a noiva.</p>
            </div>
          </div>
        `;
        return;
      }

      const options = presentes.map((p) => {
        return `<option value="${p.id}" data-nome="${escaparHtml(p.nome)}">${escaparHtml(p.nome)}</option>`;
      }).join('');

      container.innerHTML = `
        <section class="rsvp-card-wrapper paper-texture">
          <div class="rsvp-card__inner-border">
            <div class="section-title-wrap">
              <span class="eyebrow-tag">SUA PRESENÇA</span>
              <h2 class="section-title">Confirme sua Presença</h2>
              <p class="section-subtitle">
                Por favor, confirme até <strong>${escaparHtml(dataLimiteFormatada)}</strong> para organizarmos tudo com carinho.
              </p>
            </div>

            <form id="form-rsvp" class="rsvp-form" novalidate>
              <div class="form-group">
                <label for="input-nome-convidado" class="form-label">NOME COMPLETO *</label>
                <input type="text" id="input-nome-convidado" name="nomeConvidado" class="form-input" placeholder="Ex: Maria Alice Ferreira" required minlength="2" />
                <div id="alerta-homonimo" class="friendly-homonym-alert" hidden>
                  <span>ℹ️ Já temos uma confirmação com esse nome! Se for outra pessoa, sugerimos adicionar o sobrenome ou apelido.</span>
                </div>
              </div>

              <div class="form-group form-group--checkbox">
                <label class="custom-checkbox-label" for="check-apenas-presenca">
                  <input type="checkbox" id="check-apenas-presenca" class="custom-checkbox" />
                  <span class="custom-checkbox-box"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                  <span class="custom-checkbox-text">Desejo apenas confirmar presença (sem escolher presente físico agora)</span>
                </label>
              </div>

              <div class="form-group" id="group-select-presente">
                <label for="select-presente" class="form-label">LISTA DE PRESENTES OU CONTRIBUIÇÃO *</label>
                <div class="custom-select-wrapper">
                  <select id="select-presente" class="form-select">
                    <option value="">Selecione um presente da lista...</option>
                    <option value="pix_surpresa" class="select-option--highlight">✨ Presentear com PIX / Presente surpresa</option>
                    ${options}
                  </select>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" id="btn-submit-rsvp" class="btn btn--primary btn--block">
                  <span class="btn__text">Confirmar Presença</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      `;
    },

    renderizarSucesso(container, { nomeConvidado, tipoEscolha, nomePresente, chavePix, onNovo }) {
      if (!container) return;

      let detalhe = '';
      if (tipoEscolha === 'presente_item') {
        detalhe = `
          <div class="success-gift-highlight">
            <span class="success-gift-icon">🎁</span>
            <div>
              <span class="success-gift-label">PRESENTE ESCOLHIDO</span>
              <strong class="success-gift-name">${escaparHtml(nomePresente)}</strong>
              <p class="success-gift-desc">Item reservado no seu nome com muito carinho!</p>
            </div>
          </div>
        `;
      } else if (tipoEscolha === 'pix_surpresa') {
        detalhe = `
          <div class="pix-card">
            <span class="pix-badge">PRESENTE VIA PIX</span>
            <p class="pix-card__lead">Agradecemos imensamente pela sua contribuição com o nosso novo lar:</p>
            <div class="pix-key-box">
              <div class="pix-key-display">
                <span class="pix-key-label">CHAVE PIX:</span>
                <code class="pix-key-value">${escaparHtml(chavePix)}</code>
              </div>
              <button type="button" class="btn btn--secondary btn--copy-pix" id="btn-copiar-pix">
                <span class="btn-copy-text">Copiar Chave PIX</span>
              </button>
            </div>
          </div>
        `;
      } else {
        detalhe = `
          <div class="success-presence-highlight">
            <span class="success-presence-icon">🌿</span>
            <p class="success-presence-text">Sua presença está confirmadíssima! Será maravilhoso ter você conosco.</p>
          </div>
        `;
      }

      container.innerHTML = `
        <section class="rsvp-card-wrapper rsvp-card-wrapper--success paper-texture">
          <div class="rsvp-card__inner-border" style="text-align: center;">
            <div class="success-seal">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="var(--color-tertiary)" stroke-width="1.5" stroke-dasharray="3 3"/>
                <circle cx="32" cy="32" r="26" fill="var(--color-surface-container-low)" stroke="var(--color-primary)" stroke-width="1"/>
                <path d="M22 33L29 40L43 24" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="eyebrow-tag">CONFIRMAÇÃO REGISTRADA</span>
            <h2 class="section-title">Presença Confirmada!</h2>
            <p class="section-subtitle">Querido(a) <strong>${escaparHtml(nomeConvidado)}</strong>, seu registro foi realizado com sucesso!</p>
            ${detalhe}
            <div class="success-footer-actions">
              <button type="button" class="btn btn--outline btn--sm" id="btn-novo-rsvp">Confirmar presença de outro convidado</button>
            </div>
          </div>
        </section>
      `;

      const btnCopiar = container.querySelector('#btn-copiar-pix');
      if (btnCopiar && chavePix) {
        btnCopiar.addEventListener('click', () => {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(chavePix).then(() => {
              btnCopiar.textContent = 'Copiado!';
              ToastView.sucesso('Chave PIX copiada com sucesso!');
              setTimeout(() => { btnCopiar.textContent = 'Copiar Chave PIX'; }, 3000);
            });
          }
        });
      }

      const btnNovo = container.querySelector('#btn-novo-rsvp');
      if (btnNovo && onNovo) {
        btnNovo.addEventListener('click', onNovo);
      }

      container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  /* --------------------------------------------------------------------------
     7. Inicialização do Controlador
     -------------------------------------------------------------------------- */
  async function iniciarApp() {
    try {
      window.__conviteIniciado = true;

      const conf = await ConfiguracaoModel.obterConfiguracoes();
      const presentes = await PresenteModel.listarDisponiveis();

      const heroEl = document.getElementById('hero-section');
      const countEl = document.getElementById('countdown-section-wrapper');
      const palEl = document.getElementById('palette-section-wrapper');
      const rsvpEl = document.getElementById('rsvp-section');

      ConviteView.renderizarHero(heroEl, { evento: conf.evento, mensagemBoasVindas: conf.mensagemBoasVindas });
      if (countEl) ConviteView.renderizarCountdown(countEl);
      ConviteView.renderizarPaleta(palEl, conf.paletaCores);

      const dataFormatada = formatarDataExtenso(conf.dataLimiteConfirmacao);

      const montarForm = (itensPresentes) => {
        FormularioRSVPView.renderizar(rsvpEl, {
          estaExpirado: conf.estaExpirado,
          dataLimiteFormatada: dataFormatada,
          presentes: itensPresentes
        });

        if (conf.estaExpirado) return;

        const inputNome = document.getElementById('input-nome-convidado');
        const checkPresenca = document.getElementById('check-apenas-presenca');
        const selPres = document.getElementById('select-presente');
        const alertaHom = document.getElementById('alerta-homonimo');
        const form = document.getElementById('form-rsvp');

        if (inputNome) {
          inputNome.addEventListener('blur', async () => {
            if (inputNome.value.trim().length >= 3) {
              const res = await ConfirmacaoModel.verificarHomonimo(inputNome.value);
              if (res.existe) alertaHom.removeAttribute('hidden');
              else alertaHom.setAttribute('hidden', '');
            }
          });
        }

        if (checkPresenca && selPres) {
          checkPresenca.addEventListener('change', (e) => {
            selPres.disabled = e.target.checked;
            if (e.target.checked) selPres.value = '';
          });
        }

        if (form) {
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = inputNome ? inputNome.value.trim() : '';
            const apenasPres = checkPresenca ? checkPresenca.checked : false;
            const presVal = selPres ? selPres.value : '';

            if (!nome || nome.length < 2) {
              ToastView.aviso('Por favor, digite seu nome completo.');
              return;
            }
            if (!apenasPres && !presVal) {
              ToastView.aviso('Por favor, selecione um presente ou marque apenas presença.');
              return;
            }

            let tipoEscolha = 'presente_item';
            let presenteId = null;
            let nomeSnapshot = null;

            if (apenasPres) {
              tipoEscolha = 'apenas_presenca';
            } else if (presVal === 'pix_surpresa') {
              tipoEscolha = 'pix_surpresa';
            } else {
              tipoEscolha = 'presente_item';
              presenteId = presVal;
              const opt = selPres.options[selPres.selectedIndex];
              nomeSnapshot = opt ? opt.getAttribute('data-nome') : null;
            }

            try {
              const res = await ConfirmacaoModel.confirmarPresenca({
                nomeConvidado: nome,
                tipoEscolha,
                presenteId,
                nomePresenteSnapshot: nomeSnapshot
              });

              FormularioRSVPView.renderizarSucesso(rsvpEl, {
                nomeConvidado: nome,
                tipoEscolha,
                nomePresente: res.nomePresente || nomeSnapshot,
                chavePix: conf.chavePix,
                onNovo: async () => {
                  const novos = await PresenteModel.listarDisponiveis();
                  montarForm(novos);
                }
              });

              ToastView.sucesso('Presença confirmada com muito carinho!');
            } catch (err) {
              if (err.code === 'ESGOTADO') {
                ToastView.aviso('Puxa, este item acabou de ser reservado! Atualizamos a lista.');
                const novos = await PresenteModel.listarDisponiveis();
                montarForm(novos);
              } else {
                ToastView.erro(err.message || 'Ocorreu um erro ao salvar.');
              }
            }
          });
        }
      };

      montarForm(presentes);

      // Countdown loop
      if (document.getElementById('countdown-dias')) {
        ConviteView.atualizarContagem(conf.evento.dataHoraISO);
        setInterval(() => {
          ConviteView.atualizarContagem(conf.evento.dataHoraISO);
        }, 1000);
      }

    } catch (err) {
      console.error('[Convite] Falha na inicialização:', err);
    }
  }

  // Execução no carregamento da página
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarApp);
  } else {
    iniciarApp();
  }
})();
