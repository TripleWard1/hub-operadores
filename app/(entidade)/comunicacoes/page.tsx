'use client';
// app/(entidade)/comunicacoes/page.tsx- criar e acompanhar comunicações.
import { useMemo, useState } from 'react';
import { useData } from '@/lib/data';
import { useCurrentEntity } from '@/lib/useEntity';
import { useToast } from '@/lib/toast';
import { Badge, Button, Card, EmptyState } from '@/components/ui/primitives';
import { SkeletonCards } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Textarea, Select } from '@/components/ui/Field';
import { IconSend } from '@/components/ui/Icons';
import {
  COMM_STATUS_LABELS,
  COMM_TYPE_EMOJI,
  COMM_TYPE_LABELS,
  COMM_TYPE_OPTIONS,
  commStatusTone,
  formatDateRange,
  timeAgo,
} from '@/lib/utils';
import type { CommunicationType } from '@/types';

const emptyForm = {
  type: 'evento' as CommunicationType,
  title: '',
  body: '',
  imageUrl: '',
  link: '',
  location: '',
  dateStart: '',
  dateEnd: '',
  timeLabel: '',
};

export default function ComunicacoesEntidade() {
  const { data, ready, addCommunication } = useData();
  const { toast } = useToast();
  const entity = useCurrentEntity();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const mine = useMemo(
    () => (entity ? data.communications.filter((c) => c.entityId === entity.id) : []),
    [data.communications, entity],
  );

  if (!ready || !entity) return <div className="page"><SkeletonCards count={3} /></div>;

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = () => {
    if (!form.title.trim()) {
      toast('Indica um título.', 'error');
      return;
    }
    addCommunication({
      entityId: entity.id,
      type: form.type,
      title: form.title.trim(),
      body: form.body.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      link: form.link.trim() || undefined,
      location: form.location.trim() || undefined,
      dateStart: form.dateStart || undefined,
      dateEnd: form.dateEnd || undefined,
      timeLabel: form.timeLabel.trim() || undefined,
    });
    toast('Comunicação enviada à Divisão de Turismo.');
    setForm(emptyForm);
    setOpen(false);
  };

  const isEvent = form.type === 'evento';
  const isPoster = form.type === 'cartaz';
  const showDates = isEvent || form.type === 'horario';

  return (
    <div className="page">
      <div className="page__head row-between wrap">
        <div>
          <div className="eyebrow">Comunicações</div>
          <h1 className="page__title">As tuas comunicações</h1>
          <p className="page__subtitle">Envia horários, eventos, cartazes e novidades à Divisão de Turismo.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <IconSend width={16} height={16} /> Nova comunicação
        </Button>
      </div>

      {mine.length === 0 ? (
        <Card padLg className="mt-2">
          <EmptyState
            title="Sem comunicações"
            hint="Cria a tua primeira comunicação para a Divisão de Turismo ficar a par."
            action={<Button variant="ghost" onClick={() => setOpen(true)}>Nova comunicação</Button>}
          />
        </Card>
      ) : (
        <div className="grid-cards mt-2">
          {mine.map((c) => (
            <Card key={c.id} padLg className="lift">
              <div className="row-between">
                <span className="type-chip">
                  {COMM_TYPE_EMOJI[c.type]} {COMM_TYPE_LABELS[c.type]}
                </span>
                <Badge tone={commStatusTone(c.status)}>{COMM_STATUS_LABELS[c.status]}</Badge>
              </div>
              <div className="fw-600 mt-2">{c.title}</div>
              {c.body && <p className="muted text-sm" style={{ margin: '6px 0 0' }}>{c.body}</p>}
              {(c.dateStart || c.location) && (
                <div className="faint text-xs mt-2">
                  {c.dateStart ? `📅 ${formatDateRange(c.dateStart, c.dateEnd)}` : ''}
                  {c.location ? ` · ${c.location}` : ''}
                </div>
              )}
              {c.imageUrl && <img src={c.imageUrl} alt={c.title} className="poster" style={{ marginTop: 12 }} />}
              {c.reply && (
                <div className="reply-box">
                  <div className="reply-box__label">Resposta da Divisão de Turismo</div>
                  <p className="text-sm" style={{ margin: '4px 0 0' }}>{c.reply}</p>
                </div>
              )}
              <div className="faint text-xs mt-2">Enviada {timeAgo(c.createdAt)}</div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nova comunicação"
        subtitle="Será enviada à Divisão de Turismo do Município de Braga."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit}>Enviar</Button>
          </>
        }
      >
        <Field label="Tipo de comunicação">
          <Select value={form.type} onChange={(e) => set({ type: e.target.value as CommunicationType })}>
            {COMM_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {COMM_TYPE_EMOJI[o.value]} {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Título">
          <Input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Ex.: Festa de São João no jardim" />
        </Field>
        <Field label="Descrição" hint="Detalhes que a divisão deve saber.">
          <Textarea rows={4} value={form.body} onChange={(e) => set({ body: e.target.value })} />
        </Field>
        {isEvent && (
          <Field label="Local">
            <Input value={form.location} onChange={(e) => set({ location: e.target.value })} placeholder="Onde acontece" />
          </Field>
        )}
        {showDates && (
          <div className="field-row">
            <Field label={form.type === 'horario' ? 'Em vigor a partir de' : 'Data de início'}>
              <Input type="date" value={form.dateStart} onChange={(e) => set({ dateStart: e.target.value })} />
            </Field>
            {isEvent && (
              <Field label="Data de fim">
                <Input type="date" value={form.dateEnd} onChange={(e) => set({ dateEnd: e.target.value })} />
              </Field>
            )}
          </div>
        )}
        {isEvent && (
          <Field label="Hora (opcional)" hint="Ex.: 21h00">
            <Input value={form.timeLabel} onChange={(e) => set({ timeLabel: e.target.value })} placeholder="21h00" />
          </Field>
        )}
        <Field label={isPoster ? 'URL do cartaz' : 'URL de imagem (opcional)'} hint="Cola o link da imagem.">
          <Input value={form.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://…" />
        </Field>
        <Field label="Link (opcional)" hint="Bilhetes ou mais informação.">
          <Input value={form.link} onChange={(e) => set({ link: e.target.value })} placeholder="https://…" />
        </Field>
      </Modal>
    </div>
  );
}
