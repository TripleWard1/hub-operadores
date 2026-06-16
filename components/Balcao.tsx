'use client';
// components/Balcao.tsx - vista "o que há" do posto (eventos por janela de tempo).
import { useMemo, useState } from 'react';
import { useData } from '@/lib/data';
import { Card, EmptyState } from './ui/primitives';
import { IconSearch } from './ui/Icons';
import {
  COMM_TYPE_EMOJI,
  addDaysIso,
  formatDateShort,
  normalize,
  overlapsRange,
  todayIso,
  weekendRange,
} from '@/lib/utils';

type Win = 'hoje' | 'fds' | 'semana' | 'tudo';
const WINDOWS: { value: Win; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'fds', label: 'Fim de semana' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'tudo', label: 'Tudo' },
];

function windowRange(win: Win): { start: string; end: string } {
  const today = todayIso();
  if (win === 'hoje') return { start: today, end: today };
  if (win === 'fds') return weekendRange();
  if (win === 'semana') return { start: today, end: addDaysIso(today, 6) };
  return { start: today, end: '9999-12-31' };
}

export function Balcao({ title = 'O que há em Braga' }: { title?: string }) {
  const { data } = useData();
  const [q, setQ] = useState('');
  const [win, setWin] = useState<Win>('fds');

  const term = normalize(q.trim());
  const nameOf = (id: string) => data.entities.find((e) => e.id === id)?.name ?? '';

  const events = useMemo(() => {
    const { start, end } = windowRange(win);
    return data.communications
      .filter((c) => c.status !== 'arquivada' && overlapsRange(c, start, end))
      .filter((c) => {
        if (!term) return true;
        return normalize(`${c.title} ${c.body} ${c.location ?? ''} ${nameOf(c.entityId)}`).includes(term);
      })
      .sort((a, b) => (a.dateStart || '').localeCompare(b.dateStart || ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.communications, win, term]);

  return (
    <div className="page page--balcao">
      <div className="balcao-hero">
        <div className="eyebrow">Posto de Turismo · O que há</div>
        <h1 className="balcao-title">{title}</h1>
        <div className="balcao-search">
          <IconSearch width={20} height={20} />
          <input
            autoFocus
            placeholder="Procurar um evento, festa, exposição…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="balcao-filters">
          <div className="segmented">
            {WINDOWS.map((w) => (
              <button key={w.value} data-active={win === w.value || undefined} onClick={() => setWin(w.value)}>
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-3">
        <div className="sec-head">
          <h3>O que há {win === 'hoje' ? 'hoje' : win === 'fds' ? 'este fim de semana' : win === 'semana' ? 'esta semana' : ''}</h3>
          <span className="faint text-sm">{events.length} evento(s)</span>
        </div>
        {events.length === 0 ? (
          <Card padLg><EmptyState title="Nada agendado nesta janela" hint="Experimenta “Esta semana” ou “Tudo”." /></Card>
        ) : (
          <div className="grid-cards">
            {events.map((c) => (
              <Card key={c.id} hover padLg className="lift event-card">
                <div className="event-card__date">
                  <span className="event-card__d">{c.dateStart ? new Date(c.dateStart + 'T00:00:00').getDate() : '-'}</span>
                  <span className="event-card__m">{c.dateStart ? formatDateShort(c.dateStart).split(' ')[1] : ''}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="type-chip">{COMM_TYPE_EMOJI[c.type]} {nameOf(c.entityId)}</div>
                  <div className="fw-700 mt-1">{c.title}</div>
                  {c.body && <p className="muted text-sm" style={{ margin: '4px 0 0' }}>{c.body}</p>}
                  <div className="faint text-xs mt-1">
                    {c.timeLabel ? `🕒 ${c.timeLabel}` : ''}{c.location ? ` · 📍 ${c.location}` : ''}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}