import { EmptyState } from "@/components/ui/empty-state"
import { LayoutDashboard } from "lucide-react"

export default function TenantAuditLogsPage() {
  return (
    <div className="space-y-6">
      {/* Clean Reusable Empty State */}
      <EmptyState 
        icon={LayoutDashboard}
        title="Audit Logs Unavailable"
        description="Audit logging functionality is currently being set up in the background."
      />
    </div>
  )
}