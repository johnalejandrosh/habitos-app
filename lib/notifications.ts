import {
  countEntriesToday,
  loadHabitStore,
  type Habit,
} from "./habits-storage";
import {
  getHabitNotificationPrefs,
  markSlotSent,
  shouldFireHabitReminder,
} from "./notification-prefs";

export type NotificationPermissionState =
  | "granted"
  | "denied"
  | "default"
  | "unsupported";

export function getNotificationSupport(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (getNotificationSupport() === "unsupported") return "unsupported";
  const result = await Notification.requestPermission();
  return result;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
}

export function buildHabitReminderMessage(
  habit: Habit,
  logsToday: number,
): { title: string; body: string } {
  const emoji = habit.emoji ?? "✅";
  if (logsToday === 0) {
    return {
      title: `${emoji} ${habit.name}`,
      body: `Aún no registraste «${habit.name}» hoy.`,
    };
  }
  return {
    title: `${emoji} ${habit.name} · Sigue así`,
    body: `Llevas ${logsToday} registro${logsToday === 1 ? "" : "s"} hoy. ¿Sumas otro?`,
  };
}

export function showLocalNotification(
  title: string,
  body: string,
  tag: string,
): void {
  if (getNotificationSupport() !== "granted") return;

  const options: NotificationOptions & { renotify?: boolean } = {
    body,
    icon: "/icon-192.svg",
    badge: "/icon-192.svg",
    tag,
    renotify: true,
    data: { url: "/home" },
  };

  if ("serviceWorker" in navigator) {
    void navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, options);
    });
    return;
  }

  new Notification(title, options);
}

export function getCurrentTimeSlot(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function checkAndFireReminders(): void {
  if (getNotificationSupport() !== "granted") return;

  const store = loadHabitStore();
  const slot = getCurrentTimeSlot();

  for (const habit of store.habits) {
    const prefs = getHabitNotificationPrefs(habit);
    const logsToday = countEntriesToday(store.entries, habit.id);

    if (!shouldFireHabitReminder(prefs, habit.id, slot, logsToday)) continue;

    const { title, body } = buildHabitReminderMessage(habit, logsToday);
    showLocalNotification(title, body, `habitos-${habit.id}-${slot}`);
    markSlotSent(habit.id, slot);
  }
}

export async function sendTestNotification(
  habitName: string,
  emoji?: string,
): Promise<void> {
  const state = getNotificationSupport();
  if (state === "unsupported") throw new Error("unsupported");
  if (state !== "granted") {
    const next = await requestNotificationPermission();
    if (next !== "granted") throw new Error("denied");
  }
  showLocalNotification(
    `${emoji ?? "✅"} ${habitName} · Prueba`,
    "Los recordatorios de este hábito están activos.",
    `habitos-test-${Date.now()}`,
  );
}
