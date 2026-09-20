/**
 * Controlador da Aplicação: ConviteController
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsabilidades (FSD Seções 6.1, 12.1, 13.1-13.5):
 * 1. Inicialização e orquestração do convite público (index.html).
 * 2. Carregamento e sincronização com os Models (ConfiguracaoModel, PresenteModel, ConfirmacaoModel).
 * 3. Gestão do ciclo de vida da contagem regressiva viva.
 * 4. Validação amigável de homônimos em tempo real (RN-05).
 * 5. Tratamento de submissão de RSVP com atomicidade e tratamento gracioso de concorrência (RN-01 a RN-06).
 */

import { ConfiguracaoModel } from '../models/ConfiguracaoModel.js';
import { PresenteModel } from '../models/PresenteModel.js';
import { ConfirmacaoModel } from '../models/ConfirmacaoModel.js';
import { ConviteView } from '../views/ConviteView.js';
import { FormularioRSVPView } from '../views/FormularioRSVPView.js';
import { ToastView } from '../views/ToastView.js';
import { formatarDataHoraBR, formatarDataExtenso } from '../utils/calendar.js';
import { logError } from '../utils/logger.js';

export class ConviteController {
  constructor() {
    this.configuracoes = null;
    this.presentesDisponiveis = [];
    this.timerCountdown = null;
    this.debounceHomonimoTimer = null;
  }

  /**
   * Inicializa o controlador da página pública do convite.
   */
  async iniciar() {
    try {
      // 1. Carrega dados de configuração e presentes
      this.configuracoes = await ConfiguracaoModel.obterConfiguracoes();
      this.presentesDisponiveis = await PresenteModel.listarDisponiveis();

      // 2. Renderiza componentes visuais principais
      this._renderizarInterface();

      // 3. Inicia contagem regressiva viva
      this._iniciarContagemRegressiva();

      // 4. Vincula eventos do formulário de confirmação
      this._vincularEventosFormulario();

    } catch (err) {
      logError('ConviteController.iniciar', err);
      ToastView.erro('Não foi possível carregar todas as informações do convite. Por favor, recarregue a página.');
    }
  }

  /**
   * Renderiza os blocos da página pública nos containers do DOM.
   */
  _renderizarInterface() {
    const heroContainer = document.getElementById('hero-section');
    const countdownContainer = document.getElementById('countdown-section-wrapper');
    const paletteContainer = document.getElementById('palette-section-wrapper');
    const rsvpContainer = document.getElementById('rsvp-section');

    // 1. Hero Card
    if (heroContainer) {
      ConviteView.renderizarHero(heroContainer, {
        evento: this.configuracoes.evento,
        mensagemBoasVindas: this.configuracoes.mensagemBoasVindas
      });
    }

    // 2. Formulário de RSVP
    if (rsvpContainer) {
      const dataFormatada = this.configuracoes.dataLimiteConfirmacao
        ? formatarDataExtenso(this.configuracoes.dataLimiteConfirmacao)
        : '';

      FormularioRSVPView.renderizar(rsvpContainer, {
        estaExpirado: this.configuracoes.estaExpirado,
        dataLimiteFormatada: dataFormatada,
        presentes: this.presentesDisponiveis
      });
    }

    // 3. Vitrine da Paleta de Cores (posicionada após a confirmação de presença)
    if (paletteContainer) {
      ConviteView.renderizarPaletaCores(paletteContainer, this.configuracoes.paletaCores);
    }
  }

  /**
   * Inicia o temporizador contínuo para atualização do countdown a cada segundo.
   */
  _iniciarContagemRegressiva() {
    if (this.timerCountdown) {
      clearInterval(this.timerCountdown);
      this.timerCountdown = null;
    }

    if (typeof document === 'undefined') return;
    const elDias = document.getElementById('countdown-dias');
    if (!elDias) return; // Se o bloco de contagem foi removido, não inicia o loop

    const dataEvento = this.configuracoes.evento?.dataHoraISO || '2026-10-24T16:00:00';

    // Executa imediatamente na inicialização
    ConviteView.atualizarContagem(dataEvento);

    // Loop contínuo a cada segundo
    this.timerCountdown = setInterval(() => {
      const status = ConviteView.atualizarContagem(dataEvento);
      if (status.encerrado) {
        clearInterval(this.timerCountdown);
        this.timerCountdown = null;
      }
    }, 1000);
  }

  /**
   * Vincula os ouvintes de eventos interativos do formulário de RSVP.
   */
  _vincularEventosFormulario() {
    if (this.configuracoes.estaExpirado) {
      return; // Se expirado, não há formulário interativo a ser vinculado
    }

    const inputNome = document.getElementById('input-nome-convidado');
    const checkApenasPresenca = document.getElementById('check-apenas-presenca');
    const formRsvp = document.getElementById('form-rsvp');

    // 1. Verificação Amigável de Homônimo com Debounce e Blur (RN-05)
    if (inputNome) {
      const checarHomonimo = async () => {
        const nome = inputNome.value.trim();
        if (nome.length >= 3) {
          const resultado = await ConfirmacaoModel.verificarHomonimo(nome);
          FormularioRSVPView.exibirAlertaHomonimo(resultado.existe);
        } else {
          FormularioRSVPView.exibirAlertaHomonimo(false);
        }
      };

      inputNome.addEventListener('input', () => {
        if (this.debounceHomonimoTimer) clearTimeout(this.debounceHomonimoTimer);
        this.debounceHomonimoTimer = setTimeout(checarHomonimo, 400);
      });

      inputNome.addEventListener('blur', checarHomonimo);
    }

    // 2. Alternância do modo "Apenas Confirmar Presença" (RN-03)
    if (checkApenasPresenca) {
      checkApenasPresenca.addEventListener('change', (e) => {
        FormularioRSVPView.alternarModoApenasPresenca(e.target.checked);
      });
    }

    // 3. Submissão do Formulário de RSVP
    if (formRsvp) {
      formRsvp.addEventListener('submit', (e) => this._tratarSubmissaoRsvp(e));
    }
  }

