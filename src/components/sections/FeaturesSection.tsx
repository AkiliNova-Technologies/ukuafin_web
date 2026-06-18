"use client";

import { cn } from "@/lib/utils";
import { 
  User, 
  LineChart, 
  PiggyBank, 
  Network, 
  FileSpreadsheet, 
  ShieldCheck, 
  Smartphone, 
  RefreshCw,
  LucideIcon
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gridClass?: string;
}

const FEATURES: Feature[] = [
  {
    icon: User,
    title: "Member Self-Service Portal",
    description: "Empower members with a 24/7 portal to check balances, apply for loans, update profiles, and download statements without administrative overhead.",
    gridClass: "md:col-span-2",
  },
  {
    icon: LineChart,
    title: "Real-time Loan Tracking",
    description: "Monitor loan disbursements, repayments, and aging with live dashboards and automated compliance tracking.",
  },
  {
    icon: PiggyBank,
    title: "Savings Management",
    description: "Flexible savings schemes with automated interest calculations, multiple share categories, and dividend distribution tools.",
  },
  {
    icon: Network,
    title: "Multi-branch Operations",
    description: "Manage multiple branches from one unified interface with granular role-based access control and consolidated reporting metrics.",
  },
  {
    icon: FileSpreadsheet,
    title: "One-click Statutory Reports",
    description: "Generate SACCO regulatory reports and internal management insights in seconds, pre-formatted to local audit standards.",
  },
  {
    icon: ShieldCheck,
    title: "Immutable Audit Logs",
    description: "Every transaction and system change is logged and completely tamper-proof, ensuring absolute accountability and audit readiness.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first Member App",
    description: "Native iOS and Android utilities ensuring members can manage their share capital accounts securely from any location.",
  },
  {
    icon: RefreshCw,
    title: "Core Banking Integration",
    description: "Production-grade REST APIs and secure pre-built connectors for seamless synchronization with tier-1 settlement banks.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 md:px-8 bg-transparent">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Typography Hub */}
        <div className="text-left md:text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs font-bold text-primary uppercase tracking-widest">
            Platform Capabilities
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            A Unified Financial Infrastructure
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Everything required to manage professional credit operations—from primary recordkeeping to real-time risk evaluation metrics.
          </p>
        </div>

        {/* Dynamic Bento-Style Feature Mesh */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, gridClass }, idx) => (
            <div
              key={idx}
              className={cn(
                "group relative p-6 bg-white rounded-2xl border border-slate-200/80",
                "hover:border-primary/40 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300",
                gridClass
              )}
            >
              <div className="space-y-4">
                {/* Responsive SVG Container Context */}
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:text-primary group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-300">
                  <Icon className="size-5" strokeWidth={2} />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-base tracking-tight leading-snug">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}