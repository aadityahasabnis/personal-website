"use client";

import React, { memo, isValidElement } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type {
  IFormData,
  IHandleChange,
  DotNestedBooleanKeys,
} from "@/types/form";

export interface ICustomCheckboxProps<TFormBody extends IFormData | undefined> {
  name: DotNestedBooleanKeys<TFormBody>;
  value: boolean;
  label: string | React.ReactElement;
  onChange: IHandleChange;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
}

const CustomCheckbox = <TFormBody extends IFormData | undefined>({
  name,
  value,
  label,
  onChange,
  required,
  disabled,
  hidden,
  className,
}: ICustomCheckboxProps<TFormBody>) => {
  const handleChange = (checked: boolean): void => {
    onChange({ target: { name, value: checked } });
  };

  if (hidden) return null;

  return (
    <div
      className={cn("relative group flex items-start gap-2 w-full", className)}
    >
      <Checkbox
        id={name}
        name={name}
        checked={value}
        onCheckedChange={handleChange}
        required={required}
        disabled={disabled}
        className="mt-0.5"
      />
      {isValidElement(label) ? (
        label
      ) : (
        <label
          htmlFor={name}
          className={cn(
            "text-sm select-none cursor-pointer transition-colors",
            value ? "text-foreground" : "text-muted-foreground",
            disabled && "group-hover:cursor-not-allowed opacity-50",
          )}
        >
          {label}
          {required ? " *" : ""}
        </label>
      )}
    </div>
  );
};

CustomCheckbox.displayName = "CustomCheckbox";
export default memo(
  CustomCheckbox,
  (prev, next) =>
    prev.name === next.name &&
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.hidden === next.hidden &&
    prev.required === next.required,
) as typeof CustomCheckbox;
