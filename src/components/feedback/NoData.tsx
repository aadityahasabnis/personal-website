"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ImgMode = "positive" | "neutral" | "error";

interface INoDataBaseProps {
  description?: string;
  className?: string;
  title?: string;
  imgClassName?: string;
  mode?: ImgMode;
}

interface INoDataWithLink extends INoDataBaseProps {
  actionType: "link";
  actionMessage: string;
  href: string;
}

interface INoDataWithAction extends INoDataBaseProps {
  actionType: "action";
  actionMessage: string;
  onAction: () => void;
}

interface INoDataDefault extends INoDataBaseProps {
  actionType?: undefined;
}

export type INoDataProps = INoDataWithLink | INoDataWithAction | INoDataDefault;

const modeEmoji: Record<ImgMode, string> = {
  positive: "🎉",
  neutral: "📭",
  error: "⚠️",
};

/**
 * No Data component for empty states
 */
const NoData = (props: INoDataProps) => {
  const {
    description = "There's nothing here just yet.",
    className,
    mode = "neutral",
    imgClassName = "text-6xl",
    title,
  } = props;

  const renderAction = () => {
    if (props.actionType === "link") {
      return (
        <Link
          href={props.href}
          className="text-primary hover:underline font-medium"
        >
          {props.actionMessage}
        </Link>
      );
    }
    if (props.actionType === "action") {
      return (
        <button
          onClick={props.onAction}
          className="text-primary hover:underline font-medium"
        >
          {props.actionMessage}
        </button>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8 min-h-[240px]",
        className,
      )}
    >
      <span className={imgClassName}>{modeEmoji[mode]}</span>
      <div className="flex flex-col items-center text-center gap-2">
        {title && (
          <h5 className="text-h6 text-foreground uppercase font-medium">
            {title}
          </h5>
        )}
        <p className="text-sm text-muted-foreground max-w-sm">
          {description} {renderAction()}
        </p>
      </div>
    </div>
  );
};

export default NoData;
