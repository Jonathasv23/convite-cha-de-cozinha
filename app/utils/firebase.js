/**
 * Módulo de Integração com Firebase Web SDK v10+ (Modular)
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsável por inicializar a conexão com Firebase Firestore e Firebase Auth
 * utilizando exclusivamente a distribuição modular oficial via CDN (sem bundlers).
 */

import { config } from '../../config/config.js';

// Importações dos módulos oficiais do Firebase SDK v10+ via CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
  getFirestore,
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
  Timestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

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

// Instâncias encapsuladas
let appInstance = null;
let dbInstance = null;
let authInstance = null;

try {
  if (isFirebaseConfigured()) {
    appInstance = initializeApp(config.firebaseConfig);
    dbInstance = getFirestore(appInstance);
    authInstance = getAuth(appInstance);
  } else {
    console.info(
      '%c[Firebase]%c Executando em modo de demonstração local com credenciais padrão em config/config.js.',
      'color: #55624d; font-weight: bold;',
      'color: #444841;'
    );
  }
} catch (error) {
  console.warn(
    '[Firebase] Não foi possível inicializar a conexão em nuvem. Os dados serão geridos com base nos fallbacks configurados.',
    error
  );
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
