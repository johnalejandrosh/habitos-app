export const NOTIFICATION_PREFS_KEY = "habitos-notification-prefs";
export const NOTIFICATION_SENT_KEY = "habitos-notification-sent";

export type NotificationPrefs = {
  enabled: boolean;
  times: string[];
  onlyIfNoLogsToday: boolean;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  enabled: false,
  times: ["09:00", "20:00"],
  onlyIfNoLogsToday: true,
};

export function loadNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFS;
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;
    const parsed = JSON.parse(raw) as NotificationPrefs;
    return {
      enabled: !!parsed.enabled,
      times: Array.isArray(parsed.times) ? parsed.times : DEFAULT_NOTIFICATION_PREFS.times,
      onlyIfNoLogsToday:
        parsed.onlyIfNoLogsToday ?? DEFAULT_NOTIFICATION_PREFS.onlyIfNoLogsToday,
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
}

export function normalizeTime(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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

export function markSlotSent(slot: string): void {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  const slots = getSentSlotsToday();
  slots[slot] = true;
  localStorage.setItem(
    NOTIFICATION_SENT_KEY,
    JSON.stringify({ date: today, slots }),
  );
}

export function wasSlotSentToday(slot: string): boolean {
  return !!getSentSlotsToday()[slot];
}
