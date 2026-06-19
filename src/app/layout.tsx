import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    default: "UkuaFin | Advanced SACCO & Core Banking Ledger Infrastructure",
    template: "%s | UkuaFin",
  },
  description:
    "The enterprise multi-tenant core banking software for modern SACCOs, micro-credit networks, and savings groups. Automate credit underwriting, member share capitals, audit trails, and financial ledger compliance.",
  keywords: [
    "SACCO Software",
    "Core Banking Platform",
    "Microfinance Management System",
    "Savings Group Ledger",
    "Credit Underwriting Automation",
    "Financial Auditing SaaS",
    "Pesapal Banking Integration",
    "Uganda Sacco Software"
  ],
  authors: [{ name: "AkiliNova Technologies", url: "https://akilinovatech.com" }],
  creator: "AkiliNova Technologies",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ukuafin.vercel.app"),
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ukuafin.vercel.app",
    title: "UkuaFin - Cloud Infrastructure for Modern SACCOs",
    description: "Streamline savings accounts, running loan books, and real-time mobile money payment reconciliations inside a unified dashboard.",
    siteName: "UkuaFin",
    images: [
      {
        url: "/og-image.png", // Drop a 1200x630 image inside your public folder for branding!
        width: 1200,
        height: 630,
        alt: "UkuaFin Enterprise Core Platform Console Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "UkuaFin | Advanced SACCO Software",
    description: "Enterprise core banking ledger infrastructure for modern micro-finance institutions.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}