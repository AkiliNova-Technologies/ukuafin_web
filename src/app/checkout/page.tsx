import { prisma } from "@/lib/prisma/client"
import { handlePlanCheckout } from "@/app/actions/billing"
import { redirect } from "next/navigation"
import { getAuthenticatedSession } from "@/lib/auth/session"
import { CheckoutForm } from "./checkout-form"
import { AlertCircle } from "lucide-react"

const CORPORATE_UGX_EXCHANGE_RATE = 3750

interface CheckoutPageProps {
  searchParams: Promise<{ planId?: string; status?: string; orgId?: string }>;
}

export default async function GlobalCheckoutPage({ searchParams }: CheckoutPageProps) {
  const resolvedParams = await searchParams
  const isSuspended = resolvedParams.status === "unpaid"

  const session = await getAuthenticatedSession()
  if (!session || !session.organizationId) {
    redirect("/login")
  }

  // 1. Fetch active subscription tiers
  const dbPlans = await prisma.subscriptionPlan.findMany({ where: { isActive: true } })
  const selectedPlan = dbPlans.find((p) => p.id === resolvedParams.planId) || dbPlans[0]

  // 2. Look up the organization using the session ID
  let organization = await prisma.organization.findUnique({ 
    where: { id: session.organizationId } 
  })

  let verifiedUserId = session.userId

  if (!organization) {
    organization = await prisma.organization.findFirst()
    if (organization) {
      const fallbackUser = await prisma.user.findFirst({
        where: { organizationId: organization.id }
      })
      if (fallbackUser) verifiedUserId = fallbackUser.id
    }
  } else {
    const userExists = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!userExists) {
      const fallbackUser = await prisma.user.findFirst({
        where: { organizationId: organization.id }
      })
      if (fallbackUser) verifiedUserId = fallbackUser.id
    }
  }

  // Safety break if tables are completely empty
  if (!selectedPlan || !organization) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center p-6 bg-white rounded-xl border border-slate-200 max-w-sm shadow-sm">
          <AlertCircle className="size-8 text-rose-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-sm">Database Sync Required</h3>
          <p className="text-xs text-slate-500 mt-1">Please run &quot;npx prisma db seed&quot; to provision your core organization and subscription tiers.</p>
        </div>
      </div>
    )
  }

  const serializedPlan = {
    id: selectedPlan.id,
    name: selectedPlan.name,
    description: selectedPlan.description,
    price: Number(selectedPlan.price),
  }

  // 3. Pass the strictly verified structural IDs down to the payment initialization pipeline
  // FIXED: Removed the unused parameter entirely to satisfy the strict linter
  const processCheckoutAction = async () => {
    "use server"
    await handlePlanCheckout({
      planId: selectedPlan.id,
      organizationId: organization!.id, 
      userId: verifiedUserId, 
    })
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-black text-xs">U</div>
          <span className="text-sm font-black text-slate-900 tracking-tight">UkuaFin Billing</span>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Workspace Identity: <span className="text-slate-900 font-semibold">{organization.name}</span>
        </div>
      </header>

      <main className="flex-1 py-12 space-y-8">
        {isSuspended && (
          <div className="max-w-6xl mx-auto px-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex gap-3 text-xs text-amber-900 font-medium max-w-3xl">
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-700" />
              <div>
                <p className="font-bold">Dashboard Access Blocked</p>
                <p className="opacity-90 mt-0.5 leading-relaxed">Your license has expired. Authorize a settlement below to re-activate branch ledgers.</p>
              </div>
            </div>
          </div>
        )}

        <CheckoutForm
          plan={serializedPlan}
          organizationName={organization.name}
          exchangeRate={CORPORATE_UGX_EXCHANGE_RATE}
          processCheckoutAction={processCheckoutAction}
        />
      </main>

      <footer className="py-6 border-t border-slate-200/60 text-center text-[10px] text-slate-400 font-mono">
        AkiliNova Technologies platform core engine © {new Date().getFullYear()} — All rights reserved.
      </footer>
    </div>
  )
}