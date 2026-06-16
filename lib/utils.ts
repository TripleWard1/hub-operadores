// lib/utils.ts- formatação (pt-PT), horários, janelas de tempo, etiquetas, CSV.

import type {
  Communication,
  CommunicationStatus,
  CommunicationType,
  EntityStatus,
  EntityTag,
  EntityType,
  OpeningHours,
  TimeInterval,
  WeekdayKey,
} from '@/types';

/* ---------- texto / ids ---------- */
export function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}
export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/* ---------- datas ---------- */
const DAY = 86400000;
export function isoOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function todayIso(): string {
  return isoOf(new Date());
}
export function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return isoOf(d);
}
export function formatDate(ts: number | string): string {
  return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(ts));
}
export function formatDateShort(iso: string): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' }).format(new Date(iso + 'T00:00:00'));
}
export function formatWeekday(iso: string): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('pt-PT', { weekday: 'long' }).format(new Date(iso + 'T00:00:00'));
}
export function formatDateRange(start?: string, end?: string): string {
  if (!start) return '';
  if (!end || end === start) return formatDateShort(start);
  return `${formatDateShort(start)} – ${formatDateShort(end)}`;
}
export function timeAgo(ts: number): string {
  const days = Math.floor((Date.now() - ts) / DAY);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'há 1 mês' : `há ${months} meses`;
}

/* ---------- calendário (agenda) ---------- */
const MONTH_NAMES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
export const WEEKDAY_SHORT = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
export function monthLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}
export function monthMatrix(year: number, month: number): { date: Date; inMonth: boolean }[][] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);
  const weeks: { date: Date; inMonth: boolean }[][] = [];
  const cur = new Date(start);
  for (let w = 0; w < 6; w++) {
    const week: { date: Date; inMonth: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({ date: new Date(cur), inMonth: cur.getMonth() === month });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/* ---------- horários / aberto agora ---------- */
export const WEEKDAY_KEYS: WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  mon: 'Segunda', tue: 'Terça', wed: 'Quarta', thu: 'Quinta', fri: 'Sexta', sat: 'Sábado', sun: 'Domingo',
};
export const WEEKDAY_LABELS_SHORT: Record<WeekdayKey, string> = {
  mon: 'Seg', tue: 'Ter', wed: 'Qua', thu: 'Qui', fri: 'Sex', sat: 'Sáb', sun: 'Dom',
};
function weekdayKeyOf(d: Date): WeekdayKey {
  return WEEKDAY_KEYS[(d.getDay() + 6) % 7];
}
function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
export function formatIntervals(intervals: TimeInterval[]): string {
  if (!intervals || intervals.length === 0) return 'Encerrado';
  return intervals.map((i) => `${i.open}–${i.close}`).join(', ');
}
export interface OpenStatus { open: boolean; label: string; }
export function openStatus(hours: OpeningHours, now: Date = new Date()): OpenStatus {
  const key = weekdayKeyOf(now);
  const cur = hhmm(now);
  const today = hours[key] ?? [];
  const active = today.find((i) => i.open <= cur && cur < i.close);
  if (active) return { open: true, label: `Aberto · fecha às ${active.close}` };
  const laterToday = today.filter((i) => i.open > cur).sort((a, b) => a.open.localeCompare(b.open))[0];
  if (laterToday) return { open: false, label: `Fechado · abre às ${laterToday.open}` };
  // próximos dias
  const startIdx = WEEKDAY_KEYS.indexOf(key);
  for (let n = 1; n <= 7; n++) {
    const k = WEEKDAY_KEYS[(startIdx + n) % 7];
    const ints = hours[k] ?? [];
    if (ints.length) {
      const when = n === 1 ? 'amanhã' : WEEKDAY_LABELS_SHORT[k].toLowerCase();
      return { open: false, label: `Fechado · abre ${when} às ${ints[0].open}` };
    }
  }
  return { open: false, label: 'Sem horário definido' };
}
export function hasHours(hours: OpeningHours): boolean {
  return WEEKDAY_KEYS.some((k) => (hours[k] ?? []).length > 0);
}

/* ---------- janelas de tempo (o que há) ---------- */
export function weekendRange(now: Date = new Date()): { start: string; end: string } {
  const day = now.getDay(); // 0 dom .. 6 sáb
  let satOffset: number, sunOffset: number;
  if (day === 0) { satOffset = -1; sunOffset = 0; }
  else if (day === 6) { satOffset = 0; sunOffset = 1; }
  else { satOffset = 6 - day; sunOffset = 7 - day; }
  const base = isoOf(now);
  return { start: addDaysIso(base, satOffset), end: addDaysIso(base, sunOffset) };
}
export function overlapsRange(c: Communication, start: string, end: string): boolean {
  if (!c.dateStart) return false;
  const cEnd = c.dateEnd || c.dateStart;
  return c.dateStart <= end && cEnd >= start;
}
export function communicationOnDay(c: Communication, date: Date): boolean {
  if (!c.dateStart) return false;
  const day = isoOf(date);
  return c.dateStart <= day && day <= (c.dateEnd || c.dateStart);
}
export function isUpcoming(c: Communication): boolean {
  if (!c.dateStart) return false;
  return (c.dateEnd || c.dateStart) >= todayIso();
}

/* ---------- frescura ---------- */
export function isStale(updatedAt: number, days = 90): boolean {
  return Date.now() - updatedAt > days * DAY;
}

/* ---------- etiquetas ---------- */
export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  hotel: 'Hotel / Alojamento',
  restaurante: 'Restaurante',
  museu: 'Museu',
  monumento: 'Monumento',
  associacao: 'Associação',
  espaco: 'Espaço cultural',
  operador: 'Operador turístico',
  comercio: 'Comércio',
  outro: 'Outro',
};
export const ENTITY_TYPE_OPTIONS = (Object.keys(ENTITY_TYPE_LABELS) as EntityType[]).map((value) => ({ value, label: ENTITY_TYPE_LABELS[value] }));
export const ENTITY_TYPE_EMOJI: Record<EntityType, string> = {
  hotel: '🏨', restaurante: '🍽️', museu: '🏛️', monumento: '⛪', associacao: '🤝',
  espaco: '🎭', operador: '🧭', comercio: '🛍️', outro: '📍',
};

