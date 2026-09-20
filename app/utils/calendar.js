/**
 * Módulo Utilitário de Integração com Calendários e Datas
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsabilidades (FSD Seção 23):
 * 1. Gerador de links para o Google Agenda (Google Calendar URL).
 * 2. Gerador padronizado de arquivo .ics para Apple Calendar, Outlook e dispositivos móveis (RFC 5545).
 * 3. Formatação amigável de datas em português do Brasil.
 */

/**
 * Converte um objeto Date ou string ISO para o formato UTC exigido por calendários: YYYYMMDDTHHmmssZ
 * @param {Date|string} data
 * @returns {string}
 */
export function formatUtcCalendarString(data) {
  const d = (typeof data === 'string') ? new Date(data) : data;
  if (isNaN(d.getTime())) {
    throw new Error('Data inválida para geração de calendário');
  }

  const pad = (n) => String(n).padStart(2, '0');

  const ano = d.getUTCFullYear();
  const mes = pad(d.getUTCMonth() + 1);
  const dia = pad(d.getUTCDate());
  const hora = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  const seg = pad(d.getUTCSeconds());

  return `${ano}${mes}${dia}T${hora}${min}${seg}Z`;
}

/**
 * Escapa caracteres reservados do padrão iCalendar (RFC 5545).
 * @param {string} texto
 * @returns {string}
 */
function escapeIcsText(texto) {
  if (!texto) return '';
  return String(texto)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Gera a URL para adição direta do evento ao Google Agenda.
 * 
 * @param {object} evento - Dados do evento
 * @param {string} evento.titulo - Título do evento (ex: 'Chá de Cozinha de Helena & Gabriel')
 * @param {string} evento.dataHoraISO - Data e hora de início em formato ISO
 * @param {number} [evento.duracaoHoras=4] - Duração estimada em horas
 * @param {string} [evento.local] - Nome do local
 * @param {string} [evento.enderecoCompleto] - Endereço completo
 * @param {string} [evento.subtitulo] - Descrição ou subtítulo
 * @returns {string} URL completa formatada para o Google Agenda
 */
export function createGoogleCalendarUrl(evento) {
  const dataInicio = new Date(evento.dataHoraISO);
  const duracaoHoras = evento.duracaoHoras || 4;
  const dataFim = new Date(dataInicio.getTime() + duracaoHoras * 60 * 60 * 1000);

  const startUtc = formatUtcCalendarString(dataInicio);
  const endUtc = formatUtcCalendarString(dataFim);

  const titulo = encodeURIComponent(evento.titulo || 'Chá de Cozinha');
  const descricao = encodeURIComponent(
    `${evento.subtitulo || ''}\n\nEsperamos você para celebrar com muito amor!`.trim()
  );
  const localizacao = encodeURIComponent(
    [evento.local, evento.enderecoCompleto].filter(Boolean).join(' - ')
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${startUtc}/${endUtc}&details=${descricao}&location=${localizacao}`;
}

/**
 * Gera o conteúdo em texto puro do arquivo .ics (formato iCalendar RFC 5545).
 * 
 * @param {object} evento - Dados do evento
 * @param {string} evento.titulo
 * @param {string} evento.dataHoraISO
 * @param {number} [evento.duracaoHoras=4]
 * @param {string} [evento.local]
 * @param {string} [evento.enderecoCompleto]
 * @param {string} [evento.subtitulo]
 * @returns {string} Conteúdo em texto formatado .ics
 */
export function generateIcsContent(evento) {
  const dataInicio = new Date(evento.dataHoraISO);
  const duracaoHoras = evento.duracaoHoras || 4;
  const dataFim = new Date(dataInicio.getTime() + duracaoHoras * 60 * 60 * 1000);
  const agora = new Date();

  const startUtc = formatUtcCalendarString(dataInicio);
  const endUtc = formatUtcCalendarString(dataFim);
  const stampUtc = formatUtcCalendarString(agora);

  const uid = `cha-cozinha-${dataInicio.getTime()}@botanicalheritage.atelier`;
  const summary = escapeIcsText(evento.titulo || 'Chá de Cozinha');
  const description = escapeIcsText(evento.subtitulo || 'Chá de Cozinha - Celebração e amor');
  const location = escapeIcsText([evento.local, evento.enderecoCompleto].filter(Boolean).join(' - '));

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Botanical Heritage Atelier//Convite Cha de Cozinha//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stampUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Dispara o download automático do arquivo .ics no navegador do usuário.
 * 
 * @param {object} evento
 * @param {string} [nomeArquivo='cha_de_cozinha.ics']
 * @returns {string} O conteúdo do arquivo .ics gerado
 */
export function downloadIcsFile(evento, nomeArquivo = 'cha_de_cozinha.ics') {
  const content = generateIcsContent(evento);

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return content;
}

/**
 * Formata uma data ISO para formato brasileiro resumido (DD/MM/AAAA).
 * @param {string} dataIso
 * @returns {string}
 */
export function formatarDataBR(dataIso) {
  if (!dataIso) return '';
  const d = new Date(dataIso);
  if (isNaN(d.getTime())) return String(dataIso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Formata uma data ISO para formato brasileiro com hora (DD/MM/AAAA HH:mm).
 * @param {string} dataIso
 * @returns {string}
 */
export function formatarDataHoraBR(dataIso) {
  if (!dataIso) return '';
  const d = new Date(dataIso);
  if (isNaN(d.getTime())) return String(dataIso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Formata uma data ISO para formato brasileiro por extenso.
 * Exemplo: "24 de Outubro de 2026 às 16:00"
 * @param {string} dataIso
 * @returns {string}
 */
export function formatarDataExtenso(dataIso) {
  if (!dataIso) return '';
  const d = new Date(dataIso);
  if (isNaN(d.getTime())) return String(dataIso);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
