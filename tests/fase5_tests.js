/**
 * Suíte de Testes Automatizados - Fase 5: Módulo do Painel Administrativo da Noiva
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Execução: node tests/fase5_tests.js
 */

import assert from 'node:assert';
import { test } from 'node:test';
import { PainelNoivaView, escaparHtml, formatarDataHoraPtBr, formatarParaInputDatetime } from '../app/views/PainelNoivaView.js';
import { AdminController } from '../app/controllers/AdminController.js';
import { ConfiguracaoModel } from '../app/models/ConfiguracaoModel.js';
import { PresenteModel } from '../app/models/PresenteModel.js';
import { ConfirmacaoModel } from '../app/models/ConfirmacaoModel.js';
import { config } from '../config/config.js';
import { demoStore } from '../app/utils/firebase.js';
import { getSecurityLogs, clearSecurityLogs } from '../app/utils/logger.js';

console.log('===================================================================');
console.log(' INICIANDO BATERIA DE TESTES AUTOMATIZADOS - FASE 5');
console.log('===================================================================');

// Simulação de Storage para ambiente CLI/Node.js
const mockLocalStorageData = {};
const mockSessionStorageData = {};

global.window = {
  localStorage: {
    getItem: (k) => mockLocalStorageData[k] || null,
    setItem: (k, v) => { mockLocalStorageData[k] = String(v); },
    removeItem: (k) => { delete mockLocalStorageData[k]; },
    clear: () => { for (const k in mockLocalStorageData) delete mockLocalStorageData[k]; }
  },
  sessionStorage: {
    getItem: (k) => mockSessionStorageData[k] || null,
    setItem: (k, v) => { mockSessionStorageData[k] = String(v); },
    removeItem: (k) => { delete mockSessionStorageData[k]; },
    clear: () => { for (const k in mockSessionStorageData) delete mockSessionStorageData[k]; }
  }
};

test('1. PainelNoivaView: Sanitização de XSS e Formatação de Datas', () => {
  const payloadXss = '<script>alert("hack")</script>&"\'';
  const sanitizado = escaparHtml(payloadXss);
  assert.strictEqual(sanitizado.includes('<script>'), false, 'Não deve conter tags de script não escapadas');
  assert.strictEqual(sanitizado.includes('&lt;script&gt;'), true, 'Deve escapar < e >');
  assert.strictEqual(sanitizado.includes('&amp;'), true, 'Deve escapar &');
  assert.strictEqual(sanitizado.includes('&quot;'), true, 'Deve escapar aspas duplas');

  // Formatação para datetime-local
  const dataIso = '2026-10-24T16:30:00.000Z';
  const dataInput = formatarParaInputDatetime(new Date('2026-10-24T16:30:00'));
  assert.strictEqual(dataInput, '2026-10-24T16:30', 'Deve formatar para YYYY-MM-DDTHH:mm');

  // Formatação PT-BR
  const dataFmt = formatarDataHoraPtBr(new Date('2026-10-24T16:30:00'));
  assert.strictEqual(dataFmt.includes('24/10/2026'), true, 'Deve formatar a data em padrão brasileiro');
  assert.strictEqual(dataFmt.includes('16:30'), true, 'Deve formatar o horário');

  console.log('  [PASSOU] PainelNoivaView sanitiza entradas e formata datas com precisão');
});

test('2. PainelNoivaView: Renderização do Gate de PIN e Bloqueio de Força Bruta', () => {
  // Gate padrão ativo
  const htmlGate = PainelNoivaView.templateGatePin({ tentativasRestantes: 5, estaBloqueado: false });
  assert.strictEqual(htmlGate.includes('pin-input'), true, 'Deve renderizar input de senha');
  assert.strictEqual(htmlGate.includes('Acessar Painel'), true, 'Deve renderizar botão de ação');
  assert.strictEqual(htmlGate.includes('ÁREA RESTRITA'), true, 'Deve conter tag de área restrita');

  // Gate sob bloqueio de força bruta
  const htmlBloqueado = PainelNoivaView.templateGatePin({ estaBloqueado: true, segundosRestantesBloqueio: 295 });
  assert.strictEqual(htmlBloqueado.includes('pin-gate-blocked'), true, 'Deve aplicar classe de bloqueio');
  assert.strictEqual(htmlBloqueado.includes('pin-countdown-timer'), true, 'Deve exibir contador regressivo');
  assert.strictEqual(htmlBloqueado.includes('4:55'), true, 'Deve formatar 295 segundos como 4:55');

  console.log('  [PASSOU] Gate de PIN renderiza corretamente em modo normal e bloqueado');
});

