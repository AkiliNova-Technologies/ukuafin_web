import { prisma } from "@/lib/prisma/client"
import { getAuthenticatedSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { Building2 } from "lucide-react"
import PricingSection, { UILayerPlan } from "./pricing-section"

export default async function TenantBillingPage() {
  const session = await getAuthenticatedSession()
  if (!session || !session.organizationId) {
    redirect("/login")
  }

  // Fetch active plans and the current organization metadata in parallel
  const [dbPlans, org] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where: { isActive: true }
    }),
    prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: { name: true }
    })
  ])

  const mappedPlans: UILayerPlan[] = dbPlans.map((dbPlan) => {
    const basePrice = Number(dbPlan.price)
    const hasPrice = basePrice > 0

    if (dbPlan.slug === "sacco-starter-core") {
      return {
        id: dbPlan.id,
        name: "Basic Plan",
        price: { monthly: basePrice, annual: Math.floor(basePrice * 0.8) },
        tagline: "Essential infrastructure for local credit unions starting out.",
        cta: "Subscribe",
        features: [
          `Up to ${dbPlan.maxMembers ? dbPlan.maxMembers.toLocaleString() : "Unlimited"} active members`,
          "Core savings & loan tracking",
          "Standard financial ledger reports",
          "Unified email support channels",
          `${dbPlan.maxStaff} administrative staff accounts`,
          "Mobile application access",
        ],
        notIncluded: ["Advanced compliance logs", "Multi-branch architecture", "API integration access"],
      }
    }

    if (dbPlan.slug === "sacco-growth-tier") {
      return {
        id: dbPlan.id,
        name: "Professional Plan",
        price: { monthly: basePrice, annual: Math.floor(basePrice * 0.8) },
        tagline: "For scaling SACCO operations with complex audit mandates.",
        cta: "Subscribe",
        highlight: true,
        features: [
          `Up to ${dbPlan.maxMembers ? dbPlan.maxMembers.toLocaleString() : "Unlimited"} active members`,
          "Advanced audit & compliance logs",
          "Mobile app member portal access",
          "Priority SLA support (24 hours)",
          `${dbPlan.maxStaff} administrative staff accounts`,
          `Multi-branch routing (up to ${dbPlan.maxBranches})`,
          "Production API channel access",
          "Custom compliance report builder",
        ],
        notIncluded: ["Enterprise white-label branding", "Dedicated residency account manager"],
      }
    }

    return {
      id: dbPlan.id,
      name: "Enterprise Tier",
      price: hasPrice 
        ? { monthly: basePrice, annual: Math.floor(basePrice * 0.8) } 
        : { monthly: "Custom", annual: "Custom" },
      tagline: "Unconstrained scale with dedicated infrastructural support.",
      cta: hasPrice ? "Subscribe" : "Contact Us", 
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
    }
  })

  return (
    <div className="space-y-8 w-full mx-auto px-4 py-6">
      {/* Administrative Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Subscription & Licensing</h1>
          <p className="text-xs text-slate-500">
            Manage your tenant processing scale, system operational thresholds, and core resource boundaries.
          </p>
        </div>
        
        {/* Dynamic Context Meta-Badge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 self-start md:self-auto">
          <Building2 className="size-4 text-slate-400 shrink-0" />
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 leading-none">Active Workspace</p>
            <p className="text-xs font-semibold text-slate-700 mt-1">{org?.name || "Loading Context..."}</p>
          </div>
        </div>
      </div>

      <PricingSection 
        organizationId={session.organizationId} 
        userId={session.userId} 
        mappedPlans={mappedPlans} 
      />
    </div>
  )
}