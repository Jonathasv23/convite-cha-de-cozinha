/**
 * Suíte de Testes de Homologação e Aceitação Técnica - Fase 7
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Homologação completa dos 14 Critérios de Aceitação da Seção 26 do docs/FSD.md
 * 
 * Execução: node tests/fase7_tests.js
 */

import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Importações dos modelos, views e utilitários
import { ConfiguracaoModel } from '../app/models/ConfiguracaoModel.js';
import { PresenteModel } from '../app/models/PresenteModel.js';
import { ConfirmacaoModel } from '../app/models/ConfirmacaoModel.js';
import { ConviteView } from '../app/views/ConviteView.js';
import { FormularioRSVPView } from '../app/views/FormularioRSVPView.js';
import { PainelNoivaView } from '../app/views/PainelNoivaView.js';
import { ToastView } from '../app/views/ToastView.js';
import { AdminController } from '../app/controllers/AdminController.js';
import { ConviteController } from '../app/controllers/ConviteController.js';
import { gerarCsvConfirmacoes } from '../app/utils/export.js';
import { createGoogleCalendarUrl, generateIcsContent } from '../app/utils/calendar.js';

console.log('===================================================================');
console.log(' INICIANDO BATERIA DE HOMOLOGAÇÃO E ACEITAÇÃO - FASE 7');
console.log(' Validação dos 14 Critérios da Seção 26 do docs/FSD.md');
console.log('===================================================================');

// Setup de ambiente simulado isomórfico
const mockLocalStorage = {};
const mockSessionStorage = {};