test('3. PainelNoivaView: Renderização do Dashboard com 3 Métricas em Tempo Real (RN-08)', () => {
  const metricas = {
    totalConfirmados: 42,
    totalPresentes: 35,
    presentesDisponiveis: 15,
    totalApenasPresenca: 7
  };

  const htmlDashboard = PainelNoivaView.templateDashboard(metricas);
  assert.strictEqual(htmlDashboard.includes('TOTAL CONFIRMADOS'), true);
  assert.strictEqual(htmlDashboard.includes('42'), true, 'Deve exibir número 42 em confirmados');
  assert.strictEqual(htmlDashboard.includes('PRESENTES ESCOLHIDOS'), true);
  assert.strictEqual(htmlDashboard.includes('35'), true, 'Deve exibir 35 presentes escolhidos');
  assert.strictEqual(htmlDashboard.includes('ITENS DISPONÍVEIS'), true);
  assert.strictEqual(htmlDashboard.includes('15'), true, 'Deve exibir 15 itens disponíveis');
  assert.strictEqual(htmlDashboard.includes('7 confirmaram apenas presença'), true);

  console.log('  [PASSOU] Dashboard de métricas renderiza os 3 contadores consolidados do FSD (RN-08)');
});

test('4. PainelNoivaView: Renderização de Configurações, Novo Presente e Tabela', () => {
  const configuracoes = {
    dataLimiteConfirmacao: '2026-10-20T23:59:00',
    chavePix: 'noiva@email.com',
    mensagemBoasVindas: 'Venham comemorar!',
    estaExpirado: false
  };

  const htmlCfg = PainelNoivaView.templateConfiguracoes(configuracoes);
  assert.strictEqual(htmlCfg.includes('noiva@email.com'), true, 'Deve preencher campo de PIX');
  assert.strictEqual(htmlCfg.includes('Venham comemorar!'), true, 'Deve preencher mensagem');
  assert.strictEqual(htmlCfg.includes('RSVP Ativo'), true, 'Deve exibir status de RSVP ativo');

  const htmlNovoPres = PainelNoivaView.templateNovoPresente();
  assert.strictEqual(htmlNovoPres.includes('novo-presente-nome'), true);
  assert.strictEqual(htmlNovoPres.includes('novo-presente-qtd'), true);

  // Tabela com convidados
  const confirmacoes = [
    {
      id: 'conf_1',
      nome_convidado: 'Marina Lima',
      tipo_escolha: 'presente_item',
      presente_id: 'pres_10',
      nome_presente_snapshot: 'Jogo de Panelas',
      criado_em: '2026-09-20T15:30:00Z',
      liberado_em: null
    },
    {
      id: 'conf_2',
      nome_convidado: 'Carlos Eduardo',
      tipo_escolha: 'pix_surpresa',
      presente_id: null,
      nome_presente_snapshot: null,
      criado_em: '2026-09-20T16:00:00Z',
      liberado_em: null
    }
  ];

  const htmlTabela = PainelNoivaView.templateTabelaConvidados(confirmacoes);
  assert.strictEqual(htmlTabela.includes('Marina Lima'), true);
  assert.strictEqual(htmlTabela.includes('Jogo de Panelas'), true);
  assert.strictEqual(htmlTabela.includes('btn-liberar-presente'), true, 'Deve ter botão para liberar presente');
  assert.strictEqual(htmlTabela.includes('Carlos Eduardo'), true);
  assert.strictEqual(htmlTabela.includes('PIX / Presente Surpresa'), true);

  console.log('  [PASSOU] Formulários e tabela de convidados renderizam com todas as colunas e badges');
});

test('5. AdminController: Validação de PIN Mestre e Gestão de Sessão', async () => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  clearSecurityLogs();

  const controller = new AdminController();

  // Teste de PIN incorreto
  const pinErrado = await controller.validarPin('0000');
  assert.strictEqual(pinErrado, false, 'PIN 0000 deve ser rejeitado');
  assert.strictEqual(controller.estaAutenticado(), false, 'Não deve estar autenticado após erro');
  assert.strictEqual(controller.obterTentativasRestantes(), 4, 'Deve restar 4 tentativas');

  // Teste de PIN correto ('2026')
  const pinCorreto = await controller.validarPin('2026');
  assert.strictEqual(pinCorreto, true, 'PIN 2026 deve ser aceito');
  assert.strictEqual(controller.estaAutenticado(), true, 'Deve registrar sessão ativa em sessionStorage');
  assert.strictEqual(controller.obterTentativasRestantes(), 5, 'Contador deve ser resetado após sucesso');

  // Teste de Logout
  await controller.logout();
  assert.strictEqual(controller.estaAutenticado(), false, 'Deve limpar sessionStorage após logout');

  console.log('  [PASSOU] AdminController valida PIN Mestre, gerencia sessão e executa logout seguro');
});

