'use client';
// app/admin/agenda/page.tsx — agenda da cidade (apoio ao balcão).
import { useMemo, useState } from 'react';
import { useData } from '@/lib/data';
import { Button, Card, EmptyState } from '@/components/ui/primitives';
import { IconChevron, IconDownload } from '@/components/ui/Icons';
import {
  COMM_TYPE_EMOJI,
  WEEKDAY_SHORT,
  communicationOnDay,
  downloadCSV,
  formatDateRange,
  formatWeekday,
  isUpcoming,
  isoOf,
  monthLabel,
  monthMatrix,
  toCSV,
} from '@/lib/utils';

export default function AgendaAdmin() {
  const { data } = useData();
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState<string>(isoOf(now));

  const events = useMemo(
    () => data.communications.filter((c) => c.dateStart && c.status !== 'arquivada'),
    [data.communications],
  );
  const nameOf = (id: string) => data.entities.find((e) => e.id === id)?.name ?? '';
  const matrix = monthMatrix(cursor.y, cursor.m);

  const dayEvents = events
    .filter((c) => communicationOnDay(c, new Date(selected + 'T00:00:00')))
    .sort((a, b) => (a.timeLabel || '').localeCompare(b.timeLabel || ''));

  const upcoming = events
    .filter(isUpcoming)
    .sort((a, b) => (a.dateStart || '').localeCompare(b.dateStart || ''))
    .slice(0, 30);

  const move = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  const exportCSV = () => {
    const rows = upcoming.map((c) => ({
      data: formatDateRange(c.dateStart, c.dateEnd), hora: c.timeLabel ?? '',
      titulo: c.title, entidade: nameOf(c.entityId), local: c.location ?? '', tipo: c.type,
    }));
    downloadCSV('agenda-braga.csv', toCSV(rows, ['data', 'hora', 'titulo', 'entidade', 'local', 'tipo']));
  };

  return (
    <div className="page">
      <div className="page__head row-between wrap">
        <div>
          <div className="eyebrow">Divisão de Turismo</div>
          <h1 className="page__title">Agenda</h1>
          <p className="page__subtitle">Visão de calendário do que há na cidade.</p>
        </div>
        <Button variant="subtle" onClick={exportCSV}><IconDownload width={16} height={16} /> Exportar CSV</Button>
      </div>

      <div className="agenda-layout mt-2">
        <Card padLg>
          <div className="row-between" style={{ marginBottom: 12 }}>
            <button className="icon-btn" onClick={() => move(-1)} aria-label="Mês anterior"><IconChevron width={18} height={18} style={{ transform: 'rotate(180deg)' }} /></button>
            <div className="fw-700" style={{ textTransform: 'capitalize' }}>{monthLabel(cursor.y, cursor.m)}</div>
            <button className="icon-btn" onClick={() => move(1)} aria-label="Mês seguinte"><IconChevron width={18} height={18} /></button>
          </div>
          <div className="cal">
            <div className="cal__head">{WEEKDAY_SHORT.map((d, i) => <span key={i}>{d}</span>)}</div>
            <div className="cal__grid">
              {matrix.flat().map(({ date, inMonth }, i) => {
                const iso = isoOf(date);
                const count = events.filter((c) => communicationOnDay(c, date)).length;
                const today = iso === isoOf(now);
                return (
                  <button
                    key={i}
                    className={`cal__cell ${!inMonth ? 'cal__cell--out' : ''} ${today ? 'cal__cell--today' : ''}`}
                    onClick={() => setSelected(iso)}
                    style={selected === iso ? { outline: '2px solid var(--accent)', outlineOffset: '-2px' } : undefined}
                  >
                    <span className="cal__num">{date.getDate()}</span>
                    {count > 0 && <span className="cal__event">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <div>
          <div className="sec-head"><h3 style={{ textTransform: 'capitalize' }}>{formatWeekday(selected)}, {formatDateRange(selected)}</h3></div>
          {dayEvents.length === 0 ? (
            <Card padLg><EmptyState title="Nada neste dia" hint="Escolhe outro dia no calendário." /></Card>
          ) : (
            dayEvents.map((c) => (
              <Card key={c.id} padLg hover className="mt-2 lift">
                <div className="type-chip">{COMM_TYPE_EMOJI[c.type]} {nameOf(c.entityId)}</div>
                <div className="fw-700 mt-1">{c.title}</div>
                <div className="faint text-xs mt-1">{c.timeLabel ? `🕒 ${c.timeLabel}` : ''}{c.location ? ` · 📍 ${c.location}` : ''}</div>
              </Card>
            ))
          )}

          <div className="sec-head mt-4"><h3>Próximos</h3><span className="faint text-sm">{upcoming.length}</span></div>
          {upcoming.map((c) => (
            <div key={c.id} className="agenda-item">
              <div className="agenda-item__date">
                <span className="fw-700 text-sm">{c.dateStart ? new Date(c.dateStart + 'T00:00:00').getDate() : ''}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="fw-600 text-sm">{c.title}</div>
                <div className="faint text-xs">{formatDateRange(c.dateStart, c.dateEnd)}{c.timeLabel ? ` · ${c.timeLabel}` : ''} · {nameOf(c.entityId)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
