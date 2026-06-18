"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CommandIcon } from "lucide-react"
import { NAVIGATION_MAPS, DashboardRole } from "@/lib/constants/navigation"
import { Separator } from "./ui/separator"


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: DashboardRole;
  userSession: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function AppSidebar({ role, userSession, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const currentNavConfig = NAVIGATION_MAPS[role]

  const formattedMainItems = currentNavConfig.main.map(item => ({
    title: item.title,
    url: item.url,
    icon: <item.icon />,
    isActive: pathname === item.url
  }))

     const formattedSecondaryItems = currentNavConfig.secondary.map(item => ({
        title: item.title,
        url: item.url,
        icon: <item.icon />,
        isActive: pathname.startsWith(item.url)
      }))

      const formattedUserItems = currentNavConfig.user?.map(item => ({
        title: item.title,
        url: item.url,
        icon: <item.icon />,
        isActive: pathname.startsWith(item.url)
      })) || []

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5! hover:bg-transparent">
              <div className="flex items-center gap-2 cursor-default">
                <div className="flex size-6 items-center justify-center rounded-md bg-emerald-700 text-white">
                  <CommandIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-sm font-semibold tracking-tight text-white">{currentNavConfig.brand.name}</span>
                  <span className="text-xs text-muted-foreground">{currentNavConfig.brand.description}</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      <Separator className="my-2 bg-primary-foreground/20" />
      </SidebarHeader>

      
      <SidebarContent>
        {/* Main Operational Flow Registry Links */}
        <NavMain items={formattedMainItems} />
        {/* Secondary Logistical/Administrative Settings Links */}
        <NavSecondary items={formattedSecondaryItems} className="mt-auto" />
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser items={formattedUserItems} user={userSession} />
      </SidebarFooter>
    </Sidebar>
  )
}