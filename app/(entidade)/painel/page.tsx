'use client';
// app/(entidade)/painel/page.tsx- resumo da entidade.
import Link from 'next/link';
import { useData } from '@/lib/data';
import { useCurrentEntity } from '@/lib/useEntity';
import { Badge, Button, Card, EmptyState, StatTile } from '@/components/ui/primitives';
import { SkeletonStats } from '@/components/ui/Skeleton';
import { IconInbox, IconSend, IconCheck } from '@/components/ui/Icons';
import { COMM_STATUS_LABELS, COMM_TYPE_EMOJI, COMM_TYPE_LABELS, commStatusTone, isStale, openStatus, timeAgo } from '@/lib/utils';

export default function PainelEntidade() {
  const { data, ready } = useData();
  const entity = useCurrentEntity();

  if (!ready || !entity) {
    return (
      <div className="page">
        <div className="page__head"><h1 className="page__title">Painel</h1></div>
        <SkeletonStats count={3} />
      </div>
    );
  }

  const mine = data.communications.filter((c) => c.entityId === entity.id);
  const porTratar = mine.filter((c) => c.status === 'recebida' || c.status === 'vista').length;
  const respondidas = mine.filter((c) => c.reply).length;
  const recent = mine.slice(0, 5);

  // completude do perfil
  const fields = [entity.email, entity.phone, entity.website, entity.address, entity.description];
  const filled = fields.filter(Boolean).length;
  const incomplete = filled < fields.length;

  return (
    <div className="page">
      <div className="page__head row-between wrap">
        <div>
          <div className="eyebrow">Bem-vindo</div>
          <h1 className="page__title">{entity.name}</h1>
          <p className="page__subtitle">Resumo da tua ficha e comunicações.</p>
          <div className="row mt-1" style={{ gap: 8 }}>
            <span className={`open-pill ${openStatus(entity.hours).open ? 'open-pill--open' : 'open-pill--closed'}`} style={{ marginTop: 0 }}>
              <span className="open-dot" /> {openStatus(entity.hours).open ? 'Aberto agora' : 'Fechado agora'}
            </span>
            <Badge tone={isStale(entity.updatedAt) ? 'pendente' : 'ativo'}>Ficha atualizada {timeAgo(entity.updatedAt)}</Badge>
          </div>
        </div>
        <Link href="/comunicacoes"><Button><IconSend width={16} height={16} /> Nova comunicação</Button></Link>
      </div>

      {incomplete && (
        <Card className="mt-2" style={{ borderColor: 'rgba(226,0,26,0.25)' }}>
          <div className="row-between wrap">
            <span className="text-sm">A tua ficha está incompleta- completa-a para o posto responder bem ao turista.</span>
            <Link href="/ficha" className="gold text-sm fw-600">Completar a ficha →</Link>
          </div>
        </Card>
      )}

      <div className="stat-grid mt-2">
        <StatTile label="Enviadas" value={mine.length} icon={<IconSend width={15} height={15} />} />
        <StatTile label="Em curso" value={porTratar} icon={<IconInbox width={15} height={15} />} />
        <StatTile label="Com resposta" value={respondidas} icon={<IconCheck width={15} height={15} />} />
      </div>

      <Card padLg className="mt-3">
        <div className="card__title">Comunicações recentes</div>
        {recent.length === 0 ? (
          <EmptyState
            title="Ainda não enviaste comunicações"
            hint="Comunica horários, eventos, cartazes ou novidades à Divisão de Turismo."
            action={<Link href="/comunicacoes"><Button variant="ghost">Criar a primeira</Button></Link>}
          />
        ) : (
          <div className="mt-2">
            {recent.map((c) => (
              <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="row-between">
                  <div className="row" style={{ gap: 8, minWidth: 0 }}>
                    <span>{COMM_TYPE_EMOJI[c.type]}</span>
                    <div>
                      <div className="fw-600 text-sm">{c.title}</div>
                      <div className="faint text-xs">{COMM_TYPE_LABELS[c.type]} · {timeAgo(c.createdAt)}</div>
                    </div>
                  </div>
                  <Badge tone={commStatusTone(c.status)}>{COMM_STATUS_LABELS[c.status]}</Badge>
                </div>
                {c.reply && (
                  <div className="reply-box" style={{ marginTop: 8 }}>
                    <div className="reply-box__label">Resposta da divisão</div>
                    <p className="text-sm" style={{ margin: '4px 0 0' }}>{c.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
