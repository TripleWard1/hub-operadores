'use client';
// components/ui/Field.tsx
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useState } from 'react';

export function Field({
  label,
  hint,
  children,
}: {
  label?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      {label && <label className="field__label">{label}</label>}
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="textarea" {...props} />;
}

export function Select({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select className="select" {...props}>
      {children}
    </select>
  );
}

/* Tag input: introduz valores separados por Enter ou vírgula. */
export function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const v = raw.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };

  return (
    <div>
      <div className="chip-row mb-2" style={{ marginBottom: values.length ? 10 : 0 }}>
        {values.map((v) => (
          <span key={v} className="chip chip--accent" style={{ cursor: 'pointer' }} onClick={() => onChange(values.filter((x) => x !== v))}>
            {v} ✕
          </span>
        ))}
      </div>
      <input
        className="input"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add(draft);
          }
        }}
        onBlur={() => draft && add(draft)}
      />
    </div>
  );
}

/* Multi-select por chips toggle (lista fixa de opções). */
export function ChipToggle({
  options,
  values,
  onChange,
}: {
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (o: string) =>
    onChange(values.includes(o) ? values.filter((x) => x !== o) : [...values, o]);
  return (
    <div className="chip-row">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={`chip ${values.includes(o) ? 'chip--accent' : ''}`}
          style={{ cursor: 'pointer' }}
          onClick={() => toggle(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
