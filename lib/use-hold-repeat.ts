"use client";

import { useCallback, useRef } from "react";

type UseHoldRepeatOptions = {
  onRepeat: () => void;
  delayMs?: number;
  intervalMs?: number;
  maxRepeats?: number;
};

export function useHoldRepeat({
  onRepeat,
  delayMs = 450,
  intervalMs = 320,
  maxRepeats = 15,
}: UseHoldRepeatOptions) {
  const holding = useRef(false);
  const repeatCount = useRef(0);
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (delayTimer.current) clearTimeout(delayTimer.current);
    if (intervalTimer.current) clearInterval(intervalTimer.current);
    delayTimer.current = null;
    intervalTimer.current = null;
  }, []);

  const stop = useCallback(() => {
    holding.current = false;
    repeatCount.current = 0;
    clearTimers();
  }, [clearTimers]);

  const start = useCallback(() => {
    holding.current = true;
    repeatCount.current = 0;
    clearTimers();

    delayTimer.current = setTimeout(() => {
      if (!holding.current) return;
      onRepeat();
      repeatCount.current++;

      intervalTimer.current = setInterval(() => {
        if (!holding.current || repeatCount.current >= maxRepeats) {
          stop();
          return;
        }
        onRepeat();
        repeatCount.current++;
      }, intervalMs);
    }, delayMs);
  }, [clearTimers, delayMs, intervalMs, maxRepeats, onRepeat, stop]);

  const pointerHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      start();
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
  };

  return { pointerHandlers, stop, isHolding: holding };
}
