"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { EllipsisVerticalIcon, LogOutIcon, Loader2Icon } from "lucide-react";

interface NavUserProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  items: {
    title: string;
    url: string;
    icon: React.ReactNode;
  }[];
}

/**
 * Helper to safely extract uppercase initials from a user's name string context
 */
function getUserInitials(name: string): string {
  const segments = name.trim().split(/\s+/);
  if (!segments.length || !segments[0]) return "??";
  if (segments.length === 1) return segments[0].substring(0, 2).toUpperCase();
  return `${segments[0][0]}${segments[segments.length - 1][0]}`.toUpperCase();
}

export function NavUser({ user, items }: NavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const initials = React.useMemo(() => getUserInitials(user.name), [user.name]);

  async function handleLogout(event: Event) {
    event.preventDefault();
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (response.ok) {
        router.refresh();
        router.push("/login");
      } else {
        console.error("Logout request failed against backend auth nodes.");
      }
    } catch (error) {
      console.error(
        "Network communication exception during logout routine:",
        error,
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground text-white">
              <Avatar className="h-10 w-10 rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full font-semibold text-xs bg-sidebar-primary/80 text-sidebar-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={12}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-full">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-full font-semibold text-xs bg-sidebar-primary/80 text-sidebar-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {items.map((item) => (
                <DropdownMenuItem
                  key={item.title}
                  className="cursor-pointer text-muted-foreground focus:text-primary focus:bg-primary/10 h-10"
                  onSelect={() => router.push(item.url)}>
                  {item.icon}
                  {item.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleLogout}
              disabled={isLoggingOut}
              className="h-10 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer disabled:opacity-50">
              {isLoggingOut ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <LogOutIcon className="size-4" />
              )}
              {isLoggingOut ? "Ending session..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
