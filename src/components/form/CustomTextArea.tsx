"use client";

import React, { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { FieldLabel } from "./FieldComponents";
import type {
  IFormData,
  IHandleChange,
  DotNestedScalarKeys,
  StrongOmit,
} from "@/types/form";

export interface ICustomTextAreaProps<TFormBody = IFormData> extends StrongOmit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange" | "name"
> {
  name: DotNestedScalarKeys<TFormBody>;
  onChange: IHandleChange;
  className?: string;
  textAreaClassName?: string;
  label?: string;
  info?: string;
  rows?: number;
}

const CustomTextArea = <TFormBody = IFormData,>({
  label,
  info,
  name,
  onChange,
  className,
  textAreaClassName,
  rows = 4,
  ...inputProps
}: ICustomTextAreaProps<TFormBody>) => {
  const handleChangeEvent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      target: {
        name,
        value: e.target.value === "" ? undefined : e.target.value,
      },
    });
  };

  const { value, defaultValue, ...restInputProps } = inputProps;
  const normalizedValue = useMemo(
    () =>
      (value ?? defaultValue)
        ? String(value ?? defaultValue).replace(/<br\s*\/?>/gi, "\n")
        : "",
    [value, defaultValue],
  );

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <FieldLabel label={label} info={info} required={inputProps?.required} />
      <textarea
        rows={rows}
        onChange={handleChangeEvent}
        name={name}
        placeholder={
          inputProps?.placeholder
            ? `${inputProps.placeholder}${inputProps?.required && !label ? " *" : ""}`
            : undefined
        }
        className={cn(
          "flex rounded-md border border-input outline-none w-full",
          "text-sm text-foreground placeholder:text-muted-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50 p-3",
          "bg-background no-scrollbar resize-none",
          "focus:ring-2 focus:ring-ring focus:ring-offset-2",
          textAreaClassName,
        )}
        {...restInputProps}
        value={normalizedValue}
      />
    </div>
  );
};

CustomTextArea.displayName = "CustomTextArea";
export default memo(CustomTextArea) as typeof CustomTextArea;
