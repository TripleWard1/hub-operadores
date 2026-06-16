'use client';
// app/admin/registo/page.tsx- registo de entidades da cidade.
import { useMemo, useState } from 'react';
import { useData } from '@/lib/data';
import { useToast } from '@/lib/toast';
import { Badge, Button, Card, EmptyState } from '@/components/ui/primitives';
import { SkeletonCards } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Field, Input, Select } from '@/components/ui/Field';
import { IconPlus, IconSearch } from '@/components/ui/Icons';
import {
  ENTITY_TYPE_EMOJI,
  ENTITY_TYPE_LABELS,
  ENTITY_TYPE_OPTIONS,
  ENTITY_STATUS_LABELS,
  entityStatusTone,
  isStale,
  normalize,
  timeAgo,
} from '@/lib/utils';
import { EMPTY_HOURS, type Entity, type EntityType } from '@/types';

const blankNew = {
  name: '', type: 'restaurante' as EntityType, email: '', phone: '', website: '', address: '', shortDesc: '',
};

export default function RegistoAdmin() {
  const { data, ready, addEntity, updateEntity, setEntityStatus } = useData();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [type, setType] = useState('todos');
  const [staleOnly, setStaleOnly] = useState(false);
  const [edit, setEdit] = useState<Entity | null>(null);
  const [creating, setCreating] = useState(false);
  const [nf, setNf] = useState(blankNew);

  const term = normalize(q.trim());
  const list = useMemo(
    () =>
      data.entities
        .filter((e) => (type === 'todos' || e.type === type))
        .filter((e) => (staleOnly ? isStale(e.updatedAt) : true))
        .filter((e) => (!term ? true : normalize(`${e.name} ${ENTITY_TYPE_LABELS[e.type]}`).includes(term)))
        .sort((a, b) => Number(b.status === 'pendente') - Number(a.status === 'pendente') || a.name.localeCompare(b.name)),
    [data.entities, type, staleOnly, term],
  );

  const pendentes = data.entities.filter((e) => e.status === 'pendente').length;
  const desatualizadas = data.entities.filter((e) => isStale(e.updatedAt)).length;

  const saveEdit = () => {
    if (!edit) return;
    updateEntity(edit.id, {
      name: edit.name, type: edit.type, email: edit.email, phone: edit.phone,
      website: edit.website, address: edit.address, shortDesc: edit.shortDesc,
      lat: edit.lat, lng: edit.lng, alert: edit.alert?.trim() ? edit.alert : undefined,
    });
    toast('Entidade atualizada.');
    setEdit(null);
  };

  const createEntity = () => {
    if (!nf.name.trim()) { toast('Indica o nome.', 'error'); return; }
    addEntity({
      name: nf.name.trim(), type: nf.type, status: 'pendente',
      email: nf.email.trim(), phone: nf.phone.trim(), website: nf.website.trim(),
      social: {}, address: nf.address.trim(), shortDesc: nf.shortDesc.trim(),
      description: '', goodToKnow: '', tags: [], hours: { ...EMPTY_HOURS },
    });
    toast('Entidade criada. Convida-a a completar a ficha.');
    setNf(blankNew);
    setCreating(false);
  };

  if (!ready) {
    return (
      <div className="page">
        <div className="page__head"><div className="eyebrow">Divisão de Turismo</div><h1 className="page__title">Registo de entidades</h1></div>
        <SkeletonCards count={4} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__head row-between wrap">
        <div>
          <div className="eyebrow">Divisão de Turismo</div>
          <h1 className="page__title">Registo de entidades</h1>
          <p className="page__subtitle">A lista oficial de espaços e operadores- sempre atual.</p>
        </div>
        <Button onClick={() => setCreating(true)}><IconPlus width={16} height={16} /> Nova entidade</Button>
      </div>

      <div className="toolbar mt-2 wrap">
        <div className="search">
          <IconSearch width={16} height={16} />
          <input className="input" placeholder="Procurar entidade…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="select" value={type} onChange={(e) => setType(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="todos">Todos os tipos</option>
          {ENTITY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button className={`chip chip--toggle ${staleOnly ? 'chip--on' : ''}`} onClick={() => setStaleOnly((v) => !v)}>
          Desatualizadas ({desatualizadas})
        </button>
        {pendentes > 0 && <Badge tone="pendente">{pendentes} a aprovar</Badge>}
      </div>

      {list.length === 0 ? (
        <Card padLg className="mt-2"><EmptyState title="Sem entidades" hint="Ajusta os filtros ou cria uma nova." /></Card>
      ) : (
        <div className="mt-2">
          {list.map((e) => {
            const stale = isStale(e.updatedAt);
            return (
              <Card key={e.id} padLg hover className="mt-2 lift">
                <div className="row-between wrap" style={{ gap: 12 }}>
                  <div className="reg-item" style={{ minWidth: 0 }}>
                    <span className="entity-card__emoji">{ENTITY_TYPE_EMOJI[e.type]}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="row" style={{ gap: 8 }}>
                        <span className="fw-700">{e.name}</span>
                        <Badge tone={entityStatusTone(e.status)}>{ENTITY_STATUS_LABELS[e.status]}</Badge>
                      </div>
                      <div className="faint text-xs mt-1">
                        {ENTITY_TYPE_LABELS[e.type]} · {e.phone || 'sem telefone'}
                      </div>
                      <div className={`reg-fresh ${stale ? 'reg-fresh--stale' : 'faint'} mt-1`}>
                        {stale ? '⚠ ' : ''}Atualizada {timeAgo(e.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    {e.status === 'pendente' && <Button size="sm" onClick={() => { setEntityStatus(e.id, 'ativa'); toast('Aprovada.'); }}>Aprovar</Button>}
                    {e.status === 'ativa' && <Button size="sm" variant="subtle" onClick={() => { setEntityStatus(e.id, 'suspensa'); toast('Suspensa.'); }}>Suspender</Button>}
                    {e.status === 'suspensa' && <Button size="sm" variant="subtle" onClick={() => { setEntityStatus(e.id, 'ativa'); toast('Reativada.'); }}>Reativar</Button>}
                    <Button size="sm" variant="ghost" onClick={() => setEdit({ ...e })}>Editar</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* editar */}
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Editar entidade"
        subtitle="O horário e as etiquetas são mantidos pela própria entidade."
        footer={<><Button variant="ghost" onClick={() => setEdit(null)}>Cancelar</Button><Button onClick={saveEdit}>Guardar</Button></>}
      >
        {edit && (
          <>
            <Field label="Nome"><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="Tipo">
              <Select value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value as EntityType })}>
                {ENTITY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </Field>
            <Field label="Frase de apresentação"><Input value={edit.shortDesc} onChange={(e) => setEdit({ ...edit, shortDesc: e.target.value })} /></Field>
            <div className="field-row">
              <Field label="Telefone"><Input value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field>
              <Field label="Email"><Input value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></Field>
            </div>
            <Field label="Website"><Input value={edit.website} onChange={(e) => setEdit({ ...edit, website: e.target.value })} /></Field>
            <Field label="Morada"><Input value={edit.address} onChange={(e) => setEdit({ ...edit, address: e.target.value })} /></Field>
            <Field label="Aviso temporário"><Input value={edit.alert ?? ''} onChange={(e) => setEdit({ ...edit, alert: e.target.value })} /></Field>
          </>
        )}
      </Modal>

      {/* criar */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Nova entidade"
        subtitle="Cria o registo; a entidade completa depois a ficha."
        footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button><Button onClick={createEntity}>Criar</Button></>}
      >
        <Field label="Nome"><Input value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} /></Field>
        <Field label="Tipo">
          <Select value={nf.type} onChange={(e) => setNf({ ...nf, type: e.target.value as EntityType })}>
            {ENTITY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="Frase de apresentação"><Input value={nf.shortDesc} onChange={(e) => setNf({ ...nf, shortDesc: e.target.value })} /></Field>
        <div className="field-row">
          <Field label="Telefone"><Input value={nf.phone} onChange={(e) => setNf({ ...nf, phone: e.target.value })} /></Field>
          <Field label="Email"><Input value={nf.email} onChange={(e) => setNf({ ...nf, email: e.target.value })} /></Field>
        </div>
        <Field label="Morada"><Input value={nf.address} onChange={(e) => setNf({ ...nf, address: e.target.value })} /></Field>
      </Modal>
    </div>
  );
}
