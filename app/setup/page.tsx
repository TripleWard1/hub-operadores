'use client';
// app/setup/page.tsx
// Página de inicialização do backend Firebase: autentica (Google ou email/password),
// semeia o Firestore com os dados de demonstração e permite tornar a conta admin.
// Em modo demo, não é necessária.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IS_DEMO, getAuthClient } from '@/lib/firebase';
import { seedFirestore, makeAdmin } from '@/lib/firestore-seed';
import { useToast } from '@/lib/toast';
import { Button, Card } from '@/components/ui/primitives';
import { Field, Input } from '@/components/ui/Field';
import { LOGO } from '@/components/Shell';

export default function SetupPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [pwEmail, setPwEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (IS_DEMO) return;
    const auth = getAuthClient();
    if (!auth) return;
    let unsub = () => {};
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      unsub = onAuthStateChanged(auth, (u) => {
        setEmail(u?.email ?? null);
        setName(u?.displayName ?? '');
      });
    });
    return () => unsub();
  }, []);

  const google = async () => {
    const auth = getAuthClient();
    if (!auth) return;
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const emailLogin = async () => {
    const auth = getAuthClient();
    if (!auth) return;
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, pwEmail.trim(), pw);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const doSeed = async () => {
    setBusy(true);
    try {
      const r = await seedFirestore();
      toast(`Firestore inicializado: ${r.entities} entidades, ${r.communications} comunicações.`);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
    setBusy(false);
  };

  const doAdmin = async () => {
    if (!email) return;
    setBusy(true);
    try {
      await makeAdmin(email, name);
      toast('A tua conta é agora administradora. A redirecionar…');
      setTimeout(() => {
        window.location.href = '/admin/balcao';
      }, 1200);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
    setBusy(false);
  };

  if (IS_DEMO) {
    return (
      <div style={{ maxWidth: 520, margin: '80px auto', padding: '0 22px' }}>
        <Card padLg>
          <h1 style={{ fontFamily: 'var(--font-display)', margin: '0 0 8px' }}>Modo demo ativo</h1>
          <p className="muted">
            A app está em modo demo (sem Firebase). A inicialização do Firestore não é necessária-
            os dados estão em memória. Define as variáveis <code>NEXT_PUBLIC_FIREBASE_*</code> para
            ativar o backend.
          </p>
          <div className="mt-3">
            <Link href="/login" className="gold">
              ← Voltar ao login
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '56px auto', padding: '0 22px' }}>
      <div className="row" style={{ marginBottom: 22 }}>
        <img src={LOGO} alt="Visit Braga" style={{ height: 34 }} />
      </div>
      <div className="eyebrow">Configuração · Firebase</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, margin: '0 0 6px' }}>
        Inicializar o Hub
      </h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Liga a tua conta, semeia os dados de demonstração e atribui o papel de administrador.
      </p>

      {!email ? (
        <Card padLg>
          <h3 style={{ marginTop: 0 }}>1 · Autenticar</h3>
          <Button block onClick={google}>
            Entrar com Google
          </Button>
          <p className="faint text-xs" style={{ textAlign: 'center', margin: '14px 0' }}>
            ou com email e password (conta criada no Firebase Auth)
          </p>
          <Field label="Email">
            <Input value={pwEmail} onChange={(e) => setPwEmail(e.target.value)} type="email" />
          </Field>
          <Field label="Palavra-passe">
            <Input value={pw} onChange={(e) => setPw(e.target.value)} type="password" />
          </Field>
          <Button variant="ghost" block onClick={emailLogin}>
            Entrar
          </Button>
        </Card>
      ) : (
        <>
          <Card padLg>
            <h3 style={{ marginTop: 0 }}>Sessão</h3>
            <p className="muted text-sm" style={{ margin: 0 }}>
              Autenticado como <span className="gold">{email}</span>.
            </p>
          </Card>

          <div className="mt-3" />
          <Card padLg>
            <h3 style={{ marginTop: 0 }}>2 · Semear dados</h3>
            <p className="muted text-sm">
              Escreve as entidades, comunicações de exemplo e os documentos de papel
              (operador@ e admin@) no Firestore. Corre apenas na primeira configuração.
            </p>
            <Button onClick={doSeed} disabled={busy}>
              {busy ? 'A escrever…' : 'Inicializar dados de demonstração'}
            </Button>
          </Card>

          <div className="mt-3" />
          <Card padLg>
            <h3 style={{ marginTop: 0 }}>3 · Tornar-me administrador</h3>
            <p className="muted text-sm">
              Atribui o papel de admin a <span className="gold">{email}</span> para acederes ao
              backoffice com esta conta.
            </p>
            <Button onClick={doAdmin} disabled={busy}>
              Tornar a minha conta administradora
            </Button>
          </Card>

          <p className="faint text-xs mt-3" style={{ textAlign: 'center' }}>
            <Link href="/login" className="gold">
              Ir para o login →
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
