import {
  getHabitStreak,
  type Habit,
  type HabitEntry,
  type HabitStore,
} from "./habits-storage";

export type ReportPeriod = "weekly" | "monthly" | "yearly";

export type ReportDayColumn = {
  key: string;
  label: string;
  sublabel?: string;
  isToday?: boolean;
};

export type HabitReportCell = {
  key: string;
  count: number;
  active: boolean;
};

export type HabitReportRow = {
  habit: Habit;
  cells: HabitReportCell[];
  completedCount: number;
  totalCount: number;
  streak: number;
};

export type ReportSummary = {
  completionRate: number;
  successDays: number;
  totalLogs: number;
  bestStreak: number;
};

export type HabitReportData = {
  period: ReportPeriod;
  rangeLabel: string;
  columns: ReportDayColumn[];
  monthWeeks?: (ReportDayColumn | null)[][];
  rows: HabitReportRow[];
  summary: ReportSummary;
};

export const WEEKDAY_HEADERS = ["L", "M", "X", "J", "V", "S", "D"] as const;

export const HABIT_ACCENT_COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-indigo-500",
] as const;

function padDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(12, 0, 0, 0);
  return start;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1, 12, 0, 0, 0);
}

function formatRangeLabel(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const startLabel = start.toLocaleDateString("es-ES", opts).toUpperCase();
  const endLabel = end.toLocaleDateString("es-ES", opts).toUpperCase();
  return `${startLabel} – ${endLabel}`;
}

function formatMonthLabel(date: Date): string {
  return date
    .toLocaleDateString("es-ES", { month: "long", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase());
}

function formatYearLabel(date: Date): string {
  return String(date.getFullYear());
}

function weekdayLabel(date: Date, style: "narrow" | "short" = "narrow"): string {
  return date.toLocaleDateString("es-ES", { weekday: style }).slice(0, 1).toUpperCase();
}

function monthShortLabel(monthIndex: number): string {
  const label = new Date(2024, monthIndex, 1)
    .toLocaleDateString("es-ES", { month: "short" })
    .replace(".", "")
    .slice(0, 3);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function countForHabitOnKey(
  entries: HabitEntry[],
  habitId: string,
  key: string,
  period: ReportPeriod,
): number {
  return entries.filter((entry) => {
    if (entry.habitId !== habitId) return false;
    const date = entry.at.slice(0, 10);
    if (period === "yearly") return date.startsWith(key);
    return date === key;
  }).length;
}

function countLogsOnKey(entries: HabitEntry[], key: string, period: ReportPeriod): number {
  return entries.filter((entry) => {
    const date = entry.at.slice(0, 10);
    if (period === "yearly") return date.startsWith(key);
    return date === key;
  }).length;
}

function buildWeeklyColumns(anchor: Date): ReportDayColumn[] {
  const start = startOfWeek(anchor);
  const today = padDate(new Date());

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const key = padDate(date);
    return {
      key,
      label: weekdayLabel(date),
      sublabel: String(date.getDate()),
      isToday: key === today,
    };
  });
}

function buildMonthlyColumns(anchor: Date): ReportDayColumn[] {
  const start = startOfMonth(anchor);
  const daysInMonth = new Date(
    anchor.getFullYear(),
    anchor.getMonth() + 1,
    0,
  ).getDate();
  const today = padDate(new Date());

  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = addDays(start, index);
    const key = padDate(date);
    return {
      key,
      label: String(date.getDate()),
      sublabel: weekdayLabel(date),
      isToday: key === today,
    };
  });
}

function buildYearlyColumns(anchor: Date): ReportDayColumn[] {
  const year = anchor.getFullYear();
  const today = padDate(new Date());

  return Array.from({ length: 12 }, (_, month) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    const isToday = today.startsWith(key);
    return {
      key,
      label: monthShortLabel(month),
      isToday,
    };
  });
}

