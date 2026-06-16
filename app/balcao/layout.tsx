'use client';
// app/balcao/layout.tsx - posto de turismo (consulta).
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Shell, type NavLink } from '@/components/Shell';
import { Loading } from '@/components/ui/primitives';
import { IconCompass, IconUsers, IconMapPin, IconCalendar } from '@/components/ui/Icons';

export default function BalcaoLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.role !== 'balcao' && user.role !== 'admin') router.replace('/');
  }, [user, loading, router]);

  if (loading || !user || (user.role !== 'balcao' && user.role !== 'admin'))
    return <Loading label="A verificar sessão…" />;

  const links: NavLink[] = [
    { href: '/balcao', label: 'Balcão', icon: <IconCompass /> },
    { href: '/balcao/operadores', label: 'Operadores', icon: <IconUsers /> },
    { href: '/balcao/mapa', label: 'Mapa', icon: <IconMapPin /> },
    { href: '/balcao/agenda', label: 'Agenda', icon: <IconCalendar /> },
  ];

  return <Shell links={links} roleLabel="Posto de Turismo">{children}</Shell>;
}