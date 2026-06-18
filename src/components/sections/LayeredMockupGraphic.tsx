"use client";

import { cn } from "@/lib/utils";
import { 
  Battery, 
  SignalHigh, 
  Wallet, 
  PlusCircle, 
  Coins, 
  Users, 
  Receipt, 
  ArrowDown, 
  ArrowUp, 
  Home, 
  LineChart, 
  Landmark, 
  Settings,
} from "lucide-react";

export default function LayeredMockupGraphic() {
  return (
    <div className="relative w-full h-[750px] flex items-center justify-center [perspective:1200px] [transform-style:preserve-3d]">
      
      {/* Immersive Background Glow Nodes */}
      <div className="absolute w-[80%] h-[75%] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── LAYER 1: Ultra-Premium Device Core Frame Layout ── */}
      <div className="relative z-10 w-[320px] h-[640px] shadow-[0_25px_60px_-15px_rgba(2,13,30,0.8)] rounded-[48px] p-2.5 transition-transform duration-500">
        
        {/* Physical Chassis Outer Shell */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-900 to-black rounded-[48px] ring-1 ring-white/20 shadow-inner pointer-events-none" />
        
        {/* Precise Deep Display Bezel Ring */}
        <div className="absolute inset-[3px] bg-black rounded-[45px] pointer-events-none" />

        {/* Display Panel Glass Gloss Overlay Shine */}
        <div className="absolute inset-[5px] bg-gradient-to-tr from-white/0 via-white/[0.03] to-white/[0.12] rounded-[43px] pointer-events-none z-30" />

        {/* 📱 Display Screen Internal Viewport */}
        <div className="relative w-full h-full bg-[#0A182F] rounded-[43px] overflow-hidden p-5 flex flex-col justify-between z-20 border border-slate-950">
          
          {/* Top Notch Area (Dynamic Island Mapping Template Alignment) */}
          <div className="absolute top-2.5 inset-x-0 flex justify-center z-50 pointer-events-none">
            <div className="w-24 h-6 bg-black rounded-full border border-white/5 flex items-center justify-end px-3 shadow-inner">
              {/* Miniature Camera Lens Reflex Reflection */}
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-indigo-950/40" />
            </div>
          </div>

          {/* Device Upper Status Utilities Grid */}
          <div className="w-full flex justify-between items-center text-[10px] font-bold text-white/80 px-2 pt-1 relative z-40 select-none">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <SignalHigh size={14} className="text-white/90 stroke-[2.5]" />
              <Battery size={15} className="text-white/90 stroke-[2]" />
            </div>
          </div>

          {/* Core App Viewport Data Stream Frame Container */}
          <div className="flex-grow flex flex-col justify-between pt-4 mt-2">
            
            {/* Header branding block */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h4 className="text-md font-bold text-white tracking-tight">UkuaFin</h4>
              </div>
            </div>

            {/* Translucent Balance Overview Card Matrix */}
            <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl p-4 text-white shadow-xl backdrop-blur-md my-3.5">
              <div className="flex items-center justify-between opacity-70">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-300">Total Share Capital</p>
                <Wallet size={14} className="text-slate-400" />
              </div>
              <p className="text-2xl font-bold tracking-tight mt-1 text-white">UGX 4,850,000</p>
              
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-[10px]">
                <div>
                  <p className="text-slate-400 font-medium">Active Loans</p>
                  <p className="text-white font-bold mt-0.5">UGX 1,200,000</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-medium">Next Due Date</p>
                  <p className="text-emerald-400 font-bold mt-0.5">28th June</p>
                </div>
              </div>
            </div>

            {/* Institutional Quick Action Modules */}
            <div className="grid grid-cols-4 gap-2 my-1 text-center">
              {[
                { icon: PlusCircle, label: "Deposit" },
                { icon: Coins, label: "Apply Loan" },
                { icon: Users, label: "Guarantors" },
                { icon: Receipt, label: "Statement" }
              ].map((act, i) => {
                const IconComponent = act.icon;
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/90">
                      <IconComponent size={18} className="stroke-[2]" />
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 tracking-tight">{act.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Ledger Micro Logs Block */}
            <div className="space-y-2 flex-grow mt-4">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-Time Remittances</p>
                <span className="text-[9px] text-primary font-bold cursor-default">View All</span>
              </div>
              
              {[
                { label: "Share Contribution", val: "+50k", desc: "M-Pesa Gateway Node" },
                { label: "Loan Amortization", val: "-120k", desc: "Direct Account Debit" },
                { label: "Dividend Payout", val: "+345k", desc: "Escrow Core Settlement" },
              ].map((item, idx) => {
                const isPositive = item.val.startsWith("+");
                return (
                  <div 
                    key={idx} 
                    className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center border",
                        isPositive 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      )}>
                        {isPositive ? (
                          <ArrowDown size={13} className="stroke-[2.5]" />
                        ) : (
                          <ArrowUp size={13} className="stroke-[2.5]" />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white/90">{item.label}</p>
                        <p className="text-[8px] text-slate-500 font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <span className={cn("text-xs font-bold", isPositive ? "text-emerald-400" : "text-amber-400")}>
                      {item.val}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Virtual Safe Navigation System Pill */}
            <div className="w-full bg-white/5 border border-white/5 rounded-full p-1 mt-3 flex items-center justify-between text-slate-400">
              <div className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-md">
                <Home size={16} className="stroke-[2.5]" />
              </div>
              <div className="px-3">
                <LineChart size={16} className="stroke-[2]" />
              </div>
              <div className="px-3">
                <Landmark size={16} className="stroke-[2]" />
              </div>
              <div className="pr-3">
                <Settings size={16} className="stroke-[2]" />
              </div>
            </div>

          </div>

          {/* System Screen Bottom Touch Indicator Home Bar Overlay */}
          <div className="w-full flex justify-center pt-2 select-none pointer-events-none">
            <div className="w-24 h-1 bg-white/30 rounded-full" />
          </div>

        </div>
      </div>

    </div>
  );
}