"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { LandmarkIcon, UserCheckIcon } from "lucide-react"
import { OnboardingFormData } from "../sacco-onboarding-stepper"
import { FileUploadZone } from "../ui/file-upload-zone"

interface StepProps {
  data: Partial<OnboardingFormData>
  updateData: (newData: Partial<OnboardingFormData>) => void
  onSubmit: () => void
  onPrev: () => void
}

export function Step4SetupKYC({ onSubmit, onPrev }: StepProps) {
  return (
    <FieldGroup className="space-y-2">
      <div className="flex flex-col items-center gap-1.5 text-center mb-2">
        <h1 className="text-2xl font-bold tracking-tight">Setup & Legal Documents</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Establish your primary operations center and upload required KYC documents for regulatory compliance.
        </p>
      </div>

      {/* KYC Document Upload Requirements based on schema enums */}
      <Field className="space-y-2">
        <FieldLabel>Organization Legal Documents</FieldLabel>
        <FileUploadZone
          icon={LandmarkIcon}
          label="Sacco Registration Certificate"
          limit="Max 10MB (PDF, JPG, PNG)"
          onClick={() => console.log("Trigger Sacco file selector interaction")}
        />
      </Field>

      <Field className="space-y-2">
        <FieldLabel>Owner Personal ID Verification</FieldLabel>
        <FileUploadZone
          icon={UserCheckIcon}
          label="Your National ID or Passport"
          limit="Max 5MB (JPG, PNG)"
          onClick={() => console.log("Trigger ID file selector interaction")}
        />
      </Field>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onPrev} className="flex-1 h-11 rounded-full">
          Previous
        </Button>
        <Button onClick={onSubmit} className="flex-1 h-11 rounded-full font-medium">
          Finish Registration
        </Button>
      </div>
    </FieldGroup>
  )
}