"use client";

import { useMemo, useState } from "react";
import {
  computeInsightsSummary,
  formatInsightDate,
  getEntriesForDate,
  getPreviousPeriodSeries,
  getSeriesForPeriod,
  getWeekHeatmap,
  type InsightPeriod,
} from "@/lib/insights";
import { formatTime, type HabitStore } from "@/lib/habits-storage";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { HabitLineChart } from "./HabitLineChart";

type InsightsSectionProps = {
  store: HabitStore;
  open: boolean;
  onToggle: () => void;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
};

const PERIODS: { value: InsightPeriod; label: string }[] = [
  { value: 7, label: "7 días" },
  { value: 14, label: "14 días" },
  { value: 30, label: "30 días" },
];

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/80">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

export function InsightsSection({
  store,
  open,
  onToggle,
  selectedDate,
  onSelectDate,
}: InsightsSectionProps) {
  const [period, setPeriod] = useState<InsightPeriod>(14);

  const series = useMemo(
    () => getSeriesForPeriod(store, period),
    [store, period],
  );
  const previousSeries = useMemo(
    () => getPreviousPeriodSeries(store, period),
    [store, period],
  );
  const summary = useMemo(
    () => computeInsightsSummary(series, previousSeries),
    [series, previousSeries],
  );
  const weekDays = useMemo(
    () => getWeekHeatmap(store.entries),
    [store.entries],
  );
  const dayEntries = useMemo(
    () => (selectedDate ? getEntriesForDate(store, selectedDate) : []),
    [store, selectedDate],
  );
  const habitById = useMemo(
    () => new Map(store.habits.map((h) => [h.id, h])),
    [store.habits],
  );
  const selectedDay = series.find((d) => d.date === selectedDate);

  const preview =
    summary.total > 0
      ? `${summary.total} registros · ${summary.activeDays} días activos`
      : "Sin datos aún";

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left active:bg-zinc-50 dark:active:bg-zinc-900"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-xl dark:bg-emerald-950">
          📊
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Estadísticas
          </p>
          {!open && (
            <p className="mt-0.5 truncate text-sm text-zinc-500">{preview}</p>
          )}
        </div>
        <svg
          className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="habit-slide-down space-y-6 border-t border-zinc-100 px-5 pb-6 pt-5 dark:border-zinc-800">
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={`min-h-10 flex-1 rounded-xl text-sm font-semibold transition active:scale-[0.98] ${
                  period === p.value
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {summary.trendPercent !== null && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                summary.trendPercent >= 0
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
              }`}
            >
              {summary.trendPercent >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(summary.trendPercent)}% vs el periodo anterior
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total" value={String(summary.total)} />
            <StatCard
              label="Promedio / día"
              value={String(summary.avgPerDay)}
            />
            <StatCard
              label="Días activos"
              value={`${summary.activeDays}/${period}`}
            />
            <StatCard
              label="Mejor día"
              value={
                summary.bestDay ? String(summary.bestDay.count) : "—"
              }
              hint={summary.bestDay?.label}
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Esta semana
            </p>
            <ActivityHeatmap
              days={weekDays}
              selectedDate={selectedDate}
              onSelectDate={(d) =>
                onSelectDate(selectedDate === d ? null : d)
              }
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Evolución · {period} días
            </p>
            <HabitLineChart
              data={series}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
            />
          </div>

          {selectedDate && selectedDay && (
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    Día seleccionado
                  </p>
                  <p className="mt-1 text-base font-semibold capitalize text-zinc-900 dark:text-zinc-50">
                    {formatInsightDate(selectedDate)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectDate(null)}
                  className="rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-zinc-600 active:bg-white dark:bg-zinc-900 dark:text-zinc-400"
                >
                  Cerrar
                </button>
              </div>

              <p className="mt-3 text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                {selectedDay.count}{" "}
                <span className="text-base font-semibold">
                  {selectedDay.count === 1 ? "registro" : "registros"}
                </span>
              </p>

              {dayEntries.length > 0 ? (
                <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto">
                  {dayEntries.map((entry) => {
                    const habit = habitById.get(entry.habitId);
                    return (
                      <li
                        key={entry.id}
                        className="rounded-xl bg-white/80 px-3 py-2.5 dark:bg-zinc-900/60"
                      >
                        <p className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          <span>{habit?.emoji ?? "✅"}</span>
                          {habit?.name ?? "Hábito"}
                          <span className="ml-auto text-xs text-zinc-400">
                            {formatTime(entry.at)}
                          </span>
                        </p>
                        {entry.description && (
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            {entry.description}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-zinc-500">
                  Sin registros este día
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
