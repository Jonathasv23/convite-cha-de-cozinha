/**
 * Camada de Visualização: PainelNoivaView
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsabilidades (FSD Seções 6.2, 12.2, 13.6, 13.7, 13.9, 13.10, 14.1 RN-07, RN-08):
 * 1. Renderização do Gate de Acesso por PIN Mestre com proteção visual e feedback de tentativas.
 * 2. Renderização do Dashboard de Resumo com contadores em tempo real (Garamond + Manrope).
 * 3. Renderização do Formulário de Configurações (prazo limite, chave PIX e mensagem de boas-vindas).
 * 4. Renderização do Formulário de Cadastro Rápido de Presentes (nome e quantidade total).
 * 5. Renderização da Tabela de Convidados Confirmados com badges de status e botão de liberação.
 * 6. Modal de Confirmação de Liberação/Estorno de Presentes físicos.
 * 7. Sanitização estrita contra XSS em todos os dados exibidos.
 */

/**
 * Utilitário de escape de caracteres HTML para prevenção de XSS (FSD 24.1).
 * @param {string} str
 * @returns {string}
 */
export function escaparHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formata um timestamp ISO ou Date para data e hora em português do Brasil.
 * Exemplo: "2026-10-24T16:30:00" -> "24/10/2026 às 16:30"
 * @param {string|Date} dataVal
 * @returns {string}
 */
