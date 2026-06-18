"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isLoading, setIsLoading] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    // TODO: Connect secure extraction endpoint workflow here
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <form 
      onSubmit={onSubmit} 
      className={cn("flex flex-col gap-6", className)} 
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1.5 text-center mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Forgot password?
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email address to receive a secure password recovery link
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            disabled={isLoading}
            className="bg-background mt-1"
          />
        </Field>

        <Field className="pt-2">
          <Button 
            type="submit" 
            className="w-full h-10 rounded-full font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Sending Link..." : "Send Reset Link"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center mt-2 text-xs">
            Remember your credentials?{" "}
            <Link 
              href="/login" 
              className="font-semibold text-primary underline underline-offset-4"
            >
              Back to login
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}