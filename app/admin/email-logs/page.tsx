import { getAdminSession } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import { supabaseAdmin, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
import fs from 'fs';
import path from 'path';
import { Mail, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const revalidate = 0;

export default async function AdminEmailLogsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  let emailLogs: any[] = [];

  if (isLiveSupabaseConfigured && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false });
    if (data) emailLogs = data;
  } else {
    try {
      const dataFile = path.join(process.cwd(), '.data', 'db.json');
      if (fs.existsSync(dataFile)) {
        const db = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
        emailLogs = (db.email_logs || []).reverse();
      }
    } catch {}
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-black uppercase text-black">
          Transactional Email Logs & Delivery Audit
        </h2>
        <p className="text-xs text-black/60 mt-0.5">
          Track automated admin notifications and team lead payment receipts dispatched via Resend.
        </p>
      </div>

      <div className="bg-white border-2 border-brand-grey overflow-hidden">
        {emailLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-black/60">
            No outgoing emails recorded yet. Logs will populate automatically upon new registrations or payment confirmations.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-grey text-black uppercase font-bold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Email Type</th>
                  <th className="p-3">Recipient Address</th>
                  <th className="p-3">Team Reference</th>
                  <th className="p-3">Delivery Status</th>
                  <th className="p-3">Provider ID / Error Reason</th>
                  <th className="p-3">Dispatched Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-grey">
                {emailLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-brand-grey/20">
                    <td className="p-3 font-mono text-black/50">{idx + 1}</td>
                    <td className="p-3 font-bold text-black uppercase">
                      {log.email_type?.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3 font-mono text-black/80">{log.recipient_email}</td>
                    <td className="p-3 font-mono font-bold text-brand-red">
                      {log.team_id || 'N/A'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                          log.delivery_status === 'SENT'
                            ? 'bg-black text-white'
                            : 'bg-brand-red text-white'
                        }`}
                      >
                        {log.delivery_status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-black/80 max-w-xs truncate">
                      {log.failure_reason || log.provider_message_id || 'Delivered'}
                    </td>
                    <td className="p-3 text-black/60">
                      {new Date(log.sent_at).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}