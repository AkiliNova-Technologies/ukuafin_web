"use client"

import * as React from "react"
import { CreditCard, Smartphone, CheckCircle2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

interface CheckoutFormProps {
  plan: Plan;
  organizationName: string;
  exchangeRate: number;
  processCheckoutAction: (paymentMethod: string) => Promise<void>;
}

export function CheckoutForm({ plan, organizationName, exchangeRate, processCheckoutAction }: CheckoutFormProps) {
  const [activeMethod, setActiveMethod] = React.useState<"card" | "momo">("card")
  const [isPending, startTransition] = React.useTransition()

  // Currency conversion calculation layers
  const priceInUSD = Number(plan.price)
  const priceInUGX = priceInUSD * exchangeRate

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await processCheckoutAction(activeMethod)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4">
      
      {/* LEFT COLUMN: Payment Configuration Matrix */}
      <div className="lg:col-span-7 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Select payment method</h2>
          <p className="text-xs text-slate-500 mt-1">Choose your preferred settlement network to clear outstanding platform tokens.</p>
        </div>

        <div className="space-y-3">
          {/* Option 1: Card Payments */}
          <button
            type="button"
            onClick={() => setActiveMethod("card")}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 outline-none",
              activeMethod === "card"
                ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600"
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-lg border", activeMethod === "card" ? "bg-white border-emerald-200" : "bg-slate-50")}>
                <CreditCard className={cn("size-5", activeMethod === "card" ? "text-emerald-700" : "text-slate-500")} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Credit or Debit Card</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Visa, Mastercard, American Express</p>
              </div>
            </div>
            <div className={cn("size-4 rounded-full border flex items-center justify-center", activeMethod === "card" ? "border-emerald-600" : "border-slate-300")}>
              {activeMethod === "card" && <div className="size-2 rounded-full bg-emerald-600" />}
            </div>
          </button>

          {/* Option 2: Mobile Money (Local Context Layer) */}
          <button
            type="button"
            onClick={() => setActiveMethod("momo")}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 outline-none",
              activeMethod === "momo"
                ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600"
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-lg border", activeMethod === "momo" ? "bg-white border-emerald-200" : "bg-slate-50")}>
                <Smartphone className={cn("size-5", activeMethod === "momo" ? "text-emerald-700" : "text-slate-500")} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Mobile Money Wallet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">MTN MoMo, Airtel Money instant push options</p>
              </div>
            </div>
            <div className={cn("size-4 rounded-full border flex items-center justify-center", activeMethod === "momo" ? "border-slate-300" : "border-slate-300")}>
              {activeMethod === "momo" && <div className="size-2 rounded-full bg-emerald-600" />}
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 group"
        >
          {isPending ? "Configuring Gateway Security..." : "Proceed with Secure Payment"}
          <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* RIGHT COLUMN: Interactive Visual Card Display */}
      <div className="lg:col-span-5 lg:sticky lg:top-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden min-h-[240px] flex flex-col justify-between">
          
          {/* Vector overlay graphic simulation matches the Batin design concept */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] tracking-widest text-slate-400 font-mono uppercase">Billing Entity</p>
              <h3 className="text-sm font-bold mt-0.5 truncate max-w-[240px] text-emerald-400">{organizationName}</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-slate-300 border border-white/5 font-mono">
              {plan.name}
            </span>
          </div>

          <div className="my-6">
            <p className="text-[10px] text-slate-400 tracking-wider font-mono uppercase">Total Local Ledger Bill Amount</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black tracking-tight text-white">
                UGX {priceInUGX.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              Calculated valuation equivalent from base pricing of ${priceInUSD.toLocaleString()} USD
            </p>
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>PCI-DSS Secured Layer</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">Rate: 1 USD = {exchangeRate.toLocaleString()} UGX</span>
          </div>
        </div>
      </div>

    </form>
  )
}