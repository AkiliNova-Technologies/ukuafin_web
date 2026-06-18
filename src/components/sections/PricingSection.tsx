"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CircleCheck, CircleMinus, Loader2 } from "lucide-react";
import { handlePlanCheckout } from "@/app/actions/billing";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  price: { monthly: number | string; annual: number | string };
  tagline: string;
  cta: string;
  highlight?: boolean;
  features: string[];
  notIncluded?: string[];
}

const PLANS: Plan[] = [
  {
    id: "plan_basic_123",
    name: "Basic Plan",
    price: { monthly: 99, annual: 79 },
    tagline: "Essential infrastructure for local credit unions starting out.",
    cta: "Deploy Basic Core",
    features: [
      "Up to 500 active members",
      "Core savings & loan tracking",
      "Standard financial ledger reports",
      "Unified email support channels",
      "2 administrative staff accounts",
      "Mobile application access",
    ],
    notIncluded: [
      "Advanced compliance logs",
      "Multi-branch architecture",
      "API integration access",
    ],
  },
  {
    id: "plan_professional_456",
    name: "Professional Plan",
    price: { monthly: 249, annual: 199 },
    tagline: "For scaling SACCO operations with complex audit mandates.",
    cta: "Initiate Free Trial",
    highlight: true,
    features: [
      "Up to 5,000 active members",
      "Advanced audit & compliance logs",
      "Mobile app member portal access",
      "Priority SLA support (24 hours)",
      "15 administrative staff accounts",
      "Multi-branch routing (up to 5)",
      "Production API channel access",
      "Custom compliance report builder",
    ],
    notIncluded: [
      "Enterprise white-label branding",
      "Dedicated residency account manager",
    ],
  },
  {
    id: "plan_enterprise_789",
    name: "Enterprise Tier",
    price: { monthly: "Custom", annual: "Custom" },
    tagline: "Unconstrained scale with dedicated infrastructural support.",
    cta: "Contact Architecture Team",
    features: [
      "Unlimited membership capacity",
      "White-labeled client portal interface",
      "24/7 dedicated account manager",
      "On-premise cloud isolation options",
      "Custom integration pipelines & APIs",
      "SLA-backed node uptime guarantee",
      "In-person staff operational training",
      "Local regulatory compliance consulting",
    ],
  },
];

export default function PricingSection({
  organizationId,
  userId,
}: {
  organizationId?: string;
  userId?: string;
}) {
  const [annual, setAnnual] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const onSelectPlan = async (plan: Plan) => {
    if (plan.price.monthly === "Custom") {
      window.location.assign(
        `mailto:architecture@ukuafin.com?subject=Enterprise Tier Inquiry`,
      );
      return;
    }

    if (!organizationId || !userId) {
      toast.error("Authentication Required", {
        description:
          "Please sign in or register your workspace to subscribe to a core engine tier.",
      });
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
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to initialize Pesapal gateway link.";
      toast.error("Checkout Error", {
        description: msg,
      });
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <section id="pricing" className="py-24 px-6 md:px-8 bg-transparent">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs font-bold text-primary uppercase tracking-widest">
            Predictable Cost Overhead
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Transparent Pricing Models
          </h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Scalable accounting tiers with zero hidden settlement operational
            fees. Adjust parameters dynamically as your membership matrix grows.
          </p>

          <div className="inline-flex items-center bg-slate-100 rounded-full p-1 border border-slate-200/40 !mt-6">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                "px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200",
                !annual
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600",
              )}>
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                "px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5",
                annual
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-600",
              )}>
              Yearly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-8 items-center max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-[28px] p-8 transition-all duration-300 justify-between",
                plan.highlight
                  ? "bg-primary text-white shadow-xl shadow-primary/20 md:scale-[1.05] z-10 py-12 border border-primary"
                  : "bg-white text-slate-900 border border-slate-100 shadow-sm shadow-slate-100/60 py-10",
              )}>
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
                      <span
                        className={cn(
                          "text-xs font-bold opacity-60",
                          plan.highlight ? "text-white" : "text-slate-400",
                        )}>
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
                  <p
                    className={cn(
                      "text-xs font-medium leading-relaxed min-h-[36px]",
                      plan.highlight ? "text-white/80" : "text-slate-500",
                    )}>
                    {plan.tagline}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2.5 text-left">
                      <CircleCheck
                        className={cn(
                          "size-4 shrink-0 mt-0.5",
                          plan.highlight ? "text-white" : "text-primary",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium leading-normal",
                          plan.highlight ? "text-white/90" : "text-slate-600",
                        )}>
                        {feature}
                      </span>
                    </div>
                  ))}

                  {plan.notIncluded?.map((feature) => (
                    <div
                      key={feature}
                      className={cn(
                        "flex items-start gap-2.5 text-left",
                        plan.highlight ? "opacity-30" : "opacity-35",
                      )}>
                      <CircleMinus
                        className={cn(
                          "size-4 shrink-0 mt-0.5",
                          plan.highlight ? "text-white" : "text-slate-400",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium line-through leading-normal",
                          plan.highlight ? "text-white" : "text-slate-400",
                        )}>
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
                    "w-full h-11 font-bold text-xs rounded-full tracking-wide transition-all shadow-sm border-0 flex items-center justify-center gap-2",
                    plan.highlight
                      ? "bg-white text-primary hover:bg-slate-50 hover:text-primary"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80",
                  )}>
                  {loadingPlanId === plan.id && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
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
