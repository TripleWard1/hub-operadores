// lib/seed.ts — dados de demonstração: entidades de Braga (fictícias) + o que há.

import type { Communication, Entity, OpeningHours, User } from '@/types';

const DAY = 86400000;
const ago = (d: number) => Date.now() - d * DAY;
const iso = (d: number) => new Date(Date.now() + d * DAY).toISOString().slice(0, 10);

const H = (...days: (string | null)[]): OpeningHours => {
  // days: 7 strings "open-close" ou "open-close|open-close" ou null (encerrado), seg→dom
  const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
  const parse = (s: string | null) =>
    !s ? [] : s.split('|').map((p) => { const [open, close] = p.split('-'); return { open, close }; });
  const out = {} as OpeningHours;
  keys.forEach((k, i) => (out[k] = parse(days[i])));
  return out;
};

export const seedUsers: User[] = [
  { id: 'u-entidade', email: 'operador@visitbraga.pt', name: 'Hotel Colina do Bom Jesus', role: 'entidade', entityId: 'ent-hotel' },
  { id: 'u-admin', email: 'admin@visitbraga.pt', name: 'Divisão de Turismo — CM Braga', role: 'admin' },
  { id: 'u-balcao', email: 'posto@visitbraga.pt', name: 'Posto de Turismo', role: 'balcao' },
];

export const seedEntities: Entity[] = [
  {
    id: 'ent-hotel', name: 'Hotel Colina do Bom Jesus', type: 'hotel', status: 'ativa',
    email: 'geral@colinabomjesus.pt', phone: '+351 253 000 100', website: 'https://exemplo.pt/colina',
    social: { instagram: '@colinabomjesus' },
    address: 'Bom Jesus do Monte, Braga', lat: 41.5547, lng: -8.3776,
    shortDesc: 'Hotel de charme junto ao Santuário do Bom Jesus, com spa e restaurante panorâmico.',
    description: 'Hotel de quatro estrelas no alto do Bom Jesus, com vista sobre a cidade, spa, piscina interior e restaurante aberto ao público.',
    goodToKnow: 'O restaurante e o spa estão abertos a não hóspedes mediante reserva. Estacionamento gratuito.',
    tags: ['familia', 'estacionamento', 'reserva', 'grupos'],
    hours: H('00:00-23:59', '00:00-23:59', '00:00-23:59', '00:00-23:59', '00:00-23:59', '00:00-23:59', '00:00-23:59'),
    imageUrl: 'https://picsum.photos/seed/colina/800/500',
    createdAt: ago(120), updatedAt: ago(3),
  },
  {
    id: 'ent-restaurante', name: 'Restaurante Sabores do Minho', type: 'restaurante', status: 'ativa',
    email: 'reservas@saboresdominho.pt', phone: '+351 253 000 400', website: '',
    social: { instagram: '@saboresdominho' },
    address: 'Rua do Souto, Braga', lat: 41.5503, lng: -8.4255,
    shortDesc: 'Cozinha tradicional minhota no centro histórico.',
    description: 'Restaurante familiar com pratos regionais — bacalhau à minhota, rojões, arroz de pato. Esplanada no verão.',
    goodToKnow: 'Recomenda-se reserva ao fim de semana. Menu vegetariano disponível.',
    tags: ['familia', 'reserva', 'grupos'],
    hours: H('12:00-15:00', '12:00-15:00|19:00-23:00', '12:00-15:00|19:00-23:00', '12:00-15:00|19:00-23:00', '12:00-15:00|19:00-23:30', '12:00-15:30|19:00-23:30', '12:00-15:30'),
    imageUrl: 'https://picsum.photos/seed/sabores/800/500',
    createdAt: ago(90), updatedAt: ago(20),
  },
  {
    id: 'ent-museu', name: 'Museu da Cidade de Braga', type: 'museu', status: 'ativa',
    email: 'museu@exemplo.pt', phone: '+351 253 000 300', website: 'https://exemplo.pt/museucidade',
    social: { facebook: 'museudacidadebraga' },
    address: 'Centro Histórico, Braga', lat: 41.5489, lng: -8.4271,
    shortDesc: 'Coleções sobre a história de Braga, da Bracara Augusta à atualidade.',
    description: 'Museu municipal com exposição permanente e mostras temporárias. Visitas guiadas para grupos mediante marcação.',
    goodToKnow: 'Entrada gratuita aos domingos de manhã. Acessível a pessoas com mobilidade reduzida.',
    tags: ['familia', 'acessivel', 'gratis', 'interior', 'grupos'],
    hours: H(null, '10:00-18:00', '10:00-18:00', '10:00-18:00', '10:00-18:00', '10:00-18:00', '10:00-13:00'),
    imageUrl: 'https://picsum.photos/seed/museubraga/800/500',
    createdAt: ago(80), updatedAt: ago(8),
  },
  {
    id: 'ent-espaco', name: 'Espaço Cultural Carandá', type: 'espaco', status: 'ativa',
    email: 'programacao@caranda.pt', phone: '+351 253 000 200', website: 'https://exemplo.pt/caranda',
    social: { instagram: '@espacocaranda', facebook: 'espacocaranda' },
    address: 'Mercado Cultural do Carandá, Braga', lat: 41.5536, lng: -8.4179,
    shortDesc: 'Concertos, feiras e exposições no antigo mercado.',
    description: 'Espaço polivalente para programação cultural — música, mercados de produtores, exposições e festas.',
    goodToKnow: 'A bilheteira abre uma hora antes de cada espetáculo. Bar no local.',
    tags: ['familia', 'interior', 'grupos'],
    hours: H(null, null, '15:00-23:00', '15:00-23:00', '15:00-00:00', '10:00-00:00', '10:00-20:00'),
    imageUrl: 'https://picsum.photos/seed/caranda/800/500',
    createdAt: ago(95), updatedAt: ago(40),
    alert: 'Entrada poente encerrada por obras — usar entrada principal.', alertUntil: iso(25),
  },
  {
    id: 'ent-operador', name: 'Braga a Pé — Visitas Guiadas', type: 'operador', status: 'ativa',
    email: 'marcacoes@bragaape.pt', phone: '+351 253 000 600', website: 'https://exemplo.pt/bragaape',
    social: { instagram: '@bragaape' },
    address: 'Praça da República, Braga', lat: 41.5499, lng: -8.4258,
    shortDesc: 'Passeios a pé pelo centro histórico, com guias locais.',
    description: 'Visitas guiadas temáticas (centro histórico, Braga romana, baroco) em português, inglês e espanhol. Saídas diárias.',
    goodToKnow: 'Ponto de encontro na Praça da República. Visitas em PT/EN/ES. Marcação até 2h antes.',
    tags: ['familia', 'arlivre', 'reserva', 'grupos'],
    hours: H('09:00-18:00', '09:00-18:00', '09:00-18:00', '09:00-18:00', '09:00-18:00', '09:00-18:00', null),
    imageUrl: 'https://picsum.photos/seed/bragaape/800/500',
    createdAt: ago(60), updatedAt: ago(120), // desatualizada de propósito
  },
  {
    id: 'ent-associacao', name: 'Associação Cultural Braga Viva', type: 'associacao', status: 'pendente',
    email: 'geral@bragaviva.pt', phone: '+351 253 000 500', website: '',
    social: {},
    address: 'São Vicente, Braga', lat: 41.5557, lng: -8.4203,
    shortDesc: 'Marchas populares, festas de bairro e atividades de rua.',
    description: 'Coletividade que organiza marchas, arraiais e iniciativas culturais de bairro.',
    goodToKnow: 'Atividades sobretudo ao ar livre e gratuitas.',
    tags: ['familia', 'arlivre', 'gratis'],
    hours: H(null, null, null, null, '18:00-22:00', '15:00-23:00', null),
    createdAt: ago(6), updatedAt: ago(6),
  },
];

