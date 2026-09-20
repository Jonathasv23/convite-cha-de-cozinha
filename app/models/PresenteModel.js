/**
 * Modelo de Domínio: PresenteModel
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsabilidades (FSD Seções 6.2.4, 9.3, 10.1, 11.1, 14.1 RN-01, RN-02, RN-07, 18.1):
 * 1. Listagem de presentes ativos disponíveis para o convidado (quantidade_disponivel > 0 - RN-01).
 * 2. Listagem integral para o painel administrativo da noiva.
 * 3. Reserva com decremento atômico via runTransaction do Firestore para prevenir estoque negativo (RN-02).
 * 4. Cadastro rápido de novos itens domésticos com validações de integridade.
 * 5. Estorno/devolução de estoque (+1) na liberação de desistência (RN-07).
 * 6. Suporte completo a modo demo com catálogo inicial de 20 itens artesanais.
 */

import { catalogoPresentes } from '../../database/migrations/002_seed_presentes.js';
import {
  isFirebaseConfigured,
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
  demoStore
} from '../utils/firebase.js';
import { logError } from '../utils/logger.js';

const COLECAO = 'presentes';
const STORAGE_DEMO_KEY = '_demo_presentes';

/**
 * Retorna os itens padrão para inicialização do catálogo no modo de demonstração local.
 * @returns {Array<object>}
 */
function getCatalogoInicialDemo() {
  return catalogoPresentes.map((item, index) => ({
    id: `demo_pres_${index + 1}`,
    nome: item.nome,
    quantidade_total: item.quantidade,
    quantidade_disponivel: item.quantidade,
    ativo: true,
    criado_em: new Date().toISOString()
  }));
}

/**
 * Lê a lista de presentes do storage demo local.
 * @returns {Array<object>}
 */
function readDemoPresentes() {
  const data = demoStore.get(STORAGE_DEMO_KEY);
  if (Array.isArray(data) && data.length > 0) {
    return data;
  }
  const inicial = getCatalogoInicialDemo();
  demoStore.set(STORAGE_DEMO_KEY, inicial);
  return inicial;
}

/**
 * Salva a lista de presentes no storage demo local.
 * @param {Array<object>} list
 */
function saveDemoPresentes(list) {
  demoStore.set(STORAGE_DEMO_KEY, list);
}

