"use client";

import { useEffect, useMemo, useState } from "react";
import type { Habit } from "@/lib/habits-storage";
import {
  DEFAULT_HABIT_NOTIFICATION_PREFS,
  formatFrequencyLabel,
  getHabitNotificationPrefs,
  getNotificationScheduleTimes,
  INTERVAL_HOUR_OPTIONS,
  normalizeFrequency,
  normalizeTime,
  type HabitNotificationPrefs,
  type NotificationFrequency,
} from "@/lib/notification-prefs";
import {
  getNotificationSupport,
  requestNotificationPermission,
  sendTestNotification,
} from "@/lib/notifications";

type NotificationSettingsSheetProps = {
  habit: Habit | null;
  open: boolean;
  onClose: () => void;
  onSave: (habitId: string, prefs: HabitNotificationPrefs) => void;
};

type FrequencyMode = NotificationFrequency["type"];

const FREQUENCY_OPTIONS: { id: FrequencyMode; label: string; hint: string }[] = [
  { id: "daily", label: "1 vez al día", hint: "Un recordatorio diario" },
  { id: "times", label: "Horarios fijos", hint: "Varias horas concretas" },
  { id: "interval", label: "Cada X horas", hint: "Repite en un rango horario" },
];

function stripLegacyTimes(prefs: HabitNotificationPrefs): HabitNotificationPrefs {
  const { times: _times, ...rest } = prefs as HabitNotificationPrefs & {
    times?: string[];
  };
  return rest;
}

