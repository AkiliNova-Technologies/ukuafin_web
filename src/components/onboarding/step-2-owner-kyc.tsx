"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OnboardingFormData } from "../sacco-onboarding-stepper"

interface StepProps {
  data: Partial<OnboardingFormData>
  updateData: (newData: Partial<OnboardingFormData>) => void
  onNext: () => void
  onPrev: () => void
}

export function Step2OwnerKYC({ data, updateData, onNext, onPrev }: StepProps) {
  // Use schema Gender enum
  const genders = ["MALE", "FEMALE", "OTHER"]

  return (
    <FieldGroup className="space-y-2">
      <div className="flex flex-col items-center gap-1.5 text-center mb-2">
        <h1 className="text-2xl font-bold tracking-tight">Personal Verification</h1>
        <p className="text-sm text-balance text-muted-foreground">
          We need your details as the primary administrator (Owner) of the SACCO.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="ownerDOB">Date of Birth</FieldLabel>
          <Input id="ownerDOB" type="date" className="bg-background " required />
        </Field>
        <Field>
          <FieldLabel htmlFor="ownerGender">Gender</FieldLabel>
          <Select onValueChange={(val) => updateData({ ownerGender: val })} defaultValue={data.ownerGender}>
            <SelectTrigger id="ownerGender" className="bg-background ">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="ownerNationalId">National ID Number (NIN) / Passport</FieldLabel>
        <Input
          id="ownerNationalId"
          type="text"
          placeholder="e.g., CM900..."
          className="bg-background "
          required
        />
      </Field>

      <div className="flex gap-1 pt-4">
        <Button variant="outline" onClick={onPrev} className="flex-1 h-11 rounded-full">Previous</Button>
        <Button onClick={onNext} className="flex-1 h-11 rounded-full">Continue</Button>
      </div>
    </FieldGroup>
  )
}