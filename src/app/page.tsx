import Navbar from "@/components/sections/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import StatsSection from "@/components/sections/StatsSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import PricingSection from "@/components/sections/PricingSection";
import CtaSection from "@/components/sections/CtaSection";
import Footer from "@/components/sections/Footer";
import AppLaunchSection from "@/components/sections/AppLaunchSection";

export default function Home() {
  return (
    <div className="relative isolate min-h-screen flex flex-col bg-slate-50 selection:bg-primary/20 selection:text-primary">
      <div className="absolute inset-0 -z-10 min-h-screen flex-1 w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <Navbar />
      
      {/* flex-1 ensures the footer stays at the bottom even if content is short */}
      <main className="">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <PricingSection />
        <CtaSection />
        <AppLaunchSection />
      </main>
      
      <Footer />
    </div>
  );
}