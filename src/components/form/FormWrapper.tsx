"use client";

import React, {
  memo,
  type FormEvent,
  type Dispatch,
  type SetStateAction,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { get } from "lodash";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CustomInput, { type ICustomInputProps } from "./CustomInput";
import CustomTextArea, { type ICustomTextAreaProps } from "./CustomTextArea";
import CustomSelect, {
  type ICustomSelectProps,
  type ISelectFieldValue,
} from "./CustomSelect";
import CustomCheckbox, { type ICustomCheckboxProps } from "./CustomCheckbox";
import CustomToggle, { type ICustomToggleProps } from "./CustomToggle";
import type { IFormData, IHandleChange, MakeOptional } from "@/types/form";

// ============ Field Size Formatter ============
export type SizeVariant = keyof typeof fieldSizeFormatter;
export const fieldSizeFormatter = {
  full: "col-span-full",
  4: "col-span-full sm:col-span-2 md:col-span-4",
  3: "col-span-full sm:col-span-2 md:col-span-3",
  2: "col-span-full sm:col-span-1 md:col-span-2",
} as const;

// ============ Field Config Types ============
interface IBaseField {
  key?: number | string;
  colsize?: SizeVariant;
  hidden?: boolean;
}

interface IInputFieldConfig<TFormBody extends IFormData | undefined>
  extends
    MakeOptional<ICustomInputProps<TFormBody>, "onChange" | "value">,
    IBaseField {
  fieldtype: "input";
}

interface ITextAreaFieldConfig<TFormBody extends IFormData | undefined>
  extends
    MakeOptional<ICustomTextAreaProps<TFormBody>, "onChange" | "value">,
    IBaseField {
  fieldtype: "textArea";
}

interface ISelectFieldConfig<TFormBody extends IFormData | undefined>
  extends
    MakeOptional<ICustomSelectProps<TFormBody>, "onChange" | "value">,
    IBaseField {
  fieldtype: "select";
}

interface ICheckboxFieldConfig<TFormBody extends IFormData | undefined>
  extends
    MakeOptional<ICustomCheckboxProps<TFormBody>, "onChange" | "value">,
    IBaseField {
  fieldtype: "checkbox";
}

interface IToggleFieldConfig<TFormBody extends IFormData | undefined>
  extends
    MakeOptional<ICustomToggleProps<TFormBody>, "onChange" | "value">,
    IBaseField {
  fieldtype: "toggle";
}

interface IDividerFieldConfig extends IBaseField {
  fieldtype: "divider";
  type?: "gap" | "line";
  name?: string;
  size?: "xs" | "md" | "lg";
}

interface IGroupFieldConfig<
  TFormBody extends IFormData | undefined,
> extends IBaseField {
  fieldtype: "group";
  fields: Array<IFieldConfig<TFormBody>>;
  label?: string;
  subText?: string;
  className?: string;
}

export type IFieldConfig<TFormBody extends IFormData | undefined> =
  | IInputFieldConfig<TFormBody>
  | ITextAreaFieldConfig<TFormBody>
  | ISelectFieldConfig<TFormBody>
  | ICheckboxFieldConfig<TFormBody>
  | IToggleFieldConfig<TFormBody>
  | IDividerFieldConfig
  | IGroupFieldConfig<TFormBody>;

// ============ Render Field Function ============
export const renderField = <TFormBody extends IFormData | undefined>(
  formData: TFormBody,
  handleChange: IHandleChange,
  field: IFieldConfig<TFormBody>,
  index?: number,
): React.ReactNode => {
  if (field.hidden) return null;

  const className = cn(
    fieldSizeFormatter[field?.colsize ?? 2],
    "className" in field && field?.className,
  );
  const key = "name" in field ? field.name : `field-${index}`;

  switch (field.fieldtype) {
    case "input":
      return (
        <CustomInput
          {...field}
          key={key}
          className={className}
          value={field?.value ?? (get(formData, field?.name, "") as string)}
          onChange={field?.onChange ?? handleChange}
          required={field.required ?? true}
        />
      );
    case "textArea":
      return (
        <CustomTextArea
          {...field}
          key={key}
          className={className}
          value={field?.value ?? (get(formData, field?.name, "") as string)}
          onChange={field?.onChange ?? handleChange}
          required={field.required ?? true}
        />
      );
    case "select":
      return (
        <CustomSelect
          {...field}
          key={key}
          className={className}
          value={
            field?.value ??
            (get(formData, field?.name, "") as ISelectFieldValue)
          }
          onChange={field?.onChange ?? handleChange}
          required={field.required ?? true}
        />
      );
    case "checkbox":
      return (
        <CustomCheckbox
          {...field}
          key={key}
          className={className}
          value={field?.value ?? (get(formData, field?.name, false) as boolean)}
          onChange={field?.onChange ?? handleChange}
        />
      );
    case "toggle":
      return (
        <CustomToggle
          {...field}
          key={key}
          className={className}
          value={field?.value ?? (get(formData, field?.name, false) as boolean)}
          onChange={field?.onChange ?? handleChange}
        />
      );
    case "divider":
      return (
        <div
          key={field?.name ?? `divider-${index}`}
          className={cn(
            "col-span-full flex items-center w-full",
            field?.size === "xs" ? "h-3" : field.size === "lg" ? "h-8" : "h-5",
          )}
        >
          {field?.type === "line" && <hr className="w-full border-border" />}
        </div>
      );
    case "group":
      return (
        <div
          key={field?.label ?? `group-${index}`}
          className={cn(
            "col-span-full flex flex-col gap-3 pb-3",
            field?.className,
          )}
        >
          {(field?.label || field?.subText) && (
            <div className="flex flex-col gap-1">
              {field?.label && (
                <h5 className="text-h5 text-foreground">{field.label}</h5>
              )}
              {field?.subText && (
                <span className="text-regular text-muted-foreground">
                  {field.subText}
                </span>
              )}
            </div>
          )}
          <div className="grid sm:grid-cols-2 md:grid-cols-6 gap-5">
            {field?.fields?.map((subField, i) =>
              renderField(formData as TFormBody, handleChange, subField, i),
            )}
          </div>
        </div>
      );
    default:
      return null;
  }
};

// ============ Form Wrapper Props ============
export interface IFormWrapperProps<TFormBody extends IFormData> {
  formConfig: Array<IFieldConfig<TFormBody>>;
  handleSubmit: (event: FormEvent) => void;
  handleSecondaryClick?: () => void;
  className?: string;
  submitLabel?: string;
  cancelLabel?: string;
  handleChange: IHandleChange;
  setFormData: Dispatch<SetStateAction<TFormBody>>;
  formData: TFormBody;
  isModified: boolean;
  isSubmitting: boolean;
  hideActionable?: boolean;
  navigateBackRequired?: boolean;
  submitBtnRef?: RefObject<HTMLButtonElement>;
  disabled?: boolean;
}

// ============ Form Wrapper Component ============
const FormWrapper = <TFormBody extends IFormData>({
  className,
  cancelLabel = "Discard",
  formConfig,
  submitBtnRef,
  submitLabel = "Submit",
  handleSubmit,
  handleSecondaryClick,
  handleChange,
  formData,
  hideActionable = false,
  isModified,
  isSubmitting,
  navigateBackRequired = true,
  disabled,
}: IFormWrapperProps<TFormBody>) => {
  const router = useRouter();

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-8 h-full transition-transform duration-300 pb-5",
        className,
      )}
    >
      <div className="grid sm:grid-cols-2 md:grid-cols-6 gap-5 h-full">
        {formConfig?.map((field, index) =>
          renderField(formData, handleChange, field, index),
        )}
      </div>

      {!hideActionable && (
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-5 w-full sm:w-fit sm:self-end">
          <div className="flex gap-3 sm:gap-5">
            {navigateBackRequired && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => router.back()}
                className="group shrink-0"
              >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              </Button>
            )}
            <Button
              type="reset"
              variant="outline"
              disabled={!isModified}
              onClick={handleSecondaryClick}
              className="w-full sm:w-48"
            >
              {cancelLabel}
            </Button>
          </div>
          <Button
            ref={submitBtnRef}
            disabled={!isModified || disabled || isSubmitting}
            className="w-full sm:w-48"
            type="submit"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
};

export default memo(FormWrapper) as typeof FormWrapper;
