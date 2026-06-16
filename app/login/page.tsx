'use client';
// app/login/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { Button, Card } from '@/components/ui/primitives';
import { Field, Input } from '@/components/ui/Field';
import { LOGO } from '@/components/Shell';
import { IconShield, IconUser, IconCompass } from '@/components/ui/Icons';

export default function LoginPage() {
  const { signIn, signInWithGoogle, isDemo } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const google = async () => {
    try {
      await signInWithGoogle();
      // o redirecionamento é tratado pela página inicial após resolução do papel
      router.push('/');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const user = await signIn(email, password);
      toast(`Bem-vindo, ${user.name}`);
      const dest = user.role === 'admin' ? '/admin/balcao' : user.role === 'balcao' ? '/balcao' : '/painel';
      router.push(dest);
    } catch (e) {
      toast((e as Error).message, 'error');
      setBusy(false);
    }
  };

  const quick = (e: string) => {
    setEmail(e);
    setPassword('demo');
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <div className="auth-aside__logo">
          <img src={LOGO} alt="Visit Braga" />
        </div>
        <div>
          <div className="eyebrow">Município de Braga · Turismo</div>
          <h1 className="auth-aside__big">
            O canal de comunicação entre as entidades da cidade e a Divisão de Turismo.
          </h1>
          <p className="muted" style={{ maxWidth: '46ch', lineHeight: 1.6 }}>
            Hotéis, restaurantes, museus, associações e operadores comunicam alterações de
            horários, festas e eventos, cartazes e novidades diretamente à Divisão de Turismo do
            Município de Braga.
          </p>
        </div>
       
      </aside>

      <div className="auth-form-side">
        <div className="auth-card">
          <h2 style={{ fontSize: 22, margin: '0 0 4px' }}>Entrar no Hub</h2>
          <p className="muted text-sm" style={{ margin: '0 0 22px' }}>
            Acede à área da tua entidade ou ao backoffice da Divisão de Turismo.
          </p>

          <Card padLg>
            <Field label="Email">
              <Input
                type="email"
                value={email}
                placeholder="operador@visitbraga.pt"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </Field>
            <Field label="Palavra-passe">
              <Input
                type="password"
                value={password}
                placeholder="demo"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </Field>
            <Button block onClick={submit} disabled={busy}>
              {busy ? 'A entrar…' : 'Entrar'}
            </Button>
          </Card>

          {isDemo ? (
            <>
              <p className="faint text-xs" style={{ margin: '20px 0 8px' }}>
                CONTAS DE DEMONSTRAÇÃO (palavra-passe: demo)
              </p>
              <button className="demo-pill" onClick={() => quick('operador@visitbraga.pt')}>
                <span className="row">
                  <IconUser width={16} height={16} style={{ color: 'var(--accent)' }} />
                  operador@visitbraga.pt
                </span>
                <span className="faint">Entidade</span>
              </button>
              <button className="demo-pill" onClick={() => quick('admin@visitbraga.pt')}>
                <span className="row">
                  <IconShield width={16} height={16} style={{ color: 'var(--accent)' }} />
                  admin@visitbraga.pt
                </span>
                <span className="faint">Divisão de Turismo</span>
              </button>
              <button className="demo-pill" onClick={() => quick('posto@visitbraga.pt')}>
                <span className="row">
                  <IconCompass width={16} height={16} style={{ color: 'var(--accent)' }} />
                  posto@visitbraga.pt
                </span>
                <span className="faint">Posto de Turismo</span>
              </button>
            </>
          ) : (
            <>
              <p className="faint text-xs" style={{ margin: '20px 0 10px', textAlign: 'center' }}>
                ou
              </p>
              <Button variant="ghost" block onClick={google}>
                Entrar com Google
              </Button>
              <p className="faint text-xs mt-3" style={{ textAlign: 'center' }}>
                Primeira vez?{' '}
                <Link href="/setup" className="gold">
                  Inicializar o Hub →
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
