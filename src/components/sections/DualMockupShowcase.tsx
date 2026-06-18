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
  Fingerprint
} from "lucide-react";

export default function DualMockupShowcase() {
  return (
    <section className="relative w-full py-20 bg-transparent flex flex-col items-center justify-center">
      
      {/* Responsive Viewport Wrapper */}
      <div className="w-full max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-2 relative z-10 [perspective:1500px] [transform-style:preserve-3d]">
        
        {/* ── DEVICE ONE: LEFT BRAND DISPLAY (SPLASH ARCHITECTURE) ── */}
        <div className="relative w-[300px] sm:w-[320px] h-[640px] shadow-[0_25px_60px_-15px_rgba(2,13,30,0.7)] rounded-[48px] p-2.5 lg:rotate-y-18  lg:-translate-x-4 transition-all duration-500 ease-out group">
          
          {/* Physical Chassis Outer Shell */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-900 to-black rounded-[48px] ring-1 ring-white/20 shadow-inner pointer-events-none" />
          <div className="absolute inset-[3px] bg-black rounded-[45px] pointer-events-none" />
          <div className="absolute inset-[5px] bg-gradient-to-tr from-white/0 via-white/[0.02] to-white/[0.1] rounded-[43px] pointer-events-none z-30" />

          {/* Screen Content: Branded Core Infrastructure Layout */}
          <div className="relative w-full h-full bg-gradient-to-b from-[#024d38] via-[#01271c] to-[#01140e] rounded-[43px] overflow-hidden p-6 flex flex-col justify-between z-20 border border-slate-950/40">
            
            {/* Dynamic Island Area */}
            <div className="absolute top-2.5 inset-x-0 flex justify-center z-50 pointer-events-none">
              <div className="w-24 h-6 bg-black rounded-full border border-white/5 flex items-center justify-end px-3 shadow-inner" />
            </div>

            {/* Upper Status Bar */}
            <div className="w-full flex justify-between items-center text-[10px] font-bold text-white/60 px-1 pt-1 relative z-40 select-none">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 opacity-80">
                <SignalHigh size={14} className="stroke-[2.5]" />
                <Battery size={15} className="stroke-[2]" />
              </div>
            </div>

            {/* Center Brand Identity Hub */}
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6 pt-12">
              <div className="relative">
                {/* Iridescent Pulsing Ring Layout Aura */}
                <div className="absolute inset-0 rounded-3xl bg-emerald-400/20 blur-xl animate-pulse scale-110" />
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-xl backdrop-blur-md relative z-10">
                  <Landmark size={32} className="text-white stroke-[1.75]" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white tracking-tight">UkuaFin</h3>
              </div>
            </div>

            {/* Bottom Security Context Indicators */}
            <div className="w-full space-y-5 pb-4 text-center flex flex-col items-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs max-w-fit">
                <Fingerprint size={16} className="text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold tracking-wide text-white/80">Biometric Identity Verified</span>
              </div>
              
            </div>

            {/* System Home Touch Indicator Bar */}
            <div className="w-full flex justify-center pt-2 select-none pointer-events-none">
              <div className="w-24 h-1 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>


        {/* ── DEVICE TWO: RIGHT OPERATIONAL DATA SURFACE (HOME VIEWPORT) ── */}
        <div className="relative w-[300px] sm:w-[320px] h-[640px] shadow-[0_25px_60px_-15px_rgba(2,13,30,0.7)] rounded-[48px] p-2.5 lg:-rotate-y-18 lg:translate-x-4 transition-all duration-500 ease-out z-20">
          
          {/* Physical Chassis Outer Shell */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-900 to-black rounded-[48px] ring-1 ring-white/20 shadow-inner pointer-events-none" />
          <div className="absolute inset-[3px] bg-black rounded-[45px] pointer-events-none" />
          <div className="absolute inset-[5px] bg-gradient-to-tr from-white/0 via-white/[0.03] to-white/[0.12] rounded-[43px] pointer-events-none z-30" />

          {/* Screen Content: Live Interactive Application Dashboard Container */}
          <div className="relative w-full h-full bg-[#0A182F] rounded-[43px] overflow-hidden p-5 flex flex-col justify-between z-20 border border-slate-950">
            
            {/* Dynamic Island Area */}
            <div className="absolute top-2.5 inset-x-0 flex justify-center z-50 pointer-events-none">
              <div className="w-24 h-6 bg-black rounded-full border border-white/5 flex items-center justify-end px-3 shadow-inner" />
            </div>

            {/* Upper Status Bar */}
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
              <div className="flex justify-between items-center border-b border-white/5 pb-3 px-1">
                <div>
                  <h4 className="text-md font-bold text-white tracking-tight">UkuaFin</h4>
                </div>
              </div>

              {/* Translucent Balance Overview Card Matrix */}
              <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl p-4 text-white shadow-xl backdrop-blur-md my-3">
                <div className="flex items-center justify-between opacity-70">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-300">Total Share Capital</p>
                  <Wallet size={14} className="text-slate-400" />
                </div>
                <p className="text-2xl font-bold tracking-tight mt-1 text-white font-mono">UGX 4,850,000</p>
                
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-[10px]">
                  <div>
                    <p className="text-slate-400 font-medium">Active Loans</p>
                    <p className="text-white font-bold mt-0.5 font-mono">UGX 1,200,000</p>
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
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/90 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                        <IconComponent size={16} className="stroke-[2]" />
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400 tracking-tight">{act.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Ledger Micro Logs Block */}
              <div className="space-y-2 flex-grow mt-3">
                <div className="flex justify-between items-center mb-1 px-1">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Real-Time Remittances</p>
                  <span className="text-[9px] text-emerald-400 font-bold cursor-pointer">View All</span>
                </div>
                
                {[
                  { label: "Share Contribution", val: "+50k", desc: "Mobile Money Node" },
                  { label: "Loan Amortization", val: "-120k", desc: "Direct Ledger Debit" },
                  { label: "Dividend Payout", val: "+345k", desc: "Escrow Core Settlement" },
                ].map((item, idx) => {
                  const isPositive = item.val.startsWith("+");
                  return (
                    <div 
                      key={idx} 
                      className="bg-white/[0.02] border border-white/5 rounded-xl p-2 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center border",
                          isPositive 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        )}>
                          {isPositive ? (
                            <ArrowDown size={12} className="stroke-[2.5]" />
                          ) : (
                            <ArrowUp size={12} className="stroke-[2.5]" />
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-white/90 leading-tight">{item.label}</p>
                          <p className="text-[8px] text-slate-500 font-medium">{item.desc}</p>
                        </div>
                      </div>
                      <span className={cn("text-xs font-bold font-mono", isPositive ? "text-emerald-400" : "text-amber-400")}>
                        {item.val}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Virtual Safe Navigation System Pill */}
              <div className="w-full bg-white/5 border border-white/5 rounded-full p-1 mt-3 flex items-center justify-between text-slate-400">
                <div className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-md">
                  <Home size={15} className="stroke-[2.5]" />
                </div>
                <div className="px-3 cursor-pointer hover:text-white transition-colors">
                  <LineChart size={15} className="stroke-[2]" />
                </div>
                <div className="px-3 cursor-pointer hover:text-white transition-colors">
                  <Landmark size={15} className="stroke-[2]" />
                </div>
                <div className="pr-3 cursor-pointer hover:text-white transition-colors">
                  <Settings size={15} className="stroke-[2]" />
                </div>
              </div>

            </div>

            {/* System Screen Bottom Touch Indicator Home Bar Overlay */}
            <div className="w-full flex justify-center pt-2 select-none pointer-events-none">
              <div className="w-24 h-1 bg-white/20 rounded-full" />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}