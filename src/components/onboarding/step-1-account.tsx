"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { OnboardingFormData } from "../sacco-onboarding-stepper"

interface StepProps {
  data: Partial<OnboardingFormData>
  updateData: (newData: Partial<OnboardingFormData>) => void
  onNext: () => void
}

export function Step1Account({ data, updateData, onNext }: StepProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    updateData({
      ownerName: formData.get("ownerName") as string,
      ownerEmail: formData.get("ownerEmail") as string,
      ownerPhone: formData.get("ownerPhone") as string,
      passwordHash: formData.get("password") as string,
    })
    
    onNext()
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="space-y-2">
        <div className="flex flex-col items-center gap-1.5 text-center mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Create your Administrator Account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Let&apos;s start with your personal profile credentials as the platform owner.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="ownerName">Full Name</FieldLabel>
          <Input
            id="ownerName"
            name="ownerName"
            type="text"
            placeholder="e.g., John Doe"
            defaultValue={data.ownerName || ""}
            required
            className="bg-background mt-1"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="ownerEmail">Official Email Address</FieldLabel>
          <Input
            id="ownerEmail"
            name="ownerEmail"
            type="email"
            placeholder="name@sacco.com"
            defaultValue={data.ownerEmail || ""}
            required
            className="bg-background mt-1"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="ownerPhone">Personal Phone Number</FieldLabel>
          <Input
            id="ownerPhone"
            name="ownerPhone"
            type="tel"
            placeholder="e.g., +256 700 000000"
            defaultValue={data.ownerPhone || ""}
            required
            className="bg-background mt-1"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Security Password</FieldLabel>
          <div className="relative mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              defaultValue={data.passwordHash || ""}
              required
              className="bg-background pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-hidden"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
          </div>
        </Field>

        <Field className="pt-2">
          <Button type="submit" className="w-full h-11 rounded-full font-medium">
            Continue to KYC
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}