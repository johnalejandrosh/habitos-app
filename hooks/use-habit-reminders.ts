"use client";

import { useEffect } from "react";
import { loadHabitStore } from "@/lib/habits-storage";
import { loadNotificationPrefs } from "@/lib/notification-prefs";
import {
  checkAndFireReminders,
  registerServiceWorker,
  syncPrefsToServiceWorker,
} from "@/lib/notifications";
import type { HabitStore } from "@/lib/habits-storage";

export function useHabitReminders(store: HabitStore | null) {
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!store) return;
    const prefs = loadNotificationPrefs();
    void syncPrefsToServiceWorker(prefs);

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then((reg) => {
        reg.active?.postMessage({ type: "UPDATE_STORE", store });
      });
    }
  }, [store]);

  useEffect(() => {
    const tick = () => checkAndFireReminders();
    tick();
    const id = setInterval(tick, 30 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

}
