'use client';
// app/(entidade)/layout.tsx — área da entidade.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Shell, type NavLink } from '@/components/Shell';
import { Loading } from '@/components/ui/primitives';
import { IconHome, IconUser, IconSend } from '@/components/ui/Icons';

export default function EntidadeLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.role !== 'entidade') router.replace('/');
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'entidade') return <Loading label="A verificar sessão…" />;

  const links: NavLink[] = [
    { href: '/painel', label: 'Painel', icon: <IconHome /> },
    { href: '/ficha', label: 'A minha ficha', icon: <IconUser /> },
    { href: '/comunicacoes', label: 'O que há', icon: <IconSend /> },
  ];

  return <Shell links={links} roleLabel="Área da Entidade">{children}</Shell>;
}
