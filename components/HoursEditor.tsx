'use client';
// components/HoursEditor.tsx — editor de horário semanal (intervalos por dia).
import { Button } from './ui/primitives';
import { IconPlus, IconTrash } from './ui/Icons';
import { WEEKDAY_KEYS, WEEKDAY_LABELS } from '@/lib/utils';
import type { OpeningHours, TimeInterval, WeekdayKey } from '@/types';

const WORKWEEK: WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri'];

export function HoursEditor({
  value,
  onChange,
}: {
  value: OpeningHours;
  onChange: (h: OpeningHours) => void;
}) {
  const setDay = (k: WeekdayKey, intervals: TimeInterval[]) => onChange({ ...value, [k]: intervals });

  const toggleDay = (k: WeekdayKey) => {
    const has = (value[k] ?? []).length > 0;
    setDay(k, has ? [] : [{ open: '09:00', close: '18:00' }]);
  };
  const setField = (k: WeekdayKey, i: number, field: 'open' | 'close', v: string) => {
    const next = [...(value[k] ?? [])];
    next[i] = { ...next[i], [field]: v };
    setDay(k, next);
  };
  const addInterval = (k: WeekdayKey) => setDay(k, [...(value[k] ?? []), { open: '19:00', close: '23:00' }]);
  const removeInterval = (k: WeekdayKey, i: number) => setDay(k, (value[k] ?? []).filter((_, idx) => idx !== i));

  const applyWorkweek = () => {
    const next = { ...value };
    WORKWEEK.forEach((k) => (next[k] = [{ open: '09:00', close: '18:00' }]));
    onChange(next);
  };
  const clearAll = () => {
    const next = {} as OpeningHours;
    WEEKDAY_KEYS.forEach((k) => (next[k] = []));
    onChange(next);
  };

  return (
    <div className="hours-editor">
      <div className="row" style={{ gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <Button type="button" size="sm" variant="subtle" onClick={applyWorkweek}>Dias úteis 09:00–18:00</Button>
        <Button type="button" size="sm" variant="ghost" onClick={clearAll}>Limpar tudo</Button>
      </div>
      {WEEKDAY_KEYS.map((k) => {
        const intervals = value[k] ?? [];
        const open = intervals.length > 0;
        return (
          <div key={k} className="hours-editor__row">
            <label className="hours-editor__day">
              <input type="checkbox" checked={open} onChange={() => toggleDay(k)} />
              {WEEKDAY_LABELS[k]}
            </label>
            <div className="hours-editor__intervals">
              {!open && <span className="faint text-sm">Encerrado</span>}
              {intervals.map((iv, i) => (
                <div key={i} className="hours-editor__interval">
                  <input type="time" className="input input--time" value={iv.open} onChange={(e) => setField(k, i, 'open', e.target.value)} />
                  <span className="faint">–</span>
                  <input type="time" className="input input--time" value={iv.close} onChange={(e) => setField(k, i, 'close', e.target.value)} />
                  <button type="button" className="icon-btn" onClick={() => removeInterval(k, i)} aria-label="Remover">
                    <IconTrash width={15} height={15} />
                  </button>
                </div>
              ))}
              {open && (
                <button type="button" className="link-btn" onClick={() => addInterval(k)}>
                  <IconPlus width={13} height={13} /> intervalo
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
