"use client";

import { useCallback, useRef, useState } from "react";
import { useHoldRepeat } from "@/lib/use-hold-repeat";

type HabitLogButtonProps = {
  habitName: string;
  onPress: () => void;
  onHoldLog?: () => void;
  fullWidth?: boolean;
};

export function HabitLogButton({
  habitName,
  onPress,
  onHoldLog,
  fullWidth = false,
}: HabitLogButtonProps) {
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const progressFrame = useRef<number | null>(null);
  const holdStart = useRef(0);
  const didRepeat = useRef(false);

  const holdHandler = onHoldLog ?? onPress;

  const { pointerHandlers, stop } = useHoldRepeat({
    onRepeat: () => {
      didRepeat.current = true;
      holdHandler();
    },
    delayMs: 500,
    intervalMs: 280,
    maxRepeats: 12,
  });

  const startHoldVisual = useCallback(() => {
    setHolding(true);
    holdStart.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - holdStart.current;
      setHoldProgress(Math.min(elapsed / 500, 1));
      if (elapsed < 520) {
        progressFrame.current = requestAnimationFrame(tick);
      }
    };
    progressFrame.current = requestAnimationFrame(tick);
  }, []);

  const endHoldVisual = useCallback(() => {
    setHolding(false);
    setHoldProgress(0);
    if (progressFrame.current) cancelAnimationFrame(progressFrame.current);
    stop();
  }, [stop]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    didRepeat.current = false;
    startHoldVisual();
    pointerHandlers.onPointerDown(e);
  };

  const handleClick = () => {
    if (didRepeat.current) {
      didRepeat.current = false;
      return;
    }
    onPress();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={endHoldVisual}
      onPointerLeave={endHoldVisual}
      onPointerCancel={endHoldVisual}
      className={`relative flex touch-manipulation select-none flex-col items-center justify-center overflow-hidden rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25 transition-[transform,box-shadow] active:bg-emerald-700 active:scale-[0.98] ${
        fullWidth ? "h-14 w-full" : "h-[4.25rem] min-w-[5.25rem]"
      } ${holding ? "scale-[0.98]" : ""}`}
      aria-label={`Registrar ${habitName}. Mantén pulsado para varios registros.`}
    >
      {holding && (
        <span
          className="pointer-events-none absolute inset-0 bg-white/15"
          style={{
            transform: `scaleX(${holdProgress})`,
            transformOrigin: "left center",
          }}
        />
      )}

      <span className="text-2xl font-bold leading-none">+1</span>
      <span className="mt-0.5 text-xs font-semibold uppercase tracking-wider opacity-90">
        {holding && holdProgress > 0.2 ? "Suelta…" : "Hecho"}
      </span>
    </button>
  );
}
