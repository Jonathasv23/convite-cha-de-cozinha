/**
 * Bateria de Testes Automatizados - Fase 3 (Camada de Modelos e Módulos Utilitários)
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 */

import assert from 'node:assert';
import { logError, logSecurity, getErrorLogs, getSecurityLogs, clearAllLogs } from '../app/utils/logger.js';
import {
  formatUtcCalendarString,
  createGoogleCalendarUrl,
  generateIcsContent,
  formatarDataBR,
  formatarDataHoraBR,
  formatarDataExtenso
} from '../app/utils/calendar.js';
import { ConfiguracaoModel } from '../app/models/ConfiguracaoModel.js';
import { PresenteModel } from '../app/models/PresenteModel.js';
import { ConfirmacaoModel, normalizarNome } from '../app/models/ConfirmacaoModel.js';

let totalTestes = 0;
let testesPassados = 0;

async function test(descricao, fn) {
  totalTestes++;
  try {
    await fn();
    console.log(`  [PASSOU] ${descricao}`);
    testesPassados++;
  } catch (err) {
    console.error(`  [FALHOU] ${descricao}`);
    console.error('           Mensagem:', err.message);
    if (err.stack) console.error('           Stack:', err.stack.split('\n')[1]);
  }
}

console.log('===================================================================');
console.log(' INICIANDO BATERIA DE TESTES AUTOMATIZADOS - FASE 3');
console.log('===================================================================\n');

// -----------------------------------------------------------------------------
// 1. Testes do Módulo Logger (app/utils/logger.js)
// -----------------------------------------------------------------------------
console.log('>> Testando app/utils/logger.js:');

await test('Deve registrar erros e recuperar do log com ID e timestamp', () => {
  clearAllLogs();
  const erro = new Error('Falha simulada de teste');
  const reg = logError('TesteContexto', erro, { dadoExtra: 123 });

  assert.ok(reg.id.startsWith('err_'));
  assert.strictEqual(reg.contexto, 'TesteContexto');
  assert.strictEqual(reg.mensagem, 'Falha simulada de teste');
  assert.strictEqual(reg.dadosAdicionais.dadoExtra, 123);

  const logs = getErrorLogs();
  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].id, reg.id);
});

await test('Deve registrar eventos de segurança e limitar registros', () => {
  clearAllLogs();
  for (let i = 1; i <= 60; i++) {
    logSecurity('TENTATIVA_PIN_INVALIDO', { tentativa: i });
  }
  const secLogs = getSecurityLogs();
  // Limite máximo de 50 registros (FIFO)
  assert.strictEqual(secLogs.length, 50);
  assert.strictEqual(secLogs[secLogs.length - 1].detalhes.tentativa, 60);
});

await test('Deve limpar todos os logs com clearAllLogs()', () => {
  logError('Contexto', 'Erro');
  logSecurity('Evento', {});
  assert.ok(getErrorLogs().length > 0);
  assert.ok(getSecurityLogs().length > 0);

  clearAllLogs();
  assert.strictEqual(getErrorLogs().length, 0);
  assert.strictEqual(getSecurityLogs().length, 0);
});

// -----------------------------------------------------------------------------
// 2. Testes do Módulo Calendar (app/utils/calendar.js)
// -----------------------------------------------------------------------------
console.log('\n>> Testando app/utils/calendar.js:');

const eventoMock = {
  titulo: 'Chá de Cozinha de Helena & Gabriel',
  subtitulo: 'Celebração com a família e amigos',
  dataHoraISO: '2026-10-24T16:00:00.000Z',
  duracaoHoras: 4,
  local: 'Espaço Jardim das Camélias',
  enderecoCompleto: 'Rua das Flores, 120 - SP'
};

await test('Deve formatar string UTC para calendários (YYYYMMDDTHHmmssZ)', () => {
  const utcStr = formatUtcCalendarString(eventoMock.dataHoraISO);
  assert.strictEqual(utcStr, '20261024T160000Z');
});

