/**
 * Modelo de Domínio: ConfirmacaoModel
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsabilidades (FSD Seções 6.1.3, 6.1.4, 6.2.2, 6.2.5, 9.2, 10.2, 10.5, 11.1, 14.1 RN-03, RN-04, RN-05, RN-07, RN-08):
 * 1. Sanitização e normalização de nomes para o índice de homônimos (RN-05).
 * 2. Validação amigável de homônimos em estrita conformidade com a LGPD (busca pontual por chave em 'nomes_confirmados').
 * 3. Persistência de confirmações nas 3 modalidades (presente_item, pix_surpresa, apenas_presenca).
 * 4. Listagem integral de confirmações para a visão administrativa da noiva.
 * 5. Liberação/estorno de presentes físicos devolvendo o item ao estoque (RN-07).
 * 6. Consolidação em tempo real dos contadores do dashboard (RN-08).
 */

import { PresenteModel } from './PresenteModel.js';
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
  orderBy,
  serverTimestamp,
  demoStore
} from '../utils/firebase.js';
import { logError } from '../utils/logger.js';

const COLECAO_CONFIRMACOES = 'confirmacoes';
const COLECAO_NOMES = 'nomes_confirmados';
const STORAGE_DEMO_CONFIRMACOES = '_demo_confirmacoes';
const STORAGE_DEMO_NOMES = '_demo_nomes_confirmados';

/**
 * Normaliza um nome para chave de índice: minúsculas, sem acentos e espaços substituídos por hífens.
 * Exemplo: " Maria de Fátima Silva " -> "maria-de-fatima-silva"
 * 
 * @param {string} nome
 * @returns {string}
 */
export function normalizarNome(nome) {
  if (!nome || typeof nome !== 'string') return '';
  return nome
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentuação
    .replace(/[^a-z0-9]+/g, '-')     // converte caracteres especiais e espaços em hífen
    .replace(/^-+|-+$/g, '');        // remove hífens das extremidades
}

export class ConfirmacaoModel {
  /**
   * Normaliza um nome de convidado para indexação segura.
   * @param {string} nome
   * @returns {string}
   */
  static normalizarNome(nome) {
    return normalizarNome(nome);
  }

  /**
   * Valida amigavelmente se já existe alguém confirmado com o nome informado (RN-05).
   * 
   * SEGURANÇA & LGPD (FSD Seção 6.1.4):
   * Para não violar a privacidade dos convidados nem permitir raspagem (scraping),
   * a consulta é estritamente pontual via getDoc() na chave específica de 'nomes_confirmados'.
   * O sistema JAMAIS lista ou pesquisa abertamente na coleção 'confirmacoes'.
   * 
   * @param {string} nome - Nome informado no formulário
   * @returns {Promise<{existe: boolean, nomeNormalizado: string, nomeOriginal?: string}>}
   */
  static async verificarHomonimo(nome) {
    const nomeNormalizado = normalizarNome(nome);
    if (!nomeNormalizado || nomeNormalizado.length < 2) {
      return { existe: false, nomeNormalizado: '' };
    }

    // 1. Consulta no Firestore se configurado
    if (isFirebaseConfigured() && db && doc && getDoc) {
      try {
        const docRef = doc(db, COLECAO_NOMES, nomeNormalizado);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          return {
            existe: true,
            nomeNormalizado,
            nomeOriginal: data.nome_original || nome.trim()
          };
        }
        return { existe: false, nomeNormalizado };
      } catch (err) {
        logError('ConfirmacaoModel.verificarHomonimo (Firestore)', err, { nomeNormalizado });
        return { existe: false, nomeNormalizado };
      }
    }

    // 2. Consulta no Storage Demo Local
    const demoNomes = demoStore.get(STORAGE_DEMO_NOMES, {});
    if (demoNomes && demoNomes[nomeNormalizado]) {
      return {
        existe: true,
        nomeNormalizado,
        nomeOriginal: demoNomes[nomeNormalizado].nome_original || nome.trim()
      };
    }

