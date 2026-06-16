'use client';
// lib/auth.tsx
// Autenticação em modo duplo:
//  • DEMO  → valida contra os utilizadores seed (palavra-passe "demo"), sessão em localStorage.
//  • FIREBASE → Firebase Auth (email/password + Google). O PAPEL (operador/admin) e o
//    entityId são lidos da coleção `users` do Firestore (doc id = email em minúsculas).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { seedUsers } from './seed';
import { IS_DEMO, getAuthClient, getDb } from './firebase';
import type { User } from '@/types';

const SESSION_KEY = 'visitbraga.hub.session';
const DEMO_PASSWORD = 'demo';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ──────────────────────────── DEMO ──────────────────────────── */
function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const match = seedUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!match || password !== DEMO_PASSWORD) {
      throw new Error('Credenciais inválidas. Em modo demo, a palavra-passe é "demo".');
    }
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(match));
    } catch {
      // localStorage bloqueado (ex.: iframe StackBlitz) — sessão apenas em memória
    }
    setUser(match);
    return match;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    throw new Error('Login com Google só está disponível em modo Firebase.');
  }, []);

  const signOut = useCallback(() => {
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isDemo: true, signIn, signInWithGoogle, signOut }),
    [user, loading, signIn, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ────────────────────────── FIREBASE ────────────────────────── */
function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    (async () => {
      const auth = getAuthClient();
      const db = getDb();
      if (!auth || !db) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { onAuthStateChanged } = await import('firebase/auth');
      const { doc, getDoc } = await import('firebase/firestore');

      unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (!fbUser || !fbUser.email) {
          if (!cancelled) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        try {
          const ref = doc(db, 'users', fbUser.email.toLowerCase());
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const u = snap.data() as User;
            if (!cancelled) setUser({ ...u, id: fbUser.uid, email: fbUser.email });
          } else {
            // Autenticado mas sem papel atribuído: sem acesso à app
            // (pode usar /setup para inicializar/atribuir-se admin).
            if (!cancelled) setUser(null);
          }
        } catch {
          if (!cancelled) setUser(null);
        }
        if (!cancelled) setLoading(false);
      });
    })();

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getAuthClient();
    const db = getDb();
    if (!auth || !db) throw new Error('Firebase indisponível.');
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { doc, getDoc } = await import('firebase/firestore');
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const mail = (cred.user.email || email).toLowerCase();
    const snap = await getDoc(doc(db, 'users', mail));
    if (!snap.exists()) {
      throw new Error('Conta sem perfil atribuído. Contacta o Município de Braga para obteres acesso.');
    }
    const u = snap.data() as User;
    return { ...u, id: cred.user.uid, email: cred.user.email || mail };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getAuthClient();
    if (!auth) throw new Error('Firebase indisponível.');
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    await signInWithPopup(auth, new GoogleAuthProvider());
    // onAuthStateChanged trata da resolução do papel.
  }, []);

  const signOut = useCallback(() => {
    const auth = getAuthClient();
    if (!auth) return;
    import('firebase/auth').then(({ signOut: fbSignOut }) => fbSignOut(auth));
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isDemo: false, signIn, signInWithGoogle, signOut }),
    [user, loading, signIn, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return IS_DEMO ? (
    <DemoAuthProvider>{children}</DemoAuthProvider>
  ) : (
    <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth tem de ser usado dentro de <AuthProvider>');
  return ctx;
}
