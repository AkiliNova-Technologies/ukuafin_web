// src/app/(tenant)/tenant/billing/pricing-section.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CircleCheck, CircleMinus, Loader2, CalendarDays } from "lucide-react";
import { handlePlanCheckout } from "@/app/actions/billing";
import { toast } from "sonner";

export interface UILayerPlan {
  id: string; 
  name: string;
  price: { monthly: number | string; annual: number | string };
  tagline: string;
  cta: string;
  highlight?: boolean;
  features: string[];
  notIncluded?: string[];
}

interface PricingSectionProps {
  organizationId: string;
  userId: string;
  mappedPlans: UILayerPlan[];
}

export default function PricingSection({ organizationId, userId, mappedPlans }: PricingSectionProps) {
  const [annual, setAnnual] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const onSelectPlan = async (plan: UILayerPlan) => {
    if (plan.price.monthly === "Custom") {
      // FIXED: Reassigned to method assign call instead of direct variable modification mutation 
      window.location.assign(`mailto:architecture@ukuafin.com?subject=Enterprise Tier Inquiry`);
      return;
    }

    try {
      setLoadingPlanId(plan.id);
      await handlePlanCheckout({
        planId: plan.id,
        organizationId,
        userId,
      });
    } catch (err: unknown) {
      // FIXED: Used safe unknown casting assertion rules instead of any
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize Pesapal gateway link.";
      
      toast.error("Checkout Error", {
        description: errorMessage,
      });
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <section id="pricing" className="pb-12 px-2 bg-transparent">
      <div className="w-full mx-auto space-y-12">

        {/* Re-Engineered Dashboard Control Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-border rounded-full p-5">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-500 shrink-0">
              <CalendarDays className="size-4 text-emerald-700" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-900">Recurrence Frequency</p>
              <p className="text-xs text-slate-400 font-medium">
                Choose between active monthly accounts or annual cycles with corporate discount structures.
              </p>
            </div>
          </div>
          
          {/* Unified Pill Toggle System */}
          <div className="inline-flex items-center bg-slate-100 rounded-full p-1 border border-slate-200/40 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                "px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 select-none",
                !annual 
                  ? "bg-emerald-700 text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                "px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1 select-none",
                annual 
                  ? "bg-emerald-700 text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              Yearly
              <span className={cn(
                "text-[9px] font-black px-1.5 py-0.25 rounded-md", 
                annual ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
              )}>
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Card Assembly Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-8 items-center max-w-8xl mx-auto">
          {mappedPlans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-[28px] p-8 transition-all duration-300 justify-between min-h-[580px]",
                plan.highlight
                  ? "bg-emerald-800 text-white shadow-xl shadow-emerald-900/20 md:scale-[1.03] z-10 py-12 border border-emerald-700"
                  : "bg-white text-slate-900 border border-border shadow-sm shadow-slate-100/60 py-10"
              )}
            >
              {plan.highlight && (
                <div className="absolute top-4 right-6 bg-white/10 text-white border border-white/10 text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase select-none">
                  Most Popular
                </div>
              )}

              <div className="space-y-6 flex-grow">
                <div className="flex items-baseline gap-1">
                  {typeof plan.price.monthly === "number" ? (
                    <>
                      <span className="text-4xl font-bold tracking-tight">
                        ${annual ? plan.price.annual : plan.price.monthly}
                      </span>
                      <span className={cn("text-xs font-bold opacity-60", plan.highlight ? "text-white" : "text-slate-400")}>
                        /month
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold tracking-tight">
                      Custom
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {plan.name}
                  </h3>
                  <p className={cn(
                    "text-xs font-medium leading-relaxed min-h-[36px]",
                    plan.highlight ? "text-white/80" : "text-slate-500"
                  )}>
                    {plan.tagline}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-left">
                      <CircleCheck 
                        className={cn(
                          "size-4 shrink-0 mt-0.5",
                          plan.highlight ? "text-white" : "text-emerald-600"
                        )} 
                      />
                      <span className={cn("text-xs font-medium leading-normal", plan.highlight ? "text-white/90" : "text-slate-600")}>
                        {feature}
                      </span>
                    </div>
                  ))}
                  
                  {plan.notIncluded?.map((feature) => (
                    <div key={feature} className={cn("flex items-start gap-2.5 text-left", plan.highlight ? "opacity-30" : "opacity-35")}>
                      <CircleMinus 
                        className={cn(
                          "size-4 shrink-0 mt-0.5", 
                          plan.highlight ? "text-white" : "text-slate-400"
                        )} 
                      />
                      <span className={cn("text-xs font-medium line-through leading-normal", plan.highlight ? "text-white" : "text-slate-400")}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <Button
                  disabled={loadingPlanId !== null}
                  onClick={() => onSelectPlan(plan)}
                  className={cn(
                    "w-full h-11 font-bold text-xs rounded-full tracking-wide transition-all border-0 flex items-center justify-center gap-2",
                    plan.highlight
                      ? "bg-white text-emerald-900 hover:bg-slate-50 hover:text-emerald-900"
                      : "bg-emerald-900 text-white hover:bg-emerald-900/80"
                  )}
                >
                  {loadingPlanId === plan.id && <Loader2 className="size-4 animate-spin" />}
                  {plan.cta}
                </Button>
              </div>

            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}