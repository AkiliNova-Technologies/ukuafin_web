import { EmptyState } from "@/components/ui/empty-state"
import { LayoutDashboard } from "lucide-react"

export default function PlatformBillingPage() {
  return (
    <div className="space-y-6">
      {/* Clean Reusable Empty State */}
      <EmptyState 
        icon={LayoutDashboard}
        title="Billing Module Inactive"
        description="Billing management, payment processing features, and subscription controls are currently being set up in the background."
      />
    </div>
  )
}