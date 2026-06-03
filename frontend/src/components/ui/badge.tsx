import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "success" | "warning" | "danger" | "info";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-muted text-foreground border-2 border-border",
    outline: "border-2 border-border bg-card text-foreground",
    success: "bg-success text-success-foreground border-2 border-border",
    warning: "bg-warning text-warning-foreground border-2 border-border",
    danger: "bg-destructive text-destructive-foreground border-2 border-border",
    info: "bg-info text-info-foreground border-2 border-border",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-black uppercase tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
