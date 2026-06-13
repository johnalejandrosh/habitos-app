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

function DailyProgressRing({
  progress,
  goalComplete,
}: {
  progress: number;
  goalComplete: boolean;
}) {
  const size = 72;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const pct = Math.round(progress * 100);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
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
          className={`transition-[stroke-dashoffset] duration-500 ${
            goalComplete
              ? "text-amber-500"
              : "text-emerald-500"
          }`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-zinc-800 dark:text-zinc-200">
        {pct}%
      </span>
    </div>
  );
}

export function DailyProgressHero({
  totalToday,
  yesterdayTotal,
  bump,
  goalComplete,
  onOpenStats,
}: DailyProgressHeroProps) {
  const progress = dailyTotalProgress(totalToday);
  const pct = Math.round(progress * 100);
  const overGoal = totalToday > DAILY_TOTAL_GOAL;
  const beatYesterday =
    totalToday > 0 && yesterdayTotal > 0 && totalToday > yesterdayTotal;

  return (
    <button
      type="button"
      onClick={onOpenStats}
      className={`group w-full overflow-hidden rounded-3xl border text-left shadow-sm transition active:scale-[0.99] ${
        goalComplete
          ? "border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-emerald-50 dark:border-amber-900/50 dark:from-amber-950/30 dark:via-zinc-950 dark:to-emerald-950/20"
          : "border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Hoy
              </p>
              {goalComplete ? (
                <span className="habit-badge-pop inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-950">
                  Meta ✓
                </span>
              ) : beatYesterday ? (
                <span className="habit-badge-pop inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  +{totalToday - yesterdayTotal} vs ayer
                </span>
              ) : null}
            </div>

            <p
              className={`mt-3 ${bump ? "habit-counter-bump" : ""}`}
            >
              <AnimatedNumber
                value={totalToday}
                className="text-5xl font-bold leading-none tracking-tight text-zinc-900 dark:text-zinc-50"
              />
            </p>
            <p className="mt-1.5 text-sm font-medium text-zinc-500">
              {totalToday === 1 ? "registro" : "registros"}
              {overGoal && (
                <span className="text-emerald-600 dark:text-emerald-400">
                  {" "}
                  · +{totalToday - DAILY_TOTAL_GOAL} sobre la meta
                </span>
              )}
            </p>
          </div>

          <DailyProgressRing progress={progress} goalComplete={goalComplete} />
        </div>

        <div className="mt-5 rounded-2xl bg-zinc-50/90 p-4 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">
              Meta del día
            </span>
            <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
              {Math.min(totalToday, DAILY_TOTAL_GOAL)} / {DAILY_TOTAL_GOAL}
              {overGoal && (
                <span className="ml-1 text-amber-600 dark:text-amber-400">
                  (+{totalToday - DAILY_TOTAL_GOAL})
                </span>
              )}
            </span>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                goalComplete
                  ? "bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 habit-progress-shine"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="mt-2.5 text-xs text-zinc-500">
            {goalComplete
              ? "¡Meta cumplida! Sigue sumando si quieres."
              : totalToday === 0
                ? `Registra hábitos para llegar a ${DAILY_TOTAL_GOAL}.`
                : `Te faltan ${DAILY_TOTAL_GOAL - totalToday} para la meta.`}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          Ver desglose por hábito
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition group-active:translate-x-0.5 dark:bg-emerald-950 dark:text-emerald-400">
          →
        </span>
      </div>
    </button>
  );
}