export const ENTITY_STATUS_LABELS: Record<EntityStatus, string> = {
  ativa: 'Ativa', pendente: 'Pendente', suspensa: 'Suspensa',
};

export const TAG_LABELS: Record<EntityTag, string> = {
  familia: 'Família', acessivel: 'Acessível', gratis: 'Grátis', arlivre: 'Ar livre',
  interior: 'Interior', estacionamento: 'Estacionamento', animais: 'Aceita animais',
  grupos: 'Grupos', reserva: 'Requer reserva',
};
export const TAG_OPTIONS = (Object.keys(TAG_LABELS) as EntityTag[]).map((value) => ({ value, label: TAG_LABELS[value] }));

export const COMM_TYPE_LABELS: Record<CommunicationType, string> = {
  evento: 'Evento', horario: 'Alteração de horário', novidade: 'Novidade', cartaz: 'Cartaz',
};
export const COMM_TYPE_OPTIONS = (Object.keys(COMM_TYPE_LABELS) as CommunicationType[]).map((value) => ({ value, label: COMM_TYPE_LABELS[value] }));
export const COMM_TYPE_EMOJI: Record<CommunicationType, string> = {
  evento: '🎉', horario: '🕒', novidade: '📣', cartaz: '🖼️',
};

export const COMM_STATUS_LABELS: Record<CommunicationStatus, string> = {
  recebida: 'Recebida', vista: 'Vista', tratada: 'Tratada', arquivada: 'Arquivada',
};
export function commStatusTone(s: CommunicationStatus): string {
  return s === 'recebida' ? 'novo' : s === 'vista' ? 'gold' : s === 'tratada' ? 'aceite' : 'suspenso';
}
export function entityStatusTone(s: EntityStatus): string {
  return s === 'ativa' ? 'ativo' : s === 'pendente' ? 'pendente' : 'suspenso';
}

/* ---------- CSV ---------- */
export function toCSV(rows: Record<string, unknown>[], headers: string[]): string {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = headers.map(esc).join(';');
  const body = rows.map((r) => headers.map((h) => esc(r[h])).join(';')).join('\n');
  return `\uFEFF${head}\n${body}`;
}
export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