  /**
   * Processa o envio da confirmação de presença.
   * @param {Event} e
   */
  async _tratarSubmissaoRsvp(e) {
    e.preventDefault();

    const inputNome = document.getElementById('input-nome-convidado');
    const checkApenasPresenca = document.getElementById('check-apenas-presenca');
    const selectPresente = document.getElementById('select-presente');

    const nomeConvidado = inputNome ? inputNome.value.trim() : '';
    const apenasPresenca = checkApenasPresenca ? checkApenasPresenca.checked : false;
    const valorPresente = selectPresente ? selectPresente.value : '';

    // Validação 1: Nome do Convidado
    if (!nomeConvidado || nomeConvidado.length < 2) {
      ToastView.aviso('Por favor, informe seu nome completo com pelo menos 2 caracteres.');
      if (inputNome) inputNome.focus();
      return;
    }

    // Validação 2: Seleção de opção
    if (!apenasPresenca && !valorPresente) {
      ToastView.aviso('Por favor, escolha um presente da lista, opte por PIX ou marque a opção de apenas confirmar presença.');
      if (selectPresente) selectPresente.focus();
      return;
    }

    // Definição da Modalidade
    let tipoEscolha = 'presente_item';
    let presenteId = null;
    let nomePresenteSnapshot = null;

    if (apenasPresenca) {
      tipoEscolha = 'apenas_presenca';
    } else if (valorPresente === 'pix_surpresa') {
      tipoEscolha = 'pix_surpresa';
    } else {
      tipoEscolha = 'presente_item';
      presenteId = valorPresente;
      const optionSel = selectPresente.options[selectPresente.selectedIndex];
      nomePresenteSnapshot = optionSel ? optionSel.getAttribute('data-nome') || optionSel.text.split(' •')[0] : null;
    }

    // Bloqueia botão e exibe estado de carregamento
    FormularioRSVPView.setEstadoEnviando(true);

    try {
      const resultado = await ConfirmacaoModel.confirmarPresenca({
        nomeConvidado,
        tipoEscolha,
        presenteId,
        nomePresenteSnapshot
      });

      // Sucesso! Renderiza tela de congratulações
      const rsvpContainer = document.getElementById('rsvp-section');
      FormularioRSVPView.renderizarSucesso(rsvpContainer, {
        nomeConvidado,
        tipoEscolha,
        nomePresente: resultado.nomePresente || nomePresenteSnapshot,
        chavePix: this.configuracoes.chavePix,
        onNovaConfirmacao: async () => {
          // Atualiza lista de presentes e recria formulário limpo
          this.presentesDisponiveis = await PresenteModel.listarDisponiveis();
          const dataFormatada = this.configuracoes.dataLimiteConfirmacao
            ? formatarDataExtenso(this.configuracoes.dataLimiteConfirmacao)
            : '';

          FormularioRSVPView.renderizar(rsvpContainer, {
            estaExpirado: this.configuracoes.estaExpirado,
            dataLimiteFormatada: dataFormatada,
            presentes: this.presentesDisponiveis
          });
          this._vincularEventosFormulario();
        }
      });

      ToastView.sucesso('Presença confirmada com sucesso!');

    } catch (err) {
      logError('ConviteController._tratarSubmissaoRsvp', err);

      // Tratamento específico de concorrência: item acabou de esgotar
      if (err.code === 'ESGOTADO' || err.message === 'ESGOTADO') {
        ToastView.aviso('Puxa, este presente acabou de ser escolhido por outro convidado! Atualizamos a lista para você escolher outro item ou optar por PIX.');
        // Recarrega presentes disponíveis e atualiza o select mantendo o nome digitado
        this.presentesDisponiveis = await PresenteModel.listarDisponiveis();
        FormularioRSVPView.atualizarDropdownPresentes(this.presentesDisponiveis);
        FormularioRSVPView.setEstadoEnviando(false);
        return;
      }

      ToastView.erro(err.message || 'Tivemos uma pequena instabilidade. Por favor, tente novamente em instantes.');
      FormularioRSVPView.setEstadoEnviando(false);
    }
  }

  /**
   * Finaliza timers e listeners ao desmontar o controlador.
   */
  destruir() {
    if (this.timerCountdown) {
      clearInterval(this.timerCountdown);
      this.timerCountdown = null;
    }
    if (this.debounceHomonimoTimer) {
      clearTimeout(this.debounceHomonimoTimer);
      this.debounceHomonimoTimer = null;
    }
  }
}

// Inicialização automática ao carregar a página index.html no navegador
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const inicializar = () => {
    const controller = new ConviteController();
    controller.iniciar();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }
}
