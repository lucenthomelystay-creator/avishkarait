'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('');
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setError('Supabase is not configured. Add the environment variables shown in .env.example and restart the app.'); return; }
    setSending(true);
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const requestedNext = new URLSearchParams(window.location.search).get('next') || '/portal';
      const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/portal';
      const { error: authError } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` } });
      if (authError) setError(`Supabase could not send the sign-in link: ${authError.message}${authError.code ? ` (${authError.code})` : ''}`);
      else setMessage('Supabase accepted the magic-link request. Check your email to finish signing in.');
    } catch {
      setError('Supabase could not be reached. Check your connection and project URL.');
    } finally { setSending(false); }
  }

  return <section className="section login-section">
    <div className="section-label"><span>AVISHKAR 2K26 / PARTICIPANT ACCESS</span><span>EMAIL AUTHENTICATION</span></div>
    <div className="login-content"><span className="eyebrow"><span className="eyebrow-line"/> SECURE SIGN IN</span><h1>YOUR TEAM<br/><span>STARTS HERE.</span></h1><p>Enter the team leader’s email. Supabase will send a one-time sign-in link; no password is stored by this site.</p>
      <form className="form login-form" onSubmit={sendMagicLink}><label>Email address<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="name@college.edu"/></label><button className="button button-red" type="submit" disabled={sending}>{sending?'Requesting link…':'Send magic link'} <ArrowUpRight size={15}/></button></form>
      {error&&<p className="form-error" role="alert">{error}</p>}{message&&<p className="login-success" role="status">{message}</p>}
      <p className="login-back">Registration requires an authenticated team leader account. <Link href="/register">Back to registration</Link></p>
    </div>
  </section>;
}
