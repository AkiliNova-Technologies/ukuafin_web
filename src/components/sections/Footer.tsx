import { Landmark, Mail, Phone } from "lucide-react";
import { IconBrandLinkedin, IconBrandInstagram, IconBrandX } from "@tabler/icons-react";
import Link from "next/link";

const LINKS = {
  Product:  ["Features", "Pricing", "Security", "Mobile App", "Integrations"],
  Company:  ["About Us", "Careers", "Blog", "Press", "Contact"],
  Support:  ["Help Center", "API Docs", "Status", "System Updates", "Community"],
  Legal:    ["Privacy Policy", "Terms of Service", "Cookie Policy", "Compliance"],
};

const SOCIAL_PROFILES = [
  { icon: IconBrandLinkedin, label: "LinkedIn", href: "#" },
  { icon: IconBrandInstagram , label: "Instagram", href: "#" },
  { icon: IconBrandX, label: "X", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-primary relative overflow-hidden" id="contact">
      {/* Structural grid background anchor */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-20 pb-10 relative z-10">

        {/* Links Matrix Layout */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-12 mb-16">
          
          {/* Brand Identity Column */}
          <div className="col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shadow-sm">
                <Landmark className="text-white size-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">UkuaFin</span>
            </div>
            <p className="text-white/70 text-xs font-medium leading-relaxed max-w-xs">
              The industry-leading digital infrastructure for modern SACCOs. Secure, reliable, and member-focused core banking platform.
            </p>

            {/* Direct Channels */}
            <div className="space-y-2.5 pt-2">
              <a 
                href="mailto:hello@saccopro.io" 
                className="flex items-center gap-3 text-white/70 hover:text-white text-xs font-semibold transition-colors group w-fit"
              >
                <Mail className="size-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                hello@ukuafin.io
              </a>
              <a 
                href="tel:+256700000000" 
                className="flex items-center gap-3 text-white/70 hover:text-white text-xs font-semibold transition-colors group w-fit"
              >
                <Phone className="size-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                +256 700 000 000
              </a>
            </div>
          </div>

          {/* Dynamic Map Parsing */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading} className="col-span-1">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
                {heading}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-xs text-white/70 hover:text-white font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded px-1 -ml-1 py-0.5"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Global Compliance & Attribution Metadata */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Social Profiles Grid */}
          <div className="flex gap-3 mb-4 md:mb-0 order-2 md:order-1">
            {SOCIAL_PROFILES.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/70 hover:bg-white hover:text-[#024d38] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label={`Visit our ${label} page`}
              >
                <Icon className="size-6" />
              </a>
            ))}
          </div>
          
          <p className="text-xs text-white/50 font-medium order-3 md:order-2">
            &copy; {new Date().getFullYear()} AkiliNova Technologies. All rights reserved.
          </p>

          {/* Real-time Infrastructure Node Status */}
          <div className="flex items-center gap-2.5 text-xs font-semibold text-white/80 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/5 order-1 md:order-3 select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            All systems operational
          </div>
        </div>

      </div>
    </footer>
  );
}