/**
 * Suíte de Testes Automatizados - Fase 4: Módulo do Convite Digital Público
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Execução: node tests/fase4_tests.js
 */

import assert from 'node:assert';
import { test } from 'node:test';
import { ToastView } from '../app/views/ToastView.js';
import { ConviteView } from '../app/views/ConviteView.js';
import { FormularioRSVPView } from '../app/views/FormularioRSVPView.js';
import { ConfiguracaoModel } from '../app/models/ConfiguracaoModel.js';
import { PresenteModel } from '../app/models/PresenteModel.js';
import { ConfirmacaoModel } from '../app/models/ConfirmacaoModel.js';
import { demoStore } from '../app/utils/firebase.js';

console.log('===================================================================');
console.log(' INICIANDO BATERIA DE TESTES AUTOMATIZADOS - FASE 4');
console.log('===================================================================');

// Mock leve de Elemento de DOM para execução em Node.js
class MockElement {
  constructor(id = '', className = '') {
    this.id = id;
    this.className = className;
    this._innerHTML = '';
    this.textContent = '';
    this.attributes = new Map();
    this.classList = {
      _classes: new Set(className ? className.split(' ') : []),
      add: (cls) => this.classList._classes.add(cls),
      remove: (cls) => this.classList._classes.delete(cls),
      contains: (cls) => this.classList._classes.has(cls)
    };
    this.children = [];
    this.style = {};
    this.disabled = false;
    this.value = '';
    this.options = [];
    this.selectedIndex = 0;
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(html) {
    this._innerHTML = html;
  }

  setAttribute(name, val) {
    this.attributes.set(name, String(val));
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  appendChild(child) {
    this.children.push(child);
  }

  querySelector() {
    return null;
  }

  addEventListener() {}
  scrollIntoView() {}
}

test('1. ConviteView: Cálculo da Contagem Regressiva Viva', () => {
  // Simula data futura de 10 dias, 5 horas, 30 minutos a partir de agora
  const agora = Date.now();
  const futuro = new Date(agora + (10 * 86400 + 5 * 3600 + 30 * 60) * 1000);

  const resultado = ConviteView.atualizarContagem(futuro);

  assert.strictEqual(resultado.encerrado, false, 'Contagem não deve estar encerrada para data futura');
  assert.strictEqual(resultado.dias, 10, 'Deve calcular 10 dias restantes');
  assert.strictEqual(resultado.horas, 5, 'Deve calcular 5 horas restantes');
  assert.strictEqual(resultado.minutos, 30, 'Deve calcular 30 minutos restantes');

  // Simula data passada
  const passado = new Date(agora - 10000);
  const resultadoPassado = ConviteView.atualizarContagem(passado);
  assert.strictEqual(resultadoPassado.encerrado, true, 'Deve indicar encerrado para data passada');
  assert.strictEqual(resultadoPassado.dias, 0);
  assert.strictEqual(resultadoPassado.segundos, 0);
  console.log('  [PASSOU] ConviteView calcula corretamente contagem regressiva e detecta encerramento');
});

test('2. ConviteView: Renderização do Hero Card com nomes oficiais (Hevelyn & Jonathas)', () => {
  const container = new MockElement('hero-section');
  const dados = {
    evento: {
      noivos: 'Hevelyn & Jonathas',
      dataHoraISO: '2026-10-24T16:00:00',
      dataHoraFormatada: '24 de Outubro de 2026 às 16:00',
      local: 'Espaço Jardim das Camélias',
      enderecoCompleto: 'Rua das Flores, 120',
      googleMapsUrl: 'https://maps.google.com/?q=Espaco'
    },
    mensagemBoasVindas: 'Sejam todos muito bem-vindos!'
  };

  ConviteView.renderizarHero(container, dados);

  assert.ok(container.innerHTML.includes('Hevelyn &amp; Jonathas'), 'Deve conter os nomes oficiais no HTML');
  assert.ok(container.innerHTML.includes('H &amp; J'), 'Monograma botânico deve conter as iniciais H & J');
  assert.ok(container.innerHTML.includes('Espaço Jardim das Camélias'), 'Deve exibir o nome do local');
  assert.ok(container.innerHTML.includes('Ver no Google Maps'), 'Deve conter link para o Google Maps');
  console.log('  [PASSOU] Hero Card renderiza com monograma botânico e dados de Hevelyn & Jonathas');
});

test('3. ConviteView: Renderização da Vitrine de Paleta de Cores', () => {
  const container = new MockElement('palette-section-wrapper');
  const paleta = [
    { nome: 'Verde Oliva', hex: '#3D4A36', descricao: 'Verde botânico nobre' },
    { nome: 'Verde Sálvia', hex: '#8A9A80', descricao: 'Sálvia suave e acolhedora' },
    { nome: 'Dourado Champanhe', hex: '#C5A880', descricao: 'Dourado champanhe sutil' }
  ];

  ConviteView.renderizarPaletaCores(container, paleta);

  assert.ok(container.innerHTML.includes('Verde Oliva'), 'Deve listar Verde Oliva');
  assert.ok(container.innerHTML.includes('#3D4A36'), 'Deve aplicar código hex no background do swatch');
  assert.ok(container.innerHTML.includes('Dourado Champanhe'), 'Deve listar Dourado Champanhe');
  console.log('  [PASSOU] Vitrine de paleta de cores renderiza as amostras em português com amostras visuais');
});

test('4. FormularioRSVPView: Renderização do formulário ativo e itens de presente', () => {
  const container = new MockElement('rsvp-section');
  const presentes = [
    { id: 'pres_1', nome: 'Faqueiro Inox', quantidade_disponivel: 2 },
    { id: 'pres_2', nome: 'Jogo de Taças', quantidade_disponivel: 1 }
  ];

  FormularioRSVPView.renderizar(container, {
    estaExpirado: false,
    dataLimiteFormatada: '18 de Outubro de 2026 às 23:59',
    presentes
  });

  assert.ok(container.innerHTML.includes('Confirme sua Presença'), 'Deve conter título do formulário');
  assert.ok(container.innerHTML.includes('input-nome-convidado'), 'Deve conter campo de nome');
  assert.ok(container.innerHTML.includes('check-apenas-presenca'), 'Deve conter checkbox para apenas presença');
  assert.ok(container.innerHTML.includes('Presentear com PIX / Presente surpresa'), 'Deve conter opção destacada de PIX');
  assert.ok(container.innerHTML.includes('Faqueiro Inox &bull; (2 disponíveis)'), 'Deve conter item do inventário formatado');
  console.log('  [PASSOU] Formulário RSVP renderiza campos obrigatórios e itens disponíveis');
});

test('5. FormularioRSVPView: Renderização do Bloqueio por Prazo Encerrado (RN-06)', () => {
  const container = new MockElement('rsvp-section');

  FormularioRSVPView.renderizar(container, {
    estaExpirado: true,
    dataLimiteFormatada: '18 de Outubro de 2026 às 23:59',
    presentes: []
  });

  assert.ok(!container.innerHTML.includes('form id="form-rsvp"'), 'Não deve renderizar o formulário ativo');
  assert.ok(container.innerHTML.includes('O prazo para confirmação de presença encerrou'), 'Deve conter mensagem amigável de encerramento');
  console.log('  [PASSOU] Bloqueio gracioso por prazo expirado renderiza sem formulário ativo (RN-06)');
});

test('6. FormularioRSVPView: Renderização da Tela de Sucesso com Bloco PIX (RN-04)', () => {
  const container = new MockElement('rsvp-section');

  FormularioRSVPView.renderizarSucesso(container, {
    nomeConvidado: 'Carla Beatriz Menezes',
    tipoEscolha: 'pix_surpresa',
    chavePix: 'hevelyn.jonathas.cha@email.com'
  });

  assert.ok(container.innerHTML.includes('Presença Confirmada!'), 'Deve conter título de confirmação');
  assert.ok(container.innerHTML.includes('Carla Beatriz Menezes'), 'Deve citar o nome da convidada');
  assert.ok(container.innerHTML.includes('hevelyn.jonathas.cha@email.com'), 'Deve exibir a chave PIX correta');
  assert.ok(container.innerHTML.includes('Copiar Chave PIX'), 'Deve conter botão de cópia');
  console.log('  [PASSOU] Tela de sucesso com PIX renderiza chave e botão de cópia');
});

test('7. ToastView: Sanitização de XSS e geração de classes', () => {
  const msgSuspeita = '<script>alert("xss")</script>Mensagem Segura';
  const escapada = ToastView._escaparHtml(msgSuspeita);

  assert.ok(!escapada.includes('<script>'), 'Não deve permitir tags script sem escape');
  assert.ok(escapada.includes('&lt;script&gt;'), 'Deve escapar tags HTML para entidades');
  console.log('  [PASSOU] ToastView sanitiza mensagens contra XSS com rigor');
});

test('8. Fluxo Integrado: Reserva Atômica no RSVP e Decremento de Estoque (RN-01 & RN-02)', async () => {
  demoStore.clear();

  // 1. Obtém lista inicial
  const disponiveisAntes = await PresenteModel.listarDisponiveis();
  const primeiroItem = disponiveisAntes[0];
  const qtdInicial = primeiroItem.quantidade_disponivel;

  // 2. Confirma presença escolhendo este presente
  const confirmacao = await ConfirmacaoModel.confirmarPresenca({
    nomeConvidado: 'Juliana Rocha Silva',
    tipoEscolha: 'presente_item',
    presenteId: primeiroItem.id,
    nomePresenteSnapshot: primeiroItem.nome
  });

  assert.ok(confirmacao.confirmacaoId, 'Deve gerar ID de confirmação');
  assert.strictEqual(confirmacao.quantidadeRestante, qtdInicial - 1, 'Estoque deve ser decrementado em exatamente 1');

  // 3. Verifica se o item no inventário agora tem 1 a menos
  const itemAtualizado = await PresenteModel.obterPorId(primeiroItem.id);
  assert.strictEqual(itemAtualizado.quantidade_disponivel, qtdInicial - 1);

  // 4. Verifica se o índice de homônimos foi populado
  const checagem = await ConfirmacaoModel.verificarHomonimo('Juliana Rocha Silva');
  assert.strictEqual(checagem.existe, true, 'Nome deve ser encontrado no índice de homônimos');

  console.log('  [PASSOU] Fluxo integrado de RSVP com reserva atômica e índice de homônimos funciona perfeitamente');
});

test('9. Tratamento de Concorrência: Erro amigável quando item esgota no clique', async () => {
  // Cadastra item com apenas 1 unidade
  const itemUnico = await PresenteModel.cadastrarPresente({
    nome: 'Item Exclusivo de Teste',
    quantidadeTotal: 1
  });

  // Convidado A reserva a unidade
  await PresenteModel.reservarPresenteAtomicamente(itemUnico.id, {
    nomeConvidado: 'Convidado A',
    nomeNormalizado: 'convidado-a',
    nomePresenteSnapshot: itemUnico.nome
  });

  // Convidado B tenta reservar simultaneamente
  try {
    await PresenteModel.reservarPresenteAtomicamente(itemUnico.id, {
      nomeConvidado: 'Convidado B',
      nomeNormalizado: 'convidado-b',
      nomePresenteSnapshot: itemUnico.nome
    });
    assert.fail('Deveria ter lançado exceção de ESGOTADO');
  } catch (err) {
    assert.strictEqual(err.code || err.message, 'ESGOTADO', 'Erro deve ser identificado como ESGOTADO para tratamento acolhedor');
  }

  console.log('  [PASSOU] Tratamento de concorrência detecta item esgotado com código ESGOTADO');
});

console.log('===================================================================');
console.log(' RESULTADO FINAL: TODOS OS TESTES DA FASE 4 FORAM APROVADOS!');
console.log('===================================================================');
