'use client';
// app/admin/layout.tsx- backoffice da Divisão de Turismo.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { Shell, type NavLink } from '@/components/Shell';
import { Loading } from '@/components/ui/primitives';
import { IconCompass, IconUsers, IconInbox, IconCalendar, IconMapPin, IconChart } from '@/components/ui/Icons';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { data } = useData();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.role !== 'admin') router.replace('/');
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') return <Loading label="A verificar sessão…" />;

  const novas = data.communications.filter((c) => c.status === 'recebida').length;

  const links: NavLink[] = [
    { href: '/admin/balcao', label: 'Balcão', icon: <IconCompass /> },
    { href: '/admin/registo', label: 'Registo de entidades', icon: <IconUsers /> },
    { href: '/admin/comunicacoes', label: 'Comunicações', icon: <IconInbox />, badge: novas || undefined },
    { href: '/admin/agenda', label: 'Agenda', icon: <IconCalendar /> },
    { href: '/admin/mapa', label: 'Mapa', icon: <IconMapPin /> },
    { href: '/admin/painel', label: 'Indicadores', icon: <IconChart /> },
  ];

  return <Shell links={links} roleLabel="Divisão de Turismo">{children}</Shell>;
}
