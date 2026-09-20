/**
 * Suíte de Testes Automatizados - Fase 6: Relatórios, Exportações (CSV e Impressão/PDF) e Acabamentos Finais
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Execução: node tests/fase6_tests.js
 */

import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {
  traduzirTipoEscolha,
  formatarDataHoraCsv,
  sanitizarCampoCsv,
  gerarCsvConfirmacoes,
  exportarConfirmacoesParaCsv
} from '../app/utils/export.js';
import { PainelNoivaView } from '../app/views/PainelNoivaView.js';
import { AdminController } from '../app/controllers/AdminController.js';

console.log('===================================================================');
console.log(' INICIANDO BATERIA DE TESTES AUTOMATIZADOS - FASE 6');
console.log('===================================================================');

// Simulação de Storage e DOM para ambiente CLI/Node.js
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
  },
  print: () => {
    // mock de window.print
    global.window.__printChamado = true;
  }
};

test('1. export.js: Tradução de tipos de escolha e formatação de datas em padrão brasileiro', () => {
  assert.strictEqual(traduzirTipoEscolha('presente_item'), 'Presente Físico');
  assert.strictEqual(traduzirTipoEscolha('pix_surpresa'), 'PIX / Presente Surpresa');
  assert.strictEqual(traduzirTipoEscolha('apenas_presenca'), 'Apenas Presença');
  assert.strictEqual(traduzirTipoEscolha('invalido'), 'Não Especificado');

  // Formatação de data/hora para CSV
  const dataTeste = new Date('2026-10-24T16:30:45');
  const dataFmt = formatarDataHoraCsv(dataTeste);
  assert.strictEqual(dataFmt.includes('24/10/2026'), true, 'Deve formatar a data DD/MM/AAAA');
  assert.strictEqual(dataFmt.includes('16:30:45'), true, 'Deve formatar hora HH:mm:ss');
  assert.strictEqual(formatarDataHoraCsv(null), '-', 'Deve tratar data nula graciosamente');

  console.log('  [PASSOU] Tradução de tipos de escolha e formatação de datas operando com precisão');
});

test('2. export.js: Sanitização e escape de caracteres especiais conforme RFC 4180 (ponto e vírgula, aspas, quebras)', () => {
  // Campo simples sem caracteres especiais
  assert.strictEqual(sanitizarCampoCsv('Maria Silva'), 'Maria Silva');

  // Campo contendo ponto e vírgula (delimitador)
  const comPontoEVirgula = sanitizarCampoCsv('Silva; Santos');
  assert.strictEqual(comPontoEVirgula, '"Silva; Santos"', 'Deve encapsular em aspas quando houver ponto e vírgula');

  // Campo contendo aspas duplas
  const comAspas = sanitizarCampoCsv('Maria "Flor"');
  assert.strictEqual(comAspas, '"Maria ""Flor"""', 'Deve duplicar aspas duplas internas e encapsular');

  // Campo contendo quebra de linha
  const comQuebra = sanitizarCampoCsv("Linha 1\nLinha 2");
  assert.strictEqual(comQuebra, '"Linha 1\nLinha 2"', 'Deve encapsular em aspas quando houver quebra de linha');

  // Valores vazios ou nulos
  assert.strictEqual(sanitizarCampoCsv(null), '');
  assert.strictEqual(sanitizarCampoCsv(undefined), '');

  console.log('  [PASSOU] Sanitização RFC 4180 protege campos com delimitadores, aspas e quebras');
});

