"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Landmark } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing",  href: "#pricing"  },
  { label: "About",    href: "#about"    },
  { label: "Contact",  href: "#contact"  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border-b border-slate-200"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-8 h-18 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 rounded-lg"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <Landmark className="text-white text-[16px]" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            Ukua<span className="text-primary">Fin</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary rounded-md hover:bg-primary/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA group */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-2 py-1">
            Login
          </Link>
          <Button variant="default" className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-all hover:shadow-md rounded-full h-10 px-6 text-sm">
            Start 14-Day Free Trial
          </Button>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 -mr-2 rounded-md hover:bg-slate-100 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className="material-symbols-outlined text-[24px]">
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </nav>

      {/* Mobile menu (Animated Dropdown) */}
      <div 
        className={`md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl transition-all duration-300 ease-in-out origin-top ${
          mobileOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
        }`}
      >
        <div className="px-6 py-4 flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-base font-medium text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-slate-100 my-2" />
          <div className="flex flex-col gap-3 pt-2">
            <Button variant="outline" className="w-full justify-center h-12 text-base font-medium">
              Login to Dashboard
            </Button>
            <Button variant="default" className="w-full justify-center h-12 text-base font-medium bg-primary hover:bg-primary/90">
              Start 14-Day Free Trial
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}