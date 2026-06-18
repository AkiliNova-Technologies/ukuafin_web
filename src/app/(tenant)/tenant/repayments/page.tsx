import { EmptyState } from "@/components/ui/empty-state"
import { LayoutDashboard } from "lucide-react"

export default function TenantRepaymentsPage() {
  return (
    <div className="space-y-6">
      {/* Clean Reusable Empty State */}
      <EmptyState 
        icon={LayoutDashboard}
        title="Repayments Unavailable"
        description="Repayment management functionality is currently being set up in the background."
      />
    </div>
  )
}