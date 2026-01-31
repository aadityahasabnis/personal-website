"use client";

import React, { memo, useState, useRef, cloneElement } from "react";
import Link from "next/link";
import { CaseUpper } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldLabel } from "./FieldComponents";
import type {
  IFormData,
  IHandleChange,
  DotNestedScalarKeys,
  StrongOmit,
} from "@/types/form";

// Input validation types
type InputType = "number" | "alphaNum" | "alpha" | "decimal" | "url" | "email";

const validationRegexMap: Record<
  InputType,
  { pattern: RegExp; formatter?: (value: string) => string }
> = {
  number: {
    pattern: /^[0-9]+$/,
    formatter: (value: string) => value.replace(/[^0-9]/g, ""),
  },
  alphaNum: {
    pattern: /^[a-zA-Z0-9\s]+$/,
    formatter: (value: string) => value.replace(/[^a-zA-Z0-9\s]/g, ""),
  },
  alpha: {
    pattern: /^[a-zA-Z\s]+$/,
  },
  decimal: {
    pattern: /^\d*\.?\d*$/,
    formatter: (value: string) => {
      const cleaned = value.replace(/[^\d.]/g, "");
      const parts = cleaned.split(".");
      if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
      return cleaned;
    },
  },
  url: {
    pattern: /^https?:\/\/[^\s]+$/i,
    formatter: (value: string) => value.replace(/\s+/g, ""),
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    formatter: (value: string) => value.trim(),
  },
};

export interface ICustomInputProps<
  TFormBody extends IFormData | undefined,
> extends StrongOmit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "name"
> {
  name: DotNestedScalarKeys<TFormBody>;
  onChange: IHandleChange;
  inputType?: InputType;
  endIcon?: React.ReactElement<{ className?: string }> | false;
  startIcon?: React.ReactElement<{ className?: string }> | false;
  error?: boolean;
  className?: string;
  inputClassName?: string;
  label?: string;
  info?: string;
  errorMessage?: string;
  supplementaryLink?: {
    href: string;
    text: string;
    target?: "_self" | "_blank";
  };
}

const CustomInput = <TFormBody extends IFormData | undefined>({
  label,
  info,
  startIcon,
  endIcon,
  inputType,
  onChange,
  error,
  inputClassName,
  className,
  errorMessage,
  supplementaryLink,
  ...inputProps
}: ICustomInputProps<TFormBody>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    const validator = inputType && validationRegexMap[inputType];
    if (validator?.formatter) inputValue = validator.formatter(inputValue);

    onChange({
      target: {
        name: inputProps.name,
        value: inputValue === "" ? undefined : inputValue,
      },
    });
  };

  const handleKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (capsLockActive !== e.getModifierState?.("CapsLock")) {
      setCapsLockActive(!!e.getModifierState("CapsLock"));
    }
  };

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-3 w-full">
          <FieldLabel
            label={label}
            info={info}
            required={inputProps?.required}
          />
          {supplementaryLink ? (
            <Link
              prefetch={false}
              className={cn(
                "text-xs text-primary duration-200 hover:underline opacity-60 hover:opacity-100 transition-opacity",
                isFocused && "opacity-100",
              )}
              href={supplementaryLink.href}
              target={supplementaryLink.target ?? "_blank"}
            >
              {supplementaryLink.text}
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center relative cursor-text w-full">
        {startIcon ? (
          <div className="flex items-center gap-2 absolute left-3 inset-y-0">
            {cloneElement(startIcon, {
              className: "size-4 text-muted-foreground",
            })}
            <span
              className={cn(
                "border-r h-[60%]",
                isFocused && "border-foreground/30",
              )}
            />
          </div>
        ) : null}

        <input
          ref={inputRef}
          className={cn(
            "flex rounded-md border border-input outline-none w-full text-sm",
            "disabled:cursor-not-allowed disabled:opacity-50 h-11",
            "text-foreground placeholder:text-muted-foreground bg-background",
            "focus:ring-2 focus:ring-ring focus:ring-offset-2",
            startIcon ? "pl-12" : "pl-3",
            capsLockActive && isFocused && endIcon
              ? "pr-16"
              : endIcon
                ? "pr-12"
                : "pr-3",
            error && "border-destructive ring-destructive",
            inputClassName,
          )}
          {...inputProps}
          onChange={handleChangeEvent}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyEvent}
          onKeyUp={handleKeyEvent}
          placeholder={
            inputProps?.placeholder
              ? `${inputProps.placeholder}${inputProps?.required && !label ? " *" : ""}`
              : undefined
          }
        />

        {endIcon || (capsLockActive && isFocused) ? (
          <div className="flex items-center gap-2 absolute right-3 inset-y-0">
            {capsLockActive && isFocused ? (
              <CaseUpper
                className="size-4 text-amber-500"
                aria-label="Caps Lock is on"
              />
            ) : null}
            {endIcon ? (
              <>
                <span
                  className={cn(
                    "border-l h-[60%]",
                    isFocused && "border-foreground/30",
                  )}
                />
                {cloneElement(endIcon, {
                  className: cn(
                    endIcon.props.className,
                    "size-4 text-muted-foreground",
                  ),
                })}
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {error && errorMessage ? (
        <span className="text-xs text-destructive">{errorMessage}</span>
      ) : null}
    </div>
  );
};

CustomInput.displayName = "CustomInput";
export default memo(CustomInput) as typeof CustomInput;