    return { existe: false, nomeNormalizado };
  }

  /**
   * Registra a confirmação de presença do convidado.
   * Suporta as 3 opções do FSD:
   * - 'presente_item': com decremento atômico de estoque via PresenteModel (RN-02).
   * - 'pix_surpresa': sem alteração de estoque físico (RN-04).
   * - 'apenas_presenca': sem alteração de estoque físico (RN-03).
   * 
   * @param {object} params
   * @param {string} params.nomeConvidado - Nome completo do convidado
   * @param {'presente_item'|'pix_surpresa'|'apenas_presenca'} params.tipoEscolha - Modalidade
   * @param {string|null} [params.presenteId] - ID do item (obrigatório se tipoEscolha === 'presente_item')
   * @param {string|null} [params.nomePresenteSnapshot] - Snapshot do nome do presente
   * @returns {Promise<object>} Dados da confirmação criada
   */
  static async confirmarPresenca({
    nomeConvidado,
    tipoEscolha,
    presenteId = null,
    nomePresenteSnapshot = null
  }) {
    // 1. Validação de dados do convidado
    if (!nomeConvidado || typeof nomeConvidado !== 'string' || nomeConvidado.trim().length < 2) {
      throw new Error('Por favor, informe seu nome completo com pelo menos 2 caracteres.');
    }
    if (nomeConvidado.trim().length > 100) {
      throw new Error('O nome do convidado não pode ultrapassar 100 caracteres.');
    }

    const modalidadesValidas = ['presente_item', 'pix_surpresa', 'apenas_presenca'];
    if (!modalidadesValidas.includes(tipoEscolha)) {
      throw new Error('Modalidade de confirmação inválida.');
    }

    const nomeHigienizado = nomeConvidado.trim().replace(/\s+/g, ' ');
    const nomeNorm = normalizarNome(nomeHigienizado);

    // 2. Se a escolha for presente físico, delega à transação atômica
    if (tipoEscolha === 'presente_item') {
      if (!presenteId) {
        throw new Error('Por favor, selecione um presente da lista.');
      }

      const resultadoReserva = await PresenteModel.reservarPresenteAtomicamente(presenteId, {
        nomeConvidado: nomeHigienizado,
        nomeNormalizado: nomeNorm,
        nomePresenteSnapshot
      });

      return {
        ...resultadoReserva,
        nomeConvidado: nomeHigienizado,
        tipoEscolha
      };
    }

    // 3. Para PIX ou Apenas Presença, grava diretamente
    const agora = new Date().toISOString();
    const dadosGravacao = {
      nome_convidado: nomeHigienizado,
      tipo_escolha: tipoEscolha,
      presente_id: null,
      nome_presente_snapshot: null,
      criado_em: agora,
      liberado_em: null
    };

    if (isFirebaseConfigured() && db && collection && addDoc && doc && setDoc) {
      try {
        const confirmacoesRef = collection(db, COLECAO_CONFIRMACOES);
        const docRef = await addDoc(confirmacoesRef, {
          ...dadosGravacao,
          criado_em: serverTimestamp ? serverTimestamp() : agora
        });

        // Atualiza o índice leve de homônimos
        const indiceRef = doc(db, COLECAO_NOMES, nomeNorm);
        await setDoc(indiceRef, {
          nome_original: nomeHigienizado,
          criado_em: serverTimestamp ? serverTimestamp() : agora
        });

        return {
          confirmacaoId: docRef.id,
          nomeConvidado: nomeHigienizado,
          tipoEscolha
        };
      } catch (err) {
        logError('ConfirmacaoModel.confirmarPresenca (Firestore)', err, {
          nomeConvidado: nomeHigienizado,
          tipoEscolha
        });
        throw new Error('Não foi possível salvar sua confirmação. Por favor, tente novamente.');
      }
    }

    // 4. Modo Demo Local
    const confirmacaoId = `demo_conf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const listaDemo = demoStore.get(STORAGE_DEMO_CONFIRMACOES, []);
    listaDemo.push({ id: confirmacaoId, ...dadosGravacao });
    demoStore.set(STORAGE_DEMO_CONFIRMACOES, listaDemo);

    const nomesDemo = demoStore.get(STORAGE_DEMO_NOMES, {});
    nomesDemo[nomeNorm] = {
      nome_original: nomeHigienizado,
      criado_em: agora
    };
    demoStore.set(STORAGE_DEMO_NOMES, nomesDemo);

    return {
      confirmacaoId,
      nomeConvidado: nomeHigienizado,
      tipoEscolha
    };
  }

  /**
   * Lista todas as confirmações de convidados para o painel administrativo da noiva.
   * 
   * @returns {Promise<Array<object>>} Lista ordenada de confirmações por data decrescente
   */
  static async listarConfirmacoes() {
    if (isFirebaseConfigured() && db && collection && getDocs) {
      try {
        const confirmacoesRef = collection(db, COLECAO_CONFIRMACOES);
        const q = query(confirmacoesRef, orderBy('criado_em', 'desc'));
        const snapshot = await getDocs(q);

        const lista = [];
        snapshot.forEach((d) => {
          lista.push({ id: d.id, ...d.data() });
        });
        return lista;
      } catch (err) {
        logError('ConfirmacaoModel.listarConfirmacoes (Firestore)', err);
      }
    }

    // Modo Demo
    const demoLista = demoStore.get(STORAGE_DEMO_CONFIRMACOES, []);
    return [...demoLista].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
  }

  /**
   * Libera o presente físico associado à confirmação de um convidado em caso de desistência (RN-07).
   * Altera a escolha para 'apenas_presenca', registra a data em 'liberado_em' e devolve +1 unidade ao estoque.
   * 
   * @param {string} confirmacaoId - ID da confirmação
   * @param {string} presenteId - ID do item a ser devolvido
   * @returns {Promise<boolean>}
   */
  static async liberarPresente(confirmacaoId, presenteId) {
    if (!confirmacaoId) {
      throw new Error('ID da confirmação não informado.');
    }

    const agora = new Date().toISOString();

    // 1. Atualização no Firestore se ativo
    if (isFirebaseConfigured() && db && doc && updateDoc) {
      try {
        const confRef = doc(db, COLECAO_CONFIRMACOES, confirmacaoId);
        await updateDoc(confRef, {
          tipo_escolha: 'apenas_presenca',
          presente_id: null,
          liberado_em: serverTimestamp ? serverTimestamp() : agora
        });

        if (presenteId) {
          await PresenteModel.devolverEstoque(presenteId);
        }

        return true;
      } catch (err) {
        logError('ConfirmacaoModel.liberarPresente (Firestore)', err, { confirmacaoId, presenteId });
        throw new Error('Falha ao liberar presente na nuvem.');
      }
    }

    // 2. Modo Demo Local
    const demoLista = demoStore.get(STORAGE_DEMO_CONFIRMACOES, []);
    const conf = demoLista.find((c) => c.id === confirmacaoId);
    if (conf) {
      conf.tipo_escolha = 'apenas_presenca';
      conf.presente_id = null;
      conf.liberado_em = agora;
      demoStore.set(STORAGE_DEMO_CONFIRMACOES, demoLista);

      if (presenteId) {
        await PresenteModel.devolverEstoque(presenteId);
      }
      return true;
    }

    return false;
  }

  /**
   * Consolida as métricas operacionais para o dashboard da noiva (RN-08).
   * - Total Confirmados: soma de todas as confirmações.
   * - Total Presentes: presenças com 'presente_item' + 'pix_surpresa'.
   * - Presentes Disponíveis: soma de 'quantidade_disponivel' dos presentes ativos.
   * - Total Apenas Presença: presenças com 'apenas_presenca'.
   * 
   * @returns {Promise<object>}
   */
  static async obterMetricas() {
    const confirmacoes = await this.listarConfirmacoes();
    const todosPresentes = await PresenteModel.listarTodos();

    let totalConfirmados = confirmacoes.length;
    let totalPresentes = 0;
    let totalApenasPresenca = 0;

    confirmacoes.forEach((c) => {
      if (c.tipo_escolha === 'presente_item' || c.tipo_escolha === 'pix_surpresa') {
        totalPresentes++;
      } else if (c.tipo_escolha === 'apenas_presenca') {
        totalApenasPresenca++;
      }
    });

    let presentesDisponiveis = 0;
    todosPresentes.forEach((p) => {
      if (p.ativo !== false && Number(p.quantidade_disponivel) > 0) {
        presentesDisponiveis += Number(p.quantidade_disponivel);
      }
    });

    return {
      totalConfirmados,
      totalPresentes,
      presentesDisponiveis,
      totalApenasPresenca
    };
  }
}
