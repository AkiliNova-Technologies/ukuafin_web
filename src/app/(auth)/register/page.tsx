"use client"

import Link from "next/link"
import Image from "next/image"
import { LandmarkIcon } from "lucide-react"
import { SaccoOnboardingStepper } from "@/components/sacco-onboarding-stepper"

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-3">
      {/* Registration Stepper View Area */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/login" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-foreground">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <LandmarkIcon className="size-5" />
            </div>
            <span>UkuaFin</span>
          </Link>
        </div>
        
        {/* Adjusted from max-w-xs to max-w-md to naturally fit multi-column data views */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <SaccoOnboardingStepper />
          </div>
        </div>
      </div>

      {/* Shared Visual Branding Panel */}
      <div className="relative hidden bg-muted lg:block lg:col-span-2 overflow-hidden">
        <Image
          src="/login-hero.jpeg"
          alt="UkuaFin Branding Hero Graphic"
          fill
          priority
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.25] dark:grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 right-0 z-10 p-12 text-white">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold tracking-tight leading-tight">
              Empowering Financial <br />Communities.
            </h2>
            <p className="mt-4 text-lg text-white/90 font-normal text-pretty">
              Streamline your credit operations, manage member dividend shares seamlessly, and secure transparency with our automated ledger architectures.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}