import * as React from "react"
import { cn } from "@/lib/utils"

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { "data-invalid"?: boolean }
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-2 max-w-sm", props["data-invalid"] && "space-y-1", className)}
    data-invalid={props["data-invalid"]}
    {...props}
  />
))
Field.displayName = "Field"

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    {...props}
  />
))
FieldLabel.displayName = "FieldLabel"

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
FieldDescription.displayName = "FieldDescription"

const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { errors?: { message?: string }[] }
>(({ className, errors, ...props }, ref) => {
  if (!errors || errors.length === 0) return null
  
  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {errors[0]?.message}
    </p>
  )
})
FieldError.displayName = "FieldError"

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  />
))
FieldGroup.displayName = "FieldGroup"

const FieldOrientation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex gap-4",
      orientation === "horizontal" && "flex-row items-center justify-end",
      orientation === "vertical" && "flex-col",
      className
    )}
    {...props}
  />
))
FieldOrientation.displayName = "FieldOrientation"

export { Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldOrientation }
