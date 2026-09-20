/**
 * Migração: 002_seed_presentes.js
 * Sistema: Convite Digital e Lista de Presentes - Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Finalidade: Carga inicial de itens de utilidade doméstica fina na coleção 'presentes'.
 */

export const id = '002_seed_presentes';
export const description = 'Carga inicial do catálogo de presentes finos de utilidade doméstica';

/**
 * Catálogo pré-definido de presentes para o Chá de Cozinha.
 */
export const catalogoPresentes = [
  { nome: 'Jogo de Panelas Antiaderente (5 Peças)', quantidade: 1 },
  { nome: 'Faqueiro Inox 24 Peças com Estojo', quantidade: 2 },
  { nome: 'Aparelho de Jantar Porcelana Branca 20 Peças', quantidade: 1 },
  { nome: 'Jogo de Taças de Cristal para Vinho (6 Unidades)', quantidade: 2 },
  { nome: 'Jogo de Copos de Cristal para Água (6 Unidades)', quantidade: 2 },
  { nome: 'Conjunto de Assadeiras Refratárias de Vidro (3 Peças)', quantidade: 2 },
  { nome: 'Jogo de Toalhas de Mesa em Linho Rústico', quantidade: 2 },
  { nome: 'Tábua de Madeira Nobre para Servir e Cortar', quantidade: 2 },
  { nome: 'Cafeteira Prensa Francesa em Aço Inox', quantidade: 1 },
  { nome: 'Chaleira Tradicional com Apito em Inox', quantidade: 1 },
  { nome: 'Conjunto de Utensílios de Cozinha em Silicone e Bambu (6 Peças)', quantidade: 2 },
  { nome: 'Liquidificador de Alta Potência com Jarra de Vidro', quantidade: 1 },
  { nome: 'Sanduicheira e Grill Antiaderente', quantidade: 1 },
  { nome: 'Porta-Condimentos Giratório com Potes de Vidro', quantidade: 1 },
  { nome: 'Par de Moedores de Sal e Pimenta em Madeira', quantidade: 2 },
  { nome: 'Escorredor de Louças em Aço Inox com Bandeja', quantidade: 1 },
  { nome: 'Conjunto de Potes Herméticos de Vidro com Tampa de Bambu (4 Peças)', quantidade: 3 },
  { nome: 'Boleira de Vidro com Tampa e Pé', quantidade: 1 },
  { nome: 'Conjunto de Bowls de Cerâmica Artesanal (4 Peças)', quantidade: 2 },
  { nome: 'Jogo de Xícaras de Chá com Pires em Porcelana (6 Unidades)', quantidade: 2 }
];

/**
 * Executa a migração populando a coleção 'presentes'.
 * @param {object} context - Contexto de execução fornecido pelo executor (run.js)
 * @returns {Promise<object>}
 */
export async function up(context) {
  const agora = new Date().toISOString();
  const itensCriados = [];

  for (const item of catalogoPresentes) {
    const docData = {
      nome: item.nome,
      quantidade_total: item.quantidade,
      quantidade_disponivel: item.quantidade,
      ativo: true,
      criado_em: agora
    };

    const docId = await context.addDoc('presentes', docData);
    itensCriados.push({ id: docId, ...docData });
  }

  return {
    documentosCriados: itensCriados.length,
    detalhes: itensCriados
  };
}
