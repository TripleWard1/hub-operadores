'use client';
// lib/useEntity.ts — entidade associada ao utilizador autenticado.

import { useAuth } from './auth';
import { useData } from './data';
import type { Entity } from '@/types';

export function useCurrentEntity(): Entity | null {
  const { user } = useAuth();
  const { data } = useData();
  if (!user?.entityId) return null;
  return data.entities.find((e) => e.id === user.entityId) ?? null;
}
