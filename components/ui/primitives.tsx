// components/ui/primitives.tsx
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { IconStar } from './Icons';

/* ---------- Button ---------- */
type ButtonVariant = 'primary' | 'ghost' | 'subtle' | 'danger';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  block?: boolean;
}
export function Button({
  variant = 'primary',
  size = 'md',
  block,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const cls = [
    'btn',
    `btn--${variant}`,
    size === 'sm' ? 'btn--sm' : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/* ---------- Card ---------- */
export function Card({
  children,
  hover,
  className = '',
  padLg,
  style,
}: {
  children: ReactNode;
  hover?: boolean;
  className?: string;
  padLg?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={['card', hover ? 'card--hover' : '', padLg ? 'card--pad-lg' : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

/* ---------- Badge ---------- */
export function Badge({
  children,
  tone,
  dot,
}: {
  children: ReactNode;
  tone?: string;
  dot?: boolean;
}) {
  return (
    <span className={`badge ${tone ? `badge--${tone}` : ''}`}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
}

/* ---------- Chip ---------- */
export function Chip({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <span className={`chip ${accent ? 'chip--accent' : ''}`}>{children}</span>;
}

/* ---------- Avatar ---------- */
export function Avatar({
  name,
  src,
  size = 40,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {src ? <img src={src} alt={name} /> : initials}
    </span>
  );
}

/* ---------- StatTile ---------- */
export function StatTile({
  label,
  value,
  delta,
  up,
  icon,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  up?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="stat">
      <div className="stat__label">
        {icon}
        {label}
      </div>
      <div className="stat__value">{value}</div>
      {delta && <div className={`stat__delta ${up ? 'stat__delta--up' : ''}`}>{delta}</div>}
    </div>
  );
}

/* ---------- Stars ---------- */
export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <IconStar
          key={i}
          width={size}
          height={size}
          style={{ color: i <= full ? 'var(--accent)' : 'var(--border-strong)' }}
        />
      ))}
    </span>
  );
}

/* ---------- EmptyState ---------- */
export function EmptyState({
  icon = '○',
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty__icon">{icon}</div>
      <div className="empty__title">{title}</div>
      {hint && <p className="card__hint" style={{ maxWidth: '42ch', margin: '0 auto' }}>{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ---------- Spinner / Loading ---------- */
export function Loading({ label }: { label?: string }) {
  return (
    <div className="loading-wrap">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
        {label && <p className="faint text-sm mt-2">{label}</p>}
      </div>
    </div>
  );
}