export class PresenteModel {
  /**
   * Lista todos os presentes ativos que possuem estoque disponível (> 0).
   * RN-01: Exclusivo para o dropdown de seleção da página pública de convite.
   * 
   * @returns {Promise<Array<object>>} Lista ordenada de presentes com estoque
   */
  static async listarDisponiveis() {
    if (isFirebaseConfigured() && db && collection && getDocs) {
      try {
        const presentesRef = collection(db, COLECAO);
        const q = query(
          presentesRef,
          where('ativo', '==', true),
          where('quantidade_disponivel', '>', 0),
          orderBy('nome', 'asc')
        );

        const snapshot = await getDocs(q);
        const lista = [];
        snapshot.forEach((d) => {
          lista.push({ id: d.id, ...d.data() });
        });
        return lista;
      } catch (err) {
        logError('PresenteModel.listarDisponiveis (Firestore)', err);
      }
    }

    // Modo Demo / Fallback local
    const demoLista = readDemoPresentes();
    return demoLista
      .filter((p) => p.ativo !== false && p.quantidade_disponivel > 0)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  /**
   * Lista todos os presentes cadastrados e ativos no inventário (inclusive os já esgotados).
   * Utilizado pelo painel administrativo da noiva.
   * 
   * @returns {Promise<Array<object>>}
   */
  static async listarTodos() {
    if (isFirebaseConfigured() && db && collection && getDocs) {
      try {
        const presentesRef = collection(db, COLECAO);
        const q = query(presentesRef, where('ativo', '==', true), orderBy('nome', 'asc'));
        const snapshot = await getDocs(q);
        const lista = [];
        snapshot.forEach((d) => {
          lista.push({ id: d.id, ...d.data() });
        });
        return lista;
      } catch (err) {
        logError('PresenteModel.listarTodos (Firestore)', err);
      }
    }

    // Modo Demo / Fallback
    const demoLista = readDemoPresentes();
    return demoLista
      .filter((p) => p.ativo !== false)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  /**
   * Busca um presente pelo seu ID.
   * @param {string} presenteId
   * @returns {Promise<object|null>}
   */
  static async obterPorId(presenteId) {
    if (!presenteId) return null;

    if (isFirebaseConfigured() && db && doc && getDoc) {
      try {
        const docRef = doc(db, COLECAO, presenteId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() };
        }
        return null;
      } catch (err) {
        logError('PresenteModel.obterPorId (Firestore)', err);
      }
    }

    const demoLista = readDemoPresentes();
    return demoLista.find((p) => p.id === presenteId) || null;
  }

  /**
   * Cadastra um novo presente no catálogo do evento.
   * Validações (FSD 14.2): Nome entre 3 e 80 caracteres; Quantidade entre 1 e 99.
   * 
   * @param {object} params
   * @param {string} params.nome - Nome do item
   * @param {number|string} params.quantidadeTotal - Quantidade total cadastrada
   * @returns {Promise<object>} Presente cadastrado
   */
  static async cadastrarPresente({ nome, quantidadeTotal }) {
    if (!nome || typeof nome !== 'string' || nome.trim().length < 3 || nome.trim().length > 80) {
      throw new Error('O nome do presente deve conter entre 3 e 80 caracteres.');
    }

    const qtd = parseInt(quantidadeTotal, 10);
    if (isNaN(qtd) || qtd < 1 || qtd > 99) {
      throw new Error('A quantidade deve ser um número inteiro positivo entre 1 e 99.');
    }

    const novoItem = {
      nome: nome.trim(),
      quantidade_total: qtd,
      quantidade_disponivel: qtd,
      ativo: true,
      criado_em: new Date().toISOString()
    };

    if (isFirebaseConfigured() && db && collection && addDoc) {
      try {
        const presentesRef = collection(db, COLECAO);
        const docRef = await addDoc(presentesRef, {
          ...novoItem,
          criado_em: serverTimestamp ? serverTimestamp() : novoItem.criado_em
        });
        return { id: docRef.id, ...novoItem };
      } catch (err) {
        logError('PresenteModel.cadastrarPresente (Firestore)', err);
        throw new Error('Não foi possível cadastrar o presente na nuvem.');
      }
    }

    // Modo Demo
    const demoLista = readDemoPresentes();
    const idGerado = `demo_pres_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const presenteCriado = { id: idGerado, ...novoItem };
    demoLista.push(presenteCriado);
    saveDemoPresentes(demoLista);
    return presenteCriado;
  }

  /**
   * Executa a reserva atômica de um presente e grava a confirmação de presença (RN-02).
   * Utiliza runTransaction do Firestore para garantir integridade sob concorrência e evitar estoque negativo.
   * 
   * @param {string} presenteId - ID do item a ser reservado
   * @param {object} dadosConfirmacao - Dados da presença do convidado
   * @param {string} dadosConfirmacao.nomeConvidado - Nome do convidado
   * @param {string} dadosConfirmacao.nomeNormalizado - Nome sanitizado para índice de homônimos
   * @param {string} [dadosConfirmacao.nomePresenteSnapshot] - Nome do item no momento da reserva
   * @returns {Promise<object>} Resultado da reserva e dados da confirmação
   */
  static async reservarPresenteAtomicamente(presenteId, dadosConfirmacao) {
    if (!presenteId) {
      throw new Error('Identificador do presente não informado.');
    }

    const { nomeConvidado, nomeNormalizado, nomePresenteSnapshot } = dadosConfirmacao;
    if (!nomeConvidado || nomeConvidado.trim().length < 2) {
      throw new Error('Nome do convidado inválido para confirmação.');
    }

    // 1. Execução via Firestore Atomic Transaction
    if (isFirebaseConfigured() && db && runTransaction && doc) {
      try {
        const resultado = await runTransaction(db, async (transaction) => {
          const presenteRef = doc(db, COLECAO, presenteId);
          const presenteDoc = await transaction.get(presenteRef);

          if (!presenteDoc.exists()) {
            throw new Error('PRESENTE_NAO_ENCONTRADO');
          }

          const dadosPresente = presenteDoc.data();
          if (dadosPresente.ativo === false) {
            throw new Error('PRESENTE_INATIVO');
          }

          const disponivelAtual = Number(dadosPresente.quantidade_disponivel);
          if (isNaN(disponivelAtual) || disponivelAtual <= 0) {
            const erroEsgotado = new Error('ESGOTADO');
            erroEsgotado.code = 'ESGOTADO';
            throw erroEsgotado;
          }

          const novaQuantidade = disponivelAtual - 1;
          transaction.update(presenteRef, {
            quantidade_disponivel: novaQuantidade
          });

          const confirmacoesRef = collection(db, 'confirmacoes');
          const novaConfirmacaoRef = doc(confirmacoesRef);
          const timestampAtual = serverTimestamp ? serverTimestamp() : new Date().toISOString();

          transaction.set(novaConfirmacaoRef, {
            nome_convidado: nomeConvidado.trim(),
            tipo_escolha: 'presente_item',
            presente_id: presenteId,
            nome_presente_snapshot: nomePresenteSnapshot || dadosPresente.nome,
            criado_em: timestampAtual,
            liberado_em: null
          });

          const indiceRef = doc(db, 'nomes_confirmados', nomeNormalizado);
          transaction.set(indiceRef, {
            nome_original: nomeConvidado.trim(),
            criado_em: timestampAtual
          });

          return {
            confirmacaoId: novaConfirmacaoRef.id,
            presenteId,
            nomePresente: dadosPresente.nome,
            quantidadeRestante: novaQuantidade
          };
        });

        return resultado;
      } catch (err) {
        if (err.code === 'ESGOTADO' || err.message === 'ESGOTADO') {
          throw err;
        }
        logError('PresenteModel.reservarPresenteAtomicamente (Firestore Transaction)', err, {
          presenteId,
          nomeConvidado
        });
        throw err;
      }
    }

    // 2. Execução no Modo Demo Local (simulação atômica com validação e persistência em demoStore)
    const demoLista = readDemoPresentes();
    const index = demoLista.findIndex((p) => p.id === presenteId);

    if (index === -1) {
      throw new Error('PRESENTE_NAO_ENCONTRADO');
    }

    const presente = demoLista[index];
    if (presente.ativo === false) {
      throw new Error('PRESENTE_INATIVO');
    }

    if (presente.quantidade_disponivel <= 0) {
      const err = new Error('ESGOTADO');
      err.code = 'ESGOTADO';
      throw err;
    }

    // Baixa de estoque
    presente.quantidade_disponivel -= 1;
    saveDemoPresentes(demoLista);

    const agora = new Date().toISOString();
    const confirmacaoId = `demo_conf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Grava confirmação demo
    const listaConf = demoStore.get('_demo_confirmacoes', []);
    listaConf.push({
      id: confirmacaoId,
      nome_convidado: nomeConvidado.trim(),
      tipo_escolha: 'presente_item',
      presente_id: presenteId,
      nome_presente_snapshot: nomePresenteSnapshot || presente.nome,
      criado_em: agora,
      liberado_em: null
    });
    demoStore.set('_demo_confirmacoes', listaConf);

    // Grava no índice demo de homônimos
    const nomesDemo = demoStore.get('_demo_nomes_confirmados', {});
    nomesDemo[nomeNormalizado] = {
      nome_original: nomeConvidado.trim(),
      criado_em: agora
    };
    demoStore.set('_demo_nomes_confirmados', nomesDemo);

    return {
      confirmacaoId,
      presenteId,
      nomePresente: presente.nome,
      quantidadeRestante: presente.quantidade_disponivel
    };
  }

  /**
   * Devolve uma unidade (+1) à quantidade disponível do presente (RN-07).
   * Acionado quando a noiva libera o item de um convidado em caso de desistência.
   * 
   * @param {string} presenteId
   * @returns {Promise<boolean>}
   */
  static async devolverEstoque(presenteId) {
    if (!presenteId) return false;

    if (isFirebaseConfigured() && db && runTransaction && doc) {
      try {
        await runTransaction(db, async (transaction) => {
          const presenteRef = doc(db, COLECAO, presenteId);
          const presenteDoc = await transaction.get(presenteRef);

          if (presenteDoc.exists()) {
            const data = presenteDoc.data();
            const disponivelAtual = Number(data.quantidade_disponivel) || 0;
            const total = Number(data.quantidade_total) || (disponivelAtual + 1);

            const novoDisponivel = Math.min(disponivelAtual + 1, total);
            transaction.update(presenteRef, {
              quantidade_disponivel: novoDisponivel
            });
          }
        });
        return true;
      } catch (err) {
        logError('PresenteModel.devolverEstoque (Firestore)', err, { presenteId });
        throw err;
      }
    }

    // Modo Demo
    const demoLista = readDemoPresentes();
    const presente = demoLista.find((p) => p.id === presenteId);
    if (presente) {
      if (presente.quantidade_disponivel < presente.quantidade_total) {
        presente.quantidade_disponivel += 1;
      }
      saveDemoPresentes(demoLista);
      return true;
    }

    return false;
  }

  /**
   * Inativa um presente no catálogo (Soft Delete - FSD 18.1).
   * @param {string} presenteId
   * @returns {Promise<boolean>}
   */
  static async inativarPresente(presenteId) {
    if (!presenteId) return false;

    if (isFirebaseConfigured() && db && doc && updateDoc) {
      try {
        const docRef = doc(db, COLECAO, presenteId);
        await updateDoc(docRef, { ativo: false });
        return true;
      } catch (err) {
        logError('PresenteModel.inativarPresente', err, { presenteId });
        throw err;
      }
    }

    const demoLista = readDemoPresentes();
    const item = demoLista.find((p) => p.id === presenteId);
    if (item) {
      item.ativo = false;
      saveDemoPresentes(demoLista);
      return true;
    }
    return false;
  }
}
