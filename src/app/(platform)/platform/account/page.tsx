import { EmptyState } from "@/components/ui/empty-state"
import { LayoutDashboard } from "lucide-react"

export default function PlatformAccountPage() {
  return (
    <div className="space-y-6">
      {/* Clean Reusable Empty State */}
      <EmptyState 
        icon={LayoutDashboard}
        title="Account Module Inactive"
        description="Account management, billing systems, and user profile features are currently being set up in the background."
      />
    </div>
  )
}