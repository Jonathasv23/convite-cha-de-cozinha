#!/usr/bin/env node
/**
 * Executor de Migrações do Firestore
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Uso:
 *   node database/migrations/run.js           # Executa migrações pendentes
 *   node database/migrations/run.js --dry-run # Simula a execução sem gravar na nuvem
 *   node database/migrations/run.js --help    # Exibe instruções de uso
 */

import { config } from '../../config/config.js';
import * as migration001 from './001_initial_schema.js';
import * as migration002 from './002_seed_presentes.js';

// Relação ordenada de migrações
const MIGRATIONS = [
  migration001,
  migration002
];

// Parser básico de argumentos
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`
===================================================================
  Botanical Heritage Atelier - Executor de Migrações Firestore
===================================================================
Uso:
  node database/migrations/run.js [opções]

Opções:
  --dry-run   Simula a validação e o plano de migração sem gravar no Firestore.
  --force     Força a execução de todas as migrações, mesmo as já executadas.
  --help, -h  Exibe esta mensagem de ajuda.
`);
  process.exit(0);
}

/**
 * Converte um objeto JavaScript simples para a estrutura de tipos do Firestore REST API.
 */
function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val)
      ? { integerValue: val.toString() }
      : { doubleValue: val };
  }
  if (typeof val === 'string') {
    // Se for formato ISO de data, tenta mapear como timestamp
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
      return { timestampValue: val.endsWith('Z') ? val : `${val}Z` };
    }
    return { stringValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

/**
 * Cria o contexto de persistência.
 * Quando em dry-run ou credenciais placeholder, opera em memória com logs.
 * Quando configurado com Firebase real, opera via Firestore REST API nativa.
 */
function createExecutionContext(isDry, projectId, apiKey, idToken = null) {
  const isReal = !isDry && apiKey && apiKey !== 'FIREBASE_API_KEY_PLACEHOLDER';
  const memoryStore = new Map();

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }
    return headers;
  };

  return {
    isRealCloud: isReal,

    async getMigrationRecord(migrationId) {
      if (!isReal) {
        return memoryStore.get(`_migrations/${migrationId}`) || null;
      }
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/_migrations/${migrationId}?key=${apiKey}`;
        const res = await fetch(url, { headers: getHeaders() });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return await res.json();
      } catch (err) {
        return null;
      }
    },

    async recordMigration(migrationId, status, errorMsg = null) {
      const agora = new Date().toISOString();
      const payload = {
        id: migrationId,
        executado_em: agora,
        status: status
      };
      if (errorMsg) payload.erro = errorMsg;

      if (!isReal) {
        memoryStore.set(`_migrations/${migrationId}`, payload);
        return;
      }

      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/_migrations/${migrationId}?key=${apiKey}`;
      const fields = {};
      for (const [k, v] of Object.entries(payload)) {
        fields[k] = toFirestoreValue(v);
      }

      await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ fields })
      });
    },

    async setDoc(collection, docId, data) {
      if (!isReal) {
        memoryStore.set(`${collection}/${docId}`, data);
        return docId;
      }
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?key=${apiKey}`;
      const fields = {};
      for (const [k, v] of Object.entries(data)) {
        fields[k] = toFirestoreValue(v);
      }
      const res = await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ fields })
      });
      if (!res.ok) throw new Error(`Falha ao gravar ${collection}/${docId}: HTTP ${res.status}`);
      return docId;
    },

    async addDoc(collection, data) {
      const autoId = `doc_${Math.random().toString(36).substring(2, 10)}`;
      if (!isReal) {
        memoryStore.set(`${collection}/${autoId}`, data);
        return autoId;
      }
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?key=${apiKey}`;
      const fields = {};
      for (const [k, v] of Object.entries(data)) {
        fields[k] = toFirestoreValue(v);
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ fields })
      });
      if (!res.ok) throw new Error(`Falha ao inserir em ${collection}: HTTP ${res.status}`);
      const json = await res.json();
      const parts = json.name ? json.name.split('/') : [];
      return parts[parts.length - 1] || autoId;
    }
  };
}

