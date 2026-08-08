"use client";

import * as React from "react";

import { Label } from "@chatapp/ui/components/label";
import { cn } from "@chatapp/ui/lib/utils";

import { useFieldContext } from "../context";
import { getFirstError } from "../lib/error-utils";

function FormField({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function FormFieldLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  const field = useFieldContext<any>();
  return (
    <Label
      data-slot="form-field-label"
      htmlFor={field.name}
      className={className}
      {...props}
    />
  );
}

function FormFieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="form-field-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormFieldMessage({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const field = useFieldContext<any>();
  const error = getFirstError(field.state.meta.errors);
  if (!error) return null;
  return (
    <p
      data-slot="form-field-message"
      role="alert"
      className={cn("text-xs text-destructive", className)}
      {...props}
    >
      {error}
    </p>
  );
}

export { FormField, FormFieldLabel, FormFieldDescription, FormFieldMessage };
