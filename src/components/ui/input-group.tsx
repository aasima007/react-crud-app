import * as React from "react"
import { cn } from "@/lib/utils"

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative", className)}
    {...props}
  />
))
InputGroup.displayName = "InputGroup"

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" | "block-end" }
>(({ className, align = "start", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center",
      align === "start" && "justify-start",
      align === "end" && "justify-end",
      align === "block-end" && "justify-end mt-2",
      className
    )}
    {...props}
  />
))
InputGroupAddon.displayName = "InputGroupAddon"

const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
InputGroupText.displayName = "InputGroupText"

const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className
    )}
    {...props}
  />
))
InputGroupTextarea.displayName = "InputGroupTextarea"

export { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea }
