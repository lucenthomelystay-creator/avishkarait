import { getAdminSession } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import { getSiteSettings } from '@/lib/supabase/admin';

export const revalidate = 0;

export default async function AdminQrConfigPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const settings = await getSiteSettings();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black uppercase tracking-wider text-black mb-6">
        QR Configuration
      </h1>

      <div className="bg-white border-2 border-brand-grey p-6 rounded mb-8">
        <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-4">
          QR Code Settings
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black/60 mb-2">
              QR Expiration (hours)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="168"
                value={settings?.qrExpirationHours ?? 24}
                onChange={(e) =>
                  window.location.href = `/admin/qr-config?qrExpirationHours=${e.target.value}`
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-brand-grey focus:border-black focus:outline-none text-xs text-black"
              />
              <QrCode className="w-4 h-4 text-black/40 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black/60 mb-2">
              Max Scans Per QR
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="9999"
                value={settings?.maxScansPerQr ?? 1}
                onChange={(e) =>
                  window.location.href = `/admin/qr-config?maxScansPerQr=${e.target.value}`
                }
                className="w-full pl-10 pr-4 py-3 border-2 border-brand-grey focus:border-black focus:outline-none text-xs text-black"
              />
              <QrCode className="w-4 h-4 text-black/40 absolute left-3 top-3.5" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-black mb-4">
          QR Purpose
        </h3>

        <p className="text-black/60 mb-4">
          QR codes are used for participant check-in at meals and other event access points.
        </p>

        <div className="space-y-3">
          <label className="flex items-center space-x-2 px-4 py-2 rounded ${
            settings?.qrPurpose === 'meals'
              ? 'bg-black text-white'
              : 'bg-brand-grey text-black'
          }" onClick={() => window.location.href = '/admin/qr-config?qrPurpose=meals'}>
            <span>Meal Check-in</span>
          </label>
          <label className="flex items-center space-x-2 px-4 py-2 rounded ${
            settings?.qrPurpose === 'general'
              ? 'bg-black text-white'
              : 'bg-brand-grey text-black'
          }" onClick={() => window.location.href = '/admin/qr-config?qrPurpose=general'}>
            <span>General Access</span>
          </label>
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