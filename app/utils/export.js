/**
 * Utilitário de Exportação: export.js
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsabilidades (FSD Seções 6.2.6, 22.2):
 * 1. Compilação da relação de confirmações de convidados em formato CSV.
 * 2. Delimitador padrão: ponto e vírgula (;) para compatibilidade nativa com Excel em PT-BR.
 * 3. Codificação UTF-8 com BOM (\uFEFF) para exibição correta de acentos e caracteres especiais.
 * 4. Sanitização e escape de campos (aspas duplas para valores contendo ponto e vírgula, quebras de linha ou aspas).
 * 5. Download automático no navegador via Blob e URL de objeto.
 */

/**
 * Mapeia o identificador textual do tipo de escolha para uma descrição legível em PT-BR.
 * @param {string} tipoEscolha
 * @returns {string}
 */
export function traduzirTipoEscolha(tipoEscolha) {
  switch (tipoEscolha) {
    case 'presente_item':
      return 'Presente Físico';
    case 'pix_surpresa':
      return 'PIX / Presente Surpresa';
    case 'apenas_presenca':
      return 'Apenas Presença';
    default:
      return 'Não Especificado';
  }
}

/**
 * Formata um carimbo de data/hora (Date, ISO string ou timestamp) para DD/MM/AAAA HH:mm:ss.
 * @param {string|Date|number} dataVal
 * @returns {string}
 */
export function formatarDataHoraCsv(dataVal) {
  if (!dataVal) return '-';
  try {
    const d = (dataVal instanceof Date) ? dataVal : new Date(dataVal);
    if (isNaN(d.getTime())) return String(dataVal);

    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const seg = String(d.getSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`;
  } catch (e) {
    return String(dataVal);
  }
}

/**
 * Sanitiza e escapa um valor de célula individual para conformidade com a RFC 4180 / Excel CSV.
 * @param {any} valor
 * @returns {string}
 */
export function sanitizarCampoCsv(valor) {
  if (valor === null || valor === undefined) return '';
  let str = String(valor).trim();

  // Prevenção contra CSV/Formula Injection (DDE Injection em Excel/Planilhas)
  // Se o valor iniciar com =, +, -, @ ou caracteres de controle, prefixa com apóstrofo
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Se contiver ponto e vírgula, aspas duplas ou quebras de linha, encapsula em aspas duplas
  if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    const escapado = str.replace(/"/g, '""');
    return `"${escapado}"`;
  }
  return str;
}

/**
 * Gera a string CSV completa a partir da lista de confirmações.
 * 
 * @param {Array<object>} confirmacoes - Lista de objetos de confirmação
 * @returns {string} Conteúdo CSV com UTF-8 BOM
 */
export function gerarCsvConfirmacoes(confirmacoes = []) {
  // Byte Order Mark (BOM) UTF-8 para garantir abertura correta no Excel sem caracteres corrompidos
  const BOM = '\uFEFF';

  const cabecalhos = [
    'Nome do Convidado',
    'Tipo de Confirmação',
    'Presente Escolhido',
    'Data e Hora da Confirmação'
  ];

  const linhas = [cabecalhos.map(sanitizarCampoCsv).join(';')];

  for (const c of confirmacoes) {
    const nome = c.nome_convidado || 'Não Informado';
    const tipo = traduzirTipoEscolha(c.tipo_escolha);

    let presente = '-';
    if (c.tipo_escolha === 'presente_item') {
      presente = c.nome_presente_snapshot || 'Presente Físico';
    } else if (c.tipo_escolha === 'pix_surpresa') {
      presente = 'Contribuição via PIX';
    } else if (c.tipo_escolha === 'apenas_presenca') {
      presente = 'Apenas Presença';
    }

    // Se o item foi liberado posteriormente pela noiva
    if (c.liberado_em && c.tipo_escolha === 'apenas_presenca' && c.nome_presente_snapshot) {
      presente = `Apenas Presença (Item Liberado: ${c.nome_presente_snapshot})`;
    }

    const dataHora = formatarDataHoraCsv(c.criado_em);

    const linha = [
      sanitizarCampoCsv(nome),
      sanitizarCampoCsv(tipo),
      sanitizarCampoCsv(presente),
      sanitizarCampoCsv(dataHora)
    ].join(';');

    linhas.push(linha);
  }

  return BOM + linhas.join('\r\n');
}

/**
 * Dispara o download automático do arquivo CSV no navegador.
 * 
 * @param {Array<object>} confirmacoes - Lista de confirmações
 * @param {string} [nomeArquivoPersonalizado] - Opcional. Nome do arquivo
 * @returns {{ sucesso: boolean, nomeArquivo: string, totalRegistros: number, conteudo: string }}
 */
export function exportarConfirmacoesParaCsv(confirmacoes = [], nomeArquivoPersonalizado = null) {
  const agora = new Date();
  const dataIso = agora.toISOString().split('T')[0];
  const nomePadrao = `lista_convidados_cha_${dataIso}.csv`;
  const nomeFinal = nomeArquivoPersonalizado || nomePadrao;

  const conteudoCsv = gerarCsvConfirmacoes(confirmacoes);

  // Se executando em navegador com suporte a DOM e Blob
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof Blob !== 'undefined') {
    try {
      const blob = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' });
      
      // Suporte a navegadores modernos
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', nomeFinal);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Falha ao disparar download do CSV:', e);
      throw e;
    }
  }

  return {
    sucesso: true,
    nomeArquivo: nomeFinal,
    totalRegistros: confirmacoes.length,
    conteudo: conteudoCsv
  };
}
