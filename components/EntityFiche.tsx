'use client';
// components/EntityFiche.tsx- a ficha-resposta do balcão para uma entidade.
import { useData } from '@/lib/data';
import { IconPhone, IconGlobe, IconMapPin, IconClock } from './ui/Icons';
import {
  COMM_TYPE_EMOJI,
  ENTITY_TYPE_EMOJI,
  ENTITY_TYPE_LABELS,
  TAG_LABELS,
  WEEKDAY_KEYS,
  WEEKDAY_LABELS,
  formatDateRange,
  formatIntervals,
  isUpcoming,
  openStatus,
} from '@/lib/utils';
import type { Entity, WeekdayKey } from '@/types';

function todayKey(): WeekdayKey {
  return WEEKDAY_KEYS[(new Date().getDay() + 6) % 7];
}

export function EntityFiche({ entity }: { entity: Entity }) {
  const { data } = useData();
  const status = openStatus(entity.hours);
  const today = todayKey();
  const whatson = data.communications
    .filter((c) => c.entityId === entity.id && c.dateStart && isUpcoming(c))
    .sort((a, b) => (a.dateStart || '').localeCompare(b.dateStart || ''))
    .slice(0, 4);

  const mapsUrl = entity.lat
    ? `https://www.google.com/maps/search/?api=1&query=${entity.lat},${entity.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entity.address)}`;

  return (
    <div className="fiche">
      {entity.imageUrl && (
        <div className="fiche__cover" style={{ backgroundImage: `url(${entity.imageUrl})` }} />
      )}

      <div className="fiche__head">
        <span className="fiche__emoji">{ENTITY_TYPE_EMOJI[entity.type]}</span>
        <div style={{ minWidth: 0 }}>
          <h2 className="fiche__name">{entity.name}</h2>
          <div className="faint text-sm">{ENTITY_TYPE_LABELS[entity.type]}</div>
        </div>
      </div>

      <div className={`open-badge ${status.open ? 'open-badge--open' : 'open-badge--closed'}`}>
        <span className="open-dot" />
        {status.label}
      </div>

      {entity.alert && (
        <div className="fiche__alert">
          ⚠️ {entity.alert}
          {entity.alertUntil ? ` (até ${formatDateRange(entity.alertUntil)})` : ''}
        </div>
      )}

      {entity.shortDesc && <p className="fiche__short">{entity.shortDesc}</p>}

      {entity.tags.length > 0 && (
        <div className="chip-row" style={{ marginTop: 10 }}>
          {entity.tags.map((t) => (
            <span key={t} className="chip">{TAG_LABELS[t]}</span>
          ))}
        </div>
      )}

      <div className="fiche__grid">
        <div>
          <div className="fiche__label"><IconClock width={14} height={14} /> Horário</div>
          <table className="hours">
            <tbody>
              {WEEKDAY_KEYS.map((k) => (
                <tr key={k} className={k === today ? 'hours__today' : ''}>
                  <td className="hours__day">{WEEKDAY_LABELS[k]}</td>
                  <td className="hours__time">{formatIntervals(entity.hours[k] ?? [])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="fiche__label">Contactos</div>
          <div className="fiche__contacts">
            {entity.phone && (
              <a href={`tel:${entity.phone.replace(/\s/g, '')}`} className="fiche__contact">
                <IconPhone width={15} height={15} /> {entity.phone}
              </a>
            )}
            {entity.website && (
              <a href={entity.website} target="_blank" rel="noreferrer" className="fiche__contact">
                <IconGlobe width={15} height={15} /> Site
              </a>
            )}
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="fiche__contact">
              <IconMapPin width={15} height={15} /> {entity.address}
            </a>
          </div>

          {entity.goodToKnow && (
            <>
              <div className="fiche__label" style={{ marginTop: 14 }}>Bom saber</div>
              <p className="text-sm" style={{ margin: '4px 0 0', lineHeight: 1.5 }}>{entity.goodToKnow}</p>
            </>
          )}
        </div>
      </div>

      {whatson.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="fiche__label">O que há aqui</div>
          {whatson.map((c) => (
            <div key={c.id} className="fiche__event">
              <span>{COMM_TYPE_EMOJI[c.type]}</span>
              <div style={{ minWidth: 0 }}>
                <span className="fw-600 text-sm">{c.title}</span>
                <span className="faint text-xs">
                  {' '}· {formatDateRange(c.dateStart, c.dateEnd)}{c.timeLabel ? `, ${c.timeLabel}` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
