"use client";

import { 
  Fingerprint, 
  Bell, 
  ShieldCheck, 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DualMockupShowcase from "./DualMockupShowcase";
import Image from "next/image";

const APP_FEATURES = [
  {
    icon: Fingerprint,
    title: "Biometric Security",
    desc: "Instant TouchID/FaceID hardware verification access."
  },
  {
    icon: Bell,
    title: "Real-time Push Alerts",
    desc: "Immediate alerts on dividend deposits and loan processing."
  },
  {
    icon: ShieldCheck,
    title: "Offline Signing Tokens",
    desc: "Generate cryptographically secure transaction approvals anywhere."
  }
];

export default function AppLaunchSection() {
  return (
    <section id="mobile-app" className="py-24 px-6 md:px-8 bg-slate-50/50 border-y border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
        
        {/* LEFT: Marketing & App Proposition Copy */}
        <div className="lg:col-span-5 space-y-8 text-left z-10">
          <div className="space-y-3">
            <p className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              Coming Soon
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-none">
              SACCO Operations,<br />Right in Your Pocket.
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl">
              Bring core multi-tenant asset management straight to your membership matrix. Drivers, farmers, and cooperative associations can monitor lines of credit, clear micro-loans, and run capital matching workflows seamlessly.
            </p>
          </div>

          {/* Core App Feature Blocks */}
          <div className="space-y-4">
            {APP_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="flex gap-4 items-start group">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center text-slate-600 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                    <Icon className="size-4.5" strokeWidth={2} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900">{feat.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Store App Access Call-To-Actions */}
          <div className="flex flex-wrap gap-3 pt-2">

            <Button className="h-12 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-full flex items-center gap-3 border-0 transition-all shadow-sm" disabled>
              <Image src="/playstore.svg" alt="Google Play Store Badge" width={20} height={20} className="object-contain" />
              <div className="text-left leading-tight">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Get it on</p>
                <p className="text-xs font-bold -mt-0.5">Google Play Store</p>
              </div>
            </Button>
          </div>
        </div>

        {/* RIGHT: Immersive Twin-Device 3D Canvas Matrix */}
        <div className="lg:col-span-7 relative z-10">

<DualMockupShowcase />
        </div>

      </div>
    </section>
  );
}