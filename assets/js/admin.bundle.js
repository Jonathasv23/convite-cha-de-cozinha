/**
 * Script Unificado Autossuficiente para Compatibilidade Universal do Painel da Noiva
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Finalidade:
 * Permite que a visão administrativa funcione perfeitamente TANTO servida via HTTP/HTTPS
 * (Live Server, npx serve, GitHub Pages) QUANTO aberta via duplo clique no Windows Explorer
 * (protocolo file:///), onde módulos ES6 externos podem ser bloqueados pelo navegador.
 */

(function () {
  // Se os módulos ES6 já foram carregados com sucesso, não duplica a inicialização
  if (window.__adminIniciado) {
    return;
  }

  const config = {
    evento: {
      noivos: 'Hevelyn & Jonathas',
      titulo: 'Chá de Cozinha de Hevelyn & Jonathas',
      subtitulo: 'Um momento de celebração e carinho para preparar o novo lar',
      dataHoraISO: '2026-10-24T16:00:00',
      dataHoraFormatada: 'Sábado, 24 de Outubro de 2026 às 16h00',
      local: 'Espaço Jardim das Camélias',
      enderecoCompleto: 'Rua das Flores, 120 - Jardim Primavera, São Paulo - SP',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Espa%C3%A7o+Jardim+das+Cam%C3%A9lias+Rua+das+Flores+120',
    },
    fallbackDinamicos: {
      dataLimiteConfirmacao: '2026-10-18T23:59:59',
      chavePix: 'hevelyn.jonathas.cha@email.com',
      mensagemBoasVindas: 'É com imensa alegria que convidamos você para compartilhar este momento tão especial conosco. Venha celebrar o amor e o início da nossa nova história!'
    },
    admin: {
      pinMestrePadrao: '2026',
      maxTentativasPin: 5,
      bloqueioMinutos: 5
    }
  };

  const STORAGE_DEMO_KEY_PRES = '_demo_presentes';
  const STORAGE_DEMO_CONF = '_demo_confirmacoes';
  const STORAGE_DEMO_CFG = '_demo_configuracoes';
  const STORAGE_AUTH_KEY = '_admin_auth_session';
  const STORAGE_LOCKOUT_KEY = '_admin_pin_lockout';
  const STORAGE_TENTATIVAS_KEY = '_admin_pin_tentativas';

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
    { nome: "Chaleira Elétrica com Infusor de Inox", quantidade: 2 },
    { nome: "Torradeira em Inox com Níveis de Tostagem", quantidade: 1 },
    { nome: "Kit Utensílios de Silicone com Cabo de Madeira", quantidade: 3 },
    { nome: "Escorredor de Louça em Inox com Bandeja", quantidade: 1 },
    { nome: "Jogo de Formas e Assadeiras Antiaderentes", quantidade: 2 },
    { nome: "Mini Processador de Alimentos Elétrico", quantidade: 1 },
    { nome: "Balança Digital de Precisão para Culinária", quantidade: 2 },
    { nome: "Kit Pano de Prato Algodão Fio Tinto (4 unid.)", quantidade: 4 },
    { nome: "Garrafa Térmica Nórdica Minimalista", quantidade: 2 }
  ];

  function getDemoStore(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function setDemoStore(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  function inicializarCatalogoSeNecessario() {
    const data = getDemoStore(STORAGE_DEMO_KEY_PRES, null);
    if (!data || !Array.isArray(data) || data.length === 0) {
      const inicial = catalogoPresentesInicial.map((item, idx) => ({
        id: `demo_pres_${idx + 1}`,
        nome: item.nome,
        quantidade_total: item.quantidade,
        quantidade_disponivel: item.quantidade,
        ativo: true,
        criado_em: new Date().toISOString()
      }));
      setDemoStore(STORAGE_DEMO_KEY_PRES, inicial);
    }
  }

  function escaparHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatarDataHoraPtBr(dataVal) {
    if (!dataVal) return '-';
    try {
      const d = (dataVal instanceof Date) ? dataVal : new Date(dataVal);
      if (isNaN(d.getTime())) return String(dataVal);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      const hora = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${ano} às ${hora}:${min}`;
    } catch (e) {
      return String(dataVal);
    }
  }

  function formatarParaInputDatetime(dataVal) {
    if (!dataVal) return '';
    try {
      const d = (dataVal instanceof Date) ? dataVal : new Date(dataVal);
      if (isNaN(d.getTime())) return '';
      const ano = d.getFullYear();
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const dia = String(d.getDate()).padStart(2, '0');
      const hora = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${ano}-${mes}-${dia}T${hora}:${min}`;
    } catch (e) {
      return '';
    }
  }

  // Toast simples autônomo
  const Toast = {
    exibir(msg, tipo = 'info') {
      const c = document.getElementById('admin-toast-container');
      if (!c) return;
      const el = document.createElement('div');
      el.className = `toast toast-${tipo} toast-paper-art`;
      el.textContent = msg;
      c.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
      }, 4000);
    },
    sucesso(msg) { this.exibir(msg, 'sucesso'); },
    aviso(msg) { this.exibir(msg, 'aviso'); },
    erro(msg) { this.exibir(msg, 'erro'); },
    info(msg) { this.exibir(msg, 'info'); }
  };

  class AdminApp {
    constructor() {
      this.timerBloqueio = null;
      this.modalAtivo = null;
      inicializarCatalogoSeNecessario();
    }

    iniciar() {
      this.gateOverlay = document.getElementById('pin-gate-overlay');
      this.adminApp = document.getElementById('admin-app');

      const statusBloqueio = this.verificarBloqueio();
      if (statusBloqueio.estaBloqueado) {
        this.exibirGateBloqueado(statusBloqueio.segundosRestantes);
        return;
      }

      if (this.estaAutenticado()) {
        this.liberarPainel();
      } else {
        this.exibirGatePin();
      }
    }

    estaAutenticado() {
      try {
        const raw = sessionStorage.getItem(STORAGE_AUTH_KEY);
        if (!raw) return false;
        const p = JSON.parse(raw);
        return Boolean(p && p.autenticado);
      } catch (e) {
        return false;
      }
    }

    verificarBloqueio() {
      try {
        const raw = localStorage.getItem(STORAGE_LOCKOUT_KEY);
        if (!raw) return { estaBloqueado: false, segundosRestantes: 0 };
        const fim = parseInt(raw, 10);
        const agora = Date.now();
        if (agora < fim) {
          return { estaBloqueado: true, segundosRestantes: Math.ceil((fim - agora) / 1000) };
        }
        localStorage.removeItem(STORAGE_LOCKOUT_KEY);
        localStorage.removeItem(STORAGE_TENTATIVAS_KEY);
        return { estaBloqueado: false, segundosRestantes: 0 };
      } catch (e) {
        return { estaBloqueado: false, segundosRestantes: 0 };
      }
    }

    obterTentativasRestantes() {
      const max = config.admin.maxTentativasPin || 5;
      try {
        const feitas = parseInt(localStorage.getItem(STORAGE_TENTATIVAS_KEY) || '0', 10);
        return Math.max(0, max - feitas);
      } catch (e) {
        return max;
      }
    }

    registrarTentativaInvalida() {
      const max = config.admin.maxTentativasPin || 5;
      const minBloqueio = config.admin.bloqueioMinutos || 5;
      let feitas = parseInt(localStorage.getItem(STORAGE_TENTATIVAS_KEY) || '0', 10) + 1;

      if (feitas >= max) {
        const fim = Date.now() + (minBloqueio * 60 * 1000);
        localStorage.setItem(STORAGE_LOCKOUT_KEY, String(fim));
        localStorage.setItem(STORAGE_TENTATIVAS_KEY, String(feitas));
        this.exibirGateBloqueado(minBloqueio * 60);
        Toast.erro(`Acesso bloqueado por ${minBloqueio} minutos após tentativas incorretas.`);
      } else {
        localStorage.setItem(STORAGE_TENTATIVAS_KEY, String(feitas));
        this.exibirGatePin();
        Toast.aviso('PIN incorreto. Verifique e tente novamente.');
      }
    }

    limparTentativas() {
      try {
        localStorage.removeItem(STORAGE_LOCKOUT_KEY);
        localStorage.removeItem(STORAGE_TENTATIVAS_KEY);
      } catch (e) {}
      if (this.timerBloqueio) {
        clearInterval(this.timerBloqueio);
        this.timerBloqueio = null;
      }
    }

    exibirGatePin() {
      if (!this.gateOverlay) return;
      const restantes = this.obterTentativasRestantes();
      this.gateOverlay.style.display = 'flex';
      if (this.adminApp) this.adminApp.style.display = 'none';

      this.gateOverlay.innerHTML = `
        <div class="pin-gate-card">
          <div class="pin-gate-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <span class="pin-gate-tag">ÁREA RESTRITA</span>
          <h1 class="pin-gate-title">Painel da Noiva</h1>
          <p class="pin-gate-subtitle">Insira o PIN Mestre para acessar a gestão do Chá de Cozinha.</p>
          
          <form id="form-pin-gate" class="pin-gate-form" onsubmit="return false;">
            <div class="pin-input-wrap">
              <input
                type="password"
                id="pin-input"
                class="pin-input"
                inputmode="numeric"
                maxlength="8"
                placeholder="Digite o PIN"
                autocomplete="current-password"
                autofocus
                required
              >
            </div>
            <button type="submit" id="btn-entrar-pin" class="btn-primary btn-pin">
              <span>Acessar Painel</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </form>

          <div id="pin-feedback" class="pin-status-message ${restantes < 5 ? 'warning' : ''}">
            ${restantes < 5 ? `Atenção: Você tem mais ${restantes} tentativa(s) antes do bloqueio.` : 'Acesso seguro e exclusivo à lista do evento.'}
          </div>
        </div>
      `;

      const form = document.getElementById('form-pin-gate');
      const input = document.getElementById('pin-input');
      if (form && input) {
        form.onsubmit = (e) => {
          e.preventDefault();
          this.validarPin(input.value);
        };
        input.focus();
      }
    }

    exibirGateBloqueado(segundos) {
      if (!this.gateOverlay) return;
      this.gateOverlay.style.display = 'flex';
      if (this.adminApp) this.adminApp.style.display = 'none';

      const min = Math.floor(segundos / 60);
      const seg = segundos % 60;
      const fmt = `${min}:${String(seg).padStart(2, '0')}`;

      this.gateOverlay.innerHTML = `
        <div class="pin-gate-card pin-gate-blocked">
          <div class="pin-gate-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 class="pin-gate-title">Acesso Temporariamente Bloqueado</h1>
          <p class="pin-gate-subtitle">
            Muitas tentativas consecutivas incorretas do PIN.<br>
            Por motivos de segurança, aguarde o término do bloqueio:
          </p>
          <div class="pin-countdown-timer" id="pin-lockout-timer">${fmt}</div>
          <p class="pin-status-message error">Novas tentativas estarão disponíveis em instantes.</p>
        </div>
      `;

      if (this.timerBloqueio) clearInterval(this.timerBloqueio);
      let t = segundos;
      this.timerBloqueio = setInterval(() => {
        t -= 1;
        const el = document.getElementById('pin-lockout-timer');
        if (el) {
          const m = Math.floor(t / 60);
          const s = t % 60;
          el.textContent = `${m}:${String(s).padStart(2, '0')}`;
        }
        if (t <= 0) {
          clearInterval(this.timerBloqueio);
          this.timerBloqueio = null;
          this.limparTentativas();
          this.exibirGatePin();
          Toast.info('Bloqueio encerrado. Você já pode tentar inserir o PIN.');
        }
      }, 1000);
    }

    validarPin(pin) {
      const status = this.verificarBloqueio();
      if (status.estaBloqueado) {
        Toast.erro('Acesso bloqueado temporariamente.');
        return;
      }
      const pinLimpo = String(pin || '').trim();
      if (pinLimpo !== String(config.admin.pinMestrePadrao)) {
        this.registrarTentativaInvalida();
        return;
      }

      this.limparTentativas();
      sessionStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify({ autenticado: true, loginEm: new Date().toISOString() }));
      Toast.sucesso('Acesso autorizado! Bem-vinda ao seu painel.');
      this.liberarPainel();
    }

    liberarPainel() {
      if (this.gateOverlay) this.gateOverlay.style.display = 'none';
      if (this.adminApp) this.adminApp.style.display = 'block';
      this.carregarDados();
    }

    carregarDados() {
      const cfg = getDemoStore(STORAGE_DEMO_CFG, config.fallbackDinamicos);
      const confs = getDemoStore(STORAGE_DEMO_CONF, []);
      const presentes = getDemoStore(STORAGE_DEMO_KEY_PRES, []);

      // Calcula métricas
      let totalConfirmados = confs.length;
      let totalPresentes = 0;
      let totalApenasPresenca = 0;
      confs.forEach((c) => {
        if (c.tipo_escolha === 'presente_item' || c.tipo_escolha === 'pix_surpresa') totalPresentes++;
        else if (c.tipo_escolha === 'apenas_presenca') totalApenasPresenca++;
      });
      let presentesDisponiveis = 0;
      presentes.forEach((p) => {
        if (p.ativo !== false && Number(p.quantidade_disponivel) > 0) {
          presentesDisponiveis += Number(p.quantidade_disponivel);
        }
      });

      const metricas = { totalConfirmados, totalPresentes, presentesDisponiveis, totalApenasPresenca };

      // Renderiza Topo
      const elHeader = document.querySelector('.admin-header');
      if (elHeader) {
        elHeader.innerHTML = `
          <header class="admin-topbar">
            <div class="admin-topbar-inner">
              <div class="admin-branding">
                <div class="admin-botanical-monogram" aria-hidden="true">
                  <svg class="admin-botanical-monogram__wreath" viewBox="0 0 160 160" width="56" height="56" fill="none">
                    <circle cx="80" cy="80" r="70" stroke="var(--color-border-linen, #D1C7B7)" stroke-width="1" stroke-dasharray="3 3" />
                    <circle cx="80" cy="80" r="66" stroke="var(--color-tertiary, #C5A880)" stroke-width="0.75" stroke-opacity="0.6" />
                    <path d="M40 110 C30 85 45 55 70 30 C65 45 50 65 48 85 C46 100 42 106 40 110Z" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.25" />
                    <path d="M40 110 Q50 90 62 76 Q52 70 44 76" stroke="var(--color-primary, #3D4A36)" stroke-width="1.2" stroke-linecap="round" />
                    <path d="M48 95 Q38 88 34 94 Q42 100 48 95" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.4" stroke="var(--color-primary, #3D4A36)" stroke-width="0.8" />
                    <path d="M58 80 Q52 68 45 74 Q52 82 58 80" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.4" stroke="var(--color-primary, #3D4A36)" stroke-width="0.8" />
                    <path d="M68 64 Q66 52 56 56 Q60 66 68 64" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.4" stroke="var(--color-primary, #3D4A36)" stroke-width="0.8" />
                    <path d="M120 110 C130 85 115 55 90 30 C95 45 110 65 112 85 C114 100 118 106 120 110Z" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.25" />
                    <path d="M120 110 Q110 90 98 76 Q108 70 116 76" stroke="var(--color-primary, #3D4A36)" stroke-width="1.2" stroke-linecap="round" />
                    <path d="M112 95 Q122 88 126 94 Q118 100 112 95" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.4" stroke="var(--color-primary, #3D4A36)" stroke-width="0.8" />
                    <path d="M102 80 Q108 68 115 74 Q108 82 102 80" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.4" stroke="var(--color-primary, #3D4A36)" stroke-width="0.8" />
                    <path d="M92 64 Q94 52 104 56 Q100 66 92 64" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.4" stroke="var(--color-primary, #3D4A36)" stroke-width="0.8" />
                    <circle cx="80" cy="24" r="2.5" fill="var(--color-tertiary, #C5A880)" />
                    <circle cx="75" cy="26" r="1.5" fill="var(--color-secondary, #8A9A80)" />
                    <circle cx="85" cy="26" r="1.5" fill="var(--color-secondary, #8A9A80)" />
                    <circle cx="80" cy="136" r="2.5" fill="var(--color-tertiary, #C5A880)" />
                  </svg>
                  <span class="admin-botanical-monogram__initials">H &amp; J</span>
                </div>
                <div>
                  <span class="admin-badge-label">PAINEL ADMINISTRATIVO</span>
                  <h1 class="admin-title">Chá de Cozinha de ${escaparHtml(config.evento.noivos)}</h1>
                </div>
              </div>
              <div class="admin-topbar-actions no-print">
                <a href="index.html" target="_blank" class="btn-secondary btn-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  <span>Ver Convite</span>
                </a>
                <button id="btn-atualizar-dados" class="btn-secondary btn-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                  <span>Atualizar</span>
                </button>
                <button id="btn-logout" class="btn-secondary btn-sm btn-logout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  <span>Sair / Bloquear</span>
                </button>
              </div>
            </div>
          </header>
        `;
      }

      // Renderiza Métricas
      const elMetrics = document.getElementById('dashboard-metrics');
      if (elMetrics) {
        elMetrics.innerHTML = `
          <section class="dashboard-section">
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-icon-wrap olive">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div class="metric-info">
                  <span class="metric-label">TOTAL CONFIRMADOS</span>
                  <div class="metric-number">${metricas.totalConfirmados}</div>
                  <span class="metric-detail">${metricas.totalApenasPresenca} confirmaram apenas presença</span>
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-icon-wrap sage">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                </div>
                <div class="metric-info">
                  <span class="metric-label">PRESENTES ESCOLHIDOS</span>
                  <div class="metric-number">${metricas.totalPresentes}</div>
                  <span class="metric-detail">Itens físicos + PIX / Surpresa</span>
                </div>
              </div>
              <div class="metric-card">
                <div class="metric-icon-wrap gold">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                </div>
                <div class="metric-info">
                  <span class="metric-label">ITENS DISPONÍVEIS</span>
                  <div class="metric-number">${metricas.presentesDisponiveis}</div>
                  <span class="metric-detail">Unidades ainda livres no catálogo</span>
                </div>
              </div>
            </div>
          </section>
        `;
      }

      // Renderiza Configurações
      const elCfgWrap = document.getElementById('secao-configuracoes-wrap');
      if (elCfgWrap) {
        const dVal = formatarParaInputDatetime(cfg.dataLimiteConfirmacao);
        const estaExpirado = new Date(cfg.dataLimiteConfirmacao).getTime() < Date.now();
        elCfgWrap.innerHTML = `
          <section class="admin-card-section">
            <div class="section-header">
              <div class="section-title-wrap">
                <span class="section-kicker">GESTÃO OPERACIONAL</span>
                <h2 class="section-title">Prazos e Configurações do Evento</h2>
              </div>
              ${estaExpirado ? '<span class="status-pill status-pill-expired">Prazo Encerrado no Convite</span>' : '<span class="status-pill status-pill-active">RSVP Ativo</span>'}
            </div>
            <form id="form-configuracoes" class="admin-form" onsubmit="return false;">
              <div class="form-row-2">
                <div class="admin-input-group">
                  <label for="cfg-data-limite" class="admin-label">PRAZO LIMITE DE CONFIRMAÇÃO <span class="required-mark">*</span></label>
                  <input type="datetime-local" id="cfg-data-limite" class="admin-input" value="${dVal}" required>
                  <span class="input-helper">Após este horário, o formulário de confirmação será bloqueado no site.</span>
                </div>
                <div class="admin-input-group">
                  <label for="cfg-chave-pix" class="admin-label">CHAVE PIX DA NOIVA <span class="required-mark">*</span></label>
                  <input type="text" id="cfg-chave-pix" class="admin-input" value="${escaparHtml(cfg.chavePix || '')}" required>
                  <span class="input-helper">Exibida aos convidados que escolherem presentear via PIX.</span>
                </div>
              </div>
              <div class="admin-input-group">
                <label for="cfg-mensagem-boas-vindas" class="admin-label">MENSAGEM DE ACOLHIMENTO <span class="required-mark">*</span></label>
                <textarea id="cfg-mensagem-boas-vindas" class="admin-textarea" rows="3" required>${escaparHtml(cfg.mensagemBoasVindas || '')}</textarea>
              </div>
              <div class="form-actions">
                <button type="submit" id="btn-salvar-config" class="btn-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  <span>Salvar Configurações</span>
                </button>
              </div>
            </form>
          </section>
        `;
      }

      // Renderiza Cadastro de Novo Presente
      const elNovoPres = document.getElementById('secao-novo-presente-wrap');
      if (elNovoPres) {
        elNovoPres.innerHTML = `
          <section class="admin-card-section">
            <div class="section-header">
              <div class="section-title-wrap">
                <span class="section-kicker">INVENTÁRIO</span>
                <h2 class="section-title">Cadastrar Novo Presente</h2>
              </div>
            </div>
            <form id="form-novo-presente" class="admin-form" onsubmit="return false;">
              <div class="form-row-novo-presente">
                <div class="admin-input-group flex-2">
                  <label for="novo-presente-nome" class="admin-label">NOME DO PRESENTE <span class="required-mark">*</span></label>
                  <input type="text" id="novo-presente-nome" class="admin-input" placeholder="Ex: Jogo de Xícaras de Porcelana" minlength="3" maxlength="80" required>
                </div>
                <div class="admin-input-group flex-1">
                  <label for="novo-presente-qtd" class="admin-label">QUANTIDADE TOTAL <span class="required-mark">*</span></label>
                  <input type="number" id="novo-presente-qtd" class="admin-input" min="1" max="99" value="1" required>
                </div>
                <div class="admin-input-group btn-align-bottom">
                  <button type="submit" id="btn-adicionar-presente" class="btn-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Adicionar à Lista</span>
                  </button>
                </div>
              </div>
            </form>
          </section>
        `;
      }

      // Renderiza Tabela de Convidados
      const elTabela = document.getElementById('guest-table-container');
      if (elTabela) {
        const sortedConfs = [...confs].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
        elTabela.innerHTML = `
          <section class="admin-card-section">
            <div class="section-header table-header-flex">
              <div class="section-title-wrap">
                <span class="section-kicker">RELAÇÃO DE CONFIRMAÇÕES</span>
                <h2 class="section-title">Convidados Confirmados (${sortedConfs.length})</h2>
              </div>
              <div class="table-actions no-print">
                <button id="btn-imprimir-relatorio" class="btn-secondary btn-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  <span>Imprimir / PDF</span>
                </button>
              </div>
            </div>
            ${sortedConfs.length === 0 ? `
              <div class="admin-empty-state">
                <p class="empty-title">Nenhum convidado confirmado até o momento</p>
                <p class="empty-subtitle">Assim que os convidados confirmarem presença pelo convite público, os registros aparecerão aqui.</p>
              </div>
            ` : `
              <div class="table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Convidado</th>
                      <th scope="col">Opção Escolhida</th>
                      <th scope="col">Data da Confirmação</th>
                      <th scope="col" class="no-print">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${sortedConfs.map((c, idx) => {
                      const nome = escaparHtml(c.nome_convidado || 'Convidado');
                      const dataFmt = formatarDataHoraPtBr(c.criado_em);
                      const isItem = c.tipo_escolha === 'presente_item' && c.presente_id;
                      const isPix = c.tipo_escolha === 'pix_surpresa';
                      let badge = '';
                      if (isItem) {
                        badge = `<span class="choice-badge badge-presente"><strong>${escaparHtml(c.nome_presente_snapshot || 'Presente')}</strong></span>`;
                      } else if (isPix) {
                        badge = `<span class="choice-badge badge-pix">PIX / Presente Surpresa</span>`;
                      } else {
                        badge = `<span class="choice-badge badge-presenca">Apenas Presença</span>`;
                      }

                      let acao = '<span class="action-muted">-</span>';
                      if (isItem) {
                        acao = `
                          <button type="button" class="btn-action-liberar btn-liberar-presente"
                            data-conf-id="${escaparHtml(c.id)}"
                            data-pres-id="${escaparHtml(c.presente_id)}"
                            data-nome-convidado="${nome}"
                            data-nome-presente="${escaparHtml(c.nome_presente_snapshot || 'Presente')}"
                          >
                            <span>Liberar Item</span>
                          </button>
                        `;
                      } else if (c.liberado_em) {
                        acao = `<span class="tag-liberado">Item Devolvido</span>`;
                      }

                      return `
                        <tr class="table-row ${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
                          <td>
                            <div class="guest-name-wrap">
                              <span class="guest-avatar-mini">${nome.charAt(0).toUpperCase()}</span>
                              <span class="guest-name-text">${nome}</span>
                            </div>
                          </td>
                          <td>${badge}</td>
                          <td><time>${dataFmt}</time></td>
                          <td class="no-print">${acao}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </section>
        `;
      }

      this.vincularEventos();
    }

    vincularEventos() {
      const btnLogout = document.getElementById('btn-logout');
      if (btnLogout) {
        btnLogout.onclick = () => {
          sessionStorage.removeItem(STORAGE_AUTH_KEY);
          Toast.info('Sessão administrativa encerrada.');
          this.exibirGatePin();
        };
      }

      const btnAtualizar = document.getElementById('btn-atualizar-dados');
      if (btnAtualizar) {
        btnAtualizar.onclick = () => {
          this.carregarDados();
          Toast.sucesso('Painel atualizado!');
        };
      }

      const formCfg = document.getElementById('form-configuracoes');
      if (formCfg) {
        formCfg.onsubmit = (e) => {
          e.preventDefault();
          const dVal = document.getElementById('cfg-data-limite')?.value;
          const pVal = document.getElementById('cfg-chave-pix')?.value?.trim();
          const mVal = document.getElementById('cfg-mensagem-boas-vindas')?.value?.trim();

          if (!pVal || !mVal || mVal.length < 5) {
            Toast.aviso('Preencha os campos corretamente.');
            return;
          }

          const novoCfg = {
            dataLimiteConfirmacao: dVal ? new Date(dVal).toISOString() : config.fallbackDinamicos.dataLimiteConfirmacao,
            chavePix: pVal,
            mensagemBoasVindas: mVal
          };
          setDemoStore(STORAGE_DEMO_CFG, novoCfg);
          Toast.sucesso('Configurações salvas com sucesso!');
          this.carregarDados();
        };
      }

      const formNovo = document.getElementById('form-novo-presente');
      if (formNovo) {
        formNovo.onsubmit = (e) => {
          e.preventDefault();
          const nVal = document.getElementById('novo-presente-nome')?.value?.trim();
          const qVal = parseInt(document.getElementById('novo-presente-qtd')?.value, 10);

          if (!nVal || nVal.length < 3 || isNaN(qVal) || qVal < 1 || qVal > 99) {
            Toast.aviso('Dados inválidos para o novo presente.');
            return;
          }

          const listaPres = getDemoStore(STORAGE_DEMO_KEY_PRES, []);
          listaPres.push({
            id: `demo_pres_${Date.now()}`,
            nome: nVal,
            quantidade_total: qVal,
            quantidade_disponivel: qVal,
            ativo: true,
            criado_em: new Date().toISOString()
          });
          setDemoStore(STORAGE_DEMO_KEY_PRES, listaPres);
          Toast.sucesso(`Presente "${nVal}" adicionado com sucesso!`);
          this.carregarDados();
        };
      }

      const botoesLiberar = document.querySelectorAll('.btn-liberar-presente');
      botoesLiberar.forEach((btn) => {
        btn.onclick = () => {
          const confId = btn.getAttribute('data-conf-id');
          const presId = btn.getAttribute('data-pres-id');
          const nomeConvidado = btn.getAttribute('data-nome-convidado');
          const nomePresente = btn.getAttribute('data-nome-presente');
          this.abrirModalLiberacao({ confId, presId, nomeConvidado, nomePresente });
        };
      });

      const btnImprimir = document.getElementById('btn-imprimir-relatorio');
      if (btnImprimir) {
        btnImprimir.onclick = () => window.print();
      }
    }

    abrirModalLiberacao({ confId, presId, nomeConvidado, nomePresente }) {
      this.fecharModalLiberacao();
      const div = document.createElement('div');
      div.id = 'modal-liberacao-container';
      div.innerHTML = `
        <div class="admin-modal-backdrop">
          <div class="admin-modal-card">
            <h3 class="admin-modal-title">Liberar Presente?</h3>
            <p class="admin-modal-text">Você está prestes a liberar <strong>"${escaparHtml(nomePresente)}"</strong> escolhido por <strong>"${escaparHtml(nomeConvidado)}"</strong>.</p>
            <div class="admin-modal-actions">
              <button type="button" id="btn-modal-cancel" class="btn-secondary">Cancelar</button>
              <button type="button" id="btn-modal-confirm" class="btn-primary">Sim, Liberar Presente</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(div);
      this.modalAtivo = div;

      document.getElementById('btn-modal-cancel').onclick = () => this.fecharModalLiberacao();
      document.getElementById('btn-modal-confirm').onclick = () => {
        // Devolve ao estoque
        const listaPres = getDemoStore(STORAGE_DEMO_KEY_PRES, []);
        const pres = listaPres.find((p) => p.id === presId);
        if (pres) {
          pres.quantidade_disponivel = Number(pres.quantidade_disponivel) + 1;
          setDemoStore(STORAGE_DEMO_KEY_PRES, listaPres);
        }

        // Atualiza confirmação
        const listaConf = getDemoStore(STORAGE_DEMO_CONF, []);
        const conf = listaConf.find((c) => c.id === confId);
        if (conf) {
          conf.tipo_escolha = 'apenas_presenca';
          conf.presente_id = null;
          conf.liberado_em = new Date().toISOString();
          setDemoStore(STORAGE_DEMO_CONF, listaConf);
        }

        this.fecharModalLiberacao();
        Toast.sucesso(`Presente "${nomePresente}" liberado com sucesso!`);
        this.carregarDados();
      };
    }

    fecharModalLiberacao() {
      if (this.modalAtivo && this.modalAtivo.parentNode) {
        this.modalAtivo.parentNode.removeChild(this.modalAtivo);
        this.modalAtivo = null;
      }
    }
  }

  const app = new AdminApp();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.iniciar());
  } else {
    app.iniciar();
  }
})();
