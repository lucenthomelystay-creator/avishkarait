'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users2,
  UserCheck,
  CalendarDays,
  CreditCard,
  QrCode,
  BarChart3,
  MailCheck,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Registrations', href: '/admin/registrations', icon: Users2 },
    { label: 'Participants', href: '/admin/participants', icon: UserCheck },
    { label: 'Events', href: '/admin/events', icon: CalendarDays },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    { label: 'QR Configuration', href: '/admin/qr-config', icon: QrCode },
    { label: 'Visitor Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Email Logs', href: '/admin/email-logs', icon: MailCheck },
    { label: 'Admin Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-black text-white min-h-screen border-r-2 border-brand-red flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-brand-grey/20">
          <Link href="/admin" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-brand-red flex items-center justify-center font-bold text-white text-sm">
              H26
            </div>
            <div>
              <div className="font-bold text-sm tracking-wider uppercase text-white">
                Admin Control
              </div>
              <div className="text-[10px] text-brand-grey uppercase tracking-widest">
                Hackathon Platform
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${isActive ? 'bg-brand-red text-white' : 'text-brand-grey hover:bg-brand-grey/10 hover:text-white'}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand-red'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-brand-grey/20 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-4 py-2.5 text-xs uppercase font-semibold text-brand-grey hover:text-white hover:bg-brand-grey/10 transition-colors"
        >
          <span>View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs uppercase font-bold text-brand-red hover:bg-brand-red hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}