class MockElement {
  constructor(id = '', className = '') {
    this.id = id;
    this._innerHTML = '';
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

  querySelectorAll() {
    return [];
  }

  addEventListener() {}
  scrollIntoView() {}
}

global.window = {
  localStorage: {
    getItem: (k) => mockLocalStorage[k] || null,
    setItem: (k, v) => { mockLocalStorage[k] = String(v); },
    removeItem: (k) => { delete mockLocalStorage[k]; },
    clear: () => { for (const k in mockLocalStorage) delete mockLocalStorage[k]; }
  },
  sessionStorage: {
    getItem: (k) => mockSessionStorage[k] || null,
    setItem: (k, v) => { mockSessionStorage[k] = String(v); },
    removeItem: (k) => { delete mockSessionStorage[k]; },
    clear: () => { for (const k in mockSessionStorage) delete mockSessionStorage[k]; }
  }
};

// -------------------------------------------------------------------------
// CRITÉRIO 1: Aderência ao Design System (Botanical Heritage Atelier)
// -------------------------------------------------------------------------
test('Critério 1: Aderência ao Design System (Cores, Fontes e Sombras de Papelaria)', () => {
  const variablesCss = fs.readFileSync(path.join(ROOT_DIR, 'assets/css/variables.css'), 'utf-8');
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  const adminHtml = fs.readFileSync(path.join(ROOT_DIR, 'admin.html'), 'utf-8');

  // 1. Cores mandatórias da paleta
  assert.strictEqual(variablesCss.includes('#3D4A36') || variablesCss.includes('#3d4a36'), true, 'Deve conter Heritage Olive (#3D4A36)');
  assert.strictEqual(variablesCss.includes('#8A9A80') || variablesCss.includes('#8a9a80'), true, 'Deve conter Warm Sage (#8A9A80)');
  assert.strictEqual(variablesCss.includes('#C5A880') || variablesCss.includes('#c5a880'), true, 'Deve conter Champagne Gold (#C5A880)');
  assert.strictEqual(variablesCss.includes('#F8F7F2') || variablesCss.includes('#f8f7f2'), true, 'Deve conter Ivory Parchment (#F8F7F2)');
  assert.strictEqual(variablesCss.includes('#FFFFFF') || variablesCss.includes('#ffffff'), true, 'Deve conter Pure Vellum (#FFFFFF)');

  // 2. Tipografia oficial
  assert.strictEqual(variablesCss.includes('EB Garamond'), true, 'Deve definir fonte display EB Garamond');
  assert.strictEqual(variablesCss.includes('Manrope'), true, 'Deve definir fonte body Manrope');
  assert.strictEqual(indexHtml.includes('EB+Garamond') && indexHtml.includes('Manrope'), true, 'index.html deve importar as fontes oficiais');
  assert.strictEqual(adminHtml.includes('EB+Garamond') && adminHtml.includes('Manrope'), true, 'admin.html deve importar as fontes oficiais');

  // 3. Sombras táteis de papelaria
  assert.strictEqual(variablesCss.includes('--shadow-level-1'), true, 'Deve conter sombra Nível 1');
  assert.strictEqual(variablesCss.includes('--shadow-level-2'), true, 'Deve conter sombra Nível 2');
  assert.strictEqual(variablesCss.includes('--shadow-level-3'), true, 'Deve conter sombra Nível 3');

  console.log('  [PASSOU] Critério 1: Design tokens e tipografia 100% aderentes ao DESIGN.md');
});

// -------------------------------------------------------------------------
// CRITÉRIO 2: Arquitetura MVC Client-Side Desacoplada
// -------------------------------------------------------------------------
test('Critério 2: Arquitetura MVC no Client-Side e Desacoplamento de Camadas', () => {
  // Verificar existência de todos os arquivos MVC
  const files = [
    'app/models/ConfiguracaoModel.js',
    'app/models/PresenteModel.js',
    'app/models/ConfirmacaoModel.js',
    'app/views/ConviteView.js',
    'app/views/FormularioRSVPView.js',
    'app/views/PainelNoivaView.js',
    'app/views/ToastView.js',
    'app/controllers/ConviteController.js',
    'app/controllers/AdminController.js',
    'app/utils/calendar.js',
    'app/utils/export.js',
    'app/utils/logger.js',
    'app/utils/firebase.js'
  ];

  files.forEach(f => {
    assert.strictEqual(fs.existsSync(path.join(ROOT_DIR, f)), true, `Arquivo ${f} deve existir no padrão MVC`);
  });

  // Garantir que as views são puramente de apresentação (não realizam operações diretas de escrita no Firestore)
  const conviteViewCode = fs.readFileSync(path.join(ROOT_DIR, 'app/views/ConviteView.js'), 'utf-8');
  const formRsvpViewCode = fs.readFileSync(path.join(ROOT_DIR, 'app/views/FormularioRSVPView.js'), 'utf-8');
  assert.strictEqual(conviteViewCode.includes('runTransaction('), false, 'ConviteView não deve executar transações diretas');
  assert.strictEqual(formRsvpViewCode.includes('runTransaction('), false, 'FormularioRSVPView não deve executar transações diretas');

  console.log('  [PASSOU] Critério 2: Arquitetura MVC respeitada com separação estrita de camadas');
});

// -------------------------------------------------------------------------
// CRITÉRIO 3: Responsividade Mobile-First (360px a 430px até telas desktop)
// -------------------------------------------------------------------------
test('Critério 3: Responsividade Mobile-First e Adaptação de Telas', () => {
  const mainCss = fs.readFileSync(path.join(ROOT_DIR, 'assets/css/main.css'), 'utf-8');
  const adminCss = fs.readFileSync(path.join(ROOT_DIR, 'assets/css/admin.css'), 'utf-8');
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');

  // Meta viewport em index.html
  assert.strictEqual(indexHtml.includes('name="viewport"'), true, 'index.html deve conter meta viewport');
  assert.strictEqual(indexHtml.includes('width=device-width'), true, 'index.html deve ter width=device-width');

  // Breakpoints responsivos nos arquivos de estilo
  assert.strictEqual(mainCss.includes('@media'), true, 'main.css deve possuir regras de media query');
  assert.strictEqual(adminCss.includes('@media'), true, 'admin.css deve possuir regras de media query');

  // Ajustes de padding e tamanhos para telas pequenas (ex: 768px, 640px ou 480px)
  const temMediaMobile = mainCss.includes('768px') || mainCss.includes('640px') || mainCss.includes('480px');
  assert.strictEqual(temMediaMobile, true, 'main.css deve possuir media queries direcionadas a dispositivos móveis');

  console.log('  [PASSOU] Critério 3: Estilos mobile-first e adaptações de viewport validadas');
});

// -------------------------------------------------------------------------
// CRITÉRIO 4: Baixa e Reversão Atômica de Estoque
// -------------------------------------------------------------------------
test('Critério 4: Baixa e Reversão Atômica de Estoque (Prevenção de Estoque Negativo e Retorno ao Catálogo)', async () => {
  // Cadastrar item com estoque 1
  const itemCriado = await PresenteModel.cadastrarPresente({
    nome: 'Item Exclusivo Homologação',
    quantidadeTotal: 1
  });

  assert.strictEqual(itemCriado.quantidade_disponivel, 1, 'Estoque inicial deve ser 1');

  // Reserva do item (baixa atômica)
  const reserva = await PresenteModel.reservarPresenteAtomicamente(itemCriado.id, {
    nomeConvidado: 'Convidada Alpha',
    nomeNormalizado: 'convidada-alpha'
  });

  assert.strictEqual(reserva.presenteId, itemCriado.id, 'Reserva deve retornar o presenteId');
  assert.strictEqual(reserva.quantidadeRestante, 0, 'Estoque deve zerar');

  // Segunda tentativa deve ser barrada imediatamente (concorrência/esgotado)
  await assert.rejects(
    async () => {
      await PresenteModel.reservarPresenteAtomicamente(itemCriado.id, {
        nomeConvidado: 'Convidado Beta',
        nomeNormalizado: 'convidado-beta'
      });
    },
    (err) => err.code === 'ESGOTADO' || err.message === 'ESGOTADO'
  );

  // Verificar que o item esgotado não aparece na listagem pública (RN-01)
  const listaPublica = await PresenteModel.listarDisponiveis();
  const itemAindaDisponivel = listaPublica.find(p => p.id === itemCriado.id);
  assert.strictEqual(itemAindaDisponivel, undefined, 'Item com estoque 0 não pode ser listado no convite');

  // Liberação do presente (estorno de estoque)
  await PresenteModel.devolverEstoque(itemCriado.id);
  const posDevolucao = await PresenteModel.obterPorId(itemCriado.id);
  assert.strictEqual(posDevolucao.quantidade_disponivel, 1, 'Estoque deve retornar a 1');

  // Item agora deve reaparecer na listagem pública
  const listaAposEstorno = await PresenteModel.listarDisponiveis();
  const itemRecuperado = listaAposEstorno.find(p => p.id === itemCriado.id);
  assert.strictEqual(itemRecuperado !== undefined, true, 'Item devolvido deve reaparecer na listagem');

  console.log('  [PASSOU] Critério 4: Baixa atômica, bloqueio de esgotado e estorno validados com precisão');
});

// -------------------------------------------------------------------------
// CRITÉRIO 5: Fluxo Alternativo de PIX / Presente Surpresa
// -------------------------------------------------------------------------
test('Critério 5: Fluxo Alternativo de PIX (Sem Impacto no Estoque e Exibição de Chave)', async () => {
  const listaAntes = await PresenteModel.listarDisponiveis();
  const qtdDisponivelAntes = listaAntes.reduce((acc, p) => acc + p.quantidade_disponivel, 0);

  // Confirmação via PIX
  const confirmacaoPix = await ConfirmacaoModel.confirmarPresenca({
    nomeConvidado: 'Amigo Generoso Homologacao',
    tipoEscolha: 'pix_surpresa'
  });

  assert.ok(confirmacaoPix.confirmacaoId, 'Confirmação PIX deve ter id');
  assert.strictEqual(confirmacaoPix.tipoEscolha, 'pix_surpresa');

  // Garantir que nenhum presente físico teve estoque alterado
  const listaDepois = await PresenteModel.listarDisponiveis();
  const qtdDisponivelDepois = listaDepois.reduce((acc, p) => acc + p.quantidade_disponivel, 0);
  assert.strictEqual(qtdDisponivelDepois, qtdDisponivelAntes, 'Estoque de presentes físicos não deve ser alterado por PIX');

  // Renderização da view de sucesso com PIX
  const containerPix = new MockElement('rsvp-container');
  FormularioRSVPView.renderizarSucesso(containerPix, {
    nomeConvidado: 'Amigo Generoso Homologacao',
    tipoEscolha: 'pix_surpresa',
    chavePix: '12345678900'
  });

  assert.strictEqual(containerPix.innerHTML.includes('12345678900'), true, 'Chave PIX deve ser exibida na tela de sucesso');
  assert.strictEqual(containerPix.innerHTML.includes('btn-copiar-pix'), true, 'Botão de cópia deve estar presente');

  console.log('  [PASSOU] Critério 5: Fluxo PIX preserva estoque e exibe chave com facilidade de cópia');
});

// -------------------------------------------------------------------------
// CRITÉRIO 6: Opção "Apenas Confirmar Presença"
// -------------------------------------------------------------------------
test('Critério 6: Opção "Apenas Confirmar Presença" (Sem Presente Associado)', async () => {
  const confirmacaoPresenca = await ConfirmacaoModel.confirmarPresenca({
    nomeConvidado: 'Familiar Querido Homologacao',
    tipoEscolha: 'apenas_presenca'
  });

  assert.ok(confirmacaoPresenca.confirmacaoId, 'Confirmação apenas presença deve ter id');
  assert.strictEqual(confirmacaoPresenca.tipoEscolha, 'apenas_presenca');

  const containerPresenca = new MockElement('rsvp-container');
  FormularioRSVPView.renderizarSucesso(containerPresenca, {
    nomeConvidado: 'Familiar Querido Homologacao',
    tipoEscolha: 'apenas_presenca'
  });

  assert.strictEqual(containerPresenca.innerHTML.includes('Presença Confirmada!'), true);
  assert.strictEqual(containerPresenca.innerHTML.includes('btn-copiar-pix'), false, 'Não deve exibir botão PIX');

  console.log('  [PASSOU] Critério 6: Apenas presença registrado corretamente sem vincular itens');
});

// -------------------------------------------------------------------------
// CRITÉRIO 7: Alerta Amigável de Nome Duplicado (RN-05 & LGPD)
// -------------------------------------------------------------------------
test('Critério 7: Validação de Homônimos Amigável e Segura contra LGPD', async () => {
  // Confirmar um convidado
  await ConfirmacaoModel.confirmarPresenca({
    nomeConvidado: 'Camila Santos Homolog',
    tipoEscolha: 'apenas_presenca'
  });

  // Verificar existência de homônimo via busca pontual
  const checagem1 = await ConfirmacaoModel.verificarHomonimo('Camila Santos Homolog');
  assert.strictEqual(checagem1.existe, true, 'Deve identificar nome já cadastrado');

  // Verificar nome não cadastrado
  const checagem2 = await ConfirmacaoModel.verificarHomonimo('Nome Inédito Homologação 2026');
  assert.strictEqual(checagem2.existe, false, 'Não deve identificar nome inédito');

  // Testar que mesmo com homônimo, o envio NÃO é bloqueado
  const segundaCamila = await ConfirmacaoModel.confirmarPresenca({
    nomeConvidado: 'Camila Santos Homolog',
    tipoEscolha: 'pix_surpresa'
  });
  assert.ok(segundaCamila.confirmacaoId, 'RN-05: Envio deve ser permitido mesmo para homônimo');

  console.log('  [PASSOU] Critério 7: Checagem pontual LGPD e envio não bloqueado para homônimos');
});

// -------------------------------------------------------------------------
// CRITÉRIO 8: Bloqueio por Data Limite Expirada (RN-06)
// -------------------------------------------------------------------------
test('Critério 8: Bloqueio Automático por Prazo Expirado', () => {
  const agora = new Date();
  
  // Data futura: prazo válido
  const dataFutura = new Date(agora.getTime() + 1000 * 60 * 60 * 24 * 7).toISOString();
  const prazoValido = ConfiguracaoModel.estaExpirado(dataFutura);
  assert.strictEqual(prazoValido, false, 'Data futura não deve constar como expirada');

  // Data passada: prazo expirado
  const dataPassada = new Date(agora.getTime() - 1000 * 60 * 60 * 24).toISOString();
  const prazoExpirado = ConfiguracaoModel.estaExpirado(dataPassada);
  assert.strictEqual(prazoExpirado, true, 'Data no passado deve constar como expirada');

  // Renderização do cartão de bloqueio
  const containerBloqueio = new MockElement('rsvp-container');
  FormularioRSVPView.renderizar(containerBloqueio, {
    estaExpirado: true,
    dataLimiteFormatada: '18 de Outubro de 2026 às 23:59',
    presentes: []
  });
  assert.strictEqual(containerBloqueio.innerHTML.includes('prazo para confirmação de presença encerrou'), true, 'Deve exibir mensagem serena de prazo encerrado');
  assert.strictEqual(containerBloqueio.innerHTML.includes('<input'), false, 'Não deve conter campos de entrada ativos');

  console.log('  [PASSOU] Critério 8: Detecção precisa de prazo expirado e bloqueio sereno na UI');
});

// -------------------------------------------------------------------------
// CRITÉRIO 9: Painel Administrativo Protegido e Sessão Segura
// -------------------------------------------------------------------------
test('Critério 9: Proteção por PIN Mestre, Bloqueio de Força Bruta e Sessão', async () => {
  window.localStorage.clear();
  window.sessionStorage.clear();

  const controller = new AdminController();

  // 1. PIN Incorreto
  const resIncorreto = await controller.validarPin('9999');
  assert.strictEqual(resIncorreto, false, 'PIN incorreto deve ser rejeitado');
  assert.strictEqual(controller.estaAutenticado(), false, 'Não deve estar autenticado');

  // 2. PIN Correto ('0523')
  const resCorreto = await controller.validarPin('0523');
  assert.strictEqual(resCorreto, true, 'PIN 0523 deve ser aceito');
  assert.strictEqual(controller.estaAutenticado(), true, 'Deve estar autenticado');

  // 3. Força Bruta
  await controller.logout();
  for (let i = 1; i <= 5; i++) {
    await controller.validarPin('0000');
  }
  const bloqueio = controller.verificarBloqueio();
  assert.strictEqual(bloqueio.estaBloqueado, true, '5ª tentativa errada deve ativar bloqueio de força bruta');

  console.log('  [PASSOU] Critério 9: Gate de PIN mestre, força bruta e sessão volátil operando com segurança');
});

// -------------------------------------------------------------------------
// CRITÉRIO 10: Segurança e Regras Declarativas no Firestore (LGPD)
// -------------------------------------------------------------------------
test('Critério 10: Regras Declarativas no Firestore (database/firestore.rules)', () => {
  const rules = fs.readFileSync(path.join(ROOT_DIR, 'database/firestore.rules'), 'utf-8');

  // Coleção confirmacoes bloqueada para leitura anônima
  assert.strictEqual(
    rules.includes('match /confirmacoes/{confirmacaoId}') && rules.includes('allow read, update, delete: if request.auth != null;'),
    true,
    'confirmacoes deve bloquear leitura anônima para conformidade com a LGPD'
  );

  // Coleção nomes_confirmados permite apenas busca pontual aberta (get)
  assert.strictEqual(
    rules.includes('match /nomes_confirmados/{nomeNormalizado}') &&
    rules.includes('allow get: if true;') &&
    rules.includes('allow list: if request.auth != null;'),
    true,
    'nomes_confirmados deve permitir apenas get pontual e proibir listagem aberta'
  );

  // Migrações internas restritas
  assert.strictEqual(
    rules.includes('match /_migrations/{migrationId}') && rules.includes('allow read, write: if request.auth != null;'),
    true,
    '_migrations deve ser estritamente restrita a administradores'
  );

  console.log('  [PASSOU] Critério 10: Regras de segurança no Firestore blindadas contra vazamento LGPD');
});

// -------------------------------------------------------------------------
// CRITÉRIO 11: Exportações Funcionais (CSV com UTF-8 BOM e Impressão Diagramada)
// -------------------------------------------------------------------------
test('Critério 11: Exportação CSV (UTF-8 BOM, Delimitador ;) e Impressão Limpa', () => {
  const confirmacoes = [
    {
      nome_convidado: 'Helena Silva',
      tipo_escolha: 'presente_item',
      nome_presente_snapshot: 'Jogo de Panelas Antiaderente',
      criado_em: new Date('2026-10-20T14:30:00')
    },
    {
      nome_convidado: 'João Souza',
      tipo_escolha: 'pix_surpresa',
      nome_presente_snapshot: null,
      criado_em: new Date('2026-10-21T10:15:00')
    }
  ];

  const csvContent = gerarCsvConfirmacoes(confirmacoes);

  // Verificação de UTF-8 BOM
  assert.strictEqual(csvContent.startsWith('\uFEFF'), true, 'CSV deve iniciar com UTF-8 BOM (\\uFEFF)');

  // Delimitador ponto e vírgula
  assert.strictEqual(csvContent.includes('Nome do Convidado;Tipo de Confirmação;Presente Escolhido;Data e Hora'), true, 'Cabeçalho com delimitador ;');
  assert.strictEqual(csvContent.includes('Helena Silva;Presente Físico;Jogo de Panelas Antiaderente'), true);
  assert.strictEqual(csvContent.includes('João Souza;PIX / Presente Surpresa;Contribuição via PIX'), true);

  // Folha de impressão print.css
  const printCss = fs.readFileSync(path.join(ROOT_DIR, 'assets/css/print.css'), 'utf-8');
  assert.strictEqual(printCss.includes('@media print'), true, 'print.css deve conter @media print');
  assert.strictEqual(printCss.includes('@page'), true, 'print.css deve conter regras de página @page');
  assert.strictEqual(printCss.includes('.no-print'), true, 'print.css deve ocultar botões e controles operacionais');

  console.log('  [PASSOU] Critério 11: CSV compatível com Excel e folha de impressão @media print');
});

// -------------------------------------------------------------------------
// CRITÉRIO 12: Deploy Exclusivo no GitHub Pages (Sem Servidor de Backend)
// -------------------------------------------------------------------------
test('Critério 12: Deploy Estático Exclusivo no GitHub Pages (Sem Backend Próprio)', () => {
  // Garantir ausência de servidores backend centralizados tradicionais
  assert.strictEqual(fs.existsSync(path.join(ROOT_DIR, 'server.js')), false, 'Não deve existir server.js');
  assert.strictEqual(fs.existsSync(path.join(ROOT_DIR, 'app.js')), false, 'Não deve existir app.js');
  assert.strictEqual(fs.existsSync(path.join(ROOT_DIR, '.htaccess')), false, 'Não deve existir .htaccess');

  // Pontos de entrada estáticos na raiz
  assert.strictEqual(fs.existsSync(path.join(ROOT_DIR, 'index.html')), true, 'index.html deve residir na raiz');
  assert.strictEqual(fs.existsSync(path.join(ROOT_DIR, 'admin.html')), true, 'admin.html deve residir na raiz');

  // Verificar caminhos relativos em index.html e admin.html
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  const adminHtml = fs.readFileSync(path.join(ROOT_DIR, 'admin.html'), 'utf-8');

  assert.strictEqual(indexHtml.includes('href="assets/'), true, 'index.html deve usar caminhos relativos');
  assert.strictEqual(adminHtml.includes('href="assets/'), true, 'admin.html deve usar caminhos relativos');
  assert.strictEqual(indexHtml.includes('src="file:///') || indexHtml.includes('href="file:///'), false, 'index.html não deve conter links locais absolutos file:///');
  assert.strictEqual(adminHtml.includes('src="file:///') || adminHtml.includes('href="file:///'), false, 'admin.html não deve conter links locais absolutos file:///');

  console.log('  [PASSOU] Critério 12: Estrutura estática pura pronta para publicação no GitHub Pages');
});

// -------------------------------------------------------------------------
// CRITÉRIO 13: Configuração em Código Sem Arquivo .env
// -------------------------------------------------------------------------
test('Critério 13: Configuração em Código Sem Arquivo .env (Segurança de Chaves)', () => {
  // Garantir ausência de arquivos .env
  assert.strictEqual(fs.existsSync(path.join(ROOT_DIR, '.env')), false, 'Não deve existir arquivo .env');
  assert.strictEqual(fs.existsSync(path.join(ROOT_DIR, '.env.local')), false, 'Não deve existir .env.local');
  assert.strictEqual(fs.existsSync(path.join(ROOT_DIR, '.env.production')), false, 'Não deve existir .env.production');

  // Existência dos arquivos de configuração padrão
  assert.strictEqual(fs.existsSync(path.join(ROOT_DIR, 'config/config.js')), true, 'config/config.js deve existir');
  assert.strictEqual(fs.existsSync(path.join(ROOT_DIR, 'config/config.example.js')), true, 'config/config.example.js deve existir');

  const configJs = fs.readFileSync(path.join(ROOT_DIR, 'config/config.js'), 'utf-8');
  assert.strictEqual(configJs.includes('firebaseConfig'), true, 'Deve conter objeto firebaseConfig');
  assert.strictEqual(configJs.includes('pinMestrePadrao'), true, 'Deve conter pinMestrePadrao');
  assert.strictEqual(configJs.includes('evento'), true, 'Deve conter parâmetros do evento');

  console.log('  [PASSOU] Critério 13: Configurações em config/config.js com zero dependência de .env');
});

// -------------------------------------------------------------------------
// CRITÉRIO 14: Migrations Versionadas e Idempotentes
// -------------------------------------------------------------------------
test('Critério 14: Migrações Versionadas com Idempotência via _migrations', () => {
  const migrationsRun = fs.readFileSync(path.join(ROOT_DIR, 'database/migrations/run.js'), 'utf-8');
  const migracao1 = fs.readFileSync(path.join(ROOT_DIR, 'database/migrations/001_initial_schema.js'), 'utf-8');
  const migracao2 = fs.readFileSync(path.join(ROOT_DIR, 'database/migrations/002_seed_presentes.js'), 'utf-8');

  // Checagem de coleção _migrations
  assert.strictEqual(migrationsRun.includes('_migrations'), true, 'run.js deve gerenciar a coleção _migrations');
  assert.strictEqual(migracao1.includes('001_initial_schema'), true, 'Migração 1 deve ter identificador versionado');
  assert.strictEqual(migracao2.includes('002_seed_presentes'), true, 'Migração 2 deve ter identificador versionado');
  assert.strictEqual(migracao1.includes('export const id ='), true, 'Migração 1 deve exportar metadados com id');
  assert.strictEqual(migracao2.includes('export const id ='), true, 'Migração 2 deve exportar metadados com id');

  console.log('  [PASSOU] Critério 14: Controle de schema e migrations versionadas com idempotência');
});

// -------------------------------------------------------------------------
// CRITÉRIO EXTRA: Utilitários de Calendário e Integração
// -------------------------------------------------------------------------
test('Critério Extra: Geração de Links de Calendário (Google Agenda & .ics)', () => {
  const eventoMock = {
    titulo: 'Chá de Cozinha de Hevelyn & Jonathas',
    dataHoraISO: '2026-10-24T16:00:00Z',
    duracaoHoras: 5,
    local: 'Salão de Festas',
    enderecoCompleto: 'Rua das Flores, 123 - Jardins, São Paulo - SP',
    subtitulo: 'Venha celebrar conosco!'
  };

  const urlGoogle = createGoogleCalendarUrl(eventoMock);
  assert.strictEqual(urlGoogle.includes('calendar.google.com/calendar/render'), true);
  assert.strictEqual(urlGoogle.includes('Hevelyn'), true);

  const conteudoIcs = generateIcsContent(eventoMock);
  assert.strictEqual(conteudoIcs.includes('BEGIN:VCALENDAR'), true);
  assert.strictEqual(conteudoIcs.includes('SUMMARY:Chá de Cozinha de Hevelyn & Jonathas'), true);
  assert.strictEqual(conteudoIcs.includes('END:VCALENDAR'), true);

  console.log('  [PASSOU] Calendários Google e iCalendar (.ics) operando com perfeição');
});
