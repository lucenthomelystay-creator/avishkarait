import { getAdminSession } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import { getAllRegistrations } from '@/lib/supabase/admin';
import { Users2 } from 'lucide-react';

export const revalidate = 0;

export default async function AdminParticipantsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const teams = await getAllRegistrations();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black uppercase tracking-wider text-black mb-6">
        Participants Overview
      </h1>

      {teams.length === 0 ? (
        <div className="bg-white border-2 border-brand-grey p-8 text-center text-black/60">
          <h3>No participant data yet.</h3>
          <p>Teams have not been submitted.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-brand-grey text-black uppercase font-bold">
              <tr>
                <th className="p-3">Team ID</th>
                <th className="p-3">Team Name</th>
                <th className="p-3">Event Domain</th>
                <th className="p-3">Team Lead</th>
                <th className="p-3">Total Members</th>
                <th className="p-3">Emails</th>
                <th className="p-3">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-grey">
              {teams.map((t: any) => {
                const members = t.members || [];
                return (
                  <tr key={t.id} className="hover:bg-brand-grey/20">
                    <td className="p-3 font-mono font-bold text-brand-red">{t.team_uid}</td>
                    <td className="p-3 font-bold text-black">{t.team_name}</td>
                    <td className="p-3 uppercase">
                      {t.events?.event_name || t.event_id || 'N/A'}
                    </td>
                    <td className="p-3">{t.team_lead_name}</td>
                    <td className="p-3">{members.length}</td>
                    <td className="p-3">
                      {members
                        .map((m: any) => m.email)
                        .filter((e: string) => e)
                        .slice(0, 3)
                        .join(', ')}{members.length > 3 ? ` +${members.length - 3} more` : ''}
                    </td>
                    <td className="p-3 text-black/60">
                      {new Date(t.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8">
        <a
          href="/admin"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-red text-white text-sm font-bold uppercase rounded hover:bg-brand-darkred transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </a>
      </div>
    </div>
  );
}