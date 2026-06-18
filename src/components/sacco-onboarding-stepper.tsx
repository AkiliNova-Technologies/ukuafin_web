"use client"

import * as React from "react"
import { FieldGroup } from "@/components/ui/field"
import { Step1Account } from "./onboarding/step-1-account"
import { Step2OwnerKYC } from "./onboarding/step-2-owner-kyc"
import { Step3OrgProfile } from "./onboarding/step-3-org-profile"
import { Step4SetupKYC } from "./onboarding/step-4-setup-kyc "

// Schema-derived data structure for the form state
export type OnboardingFormData = {
  // User Account (for User model)
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  passwordHash?: string // placeholder for password input

  // Owner Personal KYC (for Member model)
  ownerGender?: string // MALE/FEMALE from schema enum Gender
  ownerDOB?: Date
  ownerNationalId?: string

  // Organization (for Organization model)
  saccoName: string
  saccoSlug: string // required by schema unique constraint
  currency: string // default 'UGX' from schema
  timezone: string // default 'Africa/Kampala'

  // Head Office Branch (for Branch model)
  mainBranchName: string // e.g., Head Office
  mainBranchCode: string // e.g., HO001 (required unique code)
  mainBranchAddress?: string

  // KYC Documents (for Document model)
  saccoLicenseFile?: File // Business License upload
  ownerIdFile?: File // National ID upload
}

export function SaccoOnboardingStepper() {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [formData, setFormData] = React.useState<Partial<OnboardingFormData>>({
    currency: "UGX",
    timezone: "Africa/Kampala",
    mainBranchName: "Head Office",
  })

  // Handle data updates from children steps
  const updateFormData = (newData: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }))
  }

  const nextStep = () => setCurrentStep((p) => p + 1)
  const prevStep = () => setCurrentStep((p) => p - 1)

  // TODO: Implement actual Prisma/API submission here
  const submitFinalRegistration = async () => {
    console.log("Submitting final, structured onboarding data:", formData)
    // 1. Send formData (including files) to API route
    // 2. API route runs a Prisma interactive transaction:
    //    a. Creates Organization (PENDING)
    //    b. Creates User (mapped as OWNER)
    //    c. Creates Member record for Owner (holding personal KYC)
    //    d. Creates Branch (Head Office)
    //    e. Uploads files to S3/Storage and creates Document records
  }

  return (
    <FieldGroup className="w-full max-w-lg space-y-8">
      {/* Visual Stepper Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col items-center gap-2">
          <div className={`size-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 1 ? "bg-primary text-primary-foreground" : "border-muted text-muted-foreground"}`}>1</div>
          <span className="text-xs font-medium">Account</span>
        </div>
        <div className={`flex-1 h-0.5 mx-2 transition-colors ${currentStep > 1 ? "bg-primary" : "bg-muted"}`} />
        <div className="flex flex-col items-center gap-2">
          <div className={`size-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "border-muted text-muted-foreground"}`}>2</div>
          <span className="text-xs font-medium">Owner KYC</span>
        </div>
        <div className={`flex-1 h-0.5 mx-2 transition-colors ${currentStep > 2 ? "bg-primary" : "bg-muted"}`} />
        <div className="flex flex-col items-center gap-2">
          <div className={`size-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "border-muted text-muted-foreground"}`}>3</div>
          <span className="text-xs font-medium">Profile</span>
        </div>
        <div className={`flex-1 h-0.5 mx-2 transition-colors ${currentStep > 3 ? "bg-primary" : "bg-muted"}`} />
        <div className="flex flex-col items-center gap-2">
          <div className={`size-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= 4 ? "bg-primary text-primary-foreground" : "border-muted text-muted-foreground"}`}>4</div>
          <span className="text-xs font-medium">Setup & Docs</span>
        </div>
      </div>

      {/* Step Components with Transitions */}
      <div className="relative overflow-hidden">
        
          <div
            key={currentStep}
            className="w-full"
          >
            {currentStep === 1 && <Step1Account data={formData} updateData={updateFormData} onNext={nextStep} />}
            {currentStep === 2 && <Step2OwnerKYC data={formData} updateData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
            {currentStep === 3 && <Step3OrgProfile data={formData} updateData={updateFormData} onNext={nextStep} onPrev={prevStep} />}
            {currentStep === 4 && <Step4SetupKYC data={formData} updateData={updateFormData} onSubmit={submitFinalRegistration} onPrev={prevStep} />}
          </div>
      </div>
    </FieldGroup>
  )
}