'use client';
// components/MapaEntidades.tsx — mapa + lista das entidades, com ficha ao clicar.
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useData } from '@/lib/data';
import { EntityFiche } from './EntityFiche';
import { Card, EmptyState, Loading } from './ui/primitives';
import { Modal } from './ui/Modal';
import { ENTITY_TYPE_EMOJI, ENTITY_TYPE_LABELS, openStatus } from '@/lib/utils';
import type { Entity } from '@/types';

const EntitiesMap = dynamic(() => import('./EntitiesMap').then((m) => m.EntitiesMap), {
  ssr: false,
  loading: () => <Loading label="A carregar mapa…" />,
});

export function MapaEntidades() {
  const { data } = useData();
  const [active, setActive] = useState<Entity | null>(null);

  const entities = useMemo(
    () => data.entities.filter((e) => e.status === 'ativa').sort((a, b) => a.name.localeCompare(b.name)),
    [data.entities],
  );
  const withCoords = entities.filter((e) => typeof e.lat === 'number');

  return (
    <div className="page">
      <div className="page__head">
        <div className="eyebrow">Posto de Turismo</div>
        <h1 className="page__title">Mapa</h1>
        <p className="page__subtitle">Onde fica cada espaço e operador — para mostrar ao turista.</p>
      </div>

      <div className="map-layout mt-2">
        <Card className="map-wrap" padLg={false}>
          {withCoords.length === 0 ? (
            <EmptyState title="Sem localizações" hint="Nenhuma entidade tem coordenadas definidas." />
          ) : (
            <EntitiesMap entities={withCoords} onSelect={setActive} />
          )}
        </Card>

        <div className="map-list">
          {entities.map((e) => {
            const st = openStatus(e.hours);
            return (
              <Card key={e.id} hover className="lift map-list__item" style={{ cursor: 'pointer' }}>
                <button className="map-list__btn" onClick={() => setActive(e)}>
                  <span className="entity-card__emoji">{ENTITY_TYPE_EMOJI[e.type]}</span>
                  <div style={{ minWidth: 0, textAlign: 'left' }}>
                    <div className="fw-700 text-sm">{e.name}</div>
                    <div className="faint text-xs">{ENTITY_TYPE_LABELS[e.type]}</div>
                    <div className={`open-pill ${st.open ? 'open-pill--open' : 'open-pill--closed'}`} style={{ marginTop: 6 }}>
                      <span className="open-dot" /> {st.open ? 'Aberto' : 'Fechado'}
                    </div>
                  </div>
                </button>
              </Card>
            );
          })}
        </div>
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title="" wide>
        {active && <EntityFiche entity={active} />}
      </Modal>
    </div>
  );
}
