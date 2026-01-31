"use client";

import React from "react";
import {
  AlertTriangle,
  Trash2,
  Check,
  Info,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { MaxWidthDialogType } from "./DialogWrapper";

export type ConfirmationIconType = "warning" | "delete" | "success" | "info";

const iconMap: Record<
  ConfirmationIconType,
  { icon: LucideIcon; className: string }
> = {
  warning: { icon: AlertTriangle, className: "text-amber-500" },
  delete: { icon: Trash2, className: "text-destructive" },
  success: { icon: Check, className: "text-green-600" },
  info: { icon: Info, className: "text-primary" },
};

export interface IConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  message?: string | React.ReactNode;
  icon?: ConfirmationIconType;
  confirmLabel?: string;
  cancelLabel?: string;
  maxWidth?: MaxWidthDialogType;
  isLoading?: boolean;
  variant?: "default" | "destructive";
}

export const ConfirmationDialog: React.FC<IConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  message,
  icon = "warning",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  maxWidth = "sm",
  isLoading = false,
  variant = "default",
}) => {
  const IconComponent = iconMap[icon].icon;
  const iconClassName = iconMap[icon].className;

  const handleConfirm = async () => {
    await onConfirm();
    if (!isLoading) onClose();
  };

  const maxWidthMap: Record<MaxWidthDialogType, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={cn("p-5 w-full", maxWidthMap[maxWidth])}>
        <div className="flex gap-3">
          <div className="shrink-0">
            <IconComponent className={cn("size-8", iconClassName)} />
          </div>
          <DialogHeader className="text-left">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </div>

        {message && (
          <div className="text-sm text-foreground mt-2">{message}</div>
        )}

        <div className="flex items-center justify-end gap-3 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
