import { EmptyState } from "@/components/ui/empty-state"
import { LayoutDashboard } from "lucide-react"

export default function PlatformSubscriptionsPage() {
  return (
    <div className="space-y-6">
      {/* Clean Reusable Empty State */}
      <EmptyState 
        icon={LayoutDashboard}
        title="Subscriptions Module Inactive"
        description="Subscription management, pricing plans, and renewal controls are currently being set up in the background."
      />
    </div>
  )
}