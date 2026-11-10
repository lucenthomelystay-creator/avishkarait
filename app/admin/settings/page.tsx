import { getAdminSession } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import { getSiteSettings } from '@/lib/supabase/admin';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const settings = await getSiteSettings();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black uppercase tracking-wider text-black mb-6">
        Admin Settings
      </h1>

      <div className="bg-white border-2 border-brand-grey p-6 rounded mb-8">
        <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-4">
          Site Configuration
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black/60 mb-2">
              Hackathon Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={settings?.hackathon_name || 'NATIONAL LEVEL HACKATHON 2K26'}
                onChange={(e) =>
                  window.location.href = `/admin/settings?hackathon_name=${e.target.value}`
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-brand-grey focus:border-black focus:outline-none text-xs text-black"
                readOnly
              />
              <Tag className="w-4 h-4 text-black/40 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black/60 mb-2">
              Edition
            </label>
            <div className="relative">
              <input
                type="text"
                value={settings?.edition || '2K26'}
                onChange={(e) =>
                  window.location.href = `/admin/settings?edition=${e.target.value}`
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-brand-grey focus:border-black focus:outline-none text-xs text-black"
                readOnly
              />
              <Tag className="w-4 h-4 text-black/40 absolute left-3 top-3.5" />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-black/60 mb-2">
            Registration Status
          </label>
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded ${
                settings?.registrations_globally_open ? 'bg-black text-white' : 'bg-brand-grey text-black'}
              `}
            >
              {settings?.registrations_globally_open ? 'Open' : 'Closed'}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-black mb-4">
          Institutional Details
        </h3>

        <p className="text-black/60 mb-4">
          These details appear on exported CSVs and public-facing pages.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black/60 mb-2">
              Institution Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={settings?.institution_name || 'COLLEGE OF ENGINEERING & TECHNOLOGY'}
                onChange={(e) =>
                  window.location.href = `/admin/settings?institution_name=${e.target.value}`
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-brand-grey focus:border-black focus:outline-none text-xs text-black"
                readOnly
              />
              <Building className="w-4 h-4 text-black/40 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black/60 mb-2">
              Trust Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={settings?.trust_name || 'EDUCATIONAL TRUST'}
                onChange={(e) =>
                  window.location.href = `/admin/settings?trust_name=${e.target.value}`
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-brand-grey focus:border-black focus:outline-none text-xs text-black"
                readOnly
              />
              <Building className="w-4 h-4 text-black/40 absolute left-3 top-3.5" />
            </div>
          </div>
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