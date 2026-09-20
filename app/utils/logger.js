/**
 * Módulo Utilitário de Registro de Logs (Error & Security Logger)
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsabilidades:
 * - FSD 19.1: Captura e armazenamento de erros operacionais sob a chave '_app_error_logs' em localStorage (máx. 50 registros).
 * - FSD 19.2: Registro de eventos de segurança sob a chave '_app_sec_logs' em localStorage (máx. 50 registros).
 * - Fallback resiliente em memória caso localStorage esteja indisponível ou inacessível.
 */

const MAX_LOGS = 50;
const KEY_ERROR_LOGS = '_app_error_logs';
const KEY_SEC_LOGS = '_app_sec_logs';

// Armazenamento em memória para contingência (modo anônimo estrito, quota excedida ou ambiente Node)
const memoryStore = {
  [KEY_ERROR_LOGS]: [],
  [KEY_SEC_LOGS]: []
};

/**
 * Verifica com segurança se localStorage está disponível no ambiente atual.
 * @returns {boolean}
 */
function isLocalStorageAvailable() {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return false;
    }
    const testKey = '__test_storage__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Lê uma lista de logs de uma chave específica do storage.
 * @param {string} storageKey
 * @returns {Array<object>}
 */
function readLogs(storageKey) {
  if (isLocalStorageAvailable()) {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn(`[Logger] Falha ao ler logs de ${storageKey}:`, e);
      return memoryStore[storageKey] || [];
    }
  }
  return memoryStore[storageKey] || [];
}

/**
 * Persiste a lista de logs em storage, limitando aos últimos MAX_LOGS registros.
 * @param {string} storageKey
 * @param {Array<object>} list
 */
function saveLogs(storageKey, list) {
  // Mantém apenas os últimos registros (FIFO)
  const trimmed = list.slice(-MAX_LOGS);
  memoryStore[storageKey] = trimmed;

  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(trimmed));
    } catch (e) {
      console.warn(`[Logger] Falha ao salvar logs em ${storageKey}:`, e);
    }
  }
}

/**
 * Registra um erro de runtime, rede, concorrência ou operação.
 * FSD 19.1: Mensagens amigáveis para o usuário; detalhes técnicos isolados no log.
 * 
 * @param {string} contexto - Nome do componente, controller ou model (ex: 'ConviteController.confirmarPresenca')
 * @param {Error|string|object} erro - Instância de erro ou mensagem técnica
 * @param {object|null} dadosAdicionais - Metadados complementares seguros (sem expor senhas)
 * @returns {object} Registro criado
 */
export function logError(contexto, erro, dadosAdicionais = null) {
  const agora = new Date().toISOString();
  const id = `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let mensagem = 'Erro desconhecido';
  let stack = null;
  let nome = 'Error';

  if (erro instanceof Error) {
    mensagem = erro.message;
    stack = erro.stack || null;
    nome = erro.name || 'Error';
  } else if (typeof erro === 'string') {
    mensagem = erro;
  } else if (erro && typeof erro === 'object') {
    mensagem = erro.message || JSON.stringify(erro);
    stack = erro.stack || null;
  }

  const registro = {
    id,
    timestamp: agora,
    tipo: nome,
    contexto: contexto || 'Geral',
    mensagem,
    stack,
    dadosAdicionais: dadosAdicionais || null
  };

  const lista = readLogs(KEY_ERROR_LOGS);
  lista.push(registro);
  saveLogs(KEY_ERROR_LOGS, lista);

  // Exibe no console para depuração em desenvolvimento
  if (typeof console !== 'undefined' && console.error) {
    console.error(`[AppError] [${registro.contexto}] ${registro.mensagem}`, {
      id: registro.id,
      stack: registro.stack,
      dados: dadosAdicionais
    });
  }

  return registro;
}

/**
 * Registra eventos de segurança (tentativas inválidas de PIN, anomalias de submissão).
 * FSD 19.2
 * 
 * @param {string} evento - Identificador do evento de segurança (ex: 'PIN_INVALIDO', 'FORCA_BRUTA_BLOQUEIO')
 * @param {object|null} detalhes - Metadados contextuais do evento
 * @returns {object} Registro criado
 */
export function logSecurity(evento, detalhes = null) {
  const agora = new Date().toISOString();
  const id = `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const registro = {
    id,
    timestamp: agora,
    evento: evento || 'EVENTO_SEGURANCA',
    detalhes: detalhes || null
  };

  const lista = readLogs(KEY_SEC_LOGS);
  lista.push(registro);
  saveLogs(KEY_SEC_LOGS, lista);

  if (typeof console !== 'undefined' && console.warn) {
    console.warn(`[AppSecurity] [${registro.evento}]`, detalhes);
  }

  return registro;
}

/**
 * Retorna todos os logs de erro registrados.
 * @returns {Array<object>}
 */
export function getErrorLogs() {
  return readLogs(KEY_ERROR_LOGS);
}

/**
 * Retorna todos os logs de segurança registrados.
 * @returns {Array<object>}
 */
export function getSecurityLogs() {
  return readLogs(KEY_SEC_LOGS);
}

/**
 * Limpa todos os logs de erro armazenados.
 */
export function clearErrorLogs() {
  saveLogs(KEY_ERROR_LOGS, []);
}

/**
 * Limpa todos os logs de segurança armazenados.
 */
export function clearSecurityLogs() {
  saveLogs(KEY_SEC_LOGS, []);
}

/**
 * Limpa ambos os registros de logs (erros e segurança).
 */
export function clearAllLogs() {
  clearErrorLogs();
  clearSecurityLogs();
}
