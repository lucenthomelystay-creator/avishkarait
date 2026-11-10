'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Fingerprint } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function AdminPasskeySetup({ email }: { email: string }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function register() {
    setMessage('');
    setError('');
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setError('Supabase is not configured.'); return; }
    setBusy(true);
    try {
      const { error: passkeyError } = await supabase.auth.registerPasskey();
      if (passkeyError) throw passkeyError;
      setMessage('Passkey registered. You can now sign in at the admin portal with your email and passkey.');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not register this passkey. Check the Supabase passkey settings and try again.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="section admin-passkey-page"><div className="section-label"><span>AVISHKAR 2K26 / ADMIN SETUP</span><Link href="/admin">Admin portal</Link></div><section className="admin-passkey-card"><span className="eyebrow"><span className="eyebrow-line"/> ONE-TIME DEVICE SETUP</span><h1>REGISTER<br/><span>PASSKEY.</span></h1><p>Signed in as <b>{email}</b>. Register a passkey on this device to use it for future admin sign-ins.</p><p>Your browser may save it to this device or your password manager. Use the same device or synced passkey provider when signing in.</p><button className="button button-red" type="button" disabled={busy} onClick={() => void register()}><Fingerprint size={17}/>{busy ? 'Registering…' : 'Register this device'}</button>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="login-success" role="status">{message}</p>}</section></main>;
}
