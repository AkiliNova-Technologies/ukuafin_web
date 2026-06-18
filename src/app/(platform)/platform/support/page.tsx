import { EmptyState } from "@/components/ui/empty-state"
import { LayoutDashboard } from "lucide-react"

export default function PlatformSupportPage() {
  return (
    <div className="space-y-6">
      {/* Clean Reusable Empty State */}
      <EmptyState 
        icon={LayoutDashboard}
        title="Support Module Inactive"
        description="Support management, ticketing systems, and customer service features are currently being set up in the background."
      />
    </div>
  )
}