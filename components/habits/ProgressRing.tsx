"use client";

import { ringProgress } from "@/lib/habit-feedback";

type ProgressRingProps = {
  count: number;
  pulsing?: boolean;
  size?: number;
};

export function ProgressRing({
  count,
  pulsing = false,
  size = 52,
}: ProgressRingProps) {
  const progress = ringProgress(count);
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const goalReached = count >= 5;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {pulsing && (
        <span
          className="absolute inset-0 rounded-full border-2 border-emerald-400"
          style={{ animation: "habit-ring-pulse 0.5s ease-out forwards" }}
        />
      )}
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-zinc-100 dark:text-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-[stroke-dashoffset] duration-500 ease-out ${
            goalReached ? "text-amber-500" : "text-emerald-500"
          }`}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums ${
          goalReached
            ? "text-amber-600 dark:text-amber-400"
            : "text-emerald-700 dark:text-emerald-400"
        }`}
      >
        {count}
      </span>
    </div>
  );
}
