import { EmptyState } from "@/components/ui/empty-state"
import { LayoutDashboard } from "lucide-react"

export default function PlatformOrganizationsPage() {
  return (
    <div className="space-y-6">
      {/* Clean Reusable Empty State */}
      <EmptyState 
        icon={LayoutDashboard}
        title="Organizations Module Inactive"
        description="Organization management, team collaboration features, and access controls are currently being set up in the background."
      />
    </div>
  )
}