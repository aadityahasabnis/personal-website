"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFormOperations } from "@/hooks";
import { renderField, type IFieldConfig } from "@/components/form";
import { cn } from "@/lib/utils";
import type { IFormData, IHandleChange } from "@/types/form";
import type { MaxWidthDialogType } from "./DialogWrapper";

const maxWidthMap: Record<MaxWidthDialogType, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export interface IFormDialogProps<TFormBody extends IFormData> {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TFormBody) => void | Promise<void>;
  title: string;
  description?: string;
  fields:
    | Array<IFieldConfig<TFormBody>>
    | ((
        formData: TFormBody,
        handleChange: IHandleChange,
      ) => Array<IFieldConfig<TFormBody>>);
  defaultValues?: Partial<TFormBody>;
  submitLabel?: string;
  cancelLabel?: string;
  maxWidth?: MaxWidthDialogType;
  isLoading?: boolean;
  requireModification?: boolean;
  className?: string;
}

export const FormDialog = <TFormBody extends IFormData>({
  open,
  onClose,
  onSubmit,
  title,
  description,
  fields,
  defaultValues,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  maxWidth = "md",
  isLoading = false,
  requireModification = true,
  className,
}: IFormDialogProps<TFormBody>): React.ReactElement => {
  const { formData, handleChange, isModified, resetForm } =
    useFormOperations<TFormBody>(defaultValues as Partial<TFormBody>);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resolvedFields =
    typeof fields === "function" ? fields(formData, handleChange) : fields;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className={cn("p-0 w-full", maxWidthMap[maxWidth])}>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          <div
            className={cn(
              "grid sm:grid-cols-2 md:grid-cols-6 gap-x-5 gap-y-3 px-5 overflow-y-auto no-scrollbar max-h-[50vh]",
              className,
            )}
          >
            {resolvedFields?.map((field, index) =>
              renderField(formData, handleChange, field, index),
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-5 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (requireModification && !isModified)}
            >
              {isLoading ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormDialog;
