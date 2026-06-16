// components/ui/Skeleton.tsx
import type { CSSProperties } from 'react';

export function Skeleton({ style }: { style?: CSSProperties }) {
  return <div className="skeleton" style={style} />;
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid-cards mt-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skel-card" />
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="stat-grid mt-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 84, borderRadius: 'var(--radius)' }} />
      ))}
    </div>
  );
}
