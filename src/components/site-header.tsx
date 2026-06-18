import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, CircleHelp } from "lucide-react"
import { cn } from "@/lib/utils"

interface SiteHeaderProps {
  title: string;
  className?: string;
}

export function SiteHeader({ title, className }: SiteHeaderProps) {
  return (
    <header 
      className={cn(
        "flex h-16 shrink-0 items-center border-b bg-background/50 backdrop-blur-md sticky top-0 z-40 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-14",
        className
      )}
    >
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        
        {/* LEFT: Context Domain & Navigation */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
          <Separator
            orientation="vertical"
            className="mx-2 h-8 bg-border"
          />
          {/* Breadcrumb style text layout */}
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
              {title}
            </h1>
          </div>
        </div>

        {/* RIGHT: Global Utility Action Shelf */}
        <div className="flex items-center gap-2">

          <Button 
            variant="ghost" 
            size="icon" 
            className="size-10 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-all"
            title="Help & Documentation"
          >
            <CircleHelp className="size-6" strokeWidth={1.2} />
            <span className="sr-only">Documentation</span>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="size-10 text-muted-foreground hover:text-primary hover:bg-muted rounded-full relative transition-all"
            title="System Notifications"
          >
            <Bell className="size-6" strokeWidth={1.2} />
            <span className="sr-only">View Alerts</span>
          </Button>

        </div>
      </div>
    </header>
  )
}