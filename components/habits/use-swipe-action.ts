"use client";

import { useCallback, useRef, useState } from "react";

const SWIPE_THRESHOLD = 56;
const MAX_OFFSET = 72;

export function useSwipeAction(onAction: () => void) {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const active = useRef(false);

  const reset = useCallback(() => {
    setOffset(0);
    setSwiping(false);
    active.current = false;
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    active.current = true;
    setSwiping(true);
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!active.current) return;
      const delta = e.touches[0].clientX - startX.current;
      if (delta > 8) {
        setOffset(0);
        return;
      }
      setOffset(Math.max(-MAX_OFFSET, delta));
    },
    [],
  );

  const onTouchEnd = useCallback(() => {
    if (!active.current) return;
    if (offset <= -SWIPE_THRESHOLD) {
      onAction();
    }
    reset();
  }, [offset, onAction, reset]);

  return {
    offset,
    swiping,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    reset,
  };
}
