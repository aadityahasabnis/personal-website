"use client";

import React from "react";
import { type LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IFeatureCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
  iconClassName?: string;
  href?: string;
}

/**
 * Feature card component for showcasing features
 */
export const FeatureCard: React.FC<IFeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  className,
  iconClassName,
}) => {
  return (
    <Card
      className={cn(
        "group transition-all hover:shadow-md hover:border-primary/50",
        className,
      )}
    >
      <CardHeader>
        {Icon && (
          <div
            className={cn(
              "size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3",
              "group-hover:bg-primary group-hover:text-primary-foreground transition-colors",
              iconClassName,
            )}
          >
            <Icon className="size-5" />
          </div>
        )}
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
