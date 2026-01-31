"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type MaxWidthDialogType = "sm" | "md" | "lg" | "xl" | "2xl";

const maxWidthMap: Record<MaxWidthDialogType, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export interface IDialogWrapperProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  maxWidth?: MaxWidthDialogType;
  children: React.ReactNode;
  className?: string;
}

export const DialogWrapper: React.FC<IDialogWrapperProps> = ({
  open,
  onClose,
  title,
  description,
  maxWidth = "md",
  children,
  className,
}) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className={cn(
          "p-0 flex flex-col overflow-y-auto no-scrollbar max-h-[90vh] h-fit w-full",
          maxWidthMap[maxWidth],
          className,
        )}
      >
        <DialogHeader className="p-5 pb-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="p-5 pt-0">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogWrapper;
