// src/components/ui/empty-state.tsx
import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-muted/10 animate-in fade-in-50 duration-300",
        className
      )}
      {...props}
    > 
    <div className="flex flex-col items-center justify-center text-center">
      {Icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-muted/40 text-muted-foreground mb-4">
          <Icon className="size-6" strokeWidth={1.5} />
        </div>
      )}
      
      <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-sm leading-normal">
        {description}
      </p>
      
      {action && <div className="mt-6">{action}</div>}
    </div>
    </div>
  )
}