import { BadgeCheck, Users, ShieldCheck, Gauge, LucideIcon } from "lucide-react";

interface StatItem {
  value: string;
  label: string;
  sub: string;
  icon: LucideIcon;
}

const STATS: StatItem[] = [
  { value: "99.99%", label: "Core Uptime SLA", sub: "Guaranteed platform availability", icon: BadgeCheck },
  { value: "2.4M+", label: "Members Managed", sub: "Active across 500+ live networks", icon: Users },
  { value: "256-bit", label: "Bank-Grade Encryption", sub: "End-to-end ledger compliance", icon: ShieldCheck },
  { value: "< 2.0s", label: "Audit Engine Speed", sub: "Instant report generation", icon: Gauge },
];

export default function StatsSection() {
  return (
    /* Completely built directly with your brand primary color #024d38 */
    <section className="w-full bg-primary py-20 px-6 md:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center space-y-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 border border-white/10 text-white shadow-xs">
                  <Icon className="size-5" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">{stat.value}</p>
                  <p className="text-xs font-bold text-white tracking-wide">{stat.label}</p>
                  <p className="text-[11px] text-white/70 font-medium leading-relaxed max-w-xs">{stat.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}