'use client';
// app/admin/comunicacoes/page.tsx- registo do que há (entrada da divisão).
import { useMemo, useState } from 'react';
import { useData } from '@/lib/data';
import { useToast } from '@/lib/toast';
import { Badge, Button, Card, EmptyState } from '@/components/ui/primitives';
import { SkeletonCards } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { IconSearch } from '@/components/ui/Icons';
import {
  COMM_STATUS_LABELS,
  COMM_TYPE_EMOJI,
  COMM_TYPE_LABELS,
  COMM_TYPE_OPTIONS,
  commStatusTone,
  formatDateRange,
  normalize,
  timeAgo,
} from '@/lib/utils';
import type { Communication, CommunicationStatus } from '@/types';

const STATUS_TABS: { value: 'todas' | CommunicationStatus; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'recebida', label: 'Por tratar' },
  { value: 'vista', label: 'Vistas' },
  { value: 'tratada', label: 'Tratadas' },
  { value: 'arquivada', label: 'Arquivadas' },
];

export default function ComunicacoesAdmin() {
  const { data, ready, updateCommunication } = useData();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'todas' | CommunicationStatus>('recebida');
  const [type, setType] = useState('todos');
  const [manage, setManage] = useState<Communication | null>(null);
  const [reply, setReply] = useState('');
  const [resp, setResp] = useState('');

  const nameOf = (id: string) => data.entities.find((e) => e.id === id)?.name ?? 'Entidade';
  const term = normalize(q.trim());

  const list = useMemo(() => {
    return data.communications
      .filter((c) => (status === 'todas' ? c.status !== 'arquivada' : c.status === status))
      .filter((c) => (type === 'todos' ? true : c.type === type))
      .filter((c) => (!term ? true : normalize(`${c.title} ${c.body} ${nameOf(c.entityId)}`).includes(term)))
      .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.createdAt - a.createdAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.communications, status, type, term]);

  const openManage = (c: Communication) => {
    setManage(c);
    setReply(c.reply ?? '');
    setResp(c.responsavel ?? '');
    if (c.status === 'recebida') updateCommunication(c.id, { status: 'vista' });
  };

  const sendReply = () => {
    if (!manage) return;
    updateCommunication(manage.id, {
      reply: reply.trim() || undefined,
      repliedAt: reply.trim() ? Date.now() : undefined,
      responsavel: resp.trim() || undefined,
      status: reply.trim() ? 'tratada' : manage.status,
    });
    toast('Resposta guardada.');
    setManage(null);
  };

  const setStatusOf = (c: Communication, s: CommunicationStatus) => {
    updateCommunication(c.id, { status: s });
    toast(`Marcada como ${COMM_STATUS_LABELS[s].toLowerCase()}.`);
  };
  const togglePin = (c: Communication) => updateCommunication(c.id, { pinned: !c.pinned });

  const novas = data.communications.filter((c) => c.status === 'recebida').length;

  if (!ready) return <div className="page"><div className="page__head"><h1 className="page__title">Comunicações</h1></div><SkeletonCards count={4} /></div>;

  return (
    <div className="page">
      <div className="page__head">
        <div className="eyebrow">Divisão de Turismo</div>
        <h1 className="page__title">Comunicações</h1>
        <p className="page__subtitle">O que as entidades comunicam- {novas} por tratar.</p>
      </div>

      <div className="segmented mt-2">
        {STATUS_TABS.map((t) => (
          <button key={t.value} data-active={status === t.value || undefined} onClick={() => setStatus(t.value)}>{t.label}</button>
        ))}
      </div>

      <div className="toolbar mt-2 wrap">
        <div className="search">
          <IconSearch width={16} height={16} />
          <input className="input" placeholder="Procurar…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="select" value={type} onChange={(e) => setType(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="todos">Todos os tipos</option>
          {COMM_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <Card padLg className="mt-2"><EmptyState title="Nada por aqui" hint="Sem comunicações neste filtro." /></Card>
      ) : (
        <div className="grid-cards mt-2">
          {list.map((c) => (
            <Card key={c.id} padLg hover className="lift">
              <div className="row-between">
                <span className="type-chip">{COMM_TYPE_EMOJI[c.type]} {nameOf(c.entityId)}</span>
                <div className="row" style={{ gap: 6 }}>
                  {c.pinned && <Badge tone="gold">Fixada</Badge>}
                  <Badge tone={commStatusTone(c.status)}>{COMM_STATUS_LABELS[c.status]}</Badge>
                </div>
              </div>
              <div className="fw-700 mt-2">{c.title}</div>
              {c.body && <p className="muted text-sm" style={{ margin: '6px 0 0' }}>{c.body}</p>}
              {(c.dateStart || c.location) && (
                <div className="faint text-xs mt-2">
                  {c.dateStart ? `📅 ${formatDateRange(c.dateStart, c.dateEnd)}` : ''}
                  {c.timeLabel ? ` · ${c.timeLabel}` : ''}{c.location ? ` · 📍 ${c.location}` : ''}
                </div>
              )}
              {c.reply && (
                <div className="reply-box">
                  <div className="reply-box__label">Resposta {c.responsavel ? `· ${c.responsavel}` : ''}</div>
                  <p className="text-sm" style={{ margin: '4px 0 0' }}>{c.reply}</p>
                </div>
              )}
              <div className="row-between mt-3 wrap" style={{ gap: 8 }}>
                <span className="faint text-xs">Recebida {timeAgo(c.createdAt)}</span>
                <div className="row" style={{ gap: 6 }}>
                  <Button size="sm" variant="ghost" onClick={() => togglePin(c)}>{c.pinned ? 'Desafixar' : 'Fixar'}</Button>
                  {c.status !== 'arquivada' && <Button size="sm" variant="ghost" onClick={() => setStatusOf(c, 'arquivada')}>Arquivar</Button>}
                  <Button size="sm" onClick={() => openManage(c)}>Gerir</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!manage}
        onClose={() => setManage(null)}
        title={manage?.title}
        subtitle={manage ? `${COMM_TYPE_LABELS[manage.type]} · ${nameOf(manage.entityId)}` : ''}
        footer={<><Button variant="ghost" onClick={() => setManage(null)}>Fechar</Button><Button onClick={sendReply}>Guardar resposta</Button></>}
      >
        {manage && (
          <>
            {manage.body && <p className="text-sm" style={{ marginTop: 0 }}>{manage.body}</p>}
            {manage.imageUrl && <img src={manage.imageUrl} alt={manage.title} className="poster" style={{ marginBottom: 12 }} />}
            <div className="row" style={{ gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <Button size="sm" variant={manage.status === 'tratada' ? 'primary' : 'subtle'} onClick={() => { setStatusOf(manage, 'tratada'); setManage({ ...manage, status: 'tratada' }); }}>Tratada</Button>
              <Button size="sm" variant="subtle" onClick={() => { setStatusOf(manage, 'vista'); setManage({ ...manage, status: 'vista' }); }}>Vista</Button>
              <Button size="sm" variant="subtle" onClick={() => { setStatusOf(manage, 'arquivada'); setManage(null); }}>Arquivar</Button>
            </div>
            <Field label="Responsável"><Input value={resp} onChange={(e) => setResp(e.target.value)} placeholder="Quem trata disto" /></Field>
            <Field label="Resposta à entidade"><Textarea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} /></Field>
          </>
        )}
      </Modal>
    </div>
  );
}
