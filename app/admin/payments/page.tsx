import { redirect } from 'next/navigation';
import { getAuthenticatedContext } from '@/lib/auth/require-user';
import AdminPaymentsManager from './AdminPaymentsManager';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const { supabase, user, role } = await getAuthenticatedContext();
  if (!supabase) return <main className="section"><h1>Administrator portal unavailable</h1><p>Supabase is not configured for this deployment.</p></main>;
  if (!user) redirect('/admin/login');
  if (role !== 'admin') return <main className="section"><h1>Administrator access required</h1><p>This account does not have the administrator role.</p></main>;

  const { data: registrations, error } = await supabase
    .from('registrations')
    .select('id,reference_id,team_uid,team_name,institution,status,created_at,challenge_id,payment_status,payment_reference,payment_amount,domain:domains(id,name,slug,event_details),team:teams(id,name,institution,college_city,college_state,leader_id,assigned_repository_url,members:team_members(id,full_name,email,github_username,phone,is_leader))')
    .order('created_at', { ascending: false });

  if (error) {
    return <main className="section"><h1>Could not load payments</h1><p>Payment data could not be retrieved right now.</p></main>;
  }

  const rows = (registrations || []).map((reg: any) => {
    const domain = Array.isArray(reg.domain) ? reg.domain[0] : reg.domain;
    const team = Array.isArray(reg.team) ? reg.team[0] : reg.team;
    const members = (team?.members || []).map((m: any) => ({
      id: m.id,
      full_name: m.full_name || '',
      email: m.email || '',
      github_username: m.github_username || '',
      phone: m.phone || '',
      is_leader: Boolean(m.is_leader),
    }));
    const leader = members.find((m: any) => m.is_leader) || null;
    return {
      id: reg.id,
      reference_id: reg.reference_id || '',
      team_uid: reg.team_uid || '',
      team_name: reg.team_name || team?.name || 'Unnamed Team',
      institution: reg.institution || team?.institution || '',
      college: [team?.college_city, team?.college_state].filter(Boolean).join(', '),
      challenge_id: reg.challenge_id || '',
      registration_status: reg.status || 'pending',
      payment_status: reg.payment_status || 'NOT PAID',
      payment_reference: reg.payment_reference || '',
      payment_amount: reg.payment_amount ?? null,
      created_at: reg.created_at || '',
      domain: { id: domain?.id || '', name: domain?.name || 'Unknown', slug: domain?.slug || '' },
      leader,
      members,
    };
  });

  return <AdminPaymentsManager registrations={rows} />;
}
