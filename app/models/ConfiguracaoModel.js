/**
 * Modelo de Domínio: ConfiguracaoModel
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Responsabilidades (FSD Seções 10.3, 11.1, 14.1 RN-06, 20.1-20.3):
 * 1. Leitura dos parâmetros operacionais do evento (prazo limite, chave PIX, mensagem de boas-vindas).
 * 2. Fallback resiliente para as constantes estáticas de config/config.js.
 * 3. Validação e cálculo de encerramento do prazo de confirmação (RN-06).
 * 4. Atualização dinâmica das configurações pela noiva (com persistência no Firestore ou demo storage).
 */

import { config } from '../../config/config.js';
import {
  isFirebaseConfigured,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  demoStore
} from '../utils/firebase.js';
import { logError } from '../utils/logger.js';

const COLECAO = 'configuracoes';
const DOCUMENTO = 'geral';
const STORAGE_DEMO_KEY = '_demo_configuracoes';

export class ConfiguracaoModel {
  /**
   * Obtém as configurações atuais do evento.
   * Se o Firestore estiver ativo, consulta 'configuracoes/geral'.
   * Se ocorrer falha ou o Firebase não estiver configurado, utiliza o fallback de config.js.
   * 
   * @returns {Promise<object>} Configurações consolidadas do evento
   */
  static async obterConfiguracoes() {
    let dadosDinamicos = null;

    // 1. Tenta buscar no Firebase Firestore se as credenciais estiverem ativas
    if (isFirebaseConfigured() && db && doc && getDoc) {
      try {
        const docRef = doc(db, COLECAO, DOCUMENTO);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const raw = snapshot.data();
          dadosDinamicos = {
            dataLimiteConfirmacao: raw.data_limite_confirmacao || config.fallbackDinamicos.dataLimiteConfirmacao,
            chavePix: raw.chave_pix || config.fallbackDinamicos.chavePix,
            mensagemBoasVindas: raw.mensagem_boas_vindas || config.fallbackDinamicos.mensagemBoasVindas,
            atualizadoEm: raw.atualizado_em || null
          };
        }
      } catch (err) {
        logError('ConfiguracaoModel.obterConfiguracoes (Firestore)', err);
      }
    }

    // 2. Se não obtido via nuvem, tenta o armazenamento demo local
    if (!dadosDinamicos) {
      const demoData = demoStore.get(STORAGE_DEMO_KEY);
      if (demoData) {
        dadosDinamicos = {
          dataLimiteConfirmacao: demoData.dataLimiteConfirmacao || config.fallbackDinamicos.dataLimiteConfirmacao,
          chavePix: demoData.chavePix || config.fallbackDinamicos.chavePix,
          mensagemBoasVindas: demoData.mensagemBoasVindas || config.fallbackDinamicos.mensagemBoasVindas,
          atualizadoEm: demoData.atualizadoEm || null
        };
      }
    }

    // 3. Fallback final garantido pelas constantes estáticas (FSD 20.3)
    if (!dadosDinamicos) {
      dadosDinamicos = {
        dataLimiteConfirmacao: config.fallbackDinamicos.dataLimiteConfirmacao,
        chavePix: config.fallbackDinamicos.chavePix,
        mensagemBoasVindas: config.fallbackDinamicos.mensagemBoasVindas,
        atualizadoEm: null
      };
    }

    return {
      dataLimiteConfirmacao: dadosDinamicos.dataLimiteConfirmacao,
      chavePix: dadosDinamicos.chavePix,
      mensagemBoasVindas: dadosDinamicos.mensagemBoasVindas,
      atualizadoEm: dadosDinamicos.atualizadoEm,
      estaExpirado: this.estaExpirado(dadosDinamicos.dataLimiteConfirmacao),
      evento: { ...config.evento },
      paletaCores: [...config.paletaCores]
    };
  }

  /**
   * Verifica se a data e hora limite para confirmações já expirou (RN-06).
   * 
   * @param {string|Date} dataLimite - Data limite em formato ISO ou objeto Date
   * @returns {boolean} true se o prazo encerrou; false se ainda está dentro do prazo
   */
  static estaExpirado(dataLimite) {
    if (!dataLimite) return false;
    const limite = (dataLimite instanceof Date) ? dataLimite : new Date(dataLimite);
    if (isNaN(limite.getTime())) return false;
    return Date.now() > limite.getTime();
  }

  /**
   * Salva as configurações dinâmicas atualizadas pela noiva.
   * 
   * @param {object} params
   * @param {string} params.dataLimiteConfirmacao - Data e hora limite (ISO ou YYYY-MM-DDTHH:mm)
   * @param {string} params.chavePix - Chave PIX da noiva
   * @param {string} params.mensagemBoasVindas - Texto de acolhimento
   * @returns {Promise<object>} Configurações atualizadas
   */
  static async salvarConfiguracoes({ dataLimiteConfirmacao, chavePix, mensagemBoasVindas }) {
    // Validações de integridade
    if (!chavePix || typeof chavePix !== 'string' || chavePix.trim().length === 0) {
      throw new Error('A chave PIX não pode ser vazia.');
    }
    if (!mensagemBoasVindas || typeof mensagemBoasVindas !== 'string' || mensagemBoasVindas.trim().length < 5) {
      throw new Error('A mensagem de boas-vindas deve conter pelo menos 5 caracteres.');
    }
    if (dataLimiteConfirmacao) {
      const d = new Date(dataLimiteConfirmacao);
      if (isNaN(d.getTime())) {
        throw new Error('Formato inválido para a data limite de confirmação.');
      }
    }

    const payload = {
      dataLimiteConfirmacao: dataLimiteConfirmacao ? new Date(dataLimiteConfirmacao).toISOString() : config.fallbackDinamicos.dataLimiteConfirmacao,
      chavePix: chavePix.trim(),
      mensagemBoasVindas: mensagemBoasVindas.trim(),
      atualizadoEm: new Date().toISOString()
    };

    // 1. Grava no Firestore se disponível
    if (isFirebaseConfigured() && db && doc && setDoc) {
      try {
        const docRef = doc(db, COLECAO, DOCUMENTO);
        await setDoc(docRef, {
          data_limite_confirmacao: payload.dataLimiteConfirmacao,
          chave_pix: payload.chavePix,
          mensagem_boas_vindas: payload.mensagemBoasVindas,
          atualizado_em: serverTimestamp ? serverTimestamp() : payload.atualizadoEm
        }, { merge: true });
      } catch (err) {
        logError('ConfiguracaoModel.salvarConfiguracoes (Firestore)', err);
        throw new Error('Falha ao salvar configurações na nuvem. Verifique a conexão.');
      }
    }

    // 2. Persiste sempre no storage demo local para consistência
    demoStore.set(STORAGE_DEMO_KEY, payload);

    return {
      ...payload,
      estaExpirado: this.estaExpirado(payload.dataLimiteConfirmacao)
    };
  }
}
