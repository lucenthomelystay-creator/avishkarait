'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, Fingerprint } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function AdminPasskeyLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setError('Supabase is not configured.'); return; }
    setBusy(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPasskey();
      if (authError || !data.user) throw new Error('Passkey sign-in failed. Confirm that this admin account has a registered passkey.');
      if ((data.user.email ?? '').toLowerCase() !== email.trim().toLowerCase()) {
        await supabase.auth.signOut();
        throw new Error('That passkey belongs to a different email address.');
      }
      const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('This account does not have administrator access.');
      }
      router.replace('/admin');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Passkey sign-in failed. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="section admin-passkey-page"><div className="section-label"><span>AVISHKAR 2K26 / ADMIN ACCESS</span><Link href="/">Public website</Link></div><section className="admin-passkey-card"><span className="eyebrow"><span className="eyebrow-line"/> PASSKEY SIGN-IN</span><h1>ADMIN<br/><span>PORTAL.</span></h1><p>Enter your admin email, then approve the passkey prompt on your device.</p><form className="form" onSubmit={signIn}><label>Admin email<input type="email" autoComplete="username webauthn" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com"/></label><button className="button button-red" type="submit" disabled={busy}><Fingerprint size={17}/>{busy ? 'Checking passkey…' : 'Continue with passkey'} <ArrowUpRight size={15}/></button></form>{error && <p className="form-error" role="alert">{error}</p>}<p className="admin-passkey-setup-link">First time? <Link href="/admin/passkey/setup">Set up an admin passkey</Link></p><Link className="admin-team-login" href="/login">Team leader sign-in uses email magic links</Link></section></main>;
}
