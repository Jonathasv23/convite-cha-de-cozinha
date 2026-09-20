/**
 * Migração: 001_initial_schema.js
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Finalidade: Inicializar o documento 'configuracoes/geral' com os parâmetros
 * operacionais do evento (prazo limite, chave PIX e mensagem de acolhimento).
 */

import { config } from '../../config/config.js';

export const id = '001_initial_schema';
export const description = 'Inicialização dos parâmetros operacionais padrão em configuracoes/geral';

/**
 * Executa a migração.
 * @param {object} context - Contexto de execução fornecido pelo executor (run.js)
 * @returns {Promise<object>}
 */
export async function up(context) {
  const agora = new Date().toISOString();

  const dadosConfiguracao = {
    data_limite_confirmacao: config.fallbackDinamicos.dataLimiteConfirmacao,
    chave_pix: config.fallbackDinamicos.chavePix,
    mensagem_boas_vindas: config.fallbackDinamicos.mensagemBoasVindas,
    atualizado_em: agora
  };

  // Grava o documento único configuracoes/geral
  await context.setDoc('configuracoes', 'geral', dadosConfiguracao);

  return {
    documentosCriados: 1,
    detalhes: [
      {
        colecao: 'configuracoes',
        documento: 'geral',
        dados: dadosConfiguracao
      }
    ]
  };
}
