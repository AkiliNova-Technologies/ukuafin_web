import { EmptyState } from "@/components/ui/empty-state"
import { LayoutDashboard } from "lucide-react"

export default function MemberSavingsPage() {
  return (
    <div className="space-y-6">
      {/* Clean Reusable Empty State */}
      <EmptyState 
        icon={LayoutDashboard}
        title="Savings Module Inactive"
        description="Savings features are currently being set up in the background."
      />
    </div>
  )
}