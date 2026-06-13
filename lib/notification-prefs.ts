export const NOTIFICATION_SENT_KEY = "habitos-notification-sent";

export const INTERVAL_HOUR_OPTIONS = [1, 2, 3, 4, 6, 8, 12] as const;

export type NotificationFrequency =
  | { type: "daily"; time: string }
  | { type: "times"; times: string[] }
  | { type: "interval"; everyHours: number; from: string; until: string };

export type HabitNotificationPrefs = {
  enabled: boolean;
  onlyIfNoLogsToday: boolean;
  frequency: NotificationFrequency;
  /** @deprecated migrated to frequency */
  times?: string[];
};

export const DEFAULT_HABIT_NOTIFICATION_PREFS: HabitNotificationPrefs = {
  enabled: false,
  onlyIfNoLogsToday: true,
  frequency: { type: "daily", time: "09:00" },
};

type RawHabitNotificationPrefs = Partial<HabitNotificationPrefs> & {
  times?: string[];
};

function parseMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatMinutes(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function generateIntervalTimes(
  from: string,
  until: string,
  everyHours: number,
): string[] {
  const start = parseMinutes(from);
  const end = parseMinutes(until);
  if (end < start || everyHours <= 0) return [];

  const step = everyHours * 60;
  const times: string[] = [];

  for (let t = start; t <= end; t += step) {
    times.push(formatMinutes(t));
  }

  return times;
}

export function normalizeFrequency(
  raw: NotificationFrequency | undefined,
  legacyTimes?: string[],
): NotificationFrequency {
  if (raw?.type === "daily" && normalizeTime(raw.time)) {
    return { type: "daily", time: normalizeTime(raw.time)! };
  }

  if (raw?.type === "times" && Array.isArray(raw.times) && raw.times.length > 0) {
    const times = raw.times
      .map((t) => normalizeTime(t))
      .filter((t): t is string => !!t)
      .sort();
    if (times.length === 1) return { type: "daily", time: times[0] };
    if (times.length > 0) return { type: "times", times };
  }

  if (
    raw?.type === "interval" &&
    INTERVAL_HOUR_OPTIONS.includes(
      raw.everyHours as (typeof INTERVAL_HOUR_OPTIONS)[number],
    ) &&
    normalizeTime(raw.from) &&
    normalizeTime(raw.until)
  ) {
    return {
      type: "interval",
      everyHours: raw.everyHours,
      from: normalizeTime(raw.from)!,
      until: normalizeTime(raw.until)!,
    };
  }

  if (legacyTimes?.length) {
    const times = legacyTimes
      .map((t) => normalizeTime(t))
      .filter((t): t is string => !!t)
      .sort();
    if (times.length === 1) return { type: "daily", time: times[0] };
    if (times.length > 0) return { type: "times", times };
  }

  return DEFAULT_HABIT_NOTIFICATION_PREFS.frequency;
}

export function getNotificationScheduleTimes(
  frequency: NotificationFrequency,
): string[] {
  switch (frequency.type) {
    case "daily":
      return [frequency.time];
    case "times":
      return [...frequency.times].sort();
    case "interval":
      return generateIntervalTimes(
        frequency.from,
        frequency.until,
        frequency.everyHours,
      );
  }
}

export function formatFrequencyLabel(frequency: NotificationFrequency): string {
  switch (frequency.type) {
    case "daily":
      return `1 vez al día · ${frequency.time}`;
    case "times":
      return `${frequency.times.length} horarios al día`;
    case "interval":
      return `Cada ${frequency.everyHours} h · ${frequency.from}–${frequency.until}`;
  }
}

export function getHabitNotificationPrefs(habit: {
  notifications?: RawHabitNotificationPrefs;
}): HabitNotificationPrefs {
  if (!habit.notifications) return DEFAULT_HABIT_NOTIFICATION_PREFS;

  const raw = habit.notifications;
  return {
    enabled: !!raw.enabled,
    onlyIfNoLogsToday:
      raw.onlyIfNoLogsToday ??
      DEFAULT_HABIT_NOTIFICATION_PREFS.onlyIfNoLogsToday,
    frequency: normalizeFrequency(raw.frequency, raw.times),
  };
}

export function hasAnyHabitNotificationsEnabled(
  habits: { notifications?: RawHabitNotificationPrefs }[],
): boolean {
  return habits.some((h) => getHabitNotificationPrefs(h).enabled);
}

export function normalizeTime(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function reminderSlotKey(habitId: string, slot: string): string {
  return `${habitId}:${slot}`;
}

export function getSentSlotsToday(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(NOTIFICATION_SENT_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as { date: string; slots: Record<string, boolean> };
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return {};
    return data.slots ?? {};
  } catch {
    return {};
  }
}

export function markSlotSent(habitId: string, slot: string): void {
  if (typeof window === "undefined") return;
  const key = reminderSlotKey(habitId, slot);
  const today = new Date().toISOString().slice(0, 10);
  const slots = getSentSlotsToday();
  slots[key] = true;
  localStorage.setItem(
    NOTIFICATION_SENT_KEY,
    JSON.stringify({ date: today, slots }),
  );
}

export function wasSlotSentToday(habitId: string, slot: string): boolean {
  return !!getSentSlotsToday()[reminderSlotKey(habitId, slot)];
}

export function shouldFireHabitReminder(
  prefs: HabitNotificationPrefs,
  habitId: string,
  slot: string,
  logsToday: number,
): boolean {
  if (!prefs.enabled) return false;

  const schedule = getNotificationScheduleTimes(prefs.frequency);
  if (!schedule.includes(slot)) return false;
  if (wasSlotSentToday(habitId, slot)) return false;
  if (prefs.onlyIfNoLogsToday && logsToday > 0) return false;

  return true;
}
