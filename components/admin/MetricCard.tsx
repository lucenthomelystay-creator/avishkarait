import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  highlight = false,
}: MetricCardProps) {
  return (
    <div
      className={`p-6 border-2 transition-colors ${highlight
        ? 'bg-black text-white border-brand-red'
        : 'bg-white text-black border-brand-grey hover:border-black'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className={`text-xs uppercase font-bold tracking-wider ${highlight ? 'text-brand-grey' : 'text-black/60'}`}
        >
          {title}
        </span>
        <div
          className={`w-9 h-9 flex items-center justify-center ${highlight ? 'bg-brand-red text-white' : 'bg-black text-white'}`}
        >
          <Icon className="w-4 h-4 text-brand-red" />
        </div>
      </div>

      <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none mb-2">
        {value}
      </div>

      {subtitle && (
        <div
          className={`text-xs ${highlight ? 'text-brand-grey/80' : 'text-black/60'}`}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}