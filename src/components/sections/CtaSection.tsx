import { Button } from "@/components/ui/button";

// const QUICK_STATS = [
//   { value: "14 Days", label: "Sandbox Evaluation" },
//   { value: "Zero CC", label: "Required for Access" },
//   { value: "< 1 Hour", label: "Core Node Setup" },
//   { value: "24/7/365", label: "SLA Support Line" },
// ];

export default function CtaSection() {
  return (
    <section className="py-20 max-w-7xl mx-auto">
      {/* Sharp institutional container — no blur layers, no custom radial ambient gradients */}
      <div className="relative overflow-hidden bg-primary rounded-2xl px-6 py-12 md:p-16 shadow-xl shadow-slate-950/20">
        
        {/* Fine-line geometric accents — fully flat, zero blur overhead */}
        <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 border-[32px] border-white/[0.02] rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 border-[24px] border-white/[0.02] rounded-full" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Context Pane */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Deployment Pipelines
            </p>
            <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight leading-tight max-w-xl">
              Ready to Modernize Your SACCO Infrastructure?
            </h2>
            <p className="text-white/70 text-sm font-medium leading-relaxed max-w-lg">
              Join over 500 credit cooperatives driving high-scale compliance across the region. Operational node onboarding completes in under one hour, with comprehensive, zero-loss ledger data migration included.
            </p>
            
            {/* Standardized UI Action Array */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Button 
                variant="default" 
                size="lg" 
                className="h-12 px-6 font-bold text-xs tracking-wide rounded-full bg-white text-primary hover:bg-emerald-400 transition-colors"
              >
                Start Your Free Trial
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 px-6 font-bold text-xs tracking-wide bg-transparent rounded-full border-border text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
              >
                Request Architecture Consultation
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}