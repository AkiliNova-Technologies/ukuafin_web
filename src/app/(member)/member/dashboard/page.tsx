import { EmptyState } from "@/components/ui/empty-state"
import { LayoutDashboard } from "lucide-react"

export default function MemberDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Clean Reusable Empty State */}
      <EmptyState 
        icon={LayoutDashboard}
        title="Dashboard Module Inactive"
        description="Dashboard features are currently being set up in the background."
      />
    </div>
  )
}