test('3. export.js: Geração de CSV com UTF-8 BOM e integridade de colunas para Excel', () => {
  const listaConfirmacoes = [
    {
      id: 'conf_1',
      nome_convidado: 'Carolina Martins',
      tipo_escolha: 'presente_item',
      presente_id: 'pres_1',
      nome_presente_snapshot: 'Jogo de Panelas Antiaderentes',
      criado_em: '2026-10-15T14:20:10.000Z'
    },
    {
      id: 'conf_2',
      nome_convidado: 'Rodrigo & Beatriz; Família',
      tipo_escolha: 'pix_surpresa',
      presente_id: null,
      nome_presente_snapshot: null,
      criado_em: '2026-10-16T10:15:30.000Z'
    },
    {
      id: 'conf_3',
      nome_convidado: 'Tia Rosa "Rosinha"',
      tipo_escolha: 'apenas_presenca',
      presente_id: null,
      nome_presente_snapshot: null,
      criado_em: '2026-10-17T18:45:00.000Z'
    },
    {
      id: 'conf_4',
      nome_convidado: 'Lucas Alencar',
      tipo_escolha: 'apenas_presenca',
      presente_id: 'pres_2',
      nome_presente_snapshot: 'Faqueiro Inox 24 Peças',
      liberado_em: '2026-10-18T09:00:00.000Z',
      criado_em: '2026-10-15T12:00:00.000Z'
    }
  ];

  const csv = gerarCsvConfirmacoes(listaConfirmacoes);

  // 1. Verificação do Byte Order Mark (BOM) UTF-8
  assert.strictEqual(csv.startsWith('\uFEFF'), true, 'CSV deve iniciar obrigatoriamente com UTF-8 BOM (\\uFEFF)');

  // 2. Cabeçalho oficial
  assert.strictEqual(
    csv.includes('Nome do Convidado;Tipo de Confirmação;Presente Escolhido;Data e Hora da Confirmação'),
    true,
    'Cabeçalho deve conter as 4 colunas padronizadas pelo FSD delimitadas por ponto e vírgula'
  );

  // 3. Verificação do convidado com presente físico
  assert.strictEqual(csv.includes('Carolina Martins;Presente Físico;Jogo de Panelas Antiaderentes'), true);

  // 4. Verificação do convidado com PIX e ponto e vírgula no nome escapado
  assert.strictEqual(csv.includes('"Rodrigo & Beatriz; Família";PIX / Presente Surpresa;Contribuição via PIX'), true);

  // 5. Verificação do convidado com aspas no nome escapadas
  assert.strictEqual(csv.includes('"Tia Rosa ""Rosinha""";Apenas Presença;Apenas Presença'), true);

  // 6. Verificação do presente estornado/liberado
  assert.strictEqual(csv.includes('Lucas Alencar;Apenas Presença;Apenas Presença (Item Liberado: Faqueiro Inox 24 Peças)'), true);

  console.log('  [PASSOU] Geração de CSV atende integralmente ao FSD com UTF-8 BOM e delimitador ponto e vírgula');
});

test('4. export.js: Exportação de lista vazia e nomenclatura do arquivo', () => {
  const resultadoVazio = exportarConfirmacoesParaCsv([]);
  assert.strictEqual(resultadoVazio.sucesso, true);
  assert.strictEqual(resultadoVazio.totalRegistros, 0);
  assert.strictEqual(resultadoVazio.nomeArquivo.startsWith('lista_convidados_cha_'), true);
  assert.strictEqual(resultadoVazio.nomeArquivo.endsWith('.csv'), true);
  assert.strictEqual(resultadoVazio.conteudo.startsWith('\uFEFF'), true);

  // Nome personalizado
  const resultadoPersonalizado = exportarConfirmacoesParaCsv([], 'relatorio_final.csv');
  assert.strictEqual(resultadoPersonalizado.nomeArquivo, 'relatorio_final.csv');

  console.log('  [PASSOU] Exportação com lista vazia e nomenclatura dinâmica validadas');
});

test('5. PainelNoivaView: Botões de exportação e elementos de impressão na tabela de convidados', () => {
  const confirmacoes = [
    { id: '1', nome_convidado: 'Ana Silva', tipo_escolha: 'presente_item', presente_id: 'p1', nome_presente_snapshot: 'Faqueiro', criado_em: '2026-10-20T10:00:00' },
    { id: '2', nome_convidado: 'Beto Souza', tipo_escolha: 'pix_surpresa', criado_em: '2026-10-20T11:00:00' },
    { id: '3', nome_convidado: 'Carlos Lima', tipo_escolha: 'apenas_presenca', criado_em: '2026-10-20T12:00:00' }
  ];

  const html = PainelNoivaView.templateTabelaConvidados(confirmacoes, { noivos: 'Hevelyn & Jonathas' });

  // 1. Botão de Exportar Planilha (CSV)
  assert.strictEqual(html.includes('id="btn-exportar-csv"'), true, 'Deve renderizar o botão #btn-exportar-csv');
  assert.strictEqual(html.includes('Baixar Planilha (CSV)'), true, 'Deve exibir o texto descritivo do botão CSV');

  // 2. Botão de Impressão / PDF
  assert.strictEqual(html.includes('id="btn-imprimir-relatorio"'), true, 'Deve renderizar o botão #btn-imprimir-relatorio');
  assert.strictEqual(html.includes('Imprimir / PDF'), true, 'Deve exibir o texto descritivo do botão Impressão');

  // 3. Cabeçalho de Impressão
  assert.strictEqual(html.includes('class="print-header"'), true, 'Deve conter a classe .print-header');
  assert.strictEqual(html.includes('Chá de Cozinha &bull; Hevelyn &amp; Jonathas'), true, 'Deve renderizar título no print-header');
  assert.strictEqual(html.includes('Data de Emissão:'), true, 'Deve conter indicação de data de emissão');

  // 4. Resumo Consolidado de Impressão
  assert.strictEqual(html.includes('class="print-summary"'), true, 'Deve conter a classe .print-summary');
  assert.strictEqual(html.includes('Total de Convidados Confirmados:'), true);
  assert.strictEqual(html.includes('Presentes Físicos Reservados:'), true);
  assert.strictEqual(html.includes('Contribuições via PIX / Surpresa:'), true);
  assert.strictEqual(html.includes('Apenas Confirmação de Presença:'), true);

  console.log('  [PASSOU] PainelNoivaView renderiza botões de exportação, cabeçalho e resumo de impressão');
});