export function formatarDataHoraPtBr(dataVal) {
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

/**
 * Converte data ISO para formato esperado por input datetime-local (YYYY-MM-DDTHH:mm).
 * @param {string|Date} dataVal
 * @returns {string}
 */
export function formatarParaInputDatetime(dataVal) {
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

export class PainelNoivaView {
  /**
   * Renderiza a tela de bloqueio com Gate de PIN Mestre.
   * 
   * @param {object} params
   * @param {number} params.tentativasRestantes - Tentativas restantes antes do bloqueio
   * @param {boolean} params.estaBloqueado - Se está sob bloqueio temporário por força bruta
   * @param {number} params.segundosRestantesBloqueio - Tempo restante de bloqueio
   * @returns {string} Template HTML
   */
  static templateGatePin({ tentativasRestantes = 5, estaBloqueado = false, segundosRestantesBloqueio = 0 } = {}) {
    if (estaBloqueado) {
      const min = Math.floor(segundosRestantesBloqueio / 60);
      const seg = segundosRestantesBloqueio % 60;
      const tempoFormatado = `${min}:${String(seg).padStart(2, '0')}`;

      return `
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
          <div class="pin-countdown-timer" id="pin-lockout-timer">${tempoFormatado}</div>
          <p class="pin-status-message error">Novas tentativas estarão disponíveis em instantes.</p>
        </div>
      `;
    }

    return `
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

        <div id="pin-feedback" class="pin-status-message ${tentativasRestantes < 5 ? 'warning' : ''}">
          ${tentativasRestantes < 5 ? `Atenção: Você tem mais ${tentativasRestantes} tentativa(s) antes do bloqueio.` : 'Acesso seguro e exclusivo à lista do evento.'}
        </div>
      </div>
    `;
  }

  /**
   * Renderiza o cabeçalho superior do painel com dados dos noivos e ações de navegação.
   * @param {object} params
   * @param {string} params.noivos - Nome do casal
   * @returns {string} HTML
   */
  static templateHeader({ noivos = 'Hevelyn & Jonathas' } = {}) {
    return `
      <header class="admin-topbar">
        <div class="admin-topbar-inner">
          <div class="admin-branding">
            <div class="admin-botanical-monogram" aria-hidden="true">
              <svg class="admin-botanical-monogram__wreath" viewBox="0 0 160 160" width="56" height="56" fill="none">
                <!-- Círculo Guia Delicado -->
                <circle cx="80" cy="80" r="70" stroke="var(--color-border-linen, #D1C7B7)" stroke-width="1" stroke-dasharray="3 3" />
                <circle cx="80" cy="80" r="66" stroke="var(--color-tertiary, #C5A880)" stroke-width="0.75" stroke-opacity="0.6" />
                
                <!-- Folhagens e Ramos Botânicos Esquerda -->
                <path d="M40 110 C30 85 45 55 70 30 C65 45 50 65 48 85 C46 100 42 106 40 110Z" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.25" />
                <path d="M40 110 Q50 90 62 76 Q52 70 44 76" stroke="var(--color-primary, #3D4A36)" stroke-width="1.2" stroke-linecap="round" />
                <path d="M48 95 Q38 88 34 94 Q42 100 48 95" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.4" stroke="var(--color-primary, #3D4A36)" stroke-width="0.8" />
                <path d="M58 80 Q52 68 45 74 Q52 82 58 80" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.4" stroke="var(--color-primary, #3D4A36)" stroke-width="0.8" />
                <path d="M68 64 Q66 52 56 56 Q60 66 68 64" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.4" stroke="var(--color-primary, #3D4A36)" stroke-width="0.8" />
                
                <!-- Folhagens e Ramos Botânicos Direita -->
                <path d="M120 110 C130 85 115 55 90 30 C95 45 110 65 112 85 C114 100 118 106 120 110Z" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.25" />
                <path d="M120 110 Q110 90 98 76 Q108 70 116 76" stroke="var(--color-primary, #3D4A36)" stroke-width="1.2" stroke-linecap="round" />
                <path d="M112 95 Q122 88 126 94 Q118 100 112 95" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.4" stroke="var(--color-primary, #3D4A36)" stroke-width="0.8" />
                <path d="M102 80 Q108 68 115 74 Q108 82 102 80" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.4" stroke="var(--color-primary, #3D4A36)" stroke-width="0.8" />
                <path d="M92 64 Q94 52 104 56 Q100 66 92 64" fill="var(--color-secondary, #8A9A80)" fill-opacity="0.4" stroke="var(--color-primary, #3D4A36)" stroke-width="0.8" />

                <!-- Pequenos Acentos Florais -->
                <circle cx="80" cy="24" r="2.5" fill="var(--color-tertiary, #C5A880)" />
                <circle cx="75" cy="26" r="1.5" fill="var(--color-secondary, #8A9A80)" />
                <circle cx="85" cy="26" r="1.5" fill="var(--color-secondary, #8A9A80)" />
                <circle cx="80" cy="136" r="2.5" fill="var(--color-tertiary, #C5A880)" />
              </svg>
              <span class="admin-botanical-monogram__initials">H &amp; J</span>
            </div>
            <div>
              <span class="admin-badge-label">PAINEL ADMINISTRATIVO</span>
              <h1 class="admin-title">Chá de Cozinha de ${escaparHtml(noivos)}</h1>
            </div>
          </div>
          <div class="admin-topbar-actions no-print">
            <a href="index.html" target="_blank" class="btn-secondary btn-sm" title="Abrir convite público em nova aba">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>Ver Convite</span>
            </a>
            <button id="btn-atualizar-dados" class="btn-secondary btn-sm" title="Recarregar dados do servidor">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              <span>Atualizar</span>
            </button>
            <button id="btn-logout" class="btn-secondary btn-sm btn-logout" title="Encerrar sessão administrativa">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Sair / Bloquear</span>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  /**
   * Renderiza os três cartões principais de métricas do dashboard (RN-08).
   * 
   * @param {object} metricas
   * @param {number} metricas.totalConfirmados
   * @param {number} metricas.totalPresentes
   * @param {number} metricas.presentesDisponiveis
   * @param {number} [metricas.totalApenasPresenca]
   * @returns {string} HTML
   */
  static templateDashboard(metricas = {}) {
    const totalConfirmados = metricas.totalConfirmados || 0;
    const totalPresentes = metricas.totalPresentes || 0;
    const presentesDisponiveis = metricas.presentesDisponiveis || 0;
    const totalApenasPresenca = metricas.totalApenasPresenca || 0;

    return `
      <section class="dashboard-section" aria-label="Resumo em tempo real">
        <div class="metrics-grid">
          <!-- Card 1: Total Confirmados -->
          <div class="metric-card">
            <div class="metric-icon-wrap olive">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">TOTAL CONFIRMADOS</span>
              <div class="metric-number">${totalConfirmados}</div>
              <span class="metric-detail">${totalApenasPresenca} confirmaram apenas presença</span>
            </div>
          </div>

          <!-- Card 2: Total Presentes Escolhidos -->
          <div class="metric-card">
            <div class="metric-icon-wrap sage">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <polyline points="20 12 20 22 4 22 4 12"></polyline>
                <rect x="2" y="7" width="20" height="5"></rect>
                <line x1="12" y1="22" x2="12" y2="7"></line>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
              </svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">PRESENTES ESCOLHIDOS</span>
              <div class="metric-number">${totalPresentes}</div>
              <span class="metric-detail">Itens físicos + PIX / Surpresa</span>
            </div>
          </div>

          <!-- Card 3: Presentes Disponíveis -->
          <div class="metric-card">
            <div class="metric-icon-wrap gold">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 14 14"></polyline>
              </svg>
            </div>
            <div class="metric-info">
              <span class="metric-label">ITENS DISPONÍVEIS</span>
              <div class="metric-number">${presentesDisponiveis}</div>
              <span class="metric-detail">Unidades ainda livres no catálogo</span>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Renderiza a seção de configurações do evento (prazo limite, PIX e mensagem).
   * 
   * @param {object} configuracoes
   * @returns {string} HTML
   */
  static templateConfiguracoes(configuracoes = {}) {
    const dataLimiteInput = formatarParaInputDatetime(configuracoes.dataLimiteConfirmacao);
    const chavePix = configuracoes.chavePix || '';
    const mensagem = configuracoes.mensagemBoasVindas || '';
    const estaExpirado = configuracoes.estaExpirado || false;

    return `
      <section class="admin-card-section" id="secao-configuracoes">
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-kicker">GESTÃO OPERACIONAL</span>
            <h2 class="section-title">Prazos e Configurações do Evento</h2>
          </div>
          ${estaExpirado ? '<span class="status-pill status-pill-expired">Prazo Encerrado no Convite</span>' : '<span class="status-pill status-pill-active">RSVP Ativo</span>'}
        </div>

        <form id="form-configuracoes" class="admin-form" onsubmit="return false;">
          <div class="form-row-2">
            <!-- Campo 1: Data e Hora Limite -->
            <div class="admin-input-group">
              <label for="cfg-data-limite" class="admin-label">
                PRAZO LIMITE DE CONFIRMAÇÃO
                <span class="required-mark">*</span>
              </label>
              <input
                type="datetime-local"
                id="cfg-data-limite"
                class="admin-input"
                value="${dataLimiteInput}"
                required
              >
              <span class="input-helper">Após este horário, o formulário de confirmação será bloqueado no site.</span>
            </div>

            <!-- Campo 2: Chave PIX -->
            <div class="admin-input-group">
              <label for="cfg-chave-pix" class="admin-label">
                CHAVE PIX DA NOIVA
                <span class="required-mark">*</span>
              </label>
              <input
                type="text"
                id="cfg-chave-pix"
                class="admin-input"
                value="${escaparHtml(chavePix)}"
                placeholder="Ex: seu-email@exemplo.com ou telefone"
                required
              >
              <span class="input-helper">Exibida aos convidados que escolherem presentear via PIX.</span>
            </div>
          </div>

          <!-- Campo 3: Mensagem de Boas-Vindas -->
          <div class="admin-input-group">
            <label for="cfg-mensagem-boas-vindas" class="admin-label">
              MENSAGEM DE ACOLHIMENTO (CABEÇALHO)
              <span class="required-mark">*</span>
            </label>
            <textarea
              id="cfg-mensagem-boas-vindas"
              class="admin-textarea"
              rows="3"
              required
            >${escaparHtml(mensagem)}</textarea>
            <span class="input-helper">Texto introdutório exibido no topo do convite digital.</span>
          </div>

          <div class="form-actions">
            <button type="submit" id="btn-salvar-config" class="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>Salvar Configurações</span>
            </button>
          </div>
        </form>
      </section>
    `;
  }

  /**
   * Renderiza a seção de cadastro rápido de novos presentes no inventário (FSD 6.2.4).
   * @returns {string} HTML
   */
  static templateNovoPresente() {
    return `
      <section class="admin-card-section" id="secao-novo-presente">
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-kicker">INVENTÁRIO</span>
            <h2 class="section-title">Cadastrar Novo Presente</h2>
          </div>
        </div>

        <form id="form-novo-presente" class="admin-form" onsubmit="return false;">
          <div class="form-row-novo-presente">
            <div class="admin-input-group flex-2">
              <label for="novo-presente-nome" class="admin-label">
                NOME DO PRESENTE
                <span class="required-mark">*</span>
              </label>
              <input
                type="text"
                id="novo-presente-nome"
                class="admin-input"
                placeholder="Ex: Jogo de Xícaras de Chá de Porcelana"
                minlength="3"
                maxlength="80"
                required
              >
            </div>

            <div class="admin-input-group flex-1">
              <label for="novo-presente-qtd" class="admin-label">
                QUANTIDADE TOTAL
                <span class="required-mark">*</span>
              </label>
              <input
                type="number"
                id="novo-presente-qtd"
                class="admin-input"
                min="1"
                max="99"
                value="1"
                required
              >
            </div>

            <div class="admin-input-group btn-align-bottom">
              <button type="submit" id="btn-adicionar-presente" class="btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Adicionar à Lista</span>
              </button>
            </div>
          </div>
        </form>
      </section>
    `;
  }

  /**
   * Renderiza a tabela de convidados confirmados com suas respectivas escolhas e ações (FSD 6.2.5, 6.2.6, 22.1, 22.2).
   * 
   * @param {Array<object>} confirmacoes - Lista de confirmações
   * @param {object} [opcoes] - Opções de renderização
   * @param {string} [opcoes.noivos] - Nomes dos noivos para cabeçalho impresso
   * @returns {string} HTML
   */
  static templateTabelaConvidados(confirmacoes = [], { noivos = 'Hevelyn & Jonathas' } = {}) {
    const totalConfirmados = confirmacoes.length;
    const totalPresentesFisicos = confirmacoes.filter(c => c.tipo_escolha === 'presente_item').length;
    const totalPix = confirmacoes.filter(c => c.tipo_escolha === 'pix_surpresa').length;
    const totalApenasPresenca = confirmacoes.filter(c => c.tipo_escolha === 'apenas_presenca').length;
    const dataEmissao = formatarDataHoraPtBr(new Date());

    return `
      <section class="admin-card-section" id="secao-convidados">
        <!-- Cabeçalho Exclusivo para Mídia de Impressão (@media print) -->
        <div class="print-header">
          <div class="print-header-top">
            <h1 class="print-title">Chá de Cozinha &bull; ${escaparHtml(noivos)}</h1>
            <p class="print-subtitle">Relatório Consolidado de Confirmação de Presença e Lista de Presentes</p>
          </div>
          <div class="print-meta">
            <span><strong>Data de Emissão:</strong> ${dataEmissao}</span>
            <span><strong>Total de Registros:</strong> ${totalConfirmados}</span>
          </div>
        </div>

        <div class="section-header table-header-flex">
          <div class="section-title-wrap">
            <span class="section-kicker">RELAÇÃO DE CONFIRMAÇÕES</span>
            <h2 class="section-title">Convidados Confirmados (${totalConfirmados})</h2>
          </div>
          <div class="table-actions no-print">
            <button id="btn-exportar-csv" class="btn-secondary btn-sm" title="Baixar lista em formato CSV para Excel">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Baixar Planilha (CSV)</span>
            </button>
            <button id="btn-imprimir-relatorio" class="btn-secondary btn-sm" title="Imprimir lista ou salvar como PDF">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        ${confirmacoes.length === 0 ? `
          <div class="admin-empty-state">
            <div class="empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <p class="empty-title">Nenhum convidado confirmado até o momento</p>
            <p class="empty-subtitle">Assim que os convidados confirmarem presença pelo convite público, os registros aparecerão organizados aqui.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th scope="col" class="th-nome">Convidado</th>
                  <th scope="col" class="th-escolha">Opção Escolhida</th>
                  <th scope="col" class="th-data">Data da Confirmação</th>
                  <th scope="col" class="th-acoes no-print">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${confirmacoes.map((c, index) => {
                  const nome = escaparHtml(c.nome_convidado || 'Convidado');
                  const dataFormatada = formatarDataHoraPtBr(c.criado_em);
                  const isPresenteItem = c.tipo_escolha === 'presente_item' && c.presente_id;
                  const isPix = c.tipo_escolha === 'pix_surpresa';
                  const isApenasPresenca = c.tipo_escolha === 'apenas_presenca';
                  const foiLiberado = Boolean(c.liberado_em);

                  let badgeHtml = '';
                  let itemTexto = '';

                  if (isPresenteItem) {
                    itemTexto = escaparHtml(c.nome_presente_snapshot || 'Presente Físico');
                    badgeHtml = `
                      <span class="choice-badge badge-presente">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20 12 20 22 4 22 4 12"></polyline>
                          <rect x="2" y="7" width="20" height="5"></rect>
                        </svg>
                        <strong>${itemTexto}</strong>
                      </span>
                    `;
                  } else if (isPix) {
                    badgeHtml = `
                      <span class="choice-badge badge-pix">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          <line x1="12" y1="8" x2="12" y2="16"></line>
                          <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                        PIX / Presente Surpresa
                      </span>
                    `;
                  } else {
                    badgeHtml = `
                      <span class="choice-badge badge-presenca">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Apenas Confirmou Presença
                      </span>
                    `;
                  }

                  let acaoHtml = '<span class="action-muted">-</span>';
                  if (isPresenteItem) {
                    acaoHtml = `
                      <button
                        type="button"
                        class="btn-action-liberar btn-liberar-presente"
                        data-conf-id="${escaparHtml(c.id)}"
                        data-pres-id="${escaparHtml(c.presente_id)}"
                        data-nome-convidado="${nome}"
                        data-nome-presente="${escaparHtml(c.nome_presente_snapshot || 'Presente')}"
                        title="Liberar presente e devolver unidade ao estoque"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="1 4 1 10 7 10"></polyline>
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                        </svg>
                        <span>Liberar Item</span>
                      </button>
                    `;
                  } else if (foiLiberado) {
                    acaoHtml = `<span class="tag-liberado" title="Item estornado em ${formatarDataHoraPtBr(c.liberado_em)}">Item Devolvido</span>`;
                  }

                  return `
                    <tr class="table-row ${index % 2 === 0 ? 'row-even' : 'row-odd'}">
                      <td class="td-nome">
                        <div class="guest-name-wrap">
                          <span class="guest-avatar-mini">${nome.charAt(0).toUpperCase()}</span>
                          <span class="guest-name-text">${nome}</span>
                        </div>
                      </td>
                      <td class="td-escolha">${badgeHtml}</td>
                      <td class="td-data">
                        <time datetime="${escaparHtml(c.criado_em)}">${dataFormatada}</time>
                      </td>
                      <td class="td-acoes no-print">${acaoHtml}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}

        <!-- Resumo Consolidado Exclusivo para Mídia de Impressão (@media print) -->
        <div class="print-summary">
          <div class="print-summary-title">Resumo das Confirmações</div>
          <div class="print-summary-grid">
            <div class="print-summary-item">
              <span class="print-summary-label">Total de Convidados Confirmados:</span>
              <strong class="print-summary-val">${totalConfirmados}</strong>
            </div>
            <div class="print-summary-item">
              <span class="print-summary-label">Presentes Físicos Reservados:</span>
              <strong class="print-summary-val">${totalPresentesFisicos}</strong>
            </div>
            <div class="print-summary-item">
              <span class="print-summary-label">Contribuições via PIX / Surpresa:</span>
              <strong class="print-summary-val">${totalPix}</strong>
            </div>
            <div class="print-summary-item">
              <span class="print-summary-label">Apenas Confirmação de Presença:</span>
              <strong class="print-summary-val">${totalApenasPresenca}</strong>
            </div>
          </div>
          <div class="print-footer-note">
            Este documento foi emitido a partir do Painel Administrativo do Chá de Cozinha.
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Renderiza a sobreposição modal para confirmação de liberação/estorno de presente.
   * 
   * @param {object} params
   * @param {string} params.nomeConvidado
   * @param {string} params.nomePresente
   * @returns {string} HTML
   */
  static templateModalLiberacao({ nomeConvidado, nomePresente }) {
    return `
      <div id="modal-liberacao-backdrop" class="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-liberar-title">
        <div class="admin-modal-card">
          <div class="admin-modal-icon-wrap warning">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <span class="modal-kicker">CONFIRMAÇÃO DE ESTORNO</span>
          <h3 id="modal-liberar-title" class="admin-modal-title">Liberar Presente Escolhido?</h3>
          <p class="admin-modal-text">
            Você está prestes a liberar o item <strong>"${escaparHtml(nomePresente)}"</strong> escolhido por <strong>"${escaparHtml(nomeConvidado)}"</strong>.
          </p>
          <div class="admin-modal-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>A presença do convidado será mantida, e <strong>+1 unidade</strong> do presente voltará imediatamente à lista disponível no convite.</span>
          </div>
          <div class="admin-modal-actions">
            <button type="button" id="btn-cancelar-liberacao" class="btn-secondary">Cancelar</button>
            <button type="button" id="btn-confirmar-liberacao" class="btn-primary btn-confirm-action">
              <span>Sim, Liberar Presente</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
