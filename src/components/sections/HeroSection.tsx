import { Button } from "@/components/ui/button";
import LayeredMockupGraphic  from "./LayeredMockupGraphic";

// const AVATARS = [
//   "https://lh3.googleusercontent.com/aida/AP1WRLtldqXt8xMZoeTGFYmRqRiyne8npjsy8iJjjOpz7jgv1eUtdVeW0fZ0SHAlDg15Z5si6jsQsCswN6pwpmgY9hzAXmk9SqweqaB5EU5DH81iuiMOH6tJaI_sW8ReqWe3wkCgc8m3sfiL0Cg_9yO4M7775lORd10T29ZXOsGcukcbTtv9uYJjfMMg_IdcEQlifOfHZYtRw-hMF_VDKCBX_C0_zHU12h7eNls1FqeYpY-IyDK-jvsF3SwyS3es",
//   "https://lh3.googleusercontent.com/aida/AP1WRLsx2vbLIMQBvloQ5qL9PhVW65vSrTmk1UNUKVRnzC4NzoRqOylW7EHWWD9O15djsKnxc9ph5aBZ0xP5WUisnLWGPdbbjqdcJcJ5zTwitG6BMPh1Wwr7oZVnUDq00qw8KnWfXjoRdhLA1buxN1Moqo_xJ24GV6dYrUSgekH5K4ONO1iTaF53IFHgbHk2dpmHM1AJDapWgg2-D7oH-X9FQYDSFwvFdPArQcBFvxQbtT1-ThJ9m8cviuy3uKXs",
//   "https://lh3.googleusercontent.com/aida/AP1WRLuiLYvLQIQ6CtkB0-6BRhKEV6171F74UqoA2xbOIo9taLvGDf3kEfqrq7Lx1naYggoBNGgdLtZFZAwZAiZh0gn7A82XAYSgnW_6bHX8GqD7Z1jUlK2o_FuAevQgj1wfedi3cOR4ylj7qSNuBcMbtoW1PKUdYxf4dhupOe5KNi6jaIx5e0_MvktPZX_blpcv0GkSvIIn-F2RXVA1c_Q3iH08E0R-OWnK_PEkPaFCRsIoyW9cH89WB00jnK4",
// ];

// const TRUST_LOGOS = [
//   { name: "Stanbic Bank", icon: "account_balance" },
//   { name: "Equity Bank", icon: "savings" },
//   { name: "KCB Group", icon: "currency_exchange" },
//   { name: "dfcu Bank", icon: "assured_workload" },
//   { name: "Centenary", icon: "monetization_on" },
// ];

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen pt-24 pb-24 flex flex-col items-center overflow-hidden">
      {/* Background radial gradient blurs to replicate the effect on dashboard image side */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-primary/10 rounded-full" />
        <div className="absolute -bottom-20 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto px-6 md:px-8 flex-grow">
        {/* ── Left Content Block ── */}
        <div className="space-y-8 text-left max-w-2xl">
          <div className="space-y-5">
            <h1 className="text-4xl md:text-5xl lg:text-[3.75rem] font-semibold leading-[1.05] tracking-tight">
              Where <span className="text-primary">Financial</span> Intelligence{" "}
              Creates{" "}
              <span className="relative inline-block">
                <span className="text-primary">Excellence</span>
                {/* Clean inline SVG underline vector */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-2"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden>
                  <path
                    d="M2 9.5C50 4 150 1 298 5"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              for SACCOs
            </h1>

            <p className="text-md md:text-lg text-black/70 font-medium leading-relaxed max-w-xl">
              Guiding financial journey, optimizing allocations, book keeping
              and member remittances with automated core banking for credit
              unions across East Africa.
            </p>
          </div>

          {/* Optimized CTA Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-bold h-14 px-8 text-base shadow-lg hover:shadow-xl transition-all rounded-full gap-3 group">
              Get Started Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-primary/40 hover:bg-primary/5 text-primary font-semibold h-14 px-8 text-base rounded-full gap-3 transition-all">
              Watch Core Demo
            </Button>
          </div>

        </div>

        {/* ── Right Dashboard/Phone Stack Mockup ── */}
        <div className="relative flex items-center justify-center lg:ml-4 z-20">
          <LayeredMockupGraphic />
        </div>
      </div>
    </section>
  );
}
