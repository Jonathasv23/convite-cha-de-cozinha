/**
 * Controlador da Camada Administrativa: AdminController
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsabilidades (FSD Seções 6.2, 8.2, 9.1, 13.6, 13.7, 13.9, 13.10, 14.1, 15):
 * 1. Controle de acesso por PIN Mestre com proteção contra força bruta (5 tentativas / 5 minutos de bloqueio).
 * 2. Gestão de sessão administrativa em sessionStorage (volátil, expira ao fechar a aba).
 * 3. Autenticação administrativa silenciosa no Firebase Auth (quando ativo).
 * 4. Carregamento e consolidação de contadores em tempo real (RN-08).
 * 5. Alteração dinâmica do prazo limite de RSVP, chave PIX e mensagem de boas-vindas.
 * 6. Cadastro rápido de novos presentes no inventário.
 * 7. Liberação/estorno atômico de presentes com devolução ao estoque (RN-07).
 * 8. Encerramento de sessão (Logout) seguro.
 */

import { config } from '../../config/config.js';
import {
  isFirebaseConfigured,
  auth,
  signInWithEmailAndPassword,
  signOut
} from '../utils/firebase.js';
import { ConfiguracaoModel } from '../models/ConfiguracaoModel.js';
import { PresenteModel } from '../models/PresenteModel.js';
import { ConfirmacaoModel } from '../models/ConfirmacaoModel.js';
import { PainelNoivaView } from '../views/PainelNoivaView.js';
import { ToastView } from '../views/ToastView.js';
import { logError, logSecurity } from '../utils/logger.js';
import { exportarConfirmacoesParaCsv } from '../utils/export.js';

const STORAGE_AUTH_KEY = '_admin_auth_session';
const STORAGE_LOCKOUT_KEY = '_admin_pin_lockout';
const STORAGE_TENTATIVAS_KEY = '_admin_pin_tentativas';

export class AdminController {
  constructor() {
    this._timerBloqueio = null;
    this._modalAtivo = null;
    this._dadosAtuais = {
      configuracoes: null,
      metricas: null,
      confirmacoes: []
    };
  }

  /**
   * Ponto de entrada do controlador administrativo.
   */
  async inicializar() {
    try {
      this._configurarElementosBase();

      // Verifica se há bloqueio temporário ativo por força bruta
      const statusBloqueio = this.verificarBloqueio();
      if (statusBloqueio.estaBloqueado) {
        this._exibirGateBloqueado(statusBloqueio.segundosRestantes);
        return;
      }

      // Verifica se já possui sessão ativa em sessionStorage
      if (this.estaAutenticado()) {
        await this._liberarAcessoPainel();
      } else {
        this._exibirGatePin();
      }
    } catch (err) {
      logError('AdminController.inicializar', err);
      ToastView.exibirErro('Ocorreu um erro ao carregar o painel administrativo.');
    }
  }

  /**
   * Configura os elementos raiz da página admin.html.
   * @private
   */
  _configurarElementosBase() {
    if (typeof document === 'undefined') return;

    this.gateOverlay = document.getElementById('pin-gate-overlay');
    this.adminApp = document.getElementById('admin-app');
    this.toastContainer = document.getElementById('admin-toast-container');

    if (this.toastContainer) {
      ToastView.inicializar(this.toastContainer);
    }
  }

