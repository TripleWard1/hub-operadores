'use client';
// app/page.tsx- encaminhamento conforme o papel da sessão.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loading } from '@/components/ui/primitives';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.role === 'admin') router.replace('/admin/balcao');
    else if (user.role === 'balcao') router.replace('/balcao');
    else router.replace('/painel');
  }, [user, loading, router]);

  return <Loading label="A preparar o Hub…" />;
}
