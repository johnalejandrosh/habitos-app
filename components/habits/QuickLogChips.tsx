"use client";

import { hapticLight } from "@/lib/haptics";

type QuickLogChipsProps = {
  onLogMany: (count: number) => void;
};

export function QuickLogChips({ onLogMany }: QuickLogChipsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[3, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => {
            hapticLight();
            onLogMany(n);
          }}
          className="min-h-12 rounded-2xl border border-emerald-200 bg-emerald-50/80 text-base font-bold text-emerald-800 active:scale-[0.98] active:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          +{n} rápido
        </button>
      ))}
    </div>
  );
}