  /**
   * Verifica se o usuário atual possui sessão administrativa gravada em sessionStorage.
   * @returns {boolean}
   */
  estaAutenticado() {
    if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
      return false;
    }
    try {
      const raw = window.sessionStorage.getItem(STORAGE_AUTH_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed && parsed.autenticado);
    } catch (e) {
      return false;
    }
  }

  /**
   * Verifica se o acesso está bloqueado por tentativas consecutivas inválidas (força bruta).
   * @returns {{ estaBloqueado: boolean, segundosRestantes: number }}
   */
  verificarBloqueio() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return { estaBloqueado: false, segundosRestantes: 0 };
    }
    try {
      const rawLockout = window.localStorage.getItem(STORAGE_LOCKOUT_KEY);
      if (!rawLockout) return { estaBloqueado: false, segundosRestantes: 0 };

      const timestampFim = parseInt(rawLockout, 10);
      const agora = Date.now();

      if (agora < timestampFim) {
        const segundosRestantes = Math.ceil((timestampFim - agora) / 1000);
        return { estaBloqueado: true, segundosRestantes };
      }

      // O tempo de bloqueio expirou: limpa os registros
      window.localStorage.removeItem(STORAGE_LOCKOUT_KEY);
      window.localStorage.removeItem(STORAGE_TENTATIVAS_KEY);
      return { estaBloqueado: false, segundosRestantes: 0 };
    } catch (e) {
      return { estaBloqueado: false, segundosRestantes: 0 };
    }
  }

  /**
   * Retorna o total de tentativas restantes antes do bloqueio temporário.
   * @returns {number}
   */
  obterTentativasRestantes() {
    const maxTentativas = config.admin?.maxTentativasPin || 5;
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return maxTentativas;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_TENTATIVAS_KEY);
      const tentativas = raw ? parseInt(raw, 10) : 0;
      return Math.max(0, maxTentativas - tentativas);
    } catch (e) {
      return maxTentativas;
    }
  }

  /**
   * Registra uma tentativa incorreta de PIN e ativa bloqueio se atingir o teto.
   * @private
   */
  _registrarTentativaInvalida() {
    const maxTentativas = config.admin?.maxTentativasPin || 5;
    const minutosBloqueio = config.admin?.bloqueioMinutos || 5;

    let tentativas = 0;
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_TENTATIVAS_KEY);
      tentativas = raw ? parseInt(raw, 10) : 0;
    }

    tentativas += 1;
    logSecurity('TENTATIVA_PIN_INVALIDO', { tentativa: tentativas, maxTentativas });

    if (tentativas >= maxTentativas) {
      const fimBloqueio = Date.now() + (minutosBloqueio * 60 * 1000);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_LOCKOUT_KEY, String(fimBloqueio));
        window.localStorage.setItem(STORAGE_TENTATIVAS_KEY, String(tentativas));
      }
      logSecurity('FORCA_BRUTA_BLOQUEIO', { minutosBloqueio, fimBloqueio });
      this._exibirGateBloqueado(minutosBloqueio * 60);
      ToastView.exibirErro(`Acesso bloqueado por ${minutosBloqueio} minutos após sucessivas tentativas incorretas.`);
    } else {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_TENTATIVAS_KEY, String(tentativas));
      }
      this._exibirGatePin();
      ToastView.exibirAviso('PIN incorreto. Por favor, verifique e tente novamente.');
    }
  }

  /**
   * Limpa contadores de tentativas e bloqueios após autenticação bem-sucedida.
   * @private
   */
  _limparHistoricoTentativas() {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_LOCKOUT_KEY);
      window.localStorage.removeItem(STORAGE_TENTATIVAS_KEY);
    }
    if (this._timerBloqueio) {
      clearInterval(this._timerBloqueio);
      this._timerBloqueio = null;
    }
  }

  /**
   * Exibe o Gate de PIN Mestre na interface.
   * @private
   */
  _exibirGatePin() {
    if (!this.gateOverlay) return;

    const tentativasRestantes = this.obterTentativasRestantes();
    this.gateOverlay.style.display = 'flex';
    if (this.adminApp) this.adminApp.style.display = 'none';

    this.gateOverlay.innerHTML = PainelNoivaView.templateGatePin({
      tentativasRestantes,
      estaBloqueado: false
    });

    const form = document.getElementById('form-pin-gate');
    const input = document.getElementById('pin-input');
    const btn = document.getElementById('btn-entrar-pin');

    const acaoEntrar = (e) => {
      if (e) e.preventDefault();
      const val = input ? input.value : '';
      this.validarPin(val);
    };

    if (form) {
      form.onsubmit = acaoEntrar;
    }
    if (btn) {
      btn.onclick = acaoEntrar;
    }
    if (input) {
      input.focus();
    }
  }

  /**
   * Exibe o aviso de bloqueio temporário com contagem regressiva em segundos.
   * @private
   * @param {number} segundosRestantes
   */
  _exibirGateBloqueado(segundosRestantes) {
    if (!this.gateOverlay) return;

    this.gateOverlay.style.display = 'flex';
    if (this.adminApp) this.adminApp.style.display = 'none';

    this.gateOverlay.innerHTML = PainelNoivaView.templateGatePin({
      estaBloqueado: true,
      segundosRestantesBloqueio: segundosRestantes
    });

    if (this._timerBloqueio) clearInterval(this._timerBloqueio);

    let tempo = segundosRestantes;
    this._timerBloqueio = setInterval(() => {
      tempo -= 1;
      const elTimer = document.getElementById('pin-lockout-timer');
      if (elTimer) {
        const min = Math.floor(tempo / 60);
        const seg = tempo % 60;
        elTimer.textContent = `${min}:${String(seg).padStart(2, '0')}`;
      }

      if (tempo <= 0) {
        clearInterval(this._timerBloqueio);
        this._timerBloqueio = null;
        this._limparHistoricoTentativas();
        this._exibirGatePin();
        ToastView.exibirInfo('Bloqueio encerrado. Você já pode tentar inserir o PIN novamente.');
      }
    }, 1000);
  }

  /**
   * Valida o PIN inserido pelo usuário.
   * @param {string} pinDigitado
   * @returns {Promise<boolean>}
   */
  async validarPin(pinDigitado) {
    const status = this.verificarBloqueio();
    if (status.estaBloqueado) {
      ToastView.exibirErro('Acesso bloqueado temporariamente por segurança.');
      return false;
    }

    if (!pinDigitado || typeof pinDigitado !== 'string') {
      ToastView.exibirAviso('Por favor, informe o PIN Mestre.');
      return false;
    }

    const pinLimpo = pinDigitado.trim();
    const pinCorreto = String(config.admin?.pinMestrePadrao || '0523');

    if (pinLimpo !== pinCorreto) {
      this._registrarTentativaInvalida();
      return false;
    }

    // PIN VÁLIDO: Limpa histórico de erros
    this._limparHistoricoTentativas();

    // 1. Grava sessão volátil em sessionStorage (FSD 15.2)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify({
        autenticado: true,
        loginEm: new Date().toISOString()
      }));
    }

    // 2. Autenticação administrativa silenciosa no Firebase Auth (se ativo)
    if (isFirebaseConfigured() && auth && signInWithEmailAndPassword) {
      try {
        const emailAdmin = config.adminAuth?.email || 'admin@convitedigital.local';
        // O Firebase Auth exige senhas com no mínimo 6 caracteres.
        // Utiliza config.adminAuth.password se definida, ou o PIN (com sufixo seguro caso tenha menos de 6 caracteres).
        const senhaFirebase = config.adminAuth?.password || (pinLimpo.length >= 6 ? pinLimpo : `${pinLimpo}_admin_auth`);
        await signInWithEmailAndPassword(auth, emailAdmin, senhaFirebase);
      } catch (authErr) {
        // Log seguro: não expõe senha, apenas registra evento
        logError('AdminController.validarPin (Silent Auth Firebase)', authErr);
      }
    }

    ToastView.exibirSucesso('Acesso autorizado! Bem-vinda ao seu painel.');
    await this._liberarAcessoPainel();
    return true;
  }

  /**
   * Libera o acesso visual ao painel administrativo e carrega os dados em tempo real.
   * @private
   */
  async _liberarAcessoPainel() {
    if (this.gateOverlay) {
      this.gateOverlay.style.display = 'none';
    }
    if (this.adminApp) {
      this.adminApp.style.display = 'block';
    }

    await this.carregarPainel();
  }

  /**
   * Carrega e renderiza todos os componentes do painel administrativo.
   */
  async carregarPainel() {
    if (typeof document === 'undefined') return;

    try {
      // 1. Leitura em paralelo dos dados operacionais
      const [configuracoes, metricas, confirmacoes] = await Promise.all([
        ConfiguracaoModel.obterConfiguracoes(),
        ConfirmacaoModel.obterMetricas(),
        ConfirmacaoModel.listarConfirmacoes()
      ]);

      this._dadosAtuais = { configuracoes, metricas, confirmacoes };

      // 2. Renderização das seções
      this._renderizarTopo(configuracoes.evento?.noivos || config.evento.noivos);
      this._renderizarMetricas(metricas);
      this._renderizarConfiguracoes(configuracoes);
      this._renderizarNovoPresente();
      this._renderizarTabelaConvidados(confirmacoes);

      // 3. Vinculação de eventos nos botões e formulários
      this._vincularEventosPainel();
    } catch (err) {
      logError('AdminController.carregarPainel', err);
      ToastView.exibirErro('Falha ao sincronizar dados do painel. Verifique a conexão.');
    }
  }

  /**
   * Renderiza a barra superior.
   * @private
   */
  _renderizarTopo(noivos) {
    const elHeader = document.querySelector('.admin-header');
    if (elHeader) {
      elHeader.innerHTML = PainelNoivaView.templateHeader({ noivos });
    }
  }

  /**
   * Renderiza os cartões de métricas.
   * @private
   */
  _renderizarMetricas(metricas) {
    const elMetrics = document.getElementById('dashboard-metrics');
    if (elMetrics) {
      elMetrics.innerHTML = PainelNoivaView.templateDashboard(metricas);
    }
  }

  /**
   * Renderiza a seção de configurações do evento.
   * @private
   */
  _renderizarConfiguracoes(configuracoes) {
    let elSecao = document.getElementById('secao-configuracoes-wrap');
    if (!elSecao) {
      elSecao = document.createElement('div');
      elSecao.id = 'secao-configuracoes-wrap';
      const elMain = document.querySelector('.admin-main');
      if (elMain) {
        const elTabela = document.getElementById('guest-table-container');
        elMain.insertBefore(elSecao, elTabela);
      }
    }
    if (elSecao) {
      elSecao.innerHTML = PainelNoivaView.templateConfiguracoes(configuracoes);
    }
  }

  /**
   * Renderiza o formulário de cadastro de novos presentes.
   * @private
   */
  _renderizarNovoPresente() {
    let elSecao = document.getElementById('secao-novo-presente-wrap');
    if (!elSecao) {
      elSecao = document.createElement('div');
      elSecao.id = 'secao-novo-presente-wrap';
      const elMain = document.querySelector('.admin-main');
      if (elMain) {
        const elTabela = document.getElementById('guest-table-container');
        elMain.insertBefore(elSecao, elTabela);
      }
    }
    if (elSecao) {
      elSecao.innerHTML = PainelNoivaView.templateNovoPresente();
    }
  }

  /**
   * Renderiza a tabela de convidados confirmados.
   * @private
   */
  _renderizarTabelaConvidados(confirmacoes) {
    const elTabela = document.getElementById('guest-table-container');
    if (elTabela) {
      const noivos = config.evento?.nomesNoivos || 'Hevelyn & Jonathas';
      elTabela.innerHTML = PainelNoivaView.templateTabelaConvidados(confirmacoes, { noivos });
    }
  }

  /**
   * Vincula ouvintes de eventos da interface administrativa.
   * @private
   */
  _vincularEventosPainel() {
    if (typeof document === 'undefined') return;

    // 1. Botão de Logout / Bloquear
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.onclick = () => this.logout();
    }

    // 2. Botão de Atualizar Dados
    const btnAtualizar = document.getElementById('btn-atualizar-dados');
    if (btnAtualizar) {
      btnAtualizar.onclick = async () => {
        ToastView.exibirInfo('Atualizando dados em tempo real...');
        await this.carregarPainel();
        ToastView.exibirSucesso('Painel atualizado!');
      };
    }

    // 3. Formulário de Configurações
    const formConfig = document.getElementById('form-configuracoes');
    if (formConfig) {
      formConfig.onsubmit = (e) => {
        e.preventDefault();
        this.salvarConfiguracoes();
      };
    }

    // 4. Formulário de Novo Presente
    const formNovoPresente = document.getElementById('form-novo-presente');
    if (formNovoPresente) {
      formNovoPresente.onsubmit = (e) => {
        e.preventDefault();
        this.cadastrarPresente();
      };
    }

    // 5. Botões de Liberação de Presente na Tabela (delegação ou direto)
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

    // 6. Botão de Exportação CSV / Planilha Excel (FSD 6.2.6, 22.2)
    const btnExportarCsv = document.getElementById('btn-exportar-csv');
    if (btnExportarCsv) {
      btnExportarCsv.onclick = () => this.exportarCsv();
    }

    // 7. Botão de Impressão / PDF
    const btnImprimir = document.getElementById('btn-imprimir-relatorio');
    if (btnImprimir) {
      btnImprimir.onclick = () => {
        if (typeof window !== 'undefined' && window.print) {
          window.print();
        }
      };
    }
  }

  /**
   * Exporta a relação de confirmações em planilha CSV com formatação UTF-8 BOM e delimitador ponto e vírgula (FSD 22.2).
   */
  exportarCsv() {
    try {
      const confirmacoes = this._dadosAtuais.confirmacoes || [];
      if (confirmacoes.length === 0) {
        ToastView.exibirAviso('Ainda não há convidados confirmados para exportar.');
        return;
      }

      const resultado = exportarConfirmacoesParaCsv(confirmacoes);
      ToastView.exibirSucesso(`Planilha CSV "${resultado.nomeArquivo}" gerada com sucesso!`);
    } catch (err) {
      logError('AdminController.exportarCsv', err);
      ToastView.exibirErro('Não foi possível gerar a planilha CSV. Tente novamente.');
    }
  }

  /**
   * Salva as configurações dinâmicas atualizadas pela noiva.
   */
  async salvarConfiguracoes() {
    if (typeof document === 'undefined') return;

    const inputData = document.getElementById('cfg-data-limite');
    const inputPix = document.getElementById('cfg-chave-pix');
    const inputMsg = document.getElementById('cfg-mensagem-boas-vindas');

    if (!inputData || !inputPix || !inputMsg) return;

    try {
      const dataVal = inputData.value;
      const pixVal = inputPix.value.trim();
      const msgVal = inputMsg.value.trim();

      if (!pixVal) {
        ToastView.exibirAviso('Por favor, informe a chave PIX.');
        inputPix.focus();
        return;
      }

      if (!msgVal || msgVal.length < 5) {
        ToastView.exibirAviso('A mensagem de acolhimento deve ter pelo menos 5 caracteres.');
        inputMsg.focus();
        return;
      }

      const atualizado = await ConfiguracaoModel.salvarConfiguracoes({
        dataLimiteConfirmacao: dataVal,
        chavePix: pixVal,
        mensagemBoasVindas: msgVal
      });

      this._dadosAtuais.configuracoes = atualizado;
      this._renderizarConfiguracoes(atualizado);
      this._vincularEventosPainel();

      ToastView.exibirSucesso('Configurações salvas com sucesso!');
    } catch (err) {
      logError('AdminController.salvarConfiguracoes', err);
      ToastView.exibirErro(err.message || 'Falha ao salvar configurações.');
    }
  }

  /**
   * Cadastra um novo presente no catálogo do evento.
   */
  async cadastrarPresente() {
    if (typeof document === 'undefined') return;

    const inputNome = document.getElementById('novo-presente-nome');
    const inputQtd = document.getElementById('novo-presente-qtd');

    if (!inputNome || !inputQtd) return;

    try {
      const nome = inputNome.value.trim();
      const quantidadeTotal = parseInt(inputQtd.value, 10);

      if (!nome || nome.length < 3 || nome.length > 80) {
        ToastView.exibirAviso('O nome do presente deve ter entre 3 e 80 caracteres.');
        inputNome.focus();
        return;
      }

      if (isNaN(quantidadeTotal) || quantidadeTotal < 1 || quantidadeTotal > 99) {
        ToastView.exibirAviso('A quantidade deve ser um número inteiro entre 1 e 99.');
        inputQtd.focus();
        return;
      }

      await PresenteModel.cadastrarPresente({ nome, quantidadeTotal });

      ToastView.exibirSucesso(`Presente "${nome}" adicionado com sucesso!`);
      inputNome.value = '';
      inputQtd.value = '1';

      // Atualiza métricas e dashboard
      const novasMetricas = await ConfirmacaoModel.obterMetricas();
      this._dadosAtuais.metricas = novasMetricas;
      this._renderizarMetricas(novasMetricas);
    } catch (err) {
      logError('AdminController.cadastrarPresente', err);
      ToastView.exibirErro(err.message || 'Erro ao cadastrar presente.');
    }
  }

  /**
   * Abre o modal de confirmação para liberação de um presente (RN-07).
   * 
   * @param {object} params
   * @param {string} params.confId
   * @param {string} params.presId
   * @param {string} params.nomeConvidado
   * @param {string} params.nomePresente
   */
  abrirModalLiberacao({ confId, presId, nomeConvidado, nomePresente }) {
    if (typeof document === 'undefined') return;

    // Remove qualquer modal pré-existente
    this.fecharModalLiberacao();

    const containerModal = document.createElement('div');
    containerModal.id = 'modal-liberacao-container';
    containerModal.innerHTML = PainelNoivaView.templateModalLiberacao({
      nomeConvidado,
      nomePresente
    });

    document.body.appendChild(containerModal);
    this._modalAtivo = containerModal;

    const btnCancelar = document.getElementById('btn-cancelar-liberacao');
    const btnConfirmar = document.getElementById('btn-confirmar-liberacao');

    if (btnCancelar) {
      btnCancelar.onclick = () => this.fecharModalLiberacao();
    }

    if (btnConfirmar) {
      btnConfirmar.onclick = async () => {
        btnConfirmar.disabled = true;
        btnConfirmar.textContent = 'Liberando...';
        await this.executarLiberacaoPresente(confId, presId, nomePresente);
      };
    }
  }

  /**
   * Fecha o modal de confirmação de liberação.
   */
  fecharModalLiberacao() {
    if (this._modalAtivo && this._modalAtivo.parentNode) {
      this._modalAtivo.parentNode.removeChild(this._modalAtivo);
      this._modalAtivo = null;
    }
  }

  /**
   * Executa a devolução do item ao estoque e converte a confirmação para apenas presença (RN-07).
   * 
   * @param {string} confId
   * @param {string} presId
   * @param {string} nomePresente
   */
  async executarLiberacaoPresente(confId, presId, nomePresente) {
    try {
      await ConfirmacaoModel.liberarPresente(confId, presId);
      this.fecharModalLiberacao();

      ToastView.exibirSucesso(`Presente "${nomePresente}" liberado com sucesso! Unidade devolvida à lista pública.`);

      // Recarrega dados atualizados
      const [metricas, confirmacoes] = await Promise.all([
        ConfirmacaoModel.obterMetricas(),
        ConfirmacaoModel.listarConfirmacoes()
      ]);

      this._dadosAtuais.metricas = metricas;
      this._dadosAtuais.confirmacoes = confirmacoes;

      this._renderizarMetricas(metricas);
      this._renderizarTabelaConvidados(confirmacoes);
      this._vincularEventosPainel();
    } catch (err) {
      logError('AdminController.executarLiberacaoPresente', err, { confId, presId });
      ToastView.exibirErro('Não foi possível liberar o presente. Tente novamente.');
      this.fecharModalLiberacao();
    }
  }

  /**
   * Encerra a sessão administrativa atual (Logout).
   */
  async logout() {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(STORAGE_AUTH_KEY);
      }

      if (isFirebaseConfigured() && auth && signOut) {
        await signOut(auth);
      }

      ToastView.exibirInfo('Sessão administrativa encerrada.');
      this._exibirGatePin();
    } catch (err) {
      logError('AdminController.logout', err);
      this._exibirGatePin();
    }
  }
}

// Inicialização automática no navegador
if (typeof window !== 'undefined') {
  const iniciar = () => {
    if (window.__adminControllerInstancia) return;
    const controller = new AdminController();
    window.__adminControllerInstancia = controller;
    window.__adminIniciado = true;
    controller.inicializar();
    window._adminController = controller;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
}