export const seedCommunications: Communication[] = [
  {
    id: 'com-1', entityId: 'ent-espaco', type: 'evento',
    title: 'Festival de Outono', body: 'Concertos, mercado de produtores e atividades para famílias. Entrada livre.',
    imageUrl: 'https://picsum.photos/seed/festival/600/400', location: 'Mercado Cultural do Carandá',
    link: 'https://exemplo.pt/festival', dateStart: iso(weekendIn(0)), dateEnd: iso(weekendIn(1)),
    timeLabel: '15h00', status: 'recebida', pinned: true, createdAt: ago(1),
  },
  {
    id: 'com-2', entityId: 'ent-espaco', type: 'evento',
    title: 'Noite de Fado', body: 'Concerto íntimo de fado com artistas locais.',
    location: 'Auditório do Carandá', dateStart: iso(weekendIn(1)), timeLabel: '21h30',
    status: 'recebida', createdAt: ago(1),
  },
  {
    id: 'com-3', entityId: 'ent-museu', type: 'evento',
    title: 'Visita guiada noturna', body: 'Visita encenada às coleções, à luz de velas. Lotação limitada.',
    location: 'Museu da Cidade de Braga', link: 'https://exemplo.pt/noturna',
    dateStart: iso(2), timeLabel: '21h00', status: 'vista', createdAt: ago(2),
  },
  {
    id: 'com-4', entityId: 'ent-associacao', type: 'evento',
    title: 'Marcha Popular de São Vicente', body: 'Marcha pelas ruas do bairro, com música e trajes tradicionais.',
    location: 'Bairro de São Vicente', dateStart: iso(weekendIn(0)), timeLabel: '17h00',
    status: 'recebida', createdAt: ago(0),
  },
  {
    id: 'com-5', entityId: 'ent-restaurante', type: 'novidade',
    title: 'Novo menu de inverno', body: 'Pratos de caça e sobremesas regionais já disponíveis.',
    status: 'tratada', reply: 'Obrigado pela atualização! Já consta na ficha.', repliedAt: ago(5), createdAt: ago(9),
  },
  {
    id: 'com-6', entityId: 'ent-hotel', type: 'horario',
    title: 'Restaurante passa a servir jantares até às 23h', body: 'A partir deste mês, jantares até às 23h todos os dias.',
    dateStart: iso(0), status: 'vista', responsavel: 'Equipa de Turismo', createdAt: ago(4),
  },
  {
    id: 'com-7', entityId: 'ent-operador', type: 'evento',
    title: 'Passeio «Braga Romana»', body: 'Visita guiada temática à Bracara Augusta. PT/EN/ES.',
    location: 'Praça da República', dateStart: iso(3), dateEnd: iso(3), timeLabel: '10h00',
    status: 'recebida', createdAt: ago(1),
  },
  {
    id: 'com-8', entityId: 'ent-museu', type: 'cartaz',
    title: 'Exposição «Braga ao Longo dos Séculos»', body: 'Cartaz da nova exposição temporária.',
    imageUrl: 'https://picsum.photos/seed/expo/600/800', dateStart: iso(1), dateEnd: iso(40),
    status: 'recebida', createdAt: ago(2),
  },
];

// Próximo sábado (offset 0) / domingo (offset 1) em dias a partir de hoje.
function weekendIn(which: 0 | 1): number {
  const now = new Date();
  const day = now.getDay();
  let sat: number, sun: number;
  if (day === 0) { sat = -1; sun = 0; }
  else if (day === 6) { sat = 0; sun = 1; }
  else { sat = 6 - day; sun = 7 - day; }
  return which === 0 ? sat : sun;
}