await test('Deve gerar URL válida para o Google Agenda', () => {
  const url = createGoogleCalendarUrl(eventoMock);
  assert.ok(url.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE'));
  assert.ok(url.includes(encodeURIComponent(eventoMock.titulo)));
  assert.ok(url.includes('dates=20261024T160000Z/20261024T200000Z'));
  assert.ok(url.includes(encodeURIComponent('Espaço Jardim das Camélias - Rua das Flores, 120 - SP')));
});

await test('Deve gerar conteúdo padronizado iCalendar RFC 5545 (.ics)', () => {
  const ics = generateIcsContent(eventoMock);
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('VERSION:2.0'));
  assert.ok(ics.includes('BEGIN:VEVENT'));
  assert.ok(ics.includes('SUMMARY:Chá de Cozinha de Helena & Gabriel'));
  assert.ok(ics.includes('DTSTART:20261024T160000Z'));
  assert.ok(ics.includes('DTEND:20261024T200000Z'));
  assert.ok(ics.includes('STATUS:CONFIRMED'));
  assert.ok(ics.includes('END:VEVENT'));
  assert.ok(ics.includes('END:VCALENDAR'));
});

await test('Deve formatar datas para exibição em português do Brasil', () => {
  const d = '2026-10-24T16:00:00';
  const dataBr = formatarDataBR(d);
  assert.ok(dataBr.includes('24/10/2026'));

  const dataHoraBr = formatarDataHoraBR(d);
  assert.ok(dataHoraBr.includes('24/10/2026 16:00'));

  const extenso = formatarDataExtenso(d);
  assert.ok(extenso.includes('24 de Outubro de 2026'));
});

// -----------------------------------------------------------------------------
// 3. Testes do Modelo ConfiguracaoModel (app/models/ConfiguracaoModel.js)
// -----------------------------------------------------------------------------
console.log('\n>> Testando app/models/ConfiguracaoModel.js:');

await test('Deve obter configurações com fallback e paleta de cores intacta', async () => {
  const configObj = await ConfiguracaoModel.obterConfiguracoes();
  assert.ok(configObj);
  assert.ok(configObj.dataLimiteConfirmacao);
  assert.ok(configObj.chavePix);
  assert.ok(configObj.mensagemBoasVindas);
  assert.strictEqual(configObj.evento.noivos, 'Hevelyn & Jonathas');
  assert.strictEqual(configObj.paletaCores.length, 5);
  assert.strictEqual(configObj.paletaCores[0].nome, 'Verde Oliva');
});

await test('Deve validar corretamente se o prazo expirou ou continua válido (RN-06)', () => {
  const dataFutura = new Date(Date.now() + 86400000 * 10).toISOString(); // +10 dias
  const dataPassada = new Date(Date.now() - 86400000 * 2).toISOString(); // -2 dias

  assert.strictEqual(ConfiguracaoModel.estaExpirado(dataFutura), false);
  assert.strictEqual(ConfiguracaoModel.estaExpirado(dataPassada), true);
  assert.strictEqual(ConfiguracaoModel.estaExpirado(null), false);
});

await test('Deve validar e salvar configurações atualizadas', async () => {
  const novaData = '2026-10-20T23:59:59';
  const novaChavePix = 'novachave.pix@email.com';
  const novaMensagem = 'Mensagem de boas-vindas carinhosa e atualizada.';

  const salvas = await ConfiguracaoModel.salvarConfiguracoes({
    dataLimiteConfirmacao: novaData,
    chavePix: novaChavePix,
    mensagemBoasVindas: novaMensagem
  });

  assert.strictEqual(salvas.chavePix, novaChavePix);
  assert.strictEqual(salvas.mensagemBoasVindas, novaMensagem);
});

await test('Deve rejeitar configurações inválidas com erros descritivos', async () => {
  await assert.rejects(
    async () => {
      await ConfiguracaoModel.salvarConfiguracoes({
        chavePix: '',
        mensagemBoasVindas: 'Mensagem válida'
      });
    },
    /chave PIX não pode ser vazia/
  );

  await assert.rejects(
    async () => {
      await ConfiguracaoModel.salvarConfiguracoes({
        chavePix: 'chave@pix',
        mensagemBoasVindas: 'Oi'
      });
    },
    /pelo menos 5 caracteres/
  );
});

