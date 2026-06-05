"use client";

import {
  DAILY_TOTAL_GOAL,
  dailyTotalProgress,
} from "@/lib/habit-feedback";
import { AnimatedNumber } from "./AnimatedNumber";

type DailyProgressHeroProps = {
  totalToday: number;
  yesterdayTotal: number;
  bump: boolean;
  goalComplete: boolean;
  onOpenStats: () => void;
};

export function DailyProgressHero({
  totalToday,
  yesterdayTotal,
  bump,
  goalComplete,
  onOpenStats,
}: DailyProgressHeroProps) {
  const progress = dailyTotalProgress(totalToday);
  const pct = Math.round(progress * 100);
  const beatYesterday =
    totalToday > 0 && yesterdayTotal > 0 && totalToday > yesterdayTotal;

  return (
    <button
      type="button"
      onClick={onOpenStats}
      className="w-full rounded-3xl border border-zinc-200/80 bg-white p-5 text-left shadow-sm transition active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-500">Hoy</p>
          <p
            className={`flex items-baseline gap-2 ${
              bump ? "habit-counter-bump" : ""
            }`}
          >
            <AnimatedNumber
              value={totalToday}
              className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50"
            />
            <span className="text-base font-medium text-zinc-500">
              registros
            </span>
          </p>
        </div>
        {goalComplete ? (
          <span className="habit-badge-pop rounded-2xl bg-amber-400 px-3 py-1.5 text-xs font-black text-amber-950">
            META ✓
          </span>
        ) : beatYesterday ? (
          <span className="habit-badge-pop rounded-2xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            +{totalToday - yesterdayTotal} vs ayer
          </span>
        ) : null}
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-sm text-zinc-500">
          <span>Meta del día</span>
          <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
            {totalToday} / {DAILY_TOTAL_GOAL} · {pct}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ease-out ${
              goalComplete
                ? "bg-gradient-to-r from-amber-400 to-emerald-500 habit-progress-shine"
                : "bg-emerald-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">
        Ver desglose por hábito →
      </p>
    </button>
  );
}
