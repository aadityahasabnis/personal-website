"use client";

import React from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============ Field Label Component ============
interface IFieldLabelProps {
  label?: string;
  info?: string;
  required?: boolean;
}

export const FieldLabel: React.FC<IFieldLabelProps> = ({
  label,
  info,
  required,
}) => {
  if (!label) return null;
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-start text-regular text-muted-foreground leading-6">
        {label} {required ? "*" : null}
      </label>
      {info ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3 text-muted-foreground cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{info}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
};

// ============ Hidden Input Component ============
interface IHiddenInputProps {
  name: string;
  value: string | number | boolean | undefined | null;
  required?: boolean;
  disabled?: boolean;
}

export const HiddenInput: React.FC<IHiddenInputProps> = ({
  name,
  value,
  required,
  disabled,
}) => (
  <input
    type="text"
    name={name}
    required={required}
    disabled={disabled}
    value={value === null || value === undefined ? "" : String(value)}
    onChange={() => {}}
    className="sr-only"
    tabIndex={-1}
    aria-hidden="true"
  />
);
