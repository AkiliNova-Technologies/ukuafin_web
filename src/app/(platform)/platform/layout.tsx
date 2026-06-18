import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function PlatformSuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="platform" title="SaaS Infrastructure Management">
      {children}
    </DashboardShell>
  )
}