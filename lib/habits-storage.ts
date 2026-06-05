export const HABITS_STORAGE_KEY = "habitos-app-tracking";

export type Habit = {
  id: string;
  name: string;
  emoji?: string;
};

export type HabitEntry = {
  id: string;
  habitId: string;
  at: string;
  description?: string;
};

export function createHabitEntry(
  habitId: string,
  description?: string,
): HabitEntry {
  const entry: HabitEntry = {
    id: crypto.randomUUID(),
    habitId,
    at: new Date().toISOString(),
  };
  const trimmed = description?.trim();
  if (trimmed) entry.description = trimmed;
  return entry;
}

export type HabitStore = {
  habits: Habit[];
  entries: HabitEntry[];
};

type LegacyHabitStore = {
  habits: Habit[];
  logs: Record<string, Record<string, boolean>>;
};

export function createEmptyStore(): HabitStore {
  return { habits: [], entries: [] };
}

function isLegacyStore(data: unknown): data is LegacyHabitStore {
  return (
    typeof data === "object" &&
    data !== null &&
    "logs" in data &&
    !("entries" in data)
  );
}

function migrateLegacyStore(legacy: LegacyHabitStore): HabitStore {
  const entries: HabitEntry[] = [];
  for (const [date, dayLog] of Object.entries(legacy.logs)) {
    for (const [habitId, done] of Object.entries(dayLog)) {
      if (done) {
        entries.push({
          id: `${date}-${habitId}`,
          habitId,
          at: `${date}T12:00:00.000Z`,
        });
      }
    }
  }
  return { habits: legacy.habits, entries };
}

export function loadHabitStore(): HabitStore {
  if (typeof window === "undefined") return createEmptyStore();
  try {
    const raw = localStorage.getItem(HABITS_STORAGE_KEY);
    if (!raw) return createEmptyStore();
    const parsed: unknown = JSON.parse(raw);
    if (isLegacyStore(parsed)) {
      const migrated = migrateLegacyStore(parsed);
      saveHabitStore(migrated);
      return migrated;
    }
    const store = parsed as HabitStore;
    if (!store.habits || !Array.isArray(store.entries)) return createEmptyStore();
    return store;
  } catch {
    return createEmptyStore();
  }
}

export function saveHabitStore(store: HabitStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(store));
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isToday(iso: string): boolean {
  return iso.startsWith(todayKey());
}

export function formatDateLabel(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export type DailyCompletion = {
  date: string;
  label: string;
  count: number;
};

export function buildDailyCompletionSeries(
  store: HabitStore,
  days: number = 14,
): DailyCompletion[] {
  const dateKeys = getLastNDays(days);

  return dateKeys.map((date) => {
    const count = store.entries.filter((e) => e.at.startsWith(date)).length;
    return {
      date,
      label: formatDateLabel(date),
      count,
    };
  });
}

export function countEntriesToday(
  entries: HabitEntry[],
  habitId?: string,
): number {
  const today = todayKey();
  return entries.filter(
    (e) => e.at.startsWith(today) && (habitId === undefined || e.habitId === habitId),
  ).length;
}

export function getTodayEntriesForHabit(
  entries: HabitEntry[],
  habitId: string,
): HabitEntry[] {
  const today = todayKey();
  return entries
    .filter((e) => e.habitId === habitId && e.at.startsWith(today))
    .sort((a, b) => b.at.localeCompare(a.at));
}

/** Días seguidos con al menos un registro (incluye hoy si aplica) */
export function getHabitStreak(entries: HabitEntry[], habitId: string): number {
  const datesWithActivity = new Set(
    entries
      .filter((e) => e.habitId === habitId)
      .map((e) => e.at.slice(0, 10)),
  );
  if (datesWithActivity.size === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!datesWithActivity.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function countEntriesOnDate(
  entries: HabitEntry[],
  date: string,
): number {
  return entries.filter((e) => e.at.startsWith(date)).length;
}

export type HeatmapDay = {
  date: string;
  weekday: string;
  count: number;
  isToday: boolean;
};

export function buildWeekHeatmap(entries: HabitEntry[]): HeatmapDay[] {
  return getLastNDays(7).map((date) => {
    const d = new Date(`${date}T12:00:00`);
    return {
      date,
      weekday: d.toLocaleDateString("es-ES", { weekday: "narrow" }),
      count: countEntriesOnDate(entries, date),
      isToday: date === todayKey(),
    };
  });
}
