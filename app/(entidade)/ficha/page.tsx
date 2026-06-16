'use client';
// app/(entidade)/ficha/page.tsx- a entidade mantém a sua ficha sempre atual.
import { useState } from 'react';
import { useData } from '@/lib/data';
import { useCurrentEntity } from '@/lib/useEntity';
import { useToast } from '@/lib/toast';
import { Badge, Button, Card } from '@/components/ui/primitives';
import { Field, Input, Textarea, Select } from '@/components/ui/Field';
import { HoursEditor } from '@/components/HoursEditor';
import { EntityFiche } from '@/components/EntityFiche';
import { ENTITY_TYPE_OPTIONS, TAG_OPTIONS, isStale, timeAgo } from '@/lib/utils';
import type { Entity, EntityTag, EntityType, OpeningHours } from '@/types';

export default function FichaEntidade() {
  const { ready, updateEntity } = useData();
  const { toast } = useToast();
  const entity = useCurrentEntity();
  const [f, setF] = useState(() => entity);

  if (!ready || !entity || !f) return <div className="page"><Card padLg>A carregar…</Card></div>;

  const set = (patch: Partial<Entity>) => setF((cur) => (cur ? { ...cur, ...patch } : cur));
  const setHours = (hours: OpeningHours) => set({ hours });
  const toggleTag = (t: EntityTag) =>
    set({ tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] });

  const save = () => {
    updateEntity(entity.id, {
      name: f.name,
      type: f.type,
      shortDesc: f.shortDesc,
      description: f.description,
      goodToKnow: f.goodToKnow,
      tags: f.tags,
      address: f.address,
      lat: f.lat,
      lng: f.lng,
      phone: f.phone,
      email: f.email,
      website: f.website,
      social: f.social,
      imageUrl: f.imageUrl,
      hours: f.hours,
      alert: f.alert?.trim() ? f.alert : undefined,
      alertUntil: f.alert?.trim() ? f.alertUntil : undefined,
    });
    toast('Ficha atualizada. O posto vê já a versão nova.');
  };

  const stale = isStale(entity.updatedAt);

  return (
    <div className="page">
      <div className="page__head row-between wrap">
        <div>
          <div className="eyebrow">A minha ficha</div>
          <h1 className="page__title">{f.name}</h1>
          <p className="page__subtitle">
            É esta a informação que o posto de turismo usa para responder ao turista. Mantém-na atual.
          </p>
        </div>
        <div className="text-right">
          <Badge tone={stale ? 'pendente' : 'ativo'}>Atualizada {timeAgo(entity.updatedAt)}</Badge>
          {stale && <div className="faint text-xs mt-1">Já passou algum tempo- convém rever.</div>}
        </div>
      </div>

      <div className="ficha-edit mt-2">
        <div className="ficha-edit__form">
          <Card padLg>
            <div className="card__title">Identificação</div>
            <Field label="Nome"><Input value={f.name} onChange={(e) => set({ name: e.target.value })} /></Field>
            <Field label="Tipo">
              <Select value={f.type} onChange={(e) => set({ type: e.target.value as EntityType })}>
                {ENTITY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </Field>
            <Field label="Frase de apresentação" hint="Uma linha para o balcão ler ao turista.">
              <Input value={f.shortDesc} onChange={(e) => set({ shortDesc: e.target.value })} />
            </Field>
            <Field label="Descrição completa">
              <Textarea rows={3} value={f.description} onChange={(e) => set({ description: e.target.value })} />
            </Field>
            <Field label="Bom saber" hint="Preços, acessos, reservas, dicas.">
              <Textarea rows={2} value={f.goodToKnow} onChange={(e) => set({ goodToKnow: e.target.value })} />
            </Field>
          </Card>

          <Card padLg className="mt-3">
            <div className="card__title">Etiquetas</div>
            <p className="faint text-sm" style={{ margin: '0 0 10px' }}>Ajudam o balcão a filtrar (“família”, “grátis”…).</p>
            <div className="chip-row">
              {TAG_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`chip chip--toggle ${f.tags.includes(t.value) ? 'chip--on' : ''}`}
                  onClick={() => toggleTag(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Card>

          <Card padLg className="mt-3">
            <div className="card__title">Contactos e localização</div>
            <div className="field-row">
              <Field label="Telefone"><Input value={f.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
              <Field label="Email"><Input value={f.email} onChange={(e) => set({ email: e.target.value })} /></Field>
            </div>
            <Field label="Website"><Input value={f.website} onChange={(e) => set({ website: e.target.value })} placeholder="https://…" /></Field>
            <Field label="Morada"><Input value={f.address} onChange={(e) => set({ address: e.target.value })} /></Field>
            <div className="field-row">
              <Field label="Latitude" hint="Para o mapa (opcional).">
                <Input type="number" value={f.lat ?? ''} onChange={(e) => set({ lat: e.target.value ? Number(e.target.value) : undefined })} />
              </Field>
              <Field label="Longitude">
                <Input type="number" value={f.lng ?? ''} onChange={(e) => set({ lng: e.target.value ? Number(e.target.value) : undefined })} />
              </Field>
            </div>
            <div className="field-row">
              <Field label="Instagram"><Input value={f.social.instagram ?? ''} onChange={(e) => set({ social: { ...f.social, instagram: e.target.value } })} /></Field>
              <Field label="Facebook"><Input value={f.social.facebook ?? ''} onChange={(e) => set({ social: { ...f.social, facebook: e.target.value } })} /></Field>
            </div>
            <Field label="Imagem (URL)"><Input value={f.imageUrl ?? ''} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://…" /></Field>
          </Card>

          <Card padLg className="mt-3">
            <div className="card__title">Horário</div>
            <p className="faint text-sm" style={{ margin: '0 0 12px' }}>É isto que faz o “aberto agora?” funcionar no balcão.</p>
            <HoursEditor value={f.hours} onChange={setHours} />
          </Card>

          <Card padLg className="mt-3">
            <div className="card__title">Aviso temporário</div>
            <p className="faint text-sm" style={{ margin: '0 0 10px' }}>Ex.: “encerrado para obras”. Aparece destacado no balcão.</p>
            <Field label="Aviso">
              <Input value={f.alert ?? ''} onChange={(e) => set({ alert: e.target.value })} placeholder="Deixa vazio se não houver" />
            </Field>
            {f.alert?.trim() ? (
              <Field label="Até (opcional)">
                <Input type="date" value={f.alertUntil ?? ''} onChange={(e) => set({ alertUntil: e.target.value })} />
              </Field>
            ) : null}
          </Card>

          <div className="mt-3">
            <Button block onClick={save}>Guardar ficha</Button>
          </div>
        </div>

        <div className="ficha-edit__preview">
          <div className="ficha-edit__sticky">
            <div className="eyebrow" style={{ marginBottom: 10 }}>Como o posto vê</div>
            <Card padLg>
              <EntityFiche entity={f} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
