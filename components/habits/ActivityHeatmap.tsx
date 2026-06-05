"use client";

import type { HeatmapDay } from "@/lib/habits-storage";

type ActivityHeatmapProps = {
  days: HeatmapDay[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

function heatLevel(count: number, max: number): number {
  if (count === 0) return 0;
  if (max <= 0) return 1;
  const r = count / max;
  if (r >= 0.75) return 4;
  if (r >= 0.5) return 3;
  if (r >= 0.25) return 2;
  return 1;
}

const LEVEL_CLASS: Record<number, string> = {
  0: "bg-zinc-100 text-zinc-400 dark:bg-zinc-800",
  1: "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200",
  2: "bg-emerald-400 text-white",
  3: "bg-emerald-500 text-white",
  4: "bg-emerald-600 text-white",
};

export function ActivityHeatmap({
  days,
  selectedDate,
  onSelectDate,
}: ActivityHeatmapProps) {
  const max = Math.max(...days.map((d) => d.count), 1);
  const weekTotal = days.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">
        {weekTotal} registros esta semana · toca un día
      </p>
      <div className="grid grid-cols-7 gap-2.5">
        {days.map((day) => {
          const selected = selectedDate === day.date;
          const level = heatLevel(day.count, max);
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectDate(day.date)}
              className={`flex flex-col items-center gap-2 rounded-2xl p-2.5 transition active:scale-95 ${
                selected
                  ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-950"
                  : ""
              }`}
              aria-label={`${day.weekday}: ${day.count} registros`}
            >
              <span
                className={`flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold ${LEVEL_CLASS[level]}`}
              >
                {day.count > 0 ? day.count : "·"}
              </span>
              <span
                className={`text-xs font-semibold ${
                  day.isToday
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-500"
                }`}
              >
                {day.isToday ? "Hoy" : day.weekday}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
