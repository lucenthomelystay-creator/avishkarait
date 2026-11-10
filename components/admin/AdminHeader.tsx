import { Shield, Bell, User } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  adminEmail?: string;
}

export default function AdminHeader({
  title,
  adminEmail = 'admin@institution.edu.in',
}: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b-2 border-brand-grey px-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <h1 className="text-base font-black uppercase tracking-wider text-black">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden sm:flex items-center space-x-2 text-xs text-black/60 font-mono">
          <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
          <span>System Active</span>
        </div>

        <div className="flex items-center space-x-3 pl-6 border-l border-brand-grey">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4 text-brand-red" />
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-bold text-black uppercase">
              Administrator
            </div>
            <div className="text-[11px] text-black/60 font-mono">
              {adminEmail}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}