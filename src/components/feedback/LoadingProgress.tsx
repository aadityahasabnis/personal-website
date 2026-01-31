"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface ILoadingProgressProps {
  loading: boolean;
}

/**
 * Loading progress bar with animated states
 */
const LoadingProgress = ({ loading }: ILoadingProgressProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (loading) {
      setProgress(10);
      interval = setInterval(() => {
        setProgress((p) => (p < 95 ? p + 10 : p));
      }, 50);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 300);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  if (progress === 0) return null;

  return (
    <Progress
      value={progress}
      className="fixed top-0 left-0 right-0 h-1 z-[100] rounded-none"
    />
  );
};

export default LoadingProgress;
