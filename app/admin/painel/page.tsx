'use client';
// app/admin/painel/page.tsx- Indicadores da Divisão de Turismo.
import Link from 'next/link';
import { useData } from '@/lib/data';
import { Badge, Card, EmptyState, StatTile } from '@/components/ui/primitives';
import { SkeletonStats } from '@/components/ui/Skeleton';
import { IconInbox, IconUsers, IconCalendar, IconClock } from '@/components/ui/Icons';
import {
  COMM_TYPE_EMOJI,
  COMM_TYPE_OPTIONS,
  ENTITY_TYPE_EMOJI,
  ENTITY_TYPE_LABELS,
  formatDateRange,
  isStale,
  isUpcoming,
  isoOf,
  timeAgo,
} from '@/lib/utils';

export default function IndicadoresAdmin() {
  const { data, ready } = useData();

  if (!ready) {
    return (
      <div className="page">
        <div className="page__head"><div className="eyebrow">Divisão de Turismo</div><h1 className="page__title">Indicadores</h1></div>
        <SkeletonStats />
      </div>
    );
  }

  const { communications, entities } = data;
  const nameOf = (id: string) => entities.find((e) => e.id === id)?.name ?? '—';

  const porTratar = communications.filter((c) => c.status === 'recebida');
  const ativas = entities.filter((e) => e.status === 'ativa').length;
  const pendentes = entities.filter((e) => e.status === 'pendente');
  const desatualizadas = entities.filter((e) => isStale(e.updatedAt));

  const weekEnd = isoOf(new Date(Date.now() + 7 * 86400000));
  const today = isoOf(new Date());
  const estaSemana = communications.filter((c) => c.dateStart && c.dateStart >= today && c.dateStart <= weekEnd).length;

  const byType = COMM_TYPE_OPTIONS.map((o) => ({
    label: o.label, emoji: COMM_TYPE_EMOJI[o.value],
    count: communications.filter((c) => c.type === o.value).length,
  }));
  const maxType = Math.max(1, ...byType.map((b) => b.count));

  const proximos = communications.filter(isUpcoming)
    .sort((a, b) => (a.dateStart || '').localeCompare(b.dateStart || '')).slice(0, 4);

  return (
    <div className="page">
      <div className="page__head">
        <div className="eyebrow">Divisão de Turismo</div>
        <h1 className="page__title">Indicadores</h1>
        <p className="page__subtitle">A saúde do registo e o pulso do que há na cidade.</p>
      </div>

      <div className="stat-grid mt-2">
        <StatTile label="Por tratar" value={porTratar.length} icon={<IconInbox width={15} height={15} />} />
        <StatTile label="Eventos esta semana" value={estaSemana} icon={<IconCalendar width={15} height={15} />} />
        <StatTile label="Entidades ativas" value={ativas} delta={pendentes.length ? `${pendentes.length} pendentes` : undefined} icon={<IconUsers width={15} height={15} />} />
        <StatTile label="Fichas desatualizadas" value={desatualizadas.length} icon={<IconClock width={15} height={15} />} />
      </div>

      <div className="grid-2 mt-3">
        <Card padLg>
          <div className="sec-head">
            <h3>Registo a precisar de atenção</h3>
            <Link href="/admin/registo" className="gold text-sm">Registo →</Link>
          </div>
          {pendentes.length === 0 && desatualizadas.length === 0 ? (
            <EmptyState title="Registo em dia 🎉" hint="Nada pendente e tudo atualizado." />
          ) : (
            <div>
              {pendentes.map((e) => (
                <div key={e.id} className="row-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="row" style={{ gap: 8, minWidth: 0 }}>
                    <span>{ENTITY_TYPE_EMOJI[e.type]}</span>
                    <div><div className="fw-600 text-sm">{e.name}</div><div className="faint text-xs">{ENTITY_TYPE_LABELS[e.type]}</div></div>
                  </div>
                  <Badge tone="pendente">A aprovar</Badge>
                </div>
              ))}
              {desatualizadas.slice(0, 5).map((e) => (
                <div key={e.id} className="row-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="row" style={{ gap: 8, minWidth: 0 }}>
                    <span>{ENTITY_TYPE_EMOJI[e.type]}</span>
                    <div><div className="fw-600 text-sm">{e.name}</div><div className="faint text-xs">Atualizada {timeAgo(e.updatedAt)}</div></div>
                  </div>
                  <Badge tone="suspenso">Desatualizada</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padLg>
          <div className="sec-head">
            <h3>Próximos eventos</h3>
            <Link href="/admin/agenda" className="gold text-sm">Agenda →</Link>
          </div>
          {proximos.length === 0 ? (
            <EmptyState title="Sem eventos futuros" />
          ) : (
            <div>
              {proximos.map((c) => (
                <div key={c.id} className="row-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-600 text-sm">{COMM_TYPE_EMOJI[c.type]} {c.title}</div>
                    <div className="faint text-xs">{nameOf(c.entityId)} · {formatDateRange(c.dateStart, c.dateEnd)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card padLg className="mt-3">
        <div className="card__title">Comunicações por tipo</div>
        <div className="mt-2">
          {byType.map((b) => (
            <div key={b.label} style={{ marginBottom: 12 }}>
              <div className="row-between text-sm"><span>{b.emoji} {b.label}</span><span className="faint">{b.count}</span></div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, marginTop: 4 }}>
                <div style={{ width: `${(b.count / maxType) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
