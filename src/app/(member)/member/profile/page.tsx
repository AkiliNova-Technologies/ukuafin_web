import { EmptyState } from "@/components/ui/empty-state"
import { LayoutDashboard } from "lucide-react"

export default function MemberProfilePage() {
  return (
    <div className="space-y-6">
      {/* Clean Reusable Empty State */}
      <EmptyState 
        icon={LayoutDashboard}
        title="Profile Module Inactive"
        description="Profile features are currently being set up in the background."
      />
    </div>
  )
}