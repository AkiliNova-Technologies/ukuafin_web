"use client";

import Link from "next/link";
import Image from "next/image";
import { LandmarkIcon } from "lucide-react";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-3">
      {/* Interaction Form Area Column */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/login"
            className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-foreground">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <LandmarkIcon className="size-5" />
            </div>
            <span>UkuaFin</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>

      {/* Visual Identity Hero Right Section Panel */}
      <div className="relative hidden bg-muted lg:block lg:col-span-2 overflow-hidden">
        <Image
          src="/login-hero.jpeg"
          alt="UkuaFin Branding Hero Graphic"
          fill
          priority
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.25] dark:grayscale-[20%]"
        />

        {/* Gradient Overlay flowing from bottom (darker) to top (transparent) */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          aria-hidden="true"
        />

        {/* Branding Text Content at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-12 text-white">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold tracking-tight leading-tight">
              Securing Tomorrow, <br />
              Together.
            </h2>
            <p className="mt-4 text-lg text-white/90 font-normal text-pretty">
              Join UkuaFin today. Your trusted partner in building
              sustainable wealth and enhancing community prosperity through
              smart savings and affordable credit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