/**
 * Autentica o administrador via REST API (Identity Toolkit) para obter idToken.
 * Necessário para satisfazer as Firestore Security Rules (request.auth != null) na nuvem real.
 */
async function obterTokenAutenticado(apiKey, email, password) {
  if (!apiKey || apiKey === 'FIREBASE_API_KEY_PLACEHOLDER' || !email || !password) {
    return null;
  }
  try {
    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const res = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      console.warn(`[AUTH] Não foi possível autenticar o administrador (${erro?.error?.message || res.statusText}).`);
      return null;
    }
    const dados = await res.json();
    return dados.idToken;
  } catch (err) {
    console.warn(`[AUTH] Falha ao contatar serviço de autenticação:`, err.message);
    return null;
  }
}

/**
 * Função principal de orquestração de migrações.
 */
async function main() {
  console.log('-------------------------------------------------------------------');
  console.log(' Botanical Heritage Atelier - Inicialização de Banco de Dados');
  console.log('-------------------------------------------------------------------');

  const apiKey = config.firebaseConfig?.apiKey;
  const projectId = config.firebaseConfig?.projectId;
  const isPlaceholder = apiKey === 'FIREBASE_API_KEY_PLACEHOLDER';
  let idToken = null;

  if (isPlaceholder && !isDryRun) {
    console.log('[AVISO] Chave do Firebase em config/config.js ainda é o placeholder de demonstração.');
    console.log('[AVISO] Executando em modo de validação e simulação local (--dry-run).');
    console.log('[DICA] Para persistir na nuvem real, insira suas credenciais em config/config.js.');
    console.log('-------------------------------------------------------------------');
  } else if (isDryRun) {
    console.log('[MODO] Execução em modo de simulação (--dry-run). Nenhuma gravação externa será feita.');
    console.log('-------------------------------------------------------------------');
  } else {
    console.log(`[CONEXÃO] Conectando ao projeto Firebase: ${projectId}`);
    const adminEmail = config.adminAuth?.email;
    const adminPass = config.adminAuth?.password;
    if (adminEmail && adminPass) {
      idToken = await obterTokenAutenticado(apiKey, adminEmail, adminPass);
      if (idToken) {
        console.log(`[AUTH] Administrador autenticado com sucesso via Firebase Auth.`);
      }
    }
    console.log('-------------------------------------------------------------------');
  }

  const context = createExecutionContext(isDryRun || isPlaceholder, projectId, apiKey, idToken);
  let executadas = 0;
  let puladas = 0;

  for (const migration of MIGRATIONS) {
    const { id, description, up } = migration;
    console.log(`\n>> Verificando migração: [${id}] - ${description}`);

    // Verifica idempotência
    if (!isForce) {
      const record = await context.getMigrationRecord(id);
      if (record && (record.status === 'sucesso' || record.fields?.status?.stringValue === 'sucesso')) {
        console.log(`   └─ [PULADA] Migração já executada com sucesso anteriormente.`);
        puladas++;
        continue;
      }
    }

    try {
      console.log(`   └─ Executando...`);
      const resultado = await up(context);
      await context.recordMigration(id, 'sucesso');
      console.log(`   └─ [SUCESSO] Concluída! Documentos afetados: ${resultado?.documentosCriados ?? 'OK'}`);
      executadas++;
    } catch (err) {
      console.error(`   └─ [ERRO] Falha ao executar migração ${id}:`, err.message);
      await context.recordMigration(id, 'falha', err.message).catch(() => {});
      console.error('\nExecução abortada para preservar a integridade do banco de dados.');
      process.exit(1);
    }
  }

  console.log('\n===================================================================');
  console.log(` Relatório Final de Migrações:`);
  console.log(` - Executadas com sucesso: ${executadas}`);
  console.log(` - Puladas (idempotência):  ${puladas}`);
  console.log(` - Total de migrações:     ${MIGRATIONS.length}`);
  console.log('===================================================================\n');
}

main().catch(err => {
  console.error('[ERRO CRÍTICO]', err);
  process.exit(1);
});
