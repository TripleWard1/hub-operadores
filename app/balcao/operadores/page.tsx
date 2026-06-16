'use client';
// app/balcao/operadores/page.tsx - diretório de operadores e espaços (posto).
import { useMemo, useState } from 'react';
import { useData } from '@/lib/data';
import { EntityFiche } from '@/components/EntityFiche';
import { Card, EmptyState } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/Modal';
import { IconSearch } from '@/components/ui/Icons';
import {
  ENTITY_TYPE_EMOJI,
  ENTITY_TYPE_LABELS,
  ENTITY_TYPE_OPTIONS,
  TAG_LABELS,
  TAG_OPTIONS,
  normalize,
  openStatus,
} from '@/lib/utils';
import type { Entity, EntityTag } from '@/types';

export default function OperadoresPosto() {
  const { data } = useData();
  const [q, setQ] = useState('');
  const [type, setType] = useState('todos');
  const [tag, setTag] = useState<EntityTag | null>(null);
  const [openOnly, setOpenOnly] = useState(false);
  const [active, setActive] = useState<Entity | null>(null);

  const term = normalize(q.trim());
  const list = useMemo(
    () =>
      data.entities
        .filter((e) => e.status === 'ativa')
        .filter((e) => (type === 'todos' ? true : e.type === type))
        .filter((e) => (tag ? e.tags.includes(tag) : true))
        .filter((e) => (openOnly ? openStatus(e.hours).open : true))
        .filter((e) =>
          !term
            ? true
            : normalize(
                `${e.name} ${ENTITY_TYPE_LABELS[e.type]} ${e.shortDesc} ${e.address} ${e.tags
                  .map((t) => TAG_LABELS[t])
                  .join(' ')}`,
              ).includes(term),
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [data.entities, type, tag, openOnly, term],
  );

  return (
    <div className="page">
      <div className="page__head">
        <div className="eyebrow">Posto de Turismo</div>
        <h1 className="page__title">Operadores e espaços</h1>
        <p className="page__subtitle">Toda a informação de cada espaço da cidade, num só sítio.</p>
      </div>

      <div className="toolbar mt-2 wrap">
        <div className="search">
          <IconSearch width={16} height={16} />
          <input className="input" placeholder="Procurar por nome, tipo, morada…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="select" value={type} onChange={(e) => setType(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="todos">Todos os tipos</option>
          {ENTITY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button className={`chip chip--toggle ${openOnly ? 'chip--on' : ''}`} onClick={() => setOpenOnly((v) => !v)}>● Aberto agora</button>
      </div>

      <div className="chip-row mt-2">
        {TAG_OPTIONS.map((t) => (
          <button
            key={t.value}
            className={`chip chip--toggle ${tag === t.value ? 'chip--on' : ''}`}
            onClick={() => setTag((c) => (c === t.value ? null : t.value))}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="row-between mt-3" style={{ marginBottom: 4 }}>
        <span className="faint text-sm">{list.length} resultado(s)</span>
      </div>

      {list.length === 0 ? (
        <Card padLg><EmptyState title="Sem resultados" hint="Limpa os filtros ou a pesquisa." /></Card>
      ) : (
        <div className="grid-cards">
          {list.map((e) => {
            const st = openStatus(e.hours);
            return (
              <Card key={e.id} hover padLg className="lift entity-card">
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

      <Modal open={!!active} onClose={() => setActive(null)} title="" wide>
        {active && <EntityFiche entity={active} />}
      </Modal>
    </div>
  );
}