// -----------------------------------------------------------------------------
// 4. Testes do Modelo PresenteModel (app/models/PresenteModel.js)
// -----------------------------------------------------------------------------
console.log('\n>> Testando app/models/PresenteModel.js:');

await test('Deve listar presentes disponíveis com quantidade > 0 (RN-01)', async () => {
  const disponiveis = await PresenteModel.listarDisponiveis();
  assert.ok(Array.isArray(disponiveis));
  assert.ok(disponiveis.length > 0);
  disponiveis.forEach((p) => {
    assert.strictEqual(p.ativo, true);
    assert.ok(p.quantidade_disponivel > 0);
  });
});

await test('Deve cadastrar novo presente com validação de campos', async () => {
  const novo = await PresenteModel.cadastrarPresente({
    nome: 'Jogo de Bowls de Cerâmica Artesanal',
    quantidadeTotal: 3
  });

  assert.ok(novo.id);
  assert.strictEqual(novo.nome, 'Jogo de Bowls de Cerâmica Artesanal');
  assert.strictEqual(novo.quantidade_total, 3);
  assert.strictEqual(novo.quantidade_disponivel, 3);
  assert.strictEqual(novo.ativo, true);

  const buscado = await PresenteModel.obterPorId(novo.id);
  assert.strictEqual(buscado.nome, novo.nome);
});

await test('Deve rejeitar cadastro de presente com dados inválidos', async () => {
  await assert.rejects(
    async () => {
      await PresenteModel.cadastrarPresente({ nome: 'ab', quantidadeTotal: 2 });
    },
    /entre 3 e 80 caracteres/
  );

  await assert.rejects(
    async () => {
      await PresenteModel.cadastrarPresente({ nome: 'Faqueiro Inox', quantidadeTotal: 0 });
    },
    /entre 1 e 99/
  );
});

await test('Deve reservar presente atomicamente decrementando estoque (RN-02)', async () => {
  const item = await PresenteModel.cadastrarPresente({
    nome: 'Item Teste Reserva Atômica',
    quantidadeTotal: 1
  });

  const reserva = await PresenteModel.reservarPresenteAtomicamente(item.id, {
    nomeConvidado: 'Mariana Lima',
    nomeNormalizado: 'mariana-lima',
    nomePresenteSnapshot: item.nome
  });

  assert.strictEqual(reserva.presenteId, item.id);
  assert.strictEqual(reserva.quantidadeRestante, 0);

  // Tentativa de reservar novamente o mesmo item (agora esgotado)
  await assert.rejects(
    async () => {
      await PresenteModel.reservarPresenteAtomicamente(item.id, {
        nomeConvidado: 'Outra Pessoa',
        nomeNormalizado: 'outra-pessoa'
      });
    },
    (err) => err.code === 'ESGOTADO' || err.message === 'ESGOTADO'
  );
});

await test('Deve devolver estoque ao liberar presente (RN-07)', async () => {
  const item = await PresenteModel.cadastrarPresente({
    nome: 'Item Teste Devolução',
    quantidadeTotal: 2
  });

  // Reserva uma unidade
  await PresenteModel.reservarPresenteAtomicamente(item.id, {
    nomeConvidado: 'Carlos Silva',
    nomeNormalizado: 'carlos-silva'
  });

  const posReserva = await PresenteModel.obterPorId(item.id);
  assert.strictEqual(posReserva.quantidade_disponivel, 1);

  // Devolve o estoque
  await PresenteModel.devolverEstoque(item.id);
  const posDevolucao = await PresenteModel.obterPorId(item.id);
  assert.strictEqual(posDevolucao.quantidade_disponivel, 2);
});

// -----------------------------------------------------------------------------
// 5. Testes do Modelo ConfirmacaoModel (app/models/ConfirmacaoModel.js)
// -----------------------------------------------------------------------------
console.log('\n>> Testando app/models/ConfirmacaoModel.js:');

await test('Deve normalizar nomes removendo acentos e espaços especiais', () => {
  assert.strictEqual(normalizarNome(' João da Silva Sauro '), 'joao-da-silva-sauro');
  assert.strictEqual(normalizarNome('Érica & Ângela!'), 'erica-angela');
  assert.strictEqual(normalizarNome('Maria---Luísa'), 'maria-luisa');
});

