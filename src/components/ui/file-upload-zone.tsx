import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadZoneProps extends React.ComponentPropsWithoutRef<"div"> {
  icon: LucideIcon
  label: string
  limit: string
}

export const FileUploadZone = React.forwardRef<HTMLDivElement, FileUploadZoneProps>(
  ({ className, icon: Icon, label, limit, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        className={cn(
          "border border-dashed border-muted-foreground/30 rounded-xl p-6 flex flex-col items-center gap-3 bg-background hover:border-primary cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        <Icon className="size-8 text-muted-foreground/60" />
        <div className="text-center text-sm text-muted-foreground">
          <span className="font-semibold text-primary">Click to upload</span> {label}
        </div>
        <span className="text-xs text-muted-foreground">{limit}</span>
      </div>
    )
  }
)

FileUploadZone.displayName = "FileUploadZone"