"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/notifications";
import type { HabitStore } from "@/lib/habits-storage";

export function useHabitReminders(store: HabitStore | null) {
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!store) return;

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then((reg) => {
        reg.active?.postMessage({ type: "UPDATE_STORE", store });
      });
    }
  }, [store]);
}
