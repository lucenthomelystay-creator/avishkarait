import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const failure = () => NextResponse.json(
  { error: 'Sign-in failed. Check your username and passphrase.' },
  { status: 401, headers: { 'cache-control': 'no-store' } },
);

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Request origin is not allowed.' }, { status: 403 });
  }

  const expectedUsername = process.env.ADMIN_LOGIN_USERNAME;
  const authEmail = process.env.ADMIN_LOGIN_EMAIL;
  if (!expectedUsername || !authEmail) {
    return NextResponse.json({ error: 'Admin sign-in is not configured on the server.' }, { status: 503 });
  }

  let body: { username?: unknown; passphrase?: unknown };
  try {
    body = await request.json();
  } catch {
    return failure();
  }
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const passphrase = typeof body.passphrase === 'string' ? body.passphrase : '';
  if (!username || username.length > 80 || !passphrase || passphrase.length > 256) return failure();

  // The public form accepts a username. Supabase Auth uses the administrator's
  // internally configured email as the account identifier; no email is sent.
  if (username.toLowerCase() !== expectedUsername.trim().toLowerCase()) return failure();

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase is not configured on this deployment. Check the Supabase URL and publishable/anon key in Vercel.' }, { status: 503, headers: { 'cache-control': 'no-store' } });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: passphrase });
    if (error || !data.user) {
      // Keep invalid credentials indistinguishable, but record the provider error
      // server-side so network/configuration failures can be diagnosed safely.
      if (error) console.error('[admin-login] Supabase password sign-in failed:', error.message);
      return failure();
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();
    if (profileError || profile?.role !== 'admin') {
      if (profileError) console.error('[admin-login] Could not verify administrator profile:', profileError.message);
      await supabase.auth.signOut();
      return failure();
    }

    return NextResponse.json({ success: true }, { headers: { 'cache-control': 'no-store' } });
  } catch (cause) {
    // A rejected fetch (for example, "Load failed") means the Auth service
    // could not be reached; do not expose provider internals to the browser.
    console.error('[admin-login] Supabase Auth request could not be completed:', cause);
    return NextResponse.json(
      { error: 'Could not reach Supabase Auth. Check the Supabase project status and the Supabase URL/key configured in Vercel, then try again.' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}

