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
    dataHoraISO: '2026-10-10T14:30:00',
    dataHoraFormatada: 'Sábado, 10 de Outubro de 2026 às 14:30',
    local: 'Espaço Jardim das Camélias',
    enderecoCompleto: 'Rua das Flores, 120 - Jardim Primavera, São Paulo - SP',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Espa%C3%A7o+Jardim+das+Cam%C3%A9lias+Rua+das+Flores+120',
  },

  // Paleta de Cores Sugerida (docs/DESIGN.md)
  paletaCores: [
    { nome: 'Branco', hex: '#FFFFFF', descricao: 'Luminoso, puro e atemporal' },
    { nome: 'Preto', hex: '#1A1A1A', descricao: 'Moderno, marcante e sofisticado' },
    { nome: 'Inox', hex: '#9DA3A6', background: 'linear-gradient(135deg, #B5B9BC 0%, #FFFFFF 30%, #9DA3A8 55%, #E2E5E8 85%, #8C9298 100%)', descricao: 'Aço escovado e contemporâneo' },
    { nome: 'Cinza', hex: '#6B7075', descricao: 'Neutro nobre, versátil e equilibrado' },
    { nome: 'Bege', hex: '#E8D5BF', descricao: 'Aconchegante, suave e natural' }
  ],

  // Parâmetros Dinâmicos Padrão (utilizados como fallback caso o Firestore esteja inacessível)
  fallbackDinamicos: {
    dataLimiteConfirmacao: '2026-10-04T23:59:59',
    chavePix: 'hevelyn.jonathas.cha@email.com',
    mensagemBoasVindas: 'É com imensa alegria que convidamos você para compartilhar este momento tão especial conosco. Venha celebrar o amor e o início da nossa nova história!'
  },

  // Segurança e Autenticação Administrativa
  admin: {
    pinMestrePadrao: '0523', // PIN numérico padrão para liberação da visão administrativa
    maxTentativasPin: 5,
    bloqueioMinutos: 5,
  },

  // Identificadores Públicos do Firebase Web SDK v10+
  // Insira as chaves do seu projeto Firebase Spark antes do deploy
  firebaseConfig: {
    apiKey: "FIREBASE_API_KEY_PLACEHOLDER",
    authDomain: "cha-de-cozinha-helena-gabriel.firebaseapp.com",
    projectId: "cha-de-cozinha-helena-gabriel",
    storageBucket: "cha-de-cozinha-helena-gabriel.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
  },

  // Credencial Administrativa para Auth Silencioso no Firebase (vinculada ao painel)
  // NOTA DE SEGURANÇA: O Firebase Authentication exige senhas com no mínimo 6 caracteres.
  // Cadastre exatamente este mesmo e-mail e senha no console do Firebase (Authentication -> Users).
  adminAuth: {
    email: "admin@convitedigital.local",
    password: "admin_cha_2026"
  }
};
