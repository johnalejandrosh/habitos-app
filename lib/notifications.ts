import { countEntriesToday, loadHabitStore } from "./habits-storage";
import {
  loadNotificationPrefs,
  markSlotSent,
  type NotificationPrefs,
  wasSlotSentToday,
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

export async function syncPrefsToServiceWorker(
  prefs: NotificationPrefs,
): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  reg?.active?.postMessage({ type: "UPDATE_PREFS", prefs });
}

export function buildReminderMessage(logsToday: number): {
  title: string;
  body: string;
} {
  if (logsToday === 0) {
    return {
      title: "Hábitos · Recordatorio",
      body: "Aún no registraste nada hoy. ¿Qué hábito vas a marcar?",
    };
  }
  return {
    title: "Hábitos · Sigue así",
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

export function shouldFireReminder(
  prefs: NotificationPrefs,
  slot: string,
  logsToday: number,
): boolean {
  if (!prefs.enabled) return false;
  if (!prefs.times.includes(slot)) return false;
  if (wasSlotSentToday(slot)) return false;
  if (prefs.onlyIfNoLogsToday && logsToday > 0) return false;
  return true;
}

export function checkAndFireReminders(): void {
  if (getNotificationSupport() !== "granted") return;

  const prefs = loadNotificationPrefs();
  if (!prefs.enabled) return;

  const slot = getCurrentTimeSlot();
  const store = loadHabitStore();
  const logsToday = countEntriesToday(store.entries);

  if (!shouldFireReminder(prefs, slot, logsToday)) return;

  const { title, body } = buildReminderMessage(logsToday);
  showLocalNotification(title, body, `habitos-${slot}`);
  markSlotSent(slot);
}

export async function sendTestNotification(): Promise<void> {
  const state = getNotificationSupport();
  if (state === "unsupported") throw new Error("unsupported");
  if (state !== "granted") {
    const next = await requestNotificationPermission();
    if (next !== "granted") throw new Error("denied");
  }
  showLocalNotification(
    "Hábitos · Prueba",
    "Las notificaciones están activas. Te recordaremos según tu horario.",
    "habitos-test",
  );
}
