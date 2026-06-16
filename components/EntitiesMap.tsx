'use client';
// components/EntitiesMap.tsx — mapa Leaflet (carregado só no cliente via dynamic import).
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { openStatus, ENTITY_TYPE_LABELS } from '@/lib/utils';
import type { Entity } from '@/types';

const pin = L.divIcon({
  className: 'map-pin-wrap',
  html: '<span class="map-pin"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -20],
});

export function EntitiesMap({
  entities,
  onSelect,
}: {
  entities: Entity[];
  onSelect: (e: Entity) => void;
}) {
  const pts = entities.filter((e) => typeof e.lat === 'number' && typeof e.lng === 'number');
  return (
    <MapContainer center={[41.5454, -8.4265]} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pts.map((e) => {
        const st = openStatus(e.hours);
        return (
          <Marker key={e.id} position={[e.lat as number, e.lng as number]} icon={pin}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong>{e.name}</strong>
                <div style={{ fontSize: 12, color: '#666' }}>{ENTITY_TYPE_LABELS[e.type]}</div>
                <div style={{ fontSize: 12, marginTop: 4, color: st.open ? '#0d7a3e' : '#999' }}>
                  {st.open ? 'Aberto agora' : 'Fechado'}
                </div>
                <button
                  onClick={() => onSelect(e)}
                  style={{
                    marginTop: 8, background: '#e2001a', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '6px 12px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Ver ficha
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
