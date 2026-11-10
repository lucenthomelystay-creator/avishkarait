import { getAdminSession } from '@/lib/admin-auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  return (
    <div className="min-h-screen bg-brand-grey/20 flex flex-col lg:flex-row font-sans">
      {session ? (
        <>
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader title="Hackathon Administration Portal" adminEmail={session.email} />
            <main className="p-6 sm:p-10 flex-1 overflow-y-auto">{children}</main>
          </div>
        </>
      ) : (
        <div className="w-full min-h-screen">{children}</div>
      )}
    </div>
  );
}