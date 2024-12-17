import { useEffect, useRef, useState } from "react";
import { useNavigation } from "react-router";
import { useSpinDelay } from "spin-delay";
import { cn } from "~/lib/utils";
import { Spinner } from "./spinner";

interface ProgressBarProps {
  showSpinner?: boolean;
}

function ProgressBar({ showSpinner = false }: ProgressBarProps) {
  const transition = useNavigation();
  const busy = transition.state !== "idle";
  const delayedPending = useSpinDelay(busy, {
    delay: 600,
    minDuration: 400,
  });
  const ref = useRef<HTMLDivElement>(null);
  const [animationComplete, setAnimationComplete] = useState(true);

  useEffect(() => {
    if (!ref.current) return;
    if (delayedPending) setAnimationComplete(false);

    const animationPromises = ref.current
      .getAnimations()
      .map(({ finished }) => finished);

    Promise.allSettled(animationPromises).then(() => {
      if (!delayedPending) setAnimationComplete(true);
    });
  }, [delayedPending]);

  return (
    <div
      aria-hidden={delayedPending ? undefined : true}
      aria-valuetext={delayedPending ? "Loading" : undefined}
      className="fixed inset-x-0 left-0 top-0 z-[99999] h-1 animate-pulse"
    >
      <div
        ref={ref}
        className={cn(
          "h-full w-0 bg-primary duration-500 ease-in-out",
          transition.state === "idle" &&
            (animationComplete
              ? "transition-none"
              : "w-full opacity-0 transition-all"),
          delayedPending && transition.state === "submitting" && "w-5/12",
          delayedPending && transition.state === "loading" && "w-8/12",
        )}
      />
      {delayedPending && showSpinner && (
        <div className="absolute right-2 top-2 flex items-center justify-center">
          <Spinner className="h-4 w-4 text-primary" />
        </div>
      )}
    </div>
  );
}

export { ProgressBar };
