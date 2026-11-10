import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth/require-user';
import AdminPasskeySetup from '@/src/AdminPasskeySetup';

export const dynamic = 'force-dynamic';

export default async function AdminPasskeySetupPage() {
  const { supabase, user, role } = await getAuthenticatedContext();
  if (!supabase) return <main className="section"><h1>Supabase is not configured.</h1></main>;
  if (!user) redirect('/login?next=%2Fadmin%2Fpasskey%2Fsetup');
  if (role !== 'admin') return <main className="section"><h1>Administrator access required</h1><p>Sign in with an administrator account before registering a passkey.</p></main>;
  return <AdminPasskeySetup email={user.email ?? ''}/>;
}
