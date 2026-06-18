import { EmptyState } from "@/components/ui/empty-state"
import { LayoutDashboard } from "lucide-react"

export default function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Clean Reusable Empty State */}
      <EmptyState 
        icon={LayoutDashboard}
        title="Settings Module Inactive"
        description="Platform settings, configuration options, and user preferences are currently being set up in the background."
      />
    </div>
  )
}