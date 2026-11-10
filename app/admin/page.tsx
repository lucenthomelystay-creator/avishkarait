import { getAdminSession } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import { getAdminMetrics, getAllRegistrations, getSiteSettings } from '@/lib/supabase/admin';
import MetricCard from '@/components/admin/MetricCard';
import Link from 'next/link';
import { Users2, UserCheck, CreditCard, Clock, IndianRupee, Eye, TrendingUp, ArrowRight } from 'lucide-react';
import { EVENT_DOMAINS } from '@/lib/constants';

export const revalidate = 0;

export default async function AdminOverviewPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const [metrics, teams, settings] = await Promise.all([
    getAdminMetrics(),
    getAllRegistrations(),
    getSiteSettings(),
  ]);

  // Calculate event-wise real counts
  const eventCounts: Record<string, number> = {
    CYB: 0,
    FSD: 0,
    IOT: 0,
    THE: 0,
    MEC: 0,
  };

  teams.forEach((t: any) => {
    const code = t.events?.event_code || t.event_code || t.event_id;
    if (code && eventCounts[code] !== undefined) {
      eventCounts[code] += 1;
    }
  });

  return (
    <div className="space-y-10">
      <h1>Admin Overview</h1>

      {/* 10 Core Metrics Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-black mb-4">
          Key Performance Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Registrations"
            value={metrics.totalRegistrations}
            subtitle="Verified team applications"
            icon={Users2}
            highlight
          />
          <MetricCard
            title="Total Participants"
            value={metrics.totalParticipants}
            subtitle="Includes team leads & members"
            icon={UserCheck}
          />
          <MetricCard
            title="Paid Teams"
            value={metrics.paidTeams}
            subtitle="Fully settled registrations"
            icon={CreditCard}
          />
          <MetricCard
            title="Total Revenue"
            value={metrics.revenue}
            subtitle="Collected registration fees"
            icon={IndianRupee}
          />
          <MetricCard
            title="Pending Payments"
            value={metrics.pendingPayments}
            subtitle="Awaiting admin UTR review"
            icon={Clock}
          />
          <MetricCard
            title="Failed / Not Paid"
            value={metrics.failedPayments}
            subtitle="Incomplete payment attempts"
            icon={AlertOctagon}
          />
          <MetricCard
            title="Total Page Views"
            value={metrics.totalVisitors}
            subtitle="First-party privacy tracking"
            icon={Eye}
          />
          <MetricCard
            title="Unique Visitors"
            value={metrics.uniqueVisitors}
            subtitle="Distinct device sessions"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Event-Wise Registration Breakdown */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-black">
          Event Domain Registrations
        </h3>
        <Link
          href="/admin/events"
          className="text-xs font-bold uppercase text-brand-red hover:text-brand-darkred flex items-center space-x-1"
        >
          <span>Configure Availability</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.values(EVENT_DOMAINS).map((event) => {
          const count = eventCounts[event.code] || 0;
          return (
            <div
              key={event.code}
              className="bg-white border-2 border-brand-grey p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-black text-white">
                    {event.code}
                  </span>
                  <span className="text-xs font-bold text-brand-red">Active</span>
                </div>
                <h4 className="text-xs font-bold uppercase text-black line-clamp-2 mb-3">
                  {event.name}
                </h4>
              </div>
              <div className="pt-3 border-t border-brand-grey flex items-end justify-between">
                <span className="text-[11px] text-black/50 uppercase font-semibold">Teams:</span>
                <span className="text-xl font-black font-mono text-black">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table Preview */}
      <div className="bg-white border-2 border-brand-grey p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-black uppercase text-black">
              Recent Team Registrations
            </h3>
            <p className="text-xs text-black/60 mt-0.5">
              Showing latest registered teams across all 5 event domains.
            </p>
          </div>
          <Link
            href="/admin/registrations"
            className="text-xs font-bold uppercase tracking-wider text-brand-red hover:text-brand-darkred flex items-center space-x-1"
          >
            <span>View All Registrations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {teams.length === 0 ? (
          <div className="py-12 text-center text-xs text-black/60 border-2 border-dashed border-brand-grey">
            No registrations received yet. Waiting for participant submissions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-grey text-black uppercase font-bold">
                <tr>
                  <th className="p-3">Team ID</th>
                  <th className="p-3">Team Name</th>
                  <th className="p-3">Event Domain</th>
                  <th className="p-3">Team Lead</th>
                  <th className="p-3">College</th>
                  <th className="p-3">Payment Status</th>
                  <th className="p-3">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-grey">
                {teams.slice(0, 5).map((t: any) => (
                  <tr key={t.id} className="hover:bg-brand-grey/20">
                    <td className="p-3 font-mono font-bold text-brand-red">{t.team_uid}</td>
                    <td className="p-3 font-bold text-black">{t.team_name}</td>
                    <td className="p-3 uppercase">
                      {t.events?.event_name || t.event_id}
                    </td>
                    <td className="p-3">{t.team_lead_name}</td>
                    <td className="p-3">{t.college_name}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase ${t.payments?.[0]?.payment_status === 'PAID' ? 'bg-black text-white' : 'bg-brand-grey text-black'}`}
                      >
                        {t.payments?.[0]?.payment_status || 'NOT PAID'}
                      </span>
                    </td>
                    <td className="p-3 text-black/60">
                      {new Date(t.created_at).toLocaleDateString('en-IN')}
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