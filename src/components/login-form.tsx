"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React from "react";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  
  const [isPlatformAdmin, setIsPlatformAdmin] = React.useState(false);

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.toLowerCase().trim();
    setIsPlatformAdmin(value.endsWith("@akilinova.com"));
  }

async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const saccoCode = isPlatformAdmin ? "" : formData.get("saccoCode");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, saccoCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong during authentication.");
      }
      router.refresh();

      const { platformRole, saccoRole } = data.user;

      if (platformRole === "PLATFORM_SUPER_ADMIN") {
        router.push("/platform/dashboard");
      } else if (saccoRole === "OWNER") {
        router.push("/tenant/dashboard"); 
      } else {
        router.push("/member/dashboard");
      }


    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to reach security servers.";
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form 
      onSubmit={onSubmit} 
      className={cn("flex flex-col gap-4", className)} 
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1.5 text-center mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            Securely access your Square Sacco portal
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-in fade-in-50 duration-200">
            {errorMessage}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            onChange={handleEmailChange}
            disabled={isLoading}
            className="bg-background"
          />
        </Field>

        <Field className={cn("transition-all duration-300", isPlatformAdmin && "opacity-60")}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="saccoCode">SACCO Code</FieldLabel>
          </div>
          <Input
            id="saccoCode"
            name="saccoCode"
            type="text"
            placeholder={isPlatformAdmin ? "e.g., SQ-KLA-01" : "e.g., SQ-KLA-01"}
            required={!isPlatformAdmin} 
            disabled={isLoading || isPlatformAdmin}
            className="bg-background tracking-wider mt-1 uppercase transition-all duration-200"
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="ml-auto text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              className="bg-background pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-hidden disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>
        </Field>

        <Field className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-full font-medium"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="size-4 animate-spin" /> Verifying...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </Field>

        <FieldSeparator className="text-muted-foreground/64 text-xs font-medium my-1">
          Or securely continue with
        </FieldSeparator>

        <Field className="space-y-4">
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            className="w-full h-10 rounded-full gap-2 font-medium"
          >
            <Image src="/google.svg" alt="Google Icon" width={16} height={16} className="object-contain" />
            Google Account
          </Button>

          <FieldDescription className="text-center mt-6 text-xs">
            New to the platform?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary underline underline-offset-4"
            >
              Register your SACCO
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}