'use client';
// components/Shell.tsx
// Estrutura de aplicação: sidebar + topbar partilhados pelos lados operador e admin.

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { Avatar, Button } from './ui/primitives';
import { IconLogout } from './ui/Icons';

export interface NavLink {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

const LOGO = 'https://i.imgur.com/Yakcz6G.png';

export function Shell({
  links,
  roleLabel,
  children,
}: {
  links: NavLink[];
  roleLabel: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const logout = () => {
    signOut();
    router.push('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <img src={LOGO} alt="Visit Braga" />
        </div>
        <div className="sidebar__section">{roleLabel}</div>
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-item ${active ? 'nav-item--active' : ''}`}
            >
              <span className="nav-item__icon">{l.icon}</span>
              {l.label}
              {l.badge ? <span className="nav-item__badge">{l.badge}</span> : null}
            </Link>
          );
        })}
        <div className="sidebar__section">Conta</div>
        <button className="nav-item" onClick={logout}>
          <span className="nav-item__icon">
            <IconLogout />
          </span>
          Terminar sessão
        </button>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <Link href="/" className="topbar__logo">
            <img src={LOGO} alt="Visit Braga" />
          </Link>
          <span className="topbar__role">{roleLabel}</span>
          <div className="topbar__spacer" />
          <div className="topbar__user">
            <span className="muted text-sm" style={{ display: 'none' }}>
              {user?.email}
            </span>
            <Avatar name={user?.name || 'U'} size={34} />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

export { LOGO };
