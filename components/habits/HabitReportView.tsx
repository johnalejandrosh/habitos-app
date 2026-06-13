"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  buildHabitReport,
  shiftReportAnchor,
  type ReportPeriod,
} from "@/lib/habit-reports";
import { loadHabitStore, type HabitStore } from "@/lib/habits-storage";
import { AppNav } from "./AppNav";
import {
  MonthlyReportGrid,
  WeeklyReportGrid,
  YearlyReportGrid,
} from "./HabitReportGrids";

const PERIOD_OPTIONS: { id: ReportPeriod; label: string }[] = [
  { id: "weekly", label: "Semana" },
  { id: "monthly", label: "Mes" },
  { id: "yearly", label: "Año" },
];

const SUMMARY_ITEMS = [
  { key: "completionRate", label: "Hábitos", suffix: "%" },
  { key: "successDays", label: "Días activos", suffix: "" },
  { key: "totalLogs", label: "Registros", suffix: "" },
  { key: "bestStreak", label: "Mejor racha", suffix: "" },
] as const;

function formatPeriodTitle(
  period: ReportPeriod,
  anchor: Date,
  rangeLabel: string,
) {
  if (period === "yearly") {
    return {
      primary: String(anchor.getFullYear()),
      secondary: "Resumen anual",
    };
  }

  if (period === "monthly") {
    const month = anchor
      .toLocaleDateString("es-ES", { month: "long" })
      .replace(/^\w/, (c) => c.toUpperCase());
    return {
      primary: month,
      secondary: String(anchor.getFullYear()),
    };
  }

  return {
    primary: rangeLabel,
    secondary: "Semana seleccionada",
  };
}

function isCurrentPeriod(period: ReportPeriod, anchor: Date): boolean {
  const now = new Date();
  if (period === "yearly") return anchor.getFullYear() === now.getFullYear();
  if (period === "monthly") {
    return (
      anchor.getFullYear() === now.getFullYear() &&
      anchor.getMonth() === now.getMonth()
    );
  }
  const weekStart = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  };
  return weekStart(anchor) === weekStart(now);
}

export function HabitReportView() {
  const [store, setStore] = useState<HabitStore | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>("weekly");
  const [anchor, setAnchor] = useState(() => new Date());

  useEffect(() => {
    setStore(loadHabitStore());
  }, []);

  const report = useMemo(() => {
    if (!store) return null;
    return buildHabitReport(store, period, anchor);
  }, [store, period, anchor]);

  const periodTitle = report
    ? formatPeriodTitle(period, anchor, report.rangeLabel)
    : null;

  const isTodayPeriod = isCurrentPeriod(period, anchor);

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-zinc-50/95 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md dark:border-zinc-800 dark:bg-black/95">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
              Reporte
            </h1>
            <Link
              href="/home"
              className="min-h-10 rounded-xl bg-zinc-200/80 px-3.5 py-2 text-xs font-semibold text-zinc-700 active:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300"
            >
              Editar
            </Link>
          </div>

          <div className="mt-3 flex rounded-2xl bg-zinc-200/70 p-1 dark:bg-zinc-900">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setPeriod(option.id);
                  setAnchor(new Date());
                }}
                className={`min-h-11 flex-1 rounded-xl text-sm font-semibold transition active:scale-[0.98] ${
                  period === option.id
                    ? "bg-white text-emerald-700 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-2xl bg-white p-2 shadow-sm dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setAnchor((current) => shiftReportAnchor(period, current, -1))
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xl text-zinc-600 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300"
                aria-label="Periodo anterior"
              >
                ‹
              </button>

              <div className="min-w-0 flex-1 px-1 text-center">
                <p
                  className={`truncate font-bold text-zinc-900 dark:text-zinc-50 ${
                    period === "yearly"
                      ? "text-2xl tabular-nums"
                      : "text-lg capitalize"
                  }`}
                >
                  {periodTitle?.primary ?? "—"}
                </p>
                {periodTitle?.secondary && (
                  <p className="mt-0.5 text-xs font-medium text-zinc-500">
                    {periodTitle.secondary}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setAnchor((current) => shiftReportAnchor(period, current, 1))
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xl text-zinc-600 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300"
                aria-label="Periodo siguiente"
              >
                ›
              </button>
            </div>

            {!isTodayPeriod && (
              <button
                type="button"
                onClick={() => setAnchor(new Date())}
                className="mt-2 w-full rounded-xl py-2 text-xs font-semibold text-emerald-700 active:bg-emerald-50 dark:text-emerald-400 dark:active:bg-emerald-950/40"
              >
                Volver a hoy
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        {!store || !report ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : report.rows.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950">
            <p className="text-5xl">📊</p>
            <p className="mt-4 text-base font-semibold text-zinc-800 dark:text-zinc-200">
              Aún no hay hábitos
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Crea hábitos en inicio para ver tu reporte aquí.
            </p>
            <Link
              href="/home"
              className="mt-6 min-h-12 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
            >
              Ir a inicio
            </Link>
          </div>
        ) : (
          <>
            {period === "weekly" && <WeeklyReportGrid report={report} />}
            {period === "monthly" && <MonthlyReportGrid report={report} />}
            {period === "yearly" && <YearlyReportGrid report={report} />}

            <section className="grid grid-cols-2 gap-3">
              {SUMMARY_ITEMS.map((item, index) => {
                const value = report.summary[item.key];
                const colors = [
                  "text-emerald-600 dark:text-emerald-400",
                  "text-sky-600 dark:text-sky-400",
                  "text-amber-600 dark:text-amber-400",
                  "text-orange-600 dark:text-orange-400",
                ];

                return (
                  <div
                    key={item.key}
                    className="rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <p
                      className={`text-2xl font-bold tabular-nums sm:text-3xl ${colors[index % colors.length]}`}
                    >
                      {value}
                      {item.suffix}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </section>
          </>
        )}
      </main>

      <AppNav />
    </div>
  );
}
