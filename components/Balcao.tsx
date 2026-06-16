'use client';
// components/Balcao.tsx — vista de consulta do posto de turismo.
import { useMemo, useState } from 'react';
import { useData } from '@/lib/data';
import { EntityFiche } from './EntityFiche';
import { Card, EmptyState } from './ui/primitives';
import { Modal } from './ui/Modal';
import { IconSearch } from './ui/Icons';
import {
  COMM_TYPE_EMOJI,
  ENTITY_TYPE_EMOJI,
  ENTITY_TYPE_LABELS,
  TAG_LABELS,
  TAG_OPTIONS,
  formatDateShort,
  normalize,
  openStatus,
  overlapsRange,
  todayIso,
  addDaysIso,
  weekendRange,
} from '@/lib/utils';
import type { Entity, EntityTag } from '@/types';

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
  const [openOnly, setOpenOnly] = useState(false);
  const [tag, setTag] = useState<EntityTag | null>(null);
  const [active, setActive] = useState<Entity | null>(null);

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

  const entities = useMemo(() => {
    return data.entities
      .filter((e) => e.status === 'ativa')
      .filter((e) => (tag ? e.tags.includes(tag) : true))
      .filter((e) => (openOnly ? openStatus(e.hours).open : true))
      .filter((e) => {
        if (!term) return true;
        return normalize(`${e.name} ${ENTITY_TYPE_LABELS[e.type]} ${e.shortDesc} ${e.tags.map((t) => TAG_LABELS[t]).join(' ')}`).includes(term);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data.entities, tag, openOnly, term]);

  return (
    <div className="page page--balcao">
      <div className="balcao-hero">
        <div className="eyebrow">Posto de Turismo · Consulta</div>
        <h1 className="balcao-title">{title}</h1>
        <div className="balcao-search">
          <IconSearch width={20} height={20} />
          <input
            autoFocus
            placeholder="Procura um espaço, evento ou “aberto agora”…"
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
          <button className={`chip chip--toggle ${openOnly ? 'chip--on' : ''}`} onClick={() => setOpenOnly((v) => !v)}>
            ● Aberto agora
          </button>
          {TAG_OPTIONS.slice(0, 5).map((t) => (
            <button
              key={t.value}
              className={`chip chip--toggle ${tag === t.value ? 'chip--on' : ''}`}
              onClick={() => setTag((cur) => (cur === t.value ? null : t.value))}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* O QUE HÁ */}
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
                  <span className="event-card__d">{c.dateStart ? new Date(c.dateStart + 'T00:00:00').getDate() : '—'}</span>
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

      {/* ESPAÇOS E OPERADORES */}
      <section className="mt-4">
        <div className="sec-head">
          <h3>Espaços e operadores</h3>
          <span className="faint text-sm">{entities.length}</span>
        </div>
        {entities.length === 0 ? (
          <Card padLg><EmptyState title="Sem resultados" hint="Limpa os filtros ou a pesquisa." /></Card>
        ) : (
          <div className="grid-cards">
            {entities.map((e) => {
              const st = openStatus(e.hours);
              return (
                <Card key={e.id} hover padLg className="lift entity-card" >
                  <button className="entity-card__btn" onClick={() => setActive(e)}>
                    <div className="row" style={{ gap: 10 }}>
                      <span className="entity-card__emoji">{ENTITY_TYPE_EMOJI[e.type]}</span>
                      <div style={{ minWidth: 0, textAlign: 'left' }}>
                        <div className="fw-700">{e.name}</div>
                        <div className="faint text-xs">{ENTITY_TYPE_LABELS[e.type]}</div>
                      </div>
                    </div>
                    <p className="muted text-sm" style={{ margin: '8px 0 0', textAlign: 'left' }}>{e.shortDesc}</p>
                    <div className={`open-pill ${st.open ? 'open-pill--open' : 'open-pill--closed'}`}>
                      <span className="open-dot" /> {st.open ? 'Aberto agora' : 'Fechado'}
                    </div>
                    {e.alert && <div className="entity-card__alert">⚠️ {e.alert}</div>}
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Modal open={!!active} onClose={() => setActive(null)} title="" wide>
        {active && <EntityFiche entity={active} />}
      </Modal>
    </div>
  );
}
