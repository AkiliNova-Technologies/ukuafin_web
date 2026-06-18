import { EmptyState } from "@/components/ui/empty-state"
import { LayoutDashboard } from "lucide-react"

export default function PlatformDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Clean Reusable Empty State */}
      <EmptyState 
        icon={LayoutDashboard}
        title="Infrastructure Monitor Inactive"
        description="Aggregate platform matrices, memory allocations, and engine analytics are currently compiling in the background."
      />
    </div>
  )
}