import {
  buildDailyCompletionSeries,
  buildWeekHeatmap,
  type DailyCompletion,
  type Habit,
  type HabitEntry,
  type HabitStore,
  type HeatmapDay,
} from "./habits-storage";

export type InsightPeriod = 7 | 14 | 30;

export type InsightsSummary = {
  total: number;
  avgPerDay: number;
  activeDays: number;
  bestDay: DailyCompletion | null;
  trendPercent: number | null;
};

export type HabitDayStat = {
  habit: Habit;
  count: number;
};

export function computeInsightsSummary(
  series: DailyCompletion[],
  previousSeries: DailyCompletion[],
): InsightsSummary {
  const total = series.reduce((s, d) => s + d.count, 0);
  const activeDays = series.filter((d) => d.count > 0).length;
  const avgPerDay =
    series.length === 0 ? 0 : Math.round((total / series.length) * 10) / 10;

  const bestDay = series.reduce<DailyCompletion | null>((best, d) => {
    if (d.count === 0) return best;
    if (!best || d.count > best.count) return d;
    return best;
  }, null);

  const prevTotal = previousSeries.reduce((s, d) => s + d.count, 0);
  let trendPercent: number | null = null;
  if (prevTotal > 0) {
    trendPercent = Math.round(((total - prevTotal) / prevTotal) * 100);
  } else if (total > 0) {
    trendPercent = 100;
  }

  return {
    total,
    avgPerDay,
    activeDays,
    bestDay,
    trendPercent,
  };
}

export function getSeriesForPeriod(
  store: HabitStore,
  period: InsightPeriod,
): DailyCompletion[] {
  return buildDailyCompletionSeries(store, period);
}

export function getPreviousPeriodSeries(
  store: HabitStore,
  period: InsightPeriod,
): DailyCompletion[] {
  const today = new Date();
  const days: string[] = [];
  for (let i = period * 2 - 1; i >= period; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days.map((date) => ({
    date,
    label: `${date.slice(8, 10)}/${date.slice(5, 7)}`,
    count: store.entries.filter((e) => e.at.startsWith(date)).length,
  }));
}

export function getEntriesForDate(
  store: HabitStore,
  date: string,
): HabitEntry[] {
  return store.entries
    .filter((e) => e.at.startsWith(date))
    .sort((a, b) => b.at.localeCompare(a.at));
}

export function getHabitStatsForDate(
  store: HabitStore,
  date: string,
): HabitDayStat[] {
  return store.habits
    .map((habit) => ({
      habit,
      count: store.entries.filter(
        (e) => e.habitId === habit.id && e.at.startsWith(date),
      ).length,
    }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function formatInsightDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function getWeekHeatmap(entries: HabitEntry[]): HeatmapDay[] {
  return buildWeekHeatmap(entries);
}
