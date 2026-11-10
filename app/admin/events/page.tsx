import { getAdminSession } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import { getSiteSettings } from '@/lib/supabase/admin';
import { EVENT_DOMAINS } from '@/lib/constants';

export const revalidate = 0;

export default async function AdminEventsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const settings = await getSiteSettings();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black uppercase tracking-wider text-black mb-6">
        Event Domains Configuration
      </h1>

      <div className="bg-white border-2 border-brand-grey p-6 rounded mb-8">
        <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-4">
          Global Registration Settings
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black/60 mb-2">
              Registrations Globally Open
            </label>
            <div className="flex items-center space-x-3">
              <label
                className={`flex items-center space-x-2 px-4 py-2 rounded ${
                  settings?.registrations_globally_open ?? true
                    ? 'bg-black text-white'
                    : 'bg-brand-grey text-black'}
                `}
              >
                <input
                  type="checkbox"
                  checked={settings?.registrations_globally_open ?? true}
                  onChange={(e) =>
                    window.location.href = `/admin/settings?registrations_globally_open=${
                      e.target.checked ? 'true' : 'false'
                    }`
                  }
                />
                <span className="text-black">Open</span>
              </label>
              <label
                className={`flex items-center space-x-2 px-4 py-2 rounded ${
                  !(settings?.registrations_globally_open ?? true)
                    ? 'bg-black text-white'
                    : 'bg-brand-grey text-black'}
                `}
              >
                <input
                  type="checkbox"
                  checked={!(settings?.registrations_globally_open ?? true)}
                  onChange={(e) =>
                    window.location.href = `/admin/settings?registrations_globally_open=${
                      e.target.checked ? 'true' : 'false'
                    }`
                  }
                />
                <span className="text-black">Closed</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black/60 mb-2">
              Total Teams Registered
            </label>
            <div className="p-3 bg-black text-white text-2xl font-mono">
              {settings?.totalTeams || 0}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-black mb-4">
          Event Domains
        </h3>

        <p className="text-black/60 mb-6">
          Challenge details are stored as editable JSON. Each domain controls its own
          registration availability, team size limits, and focus areas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(EVENT_DOMAINS).map((event) => {
            return (
              <div
                key={event.code}
                className="bg-black text-white p-6 rounded border-brand-grey/20 hover:border-brand-red/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-brand-red text-white">
                      {event.code}
                    </span>
                    <h4 className="text-xl font-black uppercase text-white">
                      {event.name}
                    </h4>
                  </div>
                  <span className="text-xs text-white/60">
                    {event.registration_open ? 'Open' : 'Closed'}
                  </span>
                </div>

                <p className="text-white/60 mb-3 small">
                  {event.description || 'No description available'}
                </p>

                <div className="text-xs text-white/40">
                  <span>Min team size:</span> {event.minimum_team_size || '—'}
                  <span>&#160;|&#160;</span>
                  <span>Max team size:</span> {event.maximum_team_size || '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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