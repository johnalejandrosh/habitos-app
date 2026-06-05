"use client";

import { useEffect } from "react";
import { DAILY_TOTAL_GOAL, DAILY_VISUAL_GOAL } from "@/lib/habit-feedback";
import type { Habit, HabitEntry } from "@/lib/habits-storage";

type StatsSheetProps = {
  open: boolean;
  onClose: () => void;
  totalToday: number;
  habits: Habit[];
  entries: HabitEntry[];
  getCount: (habitId: string) => number;
};

export function StatsSheet({
  open,
  onClose,
  totalToday,
  habits,
  entries,
  getCount,
}: StatsSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const sorted = [...habits].sort((a, b) => getCount(b.id) - getCount(a.id));

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 habit-sheet-backdrop"
        onClick={onClose}
        aria-label="Cerrar resumen"
      />
      <div className="relative mx-auto w-full max-w-lg rounded-t-3xl bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 habit-sheet-panel dark:bg-zinc-950">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Resumen de hoy
        </h3>
        <p className="text-sm text-zinc-500">
          {totalToday} registros · meta {DAILY_TOTAL_GOAL}
        </p>

        <ul className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
          {sorted.length === 0 ? (
            <li className="py-6 text-center text-sm text-zinc-500">
              Sin hábitos aún
            </li>
          ) : (
            sorted.map((h) => {
              const n = getCount(h.id);
              const pct = Math.min((n / DAILY_VISUAL_GOAL) * 100, 100);
              return (
                <li
                  key={h.id}
                  className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-900"
                >
                  <span className="text-2xl">{h.emoji ?? "✅"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                      {h.name}
                    </p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-lg font-bold tabular-nums text-emerald-600">
                    {n}
                  </span>
                </li>
              );
            })
          )}
        </ul>

        <p className="mt-3 text-center text-xs text-zinc-400">
          {entries.filter((e) => e.at.startsWith(new Date().toISOString().slice(0, 10))).length}{" "}
          entradas guardadas hoy
        </p>
      </div>
    </div>
  );
}
