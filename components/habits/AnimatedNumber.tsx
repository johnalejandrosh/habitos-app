"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  className?: string;
};

export function AnimatedNumber({ value, className = "" }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    const from = prev.current;
    const to = value;
    prev.current = value;

    const steps = Math.min(Math.abs(to - from), 8);
    if (steps === 0) {
      setDisplay(to);
      return;
    }

    let step = 0;
    const id = setInterval(() => {
      step++;
      const t = step / steps;
      setDisplay(Math.round(from + (to - from) * t));
      if (step >= steps) clearInterval(id);
    }, 40);

    return () => clearInterval(id);
  }, [value]);

  return (
    <span
      key={value}
      className={`tabular-nums ${className} ${
        value !== display ? "" : "habit-counter-bump"
      }`}
    >
      {display}
    </span>
  );
}
