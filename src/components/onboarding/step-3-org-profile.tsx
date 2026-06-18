"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { OnboardingFormData } from "../sacco-onboarding-stepper"

interface StepProps {
  data: Partial<OnboardingFormData>
  updateData: (newData: Partial<OnboardingFormData>) => void
  onNext: () => void
  onPrev: () => void
}

export function Step3OrgProfile({ data, updateData, onNext, onPrev }: StepProps) {
  const [slug, setSlug] = React.useState(data.saccoSlug || "")

  // Helper to convert arbitrary corporate name text directly to database friendly slugs safely
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")        // Replace spaces with -
      .replace(/[^\w\-]+/g, "")    // Remove all non-word chars
      .replace(/\-\-+/g, "-")       // Replace multiple - with single -
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetValue = e.target.value
    // Auto-generate slug dynamically only if the user hasn't explicitly customized it heavily yet
    const generatedSlug = slugify(targetValue)
    setSlug(generatedSlug)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    updateData({
      saccoName: formData.get("saccoName") as string,
      saccoSlug: slug,
      currency: formData.get("currency") as string,
      timezone: formData.get("timezone") as string,
    })

    onNext()
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="space-y-2">
        <div className="flex flex-col items-center gap-1.5 text-center mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Cooperative Institutional Profile</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Configure your registered entity identity configurations and functional base settings.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="saccoName">SACCO Registered Corporate Name</FieldLabel>
          <Input
            id="saccoName"
            name="saccoName"
            type="text"
            placeholder="e.g., Kampala Credit Pioneers Cooperative"
            defaultValue={data.saccoName || ""}
            onChange={handleNameChange}
            required
            className="bg-background  mt-1"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="saccoSlug">Unique System Identifier Handle (Slug)</FieldLabel>
          <div className="relative mt-1 flex">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground select-none">
              squaresacco.com/
            </span>
            <Input
              id="saccoSlug"
              name="saccoSlug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required
              className="bg-background rounded-none rounded-r-md border-l-0 focus-visible:ring-0"
            />
          </div>
          <FieldDescription className="text-xs text-muted-foreground mt-1">
            This string handles system-wide queries and isolates records inside multi-tenant modules.
          </FieldDescription>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="currency">Base Currency Layer</FieldLabel>
            <Input
              id="currency"
              name="currency"
              type="text"
              defaultValue={data.currency || "UGX"}
              required
              readOnly
              className="bg-muted text-muted-foreground  mt-1 cursor-not-allowed opacity-85"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="timezone">Default System Timezone</FieldLabel>
            <Input
              id="timezone"
              name="timezone"
              type="text"
              defaultValue={data.timezone || "Africa/Kampala"}
              required
              readOnly
              className="bg-muted text-muted-foreground  mt-1 cursor-not-allowed opacity-85"
            />
          </Field>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onPrev} className="flex-1 h-11 rounded-full ">
            Back
          </Button>
          <Button type="submit" className="flex-1 h-11 rounded-full font-medium">
            Continue
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}