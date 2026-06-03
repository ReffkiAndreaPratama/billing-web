import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
      default:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-3 border-border shadow-brutal active:shadow-none active:translate-x-1 active:translate-y-1",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/80 border-3 border-border shadow-brutal active:shadow-none active:translate-x-1 active:translate-y-1",
      outline:
        "border-3 border-border bg-card hover:bg-muted/50 text-foreground shadow-brutal active:shadow-none active:translate-x-1 active:translate-y-1",
      secondary:
        "bg-primary text-primary-foreground hover:bg-primary/80 border-3 border-border shadow-brutal active:shadow-none active:translate-x-1 active:translate-y-1",
      ghost: "hover:bg-muted text-foreground",
      link: "text-primary underline-offset-4 hover:underline font-bold",
    };
    const sizes: Record<string, string> = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3 text-sm",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10",
    };
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-black text-sm transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
export { Button };
