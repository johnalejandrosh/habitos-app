import type { ReactNode } from "react";
import {
  cellsByKey,
  getHabitAccentColor,
  getHabitAccentTextColor,
  WEEKDAY_HEADERS,
  type HabitReportCell,
  type HabitReportData,
  type HabitReportRow,
  type ReportDayColumn,
} from "@/lib/habit-reports";
import { HabitReportMiniRing } from "./HabitReportMiniRing";

function HabitCardHeader({
  row,
  index,
}: {
  row: HabitReportRow;
  index: number;
}) {
  const accentText = getHabitAccentTextColor(index);

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-xl dark:bg-zinc-900">
        {row.habit.emoji ?? "✅"}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {row.habit.name}
        </h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          {row.completedCount} de {row.totalCount} · racha {row.streak} días
        </p>
      </div>
      <HabitReportMiniRing
        completed={row.completedCount}
        total={row.totalCount}
        accentTextClass={accentText}
      />
    </div>
  );
}

function DayPill({
  cell,
  accent,
  emptyHeight = 32,
}: {
  cell?: HabitReportCell;
  accent: string;
  emptyHeight?: number;
}) {
  const active = cell?.active;
  const count = cell?.count ?? 0;
  const height = active
    ? Math.max(36, Math.min(count * 3 + 28, 56))
    : emptyHeight;

  return (
    <div
      className="flex h-14 w-full flex-col items-center justify-end"
      title={
        active
          ? `${count} registro${count === 1 ? "" : "s"}`
          : "Sin registro"
      }
    >
      <span
        className={`flex w-8 items-center justify-center rounded-full text-[10px] font-bold ${
          active
            ? `${accent} text-white shadow-sm`
            : "bg-zinc-100 text-transparent dark:bg-zinc-900"
        }`}
        style={{ height: `${height}px` }}
      >
        {active ? count : ""}
      </span>
    </div>
  );
}

function MonthDayCell({
  day,
  cell,
  accent,
}: {
  day: ReportDayColumn;
  cell?: HabitReportCell;
  accent: string;
}) {
  const active = cell?.active;
  const count = cell?.count ?? 0;

  return (
    <div
      className="flex aspect-square w-full items-center justify-center"
      title={
        active
          ? `${count} registro${count === 1 ? "" : "s"}`
          : `Día ${day.label}`
      }
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-bold tabular-nums ${
          active
            ? `${accent} text-white shadow-sm`
            : day.isToday
              ? "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
        }`}
      >
        {active ? count : day.label}
      </span>
    </div>
  );
}

function MonthEmptyCell() {
  return <div className="aspect-square w-full" aria-hidden />;
}

function YearMonthCell({
  column,
  cell,
  accent,
}: {
  column: ReportDayColumn;
  cell?: HabitReportCell;
  accent: string;
}) {
  const active = cell?.active;
  const count = cell?.count ?? 0;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={`text-[10px] font-bold uppercase tracking-wide ${
          column.isToday
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-zinc-500"
        }`}
      >
        {column.label}
      </span>
      <span
        className={`flex h-12 w-full max-w-[2.75rem] items-center justify-center rounded-2xl text-[11px] font-bold ${
          active
            ? `${accent} text-white shadow-sm`
            : "bg-zinc-100 text-zinc-300 dark:bg-zinc-900 dark:text-zinc-700"
        }`}
        title={
          active
            ? `${count} registro${count === 1 ? "" : "s"}`
            : "Sin registro"
        }
      >
        {active ? count : "·"}
      </span>
    </div>
  );
}

function DayHeader({ column }: { column: ReportDayColumn }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={`text-[11px] font-bold ${
          column.isToday
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-zinc-500"
        }`}
      >
        {column.label}
      </span>
      {column.sublabel && (
        <span
          className={`text-[10px] tabular-nums ${
            column.isToday
              ? "font-bold text-emerald-600 dark:text-emerald-400"
              : "text-zinc-400"
          }`}
        >
          {column.sublabel}
        </span>
      )}
    </div>
  );
}

function HabitReportCard({
  row,
  index,
  children,
}: {
  row: HabitReportRow;
  index: number;
  children: ReactNode;
}) {
  return (
    <li className="rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <HabitCardHeader row={row} index={index} />
      <div className="mt-4">{children}</div>
    </li>
  );
}

export function WeeklyReportGrid({ report }: { report: HabitReportData }) {
  return (
    <ul className="space-y-4">
      {report.rows.map((row, index) => {
        const accent = getHabitAccentColor(index);
        const map = cellsByKey(row);

        return (
          <HabitReportCard key={row.habit.id} row={row} index={index}>
            <div className="grid grid-cols-7 gap-1.5">
              {report.columns.map((column) => (
                <DayHeader key={column.key} column={column} />
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1.5">
              {report.columns.map((column) => (
                <DayPill
                  key={column.key}
                  cell={map.get(column.key)}
                  accent={accent}
                />
              ))}
            </div>
          </HabitReportCard>
        );
      })}
    </ul>
  );
}

export function MonthlyReportGrid({ report }: { report: HabitReportData }) {
  const weeks = report.monthWeeks ?? [];

  return (
    <ul className="space-y-4">
      {report.rows.map((row, index) => {
        const accent = getHabitAccentColor(index);
        const map = cellsByKey(row);

        return (
          <HabitReportCard key={row.habit.id} row={row} index={index}>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAY_HEADERS.map((day) => (
                <span
                  key={day}
                  className="pb-1 text-center text-[11px] font-bold text-zinc-500"
                >
                  {day}
                </span>
              ))}
            </div>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="mt-1 grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) =>
                  day ? (
                    <MonthDayCell
                      key={day.key}
                      day={day}
                      cell={map.get(day.key)}
                      accent={accent}
                    />
                  ) : (
                    <MonthEmptyCell key={`empty-${weekIndex}-${dayIndex}`} />
                  ),
                )}
              </div>
            ))}
          </HabitReportCard>
        );
      })}
    </ul>
  );
}

export function YearlyReportGrid({ report }: { report: HabitReportData }) {
  return (
    <ul className="space-y-4">
      {report.rows.map((row, index) => {
        const accent = getHabitAccentColor(index);
        const map = cellsByKey(row);

        return (
          <HabitReportCard key={row.habit.id} row={row} index={index}>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {report.columns.map((column) => (
                <YearMonthCell
                  key={column.key}
                  column={column}
                  cell={map.get(column.key)}
                  accent={accent}
                />
              ))}
            </div>
          </HabitReportCard>
        );
      })}
    </ul>
  );
}
