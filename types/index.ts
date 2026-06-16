// types/index.ts
// Hub do Balcão — Visit Braga.
// Fonte de verdade interna do posto de turismo: o que há na cidade + ficha sempre
// atual de cada operador/espaço, mantida pelas próprias entidades.

export type Role = 'entidade' | 'admin' | 'balcao';

export type EntityType =
  | 'hotel'
  | 'restaurante'
  | 'museu'
  | 'monumento'
  | 'associacao'
  | 'espaco'
  | 'operador'
  | 'comercio'
  | 'outro';

export type EntityStatus = 'ativa' | 'pendente' | 'suspensa';

/** Etiquetas úteis ao balcão para responder ao turista. */
export type EntityTag =
  | 'familia'
  | 'acessivel'
  | 'gratis'
  | 'arlivre'
  | 'interior'
  | 'estacionamento'
  | 'animais'
  | 'grupos'
  | 'reserva';

export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface TimeInterval {
  open: string; // "HH:MM"
  close: string; // "HH:MM"
}

/** Horário semanal: para cada dia, 0+ intervalos (vazio = encerrado). */
export type OpeningHours = Record<WeekdayKey, TimeInterval[]>;

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  entityId?: string;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  status: EntityStatus;

  // contactos
  email: string;
  phone: string;
  website: string;
  social: { instagram?: string; facebook?: string };

  // localização
  address: string;
  lat?: number;
  lng?: number;

  // o que o balcão precisa
  shortDesc: string; // uma linha para ler ao turista
  description: string; // descrição completa
  goodToKnow: string; // "bom saber" (dicas, preços, acessos)
  tags: EntityTag[];
  hours: OpeningHours;

  // aviso temporário (ex.: "encerrado para obras")
  alert?: string;
  alertUntil?: string; // ISO date

  // multimédia
  imageUrl?: string;

  // gestão / frescura
  createdAt: number;
  updatedAt: number; // última atualização da ficha pela entidade
}

export type CommunicationType = 'evento' | 'horario' | 'novidade' | 'cartaz';
export type CommunicationStatus = 'recebida' | 'vista' | 'tratada' | 'arquivada';

/** "O que há": eventos e atualizações que as entidades comunicam. */
export interface Communication {
  id: string;
  entityId: string;
  type: CommunicationType;
  title: string;
  body: string;
  imageUrl?: string;
  link?: string;
  location?: string;
  dateStart?: string; // ISO date
  dateEnd?: string; // ISO date
  timeLabel?: string; // ex.: "21h00"
  status: CommunicationStatus;
  responsavel?: string;
  reply?: string;
  repliedAt?: number;
  adminNote?: string;
  pinned?: boolean;
  createdAt: number;
}

export const EMPTY_HOURS: OpeningHours = {
  mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [],
};
