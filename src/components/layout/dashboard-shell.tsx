import * as React from "react"
import { redirect } from "next/navigation"
import { getAuthenticatedSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma/client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardRole } from "@/lib/constants/navigation"
import { SessionProvider, ClientUserSession } from "@/providers/session-provider"
import { SiteHeader } from "../site-header"

interface DashboardShellProps {
  children: React.ReactNode;
  role: DashboardRole;
  title: string;
}

export async function DashboardShell({ children, role, title }: DashboardShellProps) {
  const session = await getAuthenticatedSession()

  if (!session) {
    redirect("/login")
  }

  if (role === "tenant" && session.organizationId) {
    // Query the subscription table directly to bypass missing model relations
    const activeSubscription = await prisma.organizationSubscription.findFirst({
      where: {
        organizationId: session.organizationId,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    })

    if (!activeSubscription) {
      redirect(`/checkout?orgId=${session.organizationId}&status=unpaid`)
    }
  }

  // Fetch the display metadata once at the root boundary
  let profileName = "System Operator"
  if (session.userId !== "VERCEL_CRON_WORKER") {
    const userProfile = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true },
    })
    if (userProfile) profileName = userProfile.name
  }

  // Build the unified package that matches our global provider contract
  const fullSession: ClientUserSession = {
    ...session,
    name: profileName,
    avatar: "",
  }

  return (
    <SessionProvider session={fullSession}>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 76)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="sidebar" role={role} userSession={fullSession} />
        <SidebarInset>
          <SiteHeader title={title} />
          
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 @container/main">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  )
}