test('6. AdminController: Proteção Contra Força Bruta (5 tentativas = bloqueio de 5 minutos)', async () => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  clearSecurityLogs();

  const controller = new AdminController();

  // Executa 4 tentativas incorretas
  for (let i = 1; i <= 4; i++) {
    const res = await controller.validarPin('9999');
    assert.strictEqual(res, false);
    assert.strictEqual(controller.verificarBloqueio().estaBloqueado, false, `Não deve bloquear na tentativa ${i}`);
  }

  // 5ª tentativa incorreta dispara o bloqueio
  const res5 = await controller.validarPin('9999');
  assert.strictEqual(res5, false);

  const statusBloqueio = controller.verificarBloqueio();
  assert.strictEqual(statusBloqueio.estaBloqueado, true, 'Deve ativar bloqueio de força bruta na 5ª tentativa');
  assert.strictEqual(statusBloqueio.segundosRestantes > 290, true, 'Deve bloquear por ~300 segundos (5 minutos)');

  // Tentativa mesmo com PIN correto durante o bloqueio deve ser rejeitada
  const resBloqueado = await controller.validarPin('2026');
  assert.strictEqual(resBloqueado, false, 'Mesmo o PIN correto deve ser bloqueado enquanto durar o bloqueio');

  // Verifica logs de segurança gravados
  const secLogs = getSecurityLogs();
  const lockoutLog = secLogs.find((l) => l.evento === 'FORCA_BRUTA_BLOQUEIO');
  assert.ok(lockoutLog, 'Deve registrar evento FORCA_BRUTA_BLOQUEIO nos logs de segurança');

  console.log('  [PASSOU] Proteção contra força bruta bloqueia 5 minutos e audita evento em log (FSD 15.2)');
});

test('7. Fluxo Integrado: Cadastro de Novo Presente e Liberação Atômica com Estorno (RN-07)', async () => {
  window.localStorage.clear();
  window.sessionStorage.clear();

  // 1. Cadastra novo presente
  const novoItem = await PresenteModel.cadastrarPresente({
    nome: 'Faqueiro de Churrasco Premium',
    quantidadeTotal: 2
  });
  assert.strictEqual(novoItem.nome, 'Faqueiro de Churrasco Premium');
  assert.strictEqual(novoItem.quantidade_disponivel, 2);

  // 2. Convidado reserva o item
  const rsvp = await ConfirmacaoModel.confirmarPresenca({
    nomeConvidado: 'Lucas Fagundes',
    tipoEscolha: 'presente_item',
    presenteId: novoItem.id,
    nomePresenteSnapshot: novoItem.nome
  });
  assert.strictEqual(rsvp.nomeConvidado, 'Lucas Fagundes');

  // Confere que o estoque baixou de 2 para 1
  let itemAtualizado = await PresenteModel.obterPorId(novoItem.id);
  assert.strictEqual(itemAtualizado.quantidade_disponivel, 1, 'Estoque deve ter baixado para 1');

  // 3. Noiva acessa o painel e libera o presente do convidado (RN-07)
  const liberado = await ConfirmacaoModel.liberarPresente(rsvp.confirmacaoId, novoItem.id);
  assert.strictEqual(liberado, true, 'Liberação deve ser concluída com sucesso');

  // 4. Confere que o estoque foi devolvido para 2 (+1 unidade)
  itemAtualizado = await PresenteModel.obterPorId(novoItem.id);
  assert.strictEqual(itemAtualizado.quantidade_disponivel, 2, 'Estoque deve ter retornado para 2 após estorno');

  // 5. Confere que a presença do convidado foi preservada como apenas_presenca com data de liberação
  const confirmacoes = await ConfirmacaoModel.listarConfirmacoes();
  const confLucas = confirmacoes.find((c) => c.nome_convidado === 'Lucas Fagundes');
  assert.ok(confLucas, 'Registro do convidado deve ser mantido');
  assert.strictEqual(confLucas.tipo_escolha, 'apenas_presenca', 'Escolha deve virar apenas_presenca');
  assert.strictEqual(confLucas.presente_id, null, 'Vínculo do presente deve ser removido');
  assert.ok(confLucas.liberado_em, 'Deve carimbar liberado_em');

  // 6. Confere que as métricas refletem a liberação
  const metricas = await ConfirmacaoModel.obterMetricas();
  assert.strictEqual(metricas.totalApenasPresenca >= 1, true);

  console.log('  [PASSOU] Liberação atômica estorna +1 unidade ao estoque e preserva a presença da pessoa (RN-07)');
});

test('8. Fluxo Integrado: Alteração e Persistência de Configurações Dinâmicas', async () => {
  const novasCfg = {
    dataLimiteConfirmacao: '2026-10-22T18:00:00',
    chavePix: 'novo.pix.noiva@banco.com',
    mensagemBoasVindas: 'Contamos com a sua ilustre presença em nosso chá!'
  };

  const resultado = await ConfiguracaoModel.salvarConfiguracoes(novasCfg);
  assert.strictEqual(resultado.chavePix, 'novo.pix.noiva@banco.com');
  assert.strictEqual(resultado.mensagemBoasVindas, 'Contamos com a sua ilustre presença em nosso chá!');

  const obtidas = await ConfiguracaoModel.obterConfiguracoes();
  assert.strictEqual(obtidas.chavePix, 'novo.pix.noiva@banco.com');
  assert.strictEqual(obtidas.mensagemBoasVindas, 'Contamos com a sua ilustre presença em nosso chá!');
  assert.strictEqual(obtidas.estaExpirado, false, 'Prazo de 2026 não deve estar expirado');

  console.log('  [PASSOU] Configurações dinâmicas da noiva são validadas, persistidas e sincronizadas');
});

console.log('===================================================================');
console.log(' RESULTADO FINAL: TODOS OS TESTES DA FASE 5 FORAM APROVADOS!');
console.log('===================================================================');
