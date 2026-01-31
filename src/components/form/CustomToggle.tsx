"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { HiddenInput } from "./FieldComponents";
import type {
  IFormData,
  IHandleChange,
  DotNestedBooleanKeys,
  StrongOmit,
} from "@/types/form";

export interface ICustomToggleProps<
  TFormBody extends IFormData | undefined,
> extends StrongOmit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  name: DotNestedBooleanKeys<TFormBody>;
  value: boolean | undefined;
  onChange: IHandleChange;
  label?: string;
  icon?: React.ReactElement<{ className?: string }>;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

const CustomToggle = <TFormBody extends IFormData = IFormData>({
  name,
  value,
  onChange,
  label,
  icon: Icon,
  className,
  required,
  disabled,
}: ICustomToggleProps<TFormBody>) => {
  const handleToggle = (): void => {
    onChange({ target: { name, value: !value } });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-background",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer group",
        className,
      )}
      onClick={disabled ? undefined : handleToggle}
    >
      <HiddenInput
        name={name}
        value={value ? "true" : "false"}
        required={required}
        disabled={disabled}
      />

      {Icon
        ? React.cloneElement(Icon, {
            className: cn(
              "size-5 text-muted-foreground group-hover:text-foreground transition-colors",
              Icon.props.className,
            ),
          })
        : null}

      {label ? (
        <span className="text-sm text-muted-foreground group-hover:text-foreground select-none transition-colors">
          {label}
          {required ? " *" : ""}
        </span>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        className={cn(
          "relative w-10 h-5 rounded-full transition-colors ml-auto",
          value ? "bg-primary" : "bg-muted",
          disabled ? "cursor-not-allowed" : "",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 size-3 rounded-full bg-background transition-transform",
            value ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
};

CustomToggle.displayName = "CustomToggle";
export default memo(
  CustomToggle,
  (prev, next) =>
    prev.name === next.name &&
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.required === next.required &&
    prev.className === next.className,
) as typeof CustomToggle;
