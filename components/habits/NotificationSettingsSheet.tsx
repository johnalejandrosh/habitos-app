"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_NOTIFICATION_PREFS,
  loadNotificationPrefs,
  normalizeTime,
  saveNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/notification-prefs";
import {
  getNotificationSupport,
  requestNotificationPermission,
  sendTestNotification,
  syncPrefsToServiceWorker,
} from "@/lib/notifications";

type NotificationSettingsSheetProps = {
  open: boolean;
  onClose: () => void;
  onPrefsChange: (prefs: NotificationPrefs) => void;
};

export function NotificationSettingsSheet({
  open,
  onClose,
  onPrefsChange,
}: NotificationSettingsSheetProps) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [newTime, setNewTime] = useState("12:00");
  const [status, setStatus] = useState<string | null>(null);
  const [permission, setPermission] = useState(getNotificationSupport());

  useEffect(() => {
    if (!open) return;
    setPrefs(loadNotificationPrefs());
    setPermission(getNotificationSupport());
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function persist(next: NotificationPrefs) {
    setPrefs(next);
    saveNotificationPrefs(next);
    onPrefsChange(next);
    void syncPrefsToServiceWorker(next);
  }

  async function handleEnableToggle() {
    if (!prefs.enabled) {
      const perm = await requestNotificationPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setStatus("Permiso denegado. Actívalo en ajustes del navegador.");
        return;
      }
      persist({ ...prefs, enabled: true });
      setStatus("Recordatorios activados");
      return;
    }
    persist({ ...prefs, enabled: false });
    setStatus("Recordatorios desactivados");
  }

  function addTime() {
    const normalized = normalizeTime(newTime);
    if (!normalized) {
      setStatus("Hora inválida (usa HH:MM)");
      return;
    }
    if (prefs.times.includes(normalized)) return;
    if (prefs.times.length >= 5) {
      setStatus("Máximo 5 horarios");
      return;
    }
    persist({ ...prefs, times: [...prefs.times, normalized].sort() });
    setStatus(null);
  }

  function removeTime(time: string) {
    persist({
      ...prefs,
      times: prefs.times.filter((t) => t !== time),
    });
  }

  async function handleTest() {
    try {
      await sendTestNotification();
      setStatus("Notificación de prueba enviada");
      setPermission("granted");
    } catch (e) {
      const err = e as Error;
      if (err.message === "denied") {
        setStatus("Permiso denegado");
        setPermission("denied");
      } else if (err.message === "unsupported") {
        setStatus("Tu navegador no soporta notificaciones");
      } else {
        setStatus("No se pudo enviar la prueba");
      }
    }
  }

  if (!open) return null;

  const unsupported = permission === "unsupported";

  return (
    <div className="fixed inset-0 z-[55] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 habit-sheet-backdrop"
        onClick={onClose}
        aria-label="Cerrar notificaciones"
      />
      <div className="relative mx-auto w-full max-w-lg rounded-t-3xl bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 habit-sheet-panel dark:bg-zinc-950">
        <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />

        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Notificaciones
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Recordatorios para registrar tus hábitos. En móvil, instala la app o
          deja la pestaña permitida en segundo plano.
        </p>

        {unsupported ? (
          <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            Este dispositivo o navegador no admite notificaciones.
          </p>
        ) : (
          <div className="mt-6 space-y-5">
            <label className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                  Activar recordatorios
                </p>
                <p className="text-xs text-zinc-500">
                  Estado: {permission === "granted" ? "Permitido" : permission === "denied" ? "Bloqueado" : "Pendiente"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.enabled}
                onClick={() => void handleEnableToggle()}
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                  prefs.enabled ? "bg-emerald-600" : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                    prefs.enabled ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
              <input
                type="checkbox"
                checked={prefs.onlyIfNoLogsToday}
                onChange={(e) =>
                  persist({ ...prefs, onlyIfNoLogsToday: e.target.checked })
                }
                className="h-5 w-5 rounded accent-emerald-600"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Solo avisar si aún no registré nada hoy
              </span>
            </label>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Horarios
              </p>
              <ul className="space-y-2">
                {prefs.times.map((time) => (
                  <li
                    key={time}
                    className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-900"
                  >
                    <span className="text-lg font-semibold tabular-nums">{time}</span>
                    <button
                      type="button"
                      onClick={() => removeTime(time)}
                      className="text-sm font-medium text-red-600"
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="min-h-12 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 dark:border-zinc-700 dark:bg-zinc-900"
                />
                <button
                  type="button"
                  onClick={addTime}
                  className="min-h-12 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Añadir
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleTest()}
              className="w-full rounded-2xl border border-emerald-200 py-3.5 text-sm font-semibold text-emerald-700 active:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400"
            >
              Probar notificación
            </button>
          </div>
        )}

        {status && (
          <p className="mt-4 text-center text-sm text-zinc-500">{status}</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full min-h-12 rounded-2xl bg-zinc-100 text-sm font-semibold dark:bg-zinc-800"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
