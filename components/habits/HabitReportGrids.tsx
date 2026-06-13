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

function HabitLabel({ row }: { row: HabitReportRow }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-lg dark:bg-zinc-900">
        {row.habit.emoji ?? "✅"}
      </span>
      <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {row.habit.name}
      </span>
    </div>
  );
}

function ActivityCell({
  cell,
  accent,
  tall = false,
}: {
  cell?: HabitReportCell;
  accent: string;
  tall?: boolean;
}) {
  const active = cell?.active;
  const count = cell?.count ?? 0;

  if (tall) {
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
          className={`flex w-7 items-center justify-center rounded-full text-[10px] font-bold ${
            active
              ? `${accent} min-h-[1.75rem] text-white shadow-sm`
              : "h-7 bg-zinc-100 text-transparent dark:bg-zinc-900"
          }`}
          style={active ? { minHeight: `${Math.max(28, Math.min(count * 4 + 20, 52))}px` } : undefined}
        >
          {active ? count : ""}
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center"
      title={
        active
          ? `${count} registro${count === 1 ? "" : "s"}`
          : "Sin registro"
      }
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${
          active
            ? `${accent} text-white shadow-sm`
            : "bg-zinc-100 text-zinc-300 dark:bg-zinc-900 dark:text-zinc-700"
        }`}
      >
        {active ? count : ""}
      </span>
    </div>
  );
}

function EmptyDayCell() {
  return <div className="h-8 w-8" aria-hidden />;
}

export function WeeklyReportGrid({ report }: { report: HabitReportData }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="grid grid-cols-[minmax(6.5rem,7.5rem)_1fr_2.75rem] items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Hábito
        </span>
        <div className="grid grid-cols-7 gap-1.5">
          {report.columns.map((column) => (
            <DayHeader key={column.key} column={column} />
          ))}
        </div>
        <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          %
        </span>
      </div>

      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {report.rows.map((row, index) => (
          <ReportRow
            key={row.habit.id}
            row={row}
            index={index}
            columns={report.columns}
          />
        ))}
      </ul>
    </section>
  );
}

export function MonthlyReportGrid({ report }: { report: HabitReportData }) {
  const weeks = report.monthWeeks ?? [];

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="grid grid-cols-[minmax(6.5rem,7.5rem)_1fr_2.75rem] items-center gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Hábito
        </span>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_HEADERS.map((day) => (
            <span
              key={day}
              className="text-center text-[11px] font-bold text-zinc-500"
            >
              {day}
            </span>
          ))}
        </div>
        <span className="text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          %
        </span>
      </div>

      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {report.rows.map((row, index) => {
          const accent = getHabitAccentColor(index);
          const accentText = getHabitAccentTextColor(index);
          const map = cellsByKey(row);

          return (
            <li
              key={row.habit.id}
              className="grid grid-cols-[minmax(6.5rem,7.5rem)_1fr_2.75rem] items-center gap-2 px-4 py-3"
            >
              <HabitLabel row={row} />

              <div className="space-y-1.5">
                {weeks.map((week, weekIndex) => (
                  <div
                    key={weekIndex}
                    className="grid grid-cols-7 gap-1.5"
                  >
                    {week.map((day, dayIndex) =>
                      day ? (
                        <div key={day.key} className="flex flex-col items-center gap-0.5">
                          <ActivityCell
                            cell={map.get(day.key)}
                            accent={accent}
                          />
                          <span
                            className={`text-[9px] font-semibold tabular-nums ${
                              day.isToday
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-zinc-400"
                            }`}
                          >
                            {day.label}
                          </span>
                        </div>
                      ) : (
                        <EmptyDayCell key={`empty-${weekIndex}-${dayIndex}`} />
                      ),
                    )}
                  </div>
                ))}
              </div>

              <HabitReportMiniRing
                completed={row.completedCount}
                total={row.totalCount}
                accentTextClass={accentText}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function YearlyReportGrid({ report }: { report: HabitReportData }) {
  const timelineWidth = report.columns.length * 2.75;

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <div
          className="min-w-full"
          style={{ minWidth: `calc(7.5rem + ${timelineWidth}rem + 2.75rem)` }}
        >
          <div className="grid grid-cols-[7.5rem_1fr_2.75rem] items-end gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Hábito
            </span>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${report.columns.length}, 2.75rem)`,
              }}
            >
              {report.columns.map((column) => (
                <DayHeader key={column.key} column={column} stacked />
              ))}
            </div>
            <span className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              %
            </span>
          </div>

          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {report.rows.map((row, index) => {
              const accent = getHabitAccentColor(index);
              const accentText = getHabitAccentTextColor(index);
              const map = cellsByKey(row);

              return (
                <li
                  key={row.habit.id}
                  className="grid grid-cols-[7.5rem_1fr_2.75rem] items-center gap-3 px-4 py-3"
                >
                  <HabitLabel row={row} />

                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${row.cells.length}, 2.75rem)`,
                    }}
                  >
                    {report.columns.map((column) => (
                      <ActivityCell
                        key={column.key}
                        cell={map.get(column.key)}
                        accent={accent}
                        tall
                      />
                    ))}
                  </div>

                  <HabitReportMiniRing
                    completed={row.completedCount}
                    total={row.totalCount}
                    accentTextClass={accentText}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function DayHeader({
  column,
  stacked = false,
}: {
  column: ReportDayColumn;
  stacked?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-0.5 ${stacked ? "w-11" : ""}`}
    >
      <span
        className={`font-bold ${
          stacked ? "text-[10px] uppercase tracking-wide" : "text-[11px]"
        } ${
          column.isToday
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-zinc-500"
        }`}
      >
        {column.label}
      </span>
      {column.sublabel && !stacked && (
        <span className="text-[10px] text-zinc-400">{column.sublabel}</span>
      )}
    </div>
  );
}

function ReportRow({
  row,
  index,
  columns,
}: {
  row: HabitReportRow;
  index: number;
  columns: ReportDayColumn[];
}) {
  const accent = getHabitAccentColor(index);
  const accentText = getHabitAccentTextColor(index);
  const map = cellsByKey(row);

  return (
    <li className="grid grid-cols-[minmax(6.5rem,7.5rem)_1fr_2.75rem] items-center gap-2 px-4 py-3">
      <HabitLabel row={row} />

      <div className="grid grid-cols-7 gap-1.5">
        {columns.map((column) => (
          <ActivityCell key={column.key} cell={map.get(column.key)} accent={accent} />
        ))}
      </div>

      <HabitReportMiniRing
        completed={row.completedCount}
        total={row.totalCount}
        accentTextClass={accentText}
      />
    </li>
  );
}