function buildMonthWeeks(anchor: Date): (ReportDayColumn | null)[][] {
  const columns = buildMonthlyColumns(anchor);
  const start = startOfMonth(anchor);
  const pad = (start.getDay() + 6) % 7;

  const padded: (ReportDayColumn | null)[] = [
    ...Array.from({ length: pad }, () => null),
    ...columns,
  ];

  while (padded.length % 7 !== 0) {
    padded.push(null);
  }

  const weeks: (ReportDayColumn | null)[][] = [];
  for (let index = 0; index < padded.length; index += 7) {
    weeks.push(padded.slice(index, index + 7));
  }

  return weeks;
}

function getPeriodColumns(period: ReportPeriod, anchor: Date): ReportDayColumn[] {
  switch (period) {
    case "weekly":
      return buildWeeklyColumns(anchor);
    case "monthly":
      return buildMonthlyColumns(anchor);
    case "yearly":
      return buildYearlyColumns(anchor);
  }
}

function getRangeLabel(period: ReportPeriod, anchor: Date): string {
  switch (period) {
    case "weekly": {
      const start = startOfWeek(anchor);
      const end = addDays(start, 6);
      return formatRangeLabel(start, end);
    }
    case "monthly":
      return formatMonthLabel(anchor);
    case "yearly":
      return formatYearLabel(anchor);
  }
}

function shiftAnchor(period: ReportPeriod, anchor: Date, delta: number): Date {
  const next = new Date(anchor);
  if (period === "weekly") next.setDate(next.getDate() + delta * 7);
  else if (period === "monthly") next.setMonth(next.getMonth() + delta);
  else next.setFullYear(next.getFullYear() + delta);
  return next;
}

export function buildHabitReport(
  store: HabitStore,
  period: ReportPeriod,
  anchor: Date = new Date(),
): HabitReportData {
  const columns = getPeriodColumns(period, anchor);
  const columnKeys = columns.map((column) => column.key);

  const rows: HabitReportRow[] = store.habits.map((habit) => {
    const cells = columns.map((column) => {
      const count = countForHabitOnKey(
        store.entries,
        habit.id,
        column.key,
        period,
      );
      return {
        key: column.key,
        count,
        active: count > 0,
      };
    });

    const completedCount = cells.filter((cell) => cell.active).length;

    return {
      habit,
      cells,
      completedCount,
      totalCount: columns.length,
      streak: getHabitStreak(store.entries, habit.id),
    };
  });

  const totalCells = rows.length * columns.length;
  const completedCells = rows.reduce(
    (sum, row) => sum + row.completedCount,
    0,
  );
  const completionRate =
    totalCells === 0 ? 0 : Math.round((completedCells / totalCells) * 100);

  const successDays = columnKeys.filter(
    (key) => countLogsOnKey(store.entries, key, period) > 0,
  ).length;

  const totalLogs = columnKeys.reduce(
    (sum, key) => sum + countLogsOnKey(store.entries, key, period),
    0,
  );

  const bestStreak = rows.reduce(
    (max, row) => Math.max(max, row.streak),
    0,
  );

  return {
    period,
    rangeLabel: getRangeLabel(period, anchor),
    columns,
    monthWeeks: period === "monthly" ? buildMonthWeeks(anchor) : undefined,
    rows,
    summary: {
      completionRate,
      successDays,
      totalLogs,
      bestStreak,
    },
  };
}

export function shiftReportAnchor(
  period: ReportPeriod,
  anchor: Date,
  direction: -1 | 1,
): Date {
  return shiftAnchor(period, anchor, direction);
}

export const HABIT_ACCENT_TEXT_COLORS = [
  "text-emerald-500",
  "text-sky-500",
  "text-amber-500",
  "text-violet-500",
  "text-rose-500",
  "text-teal-500",
  "text-orange-500",
  "text-indigo-500",
] as const;

export function getHabitAccentColor(index: number): string {
  return HABIT_ACCENT_COLORS[index % HABIT_ACCENT_COLORS.length];
}

export function getHabitAccentTextColor(index: number): string {
  return HABIT_ACCENT_TEXT_COLORS[index % HABIT_ACCENT_TEXT_COLORS.length];
}

export function cellsByKey(row: HabitReportRow): Map<string, HabitReportCell> {
  return new Map(row.cells.map((cell) => [cell.key, cell]));
}