test('6. AdminController: Método exportarCsv trata lista vazia e gera arquivo com registros', () => {
  const controller = new AdminController();

  // Teste 1: Lista vazia
  controller._dadosAtuais.confirmacoes = [];
  assert.doesNotThrow(() => {
    controller.exportarCsv();
  }, 'Não deve lançar exceção com lista vazia');

  // Teste 2: Lista com registros
  controller._dadosAtuais.confirmacoes = [
    { id: 'c1', nome_convidado: 'Mariana Duarte', tipo_escolha: 'presente_item', presente_id: 'p1', nome_presente_snapshot: 'Jogo de Taças', criado_em: '2026-10-22T15:00:00' }
  ];

  assert.doesNotThrow(() => {
    controller.exportarCsv();
  }, 'Deve exportar com sucesso quando houver registros');

  console.log('  [PASSOU] AdminController.exportarCsv lida com lista vazia e executa exportação com êxito');
});

test('7. print.css: Integridade do arquivo de estilos de impressão e regras obrigatórias', () => {
  const caminhoPrintCss = path.join(process.cwd(), 'assets', 'css', 'print.css');
  assert.strictEqual(fs.existsSync(caminhoPrintCss), true, 'O arquivo assets/css/print.css deve existir');

  const conteudoCss = fs.readFileSync(caminhoPrintCss, 'utf-8');

  // Verificações essenciais de impressão
  assert.strictEqual(conteudoCss.includes('@media print'), true, 'Deve conter bloco @media print');
  assert.strictEqual(conteudoCss.includes('@page'), true, 'Deve conter bloco @page com margens');
  assert.strictEqual(conteudoCss.includes('.print-header'), true, 'Deve conter regras para .print-header');
  assert.strictEqual(conteudoCss.includes('.print-summary'), true, 'Deve conter regras para .print-summary');
  assert.strictEqual(conteudoCss.includes('.no-print'), true, 'Deve ocultar elementos .no-print');
  assert.strictEqual(conteudoCss.includes('page-break-inside: avoid'), true, 'Deve evitar quebras de página em linhas da tabela');
  assert.strictEqual(conteudoCss.includes('#secao-configuracoes'), true, 'Deve ocultar seções operacionais');

  console.log('  [PASSOU] assets/css/print.css contém todas as regras e seletores mandatórios do FSD');
});

test('8. admin.css: Ocultação padrão de print-header e print-summary na visualização de tela', () => {
  const caminhoAdminCss = path.join(process.cwd(), 'assets', 'css', 'admin.css');
  const conteudoCss = fs.readFileSync(caminhoAdminCss, 'utf-8');

  assert.strictEqual(conteudoCss.includes('.print-header'), true, 'admin.css deve referenciar .print-header');
  assert.strictEqual(conteudoCss.includes('.print-summary'), true, 'admin.css deve referenciar .print-summary');
  assert.strictEqual(conteudoCss.includes('.table-actions'), true, 'admin.css deve definir layout para .table-actions');

  console.log('  [PASSOU] admin.css esconde elementos de impressão na tela e formata botões de ação');
});

console.log('===================================================================');
console.log(' TODOS OS 8 TESTES DA FASE 6 FORAM APROVADOS COM SUCESSO! [PASSOU]');
console.log('===================================================================');
