"use client";

import React from "react";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ITestimonialCardProps {
  quote: string;
  author: string;
  organization: string;
  initials: string;
  className?: string;
}

/**
 * Testimonial card for displaying client/peer reviews
 */
const TestimonialCard = ({
  quote,
  author,
  organization,
  initials,
  className,
}: ITestimonialCardProps) => (
  <div className={cn("group relative", className)}>
    <div className="bg-muted/30 border rounded-lg p-5 hover:shadow-md transition-all duration-300 hover:border-primary/30">
      {/* Quote Icon */}
      <div className="absolute -top-3 left-6">
        <div className="bg-background p-2 rounded-md border border-primary/30">
          <Quote className="size-4 text-primary" />
        </div>
      </div>

      {/* Quote Text */}
      <blockquote className="text-foreground text-sm italic mb-4 pt-4">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Attribution */}
      <div className="flex items-center gap-3">
        <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-primary font-semibold text-sm">{initials}</span>
        </div>
        <div>
          <p className="text-foreground font-medium text-sm">{author}</p>
          <p className="text-muted-foreground text-xs">{organization}</p>
        </div>
      </div>
    </div>
  </div>
);

export default TestimonialCard;
