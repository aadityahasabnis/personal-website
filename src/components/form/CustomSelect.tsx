"use client";

import React, { memo, useState, useMemo, useCallback } from "react";
import { ChevronDown, Loader2, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { FieldLabel, HiddenInput } from "./FieldComponents";
import type {
  IFormData,
  IHandleChange,
  DotNestedScalarKeys,
  StrongOmit,
} from "@/types/form";

// Select option type
export type ISelectFieldValue = string | number | boolean | null | undefined;

export interface ISelectOption<T extends ISelectFieldValue = string> {
  label: string;
  value: T;
  description?: string;
  disabled?: boolean;
}

export interface ICustomSelectProps<
  TFormBody = IFormData,
  TOption extends ISelectFieldValue = ISelectFieldValue,
> extends StrongOmit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "name" | "value"
> {
  name: DotNestedScalarKeys<TFormBody>;
  options: Array<ISelectOption<TOption>> | undefined;
  value: ISelectFieldValue;
  onChange: IHandleChange;
  disabled?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
  info?: string;
  isLoading?: boolean;
  isSearchable?: boolean;
  noOptionsMessage?: string;
}

const CustomSelect = <
  TFormBody extends IFormData,
  TOption extends ISelectFieldValue = ISelectFieldValue,
>({
  name,
  options,
  label,
  info,
  className,
  value,
  onChange,
  disabled,
  isLoading,
  isSearchable = false,
  noOptionsMessage = "No options found",
  ...inputProps
}: ICustomSelectProps<TFormBody, TOption>) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isValueEqual = useCallback(
    (a: ISelectFieldValue, b: ISelectFieldValue) =>
      a === b || (a !== null && a !== undefined && String(a) === String(b)),
    [],
  );

  const selectedOption = useMemo(
    () => options?.find((opt) => isValueEqual(opt.value, value)),
    [options, value, isValueEqual],
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery || !isSearchable) return options;
    const query = searchQuery.toLowerCase();
    return options?.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, searchQuery, isSearchable]);

  const placeholderText =
    `${inputProps?.placeholder ?? "Select an option"}${inputProps?.required && !label ? " *" : ""}`.trim();
  const displayLabel = selectedOption?.label ?? "";

  const handleSelect = useCallback(
    (option: ISelectOption<TOption>) => {
      const isSameValue = isValueEqual(value, option.value);
      onChange({
        target: { name, value: isSameValue ? undefined : option.value },
      });
      setOpen(false);
      setSearchQuery("");
    },
    [name, onChange, value, isValueEqual],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (disabled || isLoading) return;
      setOpen(nextOpen);
      if (!nextOpen) setSearchQuery("");
    },
    [disabled, isLoading],
  );

  const isDisabled = disabled ?? isLoading;

  return (
    <div
      role="combobox"
      className={cn("relative flex flex-col gap-1", className)}
    >
      <FieldLabel label={label} info={info} required={inputProps?.required} />
      <HiddenInput
        name={name}
        value={selectedOption ? (value ?? "") : ""}
        required={inputProps?.required}
        disabled={isDisabled}
      />

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={isDisabled}
            className={cn(
              "flex items-center justify-between gap-2 px-3 rounded-md border border-input h-11",
              "bg-background text-foreground transition-colors",
              "focus:ring-2 focus:ring-ring focus:ring-offset-2",
              open && "ring-2 ring-ring",
              isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            )}
          >
            <span className="truncate w-full text-left text-sm">
              {displayLabel || (
                <span className="text-muted-foreground">{placeholderText}</span>
              )}
            </span>
            {isLoading ? (
              <Loader2 className="size-4 shrink-0 animate-spin opacity-50" />
            ) : (
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 opacity-50 transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          sideOffset={4}
        >
          {isSearchable && (
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <ScrollArea className="max-h-60">
            {!filteredOptions || filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {noOptionsMessage}
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => {
                  const isSelected = isValueEqual(value, option.value);
                  return (
                    <button
                      key={String(option.value)}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => handleSelect(option)}
                      className={cn(
                        "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm",
                        "transition-colors outline-none",
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50",
                        option.disabled && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <Check
                        className={cn(
                          "size-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

CustomSelect.displayName = "CustomSelect";
export default memo(CustomSelect) as typeof CustomSelect;
