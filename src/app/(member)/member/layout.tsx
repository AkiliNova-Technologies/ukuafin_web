import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function MemberPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="member" title="Member Self-Service Station">
      {children}
    </DashboardShell>
  )
}