/**
 * Módulo de Integração com Firebase Web SDK v10+ (Modular)
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsável por inicializar a conexão com Firebase Firestore e Firebase Auth
 * utilizando exclusivamente a distribuição modular oficial via CDN (sem bundlers).
 * Possui suporte isomórfico com fallback gracioso para execução local e testes automatizados.
 */

import { config } from '../../config/config.js';

/**
 * Verifica se as credenciais do Firebase foram configuradas com valores reais
 * ou se ainda permanecem com os marcadores de exemplo (placeholders).
 * @returns {boolean}
 */
export function isFirebaseConfigured() {
  const cfg = config.firebaseConfig;
  return Boolean(
    cfg &&
    cfg.apiKey &&
    cfg.apiKey !== 'FIREBASE_API_KEY_PLACEHOLDER' &&
    cfg.projectId &&
    cfg.projectId !== ''
  );
}

// Armazenamento em memória para modo demo ou ambiente de testes
const inMemoryStorage = new Map();

/**
 * Gerenciador de armazenamento para o modo de demonstração local e testes.
 * Sincroniza em memória e em localStorage quando disponível.
 */
export const demoStore = {
  get(key, defaultValue = null) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw !== null) {
          const parsed = JSON.parse(raw);
          inMemoryStorage.set(key, parsed);
          return parsed;
        }
      } catch (e) {
        // Fallback para memória
      }
    }
    if (inMemoryStorage.has(key)) {
      return inMemoryStorage.get(key);
    }
    if (defaultValue !== null) {
      inMemoryStorage.set(key, defaultValue);
    }
    return defaultValue;
  },

  set(key, value) {
    inMemoryStorage.set(key, value);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        // Ignora erro de quota
      }
    }
  },

  clear() {
    inMemoryStorage.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('_demo_configuracoes');
        window.localStorage.removeItem('_demo_presentes');
        window.localStorage.removeItem('_demo_confirmacoes');
        window.localStorage.removeItem('_demo_nomes_confirmados');
      } catch (e) {}
    }
  }
};

// Instâncias encapsuladas
let appInstance = null;
let dbInstance = null;
let authInstance = null;

// Funções modulares do Firestore
let collection = null;
let doc = null;
let getDoc = null;
let getDocs = null;
let setDoc = null;
let updateDoc = null;
let addDoc = null;
let deleteDoc = null;
let query = null;
let where = null;
let orderBy = null;
let limit = null;
let runTransaction = null;
let serverTimestamp = null;
let writeBatch = null;
let Timestamp = null;

// Funções modulares de Autenticação
let signInWithEmailAndPassword = null;
let signOut = null;
let onAuthStateChanged = null;

// Carregamento dinâmico no navegador via CDN oficial do Firebase
if (typeof window !== 'undefined') {
  try {
    const firebaseApp = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
    const firestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const firebaseAuth = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');

    // Mapeamento dos métodos de Firestore
    collection = firestore.collection;
    doc = firestore.doc;
    getDoc = firestore.getDoc;
    getDocs = firestore.getDocs;
    setDoc = firestore.setDoc;
    updateDoc = firestore.updateDoc;
    addDoc = firestore.addDoc;
    deleteDoc = firestore.deleteDoc;
    query = firestore.query;
    where = firestore.where;
    orderBy = firestore.orderBy;
    limit = firestore.limit;
    runTransaction = firestore.runTransaction;
    serverTimestamp = firestore.serverTimestamp;
    writeBatch = firestore.writeBatch;
    Timestamp = firestore.Timestamp;

    // Mapeamento dos métodos de Auth
    signInWithEmailAndPassword = firebaseAuth.signInWithEmailAndPassword;
    signOut = firebaseAuth.signOut;
    onAuthStateChanged = firebaseAuth.onAuthStateChanged;

    if (isFirebaseConfigured()) {
      appInstance = firebaseApp.initializeApp(config.firebaseConfig);
      dbInstance = firestore.getFirestore(appInstance);
      authInstance = firebaseAuth.getAuth(appInstance);
    } else {
      console.info(
        '%c[Firebase]%c Executando em modo de demonstração local com credenciais padrão em config/config.js.',
        'color: #55624d; font-weight: bold;',
        'color: #444841;'
      );
    }
  } catch (error) {
    console.warn(
      '[Firebase] Não foi possível carregar o SDK em nuvem via CDN. Modo de demonstração ativado.',
      error
    );
  }
} else {
  // Em ambiente de testes (CLI/Node), fornece stubs seguros para serverTimestamp e Timestamp
  serverTimestamp = () => new Date().toISOString();
  Timestamp = {
    now: () => ({ toDate: () => new Date(), toMillis: () => Date.now() }),
    fromDate: (d) => ({ toDate: () => d, toMillis: () => d.getTime() })
  };
}

// Exportação das instâncias e dos métodos modulares
export {
  appInstance as app,
  dbInstance as db,
  authInstance as auth,
  // Métodos do Firestore
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp,
  writeBatch,
  Timestamp,
  // Métodos de Autenticação
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