export function NotificationSettingsSheet({
  habit,
  open,
  onClose,
  onSave,
}: NotificationSettingsSheetProps) {
  const [prefs, setPrefs] = useState<HabitNotificationPrefs>(
    DEFAULT_HABIT_NOTIFICATION_PREFS,
  );
  const [newTime, setNewTime] = useState("12:00");
  const [status, setStatus] = useState<string | null>(null);
  const [permission, setPermission] = useState(getNotificationSupport());

  useEffect(() => {
    if (!open || !habit) return;
    setPrefs(getHabitNotificationPrefs(habit));
    setPermission(getNotificationSupport());
    setStatus(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, habit?.id]);

  const schedulePreview = useMemo(
    () => getNotificationScheduleTimes(prefs.frequency),
    [prefs.frequency],
  );

  function persist(next: HabitNotificationPrefs) {
    if (!habit) return;
    const cleaned = stripLegacyTimes(next);
    setPrefs(cleaned);
    onSave(habit.id, cleaned);
  }

  function setFrequencyMode(mode: FrequencyMode) {
    if (prefs.frequency.type === mode) return;

    const current = normalizeFrequency(prefs.frequency);
    let next: NotificationFrequency;

    switch (mode) {
      case "daily":
        next = {
          type: "daily",
          time:
            current.type === "daily"
              ? current.time
              : getNotificationScheduleTimes(current)[0] ?? "09:00",
        };
        break;
      case "times":
        next = {
          type: "times",
          times:
            current.type === "times"
              ? current.times
              : getNotificationScheduleTimes(current).length > 0
                ? getNotificationScheduleTimes(current)
                : ["09:00", "20:00"],
        };
        break;
      case "interval":
        next = {
          type: "interval",
          everyHours: 2,
          from: "08:00",
          until: "22:00",
        };
        break;
    }

    persist({ ...prefs, frequency: next });
    setStatus(null);
  }

  async function handleEnableToggle() {
    if (!habit) return;

    if (!prefs.enabled) {
      const perm = await requestNotificationPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setStatus("Permiso denegado. Actívalo en ajustes del navegador.");
        return;
      }
      persist({ ...prefs, enabled: true });
      setStatus("Recordatorios activados para este hábito");
      return;
    }
    persist({ ...prefs, enabled: false });
    setStatus("Recordatorios desactivados");
  }

  function addTime() {
    if (prefs.frequency.type !== "times") return;
    const normalized = normalizeTime(newTime);
    if (!normalized) {
      setStatus("Hora inválida (usa HH:MM)");
      return;
    }
    if (prefs.frequency.times.includes(normalized)) return;
    if (prefs.frequency.times.length >= 8) {
      setStatus("Máximo 8 horarios");
      return;
    }
    persist({
      ...prefs,
      frequency: {
        type: "times",
        times: [...prefs.frequency.times, normalized].sort(),
      },
    });
    setStatus(null);
  }

  function removeTime(time: string) {
    if (prefs.frequency.type !== "times") return;
    const times = prefs.frequency.times.filter((t) => t !== time);
    persist({
      ...prefs,
      frequency: {
        type: "times",
        times: times.length > 0 ? times : ["09:00"],
      },
    });
  }

  async function handleTest() {
    if (!habit) return;
    try {
      await sendTestNotification(habit.name, habit.emoji);
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

  if (!open || !habit) return null;

  const unsupported = permission === "unsupported";
  const emoji = habit.emoji ?? "✅";
  const frequency = prefs.frequency;

  return (
    <div className="fixed inset-0 z-[55] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 habit-sheet-backdrop"
        onClick={onClose}
        aria-label="Cerrar notificaciones"
      />
      <div className="relative mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white pt-3 habit-sheet-panel dark:bg-zinc-950">
        <div className="mx-auto mb-5 h-1 w-12 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700" />

        <div className="overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-950">
              {emoji}
            </span>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Recordatorios
              </h3>
              <p className="text-sm text-zinc-500">{habit.name}</p>
            </div>
          </div>

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
                    Estado:{" "}
                    {permission === "granted"
                      ? "Permitido"
                      : permission === "denied"
                        ? "Bloqueado"
                        : "Pendiente"}
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

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Frecuencia
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {FREQUENCY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFrequencyMode(option.id)}
                      className={`rounded-2xl border px-3 py-3 text-left transition active:scale-[0.98] ${
                        frequency.type === option.id
                          ? "border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/40"
                          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-zinc-500">
                        {option.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {frequency.type === "daily" && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Hora del recordatorio
                  </p>
                  <input
                    type="time"
                    value={frequency.time}
                    onChange={(e) => {
                      const time = normalizeTime(e.target.value);
                      if (!time) return;
                      persist({
                        ...prefs,
                        frequency: { type: "daily", time },
                      });
                    }}
                    className="min-h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
              )}

              {frequency.type === "times" && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Horarios del día
                  </p>
                  <ul className="space-y-2">
                    {frequency.times.map((time) => (
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
              )}

              {frequency.type === "interval" && (
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Repetir cada
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {INTERVAL_HOUR_OPTIONS.map((hours) => (
                        <button
                          key={hours}
                          type="button"
                          onClick={() =>
                            persist({
                              ...prefs,
                              frequency: { ...frequency, everyHours: hours },
                            })
                          }
                          className={`min-h-10 rounded-xl px-4 text-sm font-semibold tabular-nums ${
                            frequency.everyHours === hours
                              ? "bg-emerald-600 text-white"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {hours} h
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Desde
                      </p>
                      <input
                        type="time"
                        value={frequency.from}
                        onChange={(e) => {
                          const from = normalizeTime(e.target.value);
                          if (!from) return;
                          persist({
                            ...prefs,
                            frequency: { ...frequency, from },
                          });
                        }}
                        className="min-h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Hasta
                      </p>
                      <input
                        type="time"
                        value={frequency.until}
                        onChange={(e) => {
                          const until = normalizeTime(e.target.value);
                          if (!until) return;
                          persist({
                            ...prefs,
                            frequency: { ...frequency, until },
                          });
                        }}
                        className="min-h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {schedulePreview.length > 0 && (
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Vista previa de hoy
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {formatFrequencyLabel(frequency)}
                  </p>
                  <p className="mt-2 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                    {schedulePreview.join(" · ")}
                  </p>
                </div>
              )}

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
                  Solo avisar si aún no registré este hábito hoy
                </span>
              </label>

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
    </div>
  );
}
