'use client';
// components/Providers.tsx
import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { DataProvider } from '@/lib/data';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>{children}</ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}
