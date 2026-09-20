/**
 * Configuração Geral da Aplicação - Convite Digital Chá de Cozinha
 * Identidade Visual: Botanical Heritage Atelier
 * 
 * Este arquivo contém os parâmetros estruturais do evento e as credenciais
 * públicas de acesso ao Firebase Firestore.
 */

export const config = {
  // Dados Estruturais do Evento
  evento: {
    noivos: 'Hevelyn & Jonathas',
    titulo: 'Chá de Cozinha de Hevelyn & Jonathas',
    subtitulo: 'Um momento de celebração e carinho para preparar o novo lar',
    dataHoraISO: '2026-10-24T16:00:00',
    dataHoraFormatada: 'Sábado, 24 de Outubro de 2026 às 16h00',
    local: 'Espaço Jardim das Camélias',
    enderecoCompleto: 'Rua das Flores, 120 - Jardim Primavera, São Paulo - SP',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Espa%C3%A7o+Jardim+das+Cam%C3%A9lias+Rua+das+Flores+120',
  },

  // Paleta de Cores Sugerida (docs/DESIGN.md)
  paletaCores: [
    { nome: 'Verde Oliva', hex: '#3D4A36', descricao: 'Tom botânico nobre e acolhedor' },
    { nome: 'Verde Sálvia', hex: '#8A9A80', descricao: 'Suavidade natural e leveza' },
    { nome: 'Dourado Champanhe', hex: '#C5A880', descricao: 'Toque delicado e festivo' },
    { nome: 'Marfim Natural', hex: '#F8F7F2', descricao: 'Clássico e aconchegante' },
    { nome: 'Linho Suave', hex: '#D1C7B7', descricao: 'Elegância rústica e atemporal' }
  ],

  // Parâmetros Dinâmicos Padrão (utilizados como fallback caso o Firestore esteja inacessível)
  fallbackDinamicos: {
    dataLimiteConfirmacao: '2026-10-18T23:59:59',
    chavePix: 'hevelyn.jonathas.cha@email.com',
    mensagemBoasVindas: 'É com imensa alegria que convidamos você para compartilhar este momento tão especial conosco. Venha celebrar o amor e o início da nossa nova história!'
  },

  // Segurança e Autenticação Administrativa
  admin: {
    pinMestrePadrao: '2026', // PIN numérico para liberação da visão administrativa
    maxTentativasPin: 5,
    bloqueioMinutos: 5,
  },

  // Identificadores Públicos do Firebase Web SDK v10+
  // Substitua pelos valores do seu projeto no console do Firebase
  firebaseConfig: {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:0000000000000000000000"
  },

  // Credencial Administrativa para Auth Silencioso no Firebase (vinculada ao PIN Mestre)
  adminAuth: {
    email: "admin@convitedigital.local"
  }
};
