"use client";

import React, { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

type ItemType = StaticImageData | string;

interface IInfiniteCarouselProps {
  items: ItemType[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
  itemClassName?: string;
}

/**
 * Infinite horizontal scrolling carousel for logos/images
 */
export const InfiniteCarousel = ({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
  itemClassName,
}: IInfiniteCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return;

    // Clone items for infinite scroll effect
    const scrollerContent = Array.from(scrollerRef.current.children);
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      scrollerRef.current?.appendChild(duplicatedItem);
    });

    // Set animation direction
    containerRef.current.style.setProperty(
      "--animation-direction",
      direction === "left" ? "forwards" : "reverse",
    );

    // Set animation speed
    const durations = { fast: "20s", normal: "40s", slow: "80s" };
    containerRef.current.style.setProperty(
      "--animation-duration",
      durations[speed],
    );

    setStart(true);
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative max-w-full overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 w-max m-0 p-0 list-none",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className={cn(
              "flex items-center justify-center w-fit max-w-full rounded-lg flex-shrink-0",
              "px-4 py-2 border bg-card",
              itemClassName,
            )}
          >
            <Image
              className="block h-8 w-auto object-contain"
              height={32}
              width={120}
              src={item}
              alt={`Partner ${idx + 1}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InfiniteCarousel;
