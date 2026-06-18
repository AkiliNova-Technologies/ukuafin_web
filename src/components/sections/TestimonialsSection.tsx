import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "SACCOPro reduced our loan processing turnaround from 3 days to under 4 hours. Our members are experiencing faster turnarounds and our administrative overhead has noticeably dropped.",
    name: "Grace Namukasa",
    role: "CEO, Kampala Employees SACCO",
    initials: "GN",
    rating: 5,
  },
  {
    quote:
      "The immutable audit logs completely streamlined our annual regulatory compliance inspection. The verification process was straightforward, accurate, and rapid.",
    name: "James Ochieng",
    role: "Finance Manager, Nairobi Teachers SACCO",
    initials: "JO",
    rating: 5,
  },
  {
    quote:
      "We migrated from manual ledger sheets tracking 1,200 members to organizing 4,800 active accounts effortlessly. The systemic data onboarding team was exceptional.",
    name: "Fatuma Wanjiku",
    role: "Operations Director, Mombasa Traders SACCO",
    initials: "FW",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 px-6 md:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Crisp Header Module — Matches Features Segment */}
        <div className="text-left md:text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs font-bold text-primary uppercase tracking-widest">
            Institutional Impact
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Validated by Financial Operators
          </h2>
          <p className="text-slate-500 text-base font-medium leading-relaxed">
            Discover how leading credit cooperatives and multi-branch institutions automate compliance, mitigate asset risk, and scale local member trust.
          </p>
        </div>

        {/* Flat Card Layout Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className={cn(
                "group p-6 bg-white rounded-2xl border border-slate-200/80",
                "hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/80 transition-all duration-300",
                "flex flex-col justify-between text-left"
              )}
            >
              <div className="space-y-4">
                {/* Fixed-Color Verification Layer (Amber limited strictly to stars) */}
                <div className="flex items-center gap-0.5">
                  {[...Array(t.rating)].map((_, j) => (
                    <span
                      key={j}
                      className="material-symbols-outlined text-amber-500 text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>

                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Secure Identity Bar */}
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                {/* Unified Neutral Frame: Zero pastel clutter */}
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 select-none">
                  {t.initials}
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-slate-900 tracking-tight truncate">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-400 font-medium truncate">
                    {t.role}
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