await test('Deve validar homônimos via busca pontual sem listar confirmacoes (RN-05 & LGPD)', async () => {
  const nomeTeste = 'Beatriz Mendes';
  const checagemAntes = await ConfirmacaoModel.verificarHomonimo(nomeTeste);
  assert.strictEqual(checagemAntes.existe, false);

  // Confirma presença
  await ConfirmacaoModel.confirmarPresenca({
    nomeConvidado: nomeTeste,
    tipoEscolha: 'apenas_presenca'
  });

  // Checagem posterior
  const checagemDepois = await ConfirmacaoModel.verificarHomonimo(nomeTeste);
  assert.strictEqual(checagemDepois.existe, true);
  assert.strictEqual(checagemDepois.nomeNormalizado, 'beatriz-mendes');
});

await test('Deve confirmar presença nas 3 modalidades do FSD (presente, PIX, apenas presença)', async () => {
  // Modalidade 1: Presente Físico
  const presente = await PresenteModel.cadastrarPresente({
    nome: 'Panela de Pressão Inox',
    quantidadeTotal: 2
  });
  const conf1 = await ConfirmacaoModel.confirmarPresenca({
    nomeConvidado: 'Lucas Prado',
    tipoEscolha: 'presente_item',
    presenteId: presente.id,
    nomePresenteSnapshot: presente.nome
  });
  assert.ok(conf1.confirmacaoId);

  // Modalidade 2: PIX / Presente Surpresa (RN-04)
  const conf2 = await ConfirmacaoModel.confirmarPresenca({
    nomeConvidado: 'Fernanda Rocha',
    tipoEscolha: 'pix_surpresa'
  });
  assert.ok(conf2.confirmacaoId);
  assert.strictEqual(conf2.tipoEscolha, 'pix_surpresa');

  // Modalidade 3: Apenas Presença (RN-03)
  const conf3 = await ConfirmacaoModel.confirmarPresenca({
    nomeConvidado: 'Roberto Nunes',
    tipoEscolha: 'apenas_presenca'
  });
  assert.ok(conf3.confirmacaoId);
  assert.strictEqual(conf3.tipoEscolha, 'apenas_presenca');
});

await test('Deve liberar presente convertendo para apenas_presenca e estornando estoque (RN-07)', async () => {
  const item = await PresenteModel.cadastrarPresente({
    nome: 'Aparelho de Fondue',
    quantidadeTotal: 1
  });

  const conf = await ConfirmacaoModel.confirmarPresenca({
    nomeConvidado: 'Juliana Paes',
    tipoEscolha: 'presente_item',
    presenteId: item.id
  });

  const posConf = await PresenteModel.obterPorId(item.id);
  assert.strictEqual(posConf.quantidade_disponivel, 0);

  // Libera o presente
  await ConfirmacaoModel.liberarPresente(conf.confirmacaoId, item.id);

  // O item volta a ter 1 unidade disponível no catálogo
  const posLiberacao = await PresenteModel.obterPorId(item.id);
  assert.strictEqual(posLiberacao.quantidade_disponivel, 1);

  // O convidado permanece confirmado, mas como apenas_presenca
  const lista = await ConfirmacaoModel.listarConfirmacoes();
  const conv = lista.find((c) => c.id === conf.confirmacaoId);
  assert.strictEqual(conv.tipo_escolha, 'apenas_presenca');
  assert.strictEqual(conv.presente_id, null);
  assert.ok(conv.liberado_em);
});

await test('Deve consolidar métricas corretas do dashboard (RN-08)', async () => {
  const metricas = await ConfirmacaoModel.obterMetricas();
  assert.ok(metricas.totalConfirmados >= 3);
  assert.ok(metricas.totalPresentes >= 2);
  assert.ok(metricas.presentesDisponiveis >= 1);
  assert.ok(metricas.totalApenasPresenca >= 1);
});

console.log('\n===================================================================');
console.log(` RESULTADO FINAL DOS TESTES: ${testesPassados}/${totalTestes} PASSARAM`);
console.log('===================================================================\n');

if (testesPassados !== totalTestes) {
  process.exit(1);
}
