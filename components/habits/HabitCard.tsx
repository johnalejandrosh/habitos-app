"use client";

import { useState } from "react";
import { DAILY_VISUAL_GOAL } from "@/lib/habit-feedback";
import { hapticLight, hapticWarning } from "@/lib/haptics";
import type { Habit } from "@/lib/habits-storage";
import {
  formatFrequencyLabel,
  getHabitNotificationPrefs,
} from "@/lib/notification-prefs";
import { playTick } from "@/lib/sounds";
import { AnimatedNumber } from "./AnimatedNumber";
import { BellIcon, MoreIcon, TrashIcon } from "./HabitIcons";
import { HabitLogButton } from "./HabitLogButton";
import { useSwipeAction } from "./use-swipe-action";

type HabitCardProps = {
  habit: Habit;
  count: number;
  streak: number;
  combo: number;
  ringPulse?: boolean;
  flash: boolean;
  onOpenHistory: () => void;
  onRequestLog: () => void;
  onRequestLogWithNote?: () => void;
  onHoldLog?: () => void;
  onUndo: () => void;
  onRemove: () => void;
  onOpenNotifications: () => void;
};

export function HabitCard({
  habit,
  count,
  streak,
  combo,
  ringPulse = false,
  flash,
  onOpenHistory,
  onRequestLog,
  onRequestLogWithNote,
  onHoldLog,
  onUndo,
  onRemove,
  onOpenNotifications,
}: HabitCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const goalReached = count >= DAILY_VISUAL_GOAL;
  const emoji = habit.emoji ?? "✅";
  const habitNotifications = getHabitNotificationPrefs(habit);
  const notificationsOn = habitNotifications.enabled;
  const notificationLabel = notificationsOn
    ? formatFrequencyLabel(habitNotifications.frequency)
    : null;

  const { offset, handlers, reset } = useSwipeAction(() => {
    if (count > 0) {
      hapticLight();
      onUndo();
    }
    reset();
  });

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {count > 0 && (
        <div
          className="absolute inset-y-0 right-0 flex w-24 items-center justify-center rounded-r-3xl bg-red-500 text-sm font-semibold text-white"
          aria-hidden
        >
          Deshacer
        </div>
      )}

      <article
        {...handlers}
        style={{
          transform: `translateX(${offset}px)`,
          transition: offset === 0 ? "transform 0.25s ease-out" : "none",
        }}
        className={`relative rounded-3xl border bg-white shadow-sm dark:bg-zinc-950 ${
          flash ? "habit-card-flash" : ""
        } ${
          goalReached
            ? "border-amber-200 dark:border-amber-900/60"
            : "border-zinc-200 dark:border-zinc-800"
        } ${combo >= 3 ? "habit-card-glow" : ""}`}
      >
        {combo >= 2 && (
          <div className="absolute right-4 top-4 z-10 habit-combo-pop rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white">
            x{combo}
          </div>
        )}

        <div className="space-y-5 p-5">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => {
                hapticLight();
                onRequestLog();
              }}
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl active:opacity-80 ${
                ringPulse
                  ? "habit-counter-bump bg-emerald-100 dark:bg-emerald-950"
                  : "bg-zinc-100 dark:bg-zinc-900"
              }`}
              aria-label={`Registrar ${habit.name}`}
            >
              {emoji}
            </button>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    onRequestLog();
                  }}
                  className="min-w-0 flex-1 text-left active:opacity-80"
                >
                  <h3 className="text-lg font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
                    {habit.name}
                  </h3>
                </button>

                <div className="flex shrink-0 items-center gap-1.5">
                  {notificationsOn && (
                    <span
                      className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                      title="Recordatorios activos"
                      aria-label="Recordatorios activos"
                    >
                      <BellIcon />
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      hapticLight();
                      setMenuOpen((o) => !o);
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition active:scale-95 ${
                      menuOpen
                        ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        : "bg-zinc-100 text-zinc-500 active:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:active:bg-zinc-800"
                    }`}
                    aria-label="Opciones"
                    aria-expanded={menuOpen}
                  >
                    <MoreIcon />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  hapticLight();
                  onRequestLog();
                }}
                className="mt-2 w-full text-left active:opacity-80"
              >
                <p className="text-sm text-zinc-500">
                  {count === 0 ? (
                    "Aún sin registros hoy"
                  ) : (
                    <>
                      <AnimatedNumber
                        value={count}
                        className="text-base font-bold text-emerald-700 dark:text-emerald-400"
                      />{" "}
                      {count === 1 ? "vez" : "veces"}
                      {goalReached && (
                        <span className="ml-2 font-medium text-amber-600">
                          · meta ✓
                        </span>
                      )}
                    </>
                  )}
                </p>

                {streak >= 2 && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                    <span className="habit-flame">🔥</span> {streak} días
                  </span>
                )}
              </button>
            </div>
          </div>

          {count > 0 && count < DAILY_VISUAL_GOAL && (
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(count / DAILY_VISUAL_GOAL) * 100}%` }}
              />
            </div>
          )}

          <HabitLogButton
            habitName={habit.name}
            onPress={() => {
              hapticLight();
              playTick(520);
              onRequestLog();
            }}
            onHoldLog={onHoldLog}
            fullWidth
          />

          {onRequestLogWithNote && (
            <button
              type="button"
              onClick={() => {
                hapticLight();
                onRequestLogWithNote();
              }}
              className="w-full py-1 text-sm font-medium text-zinc-400 active:text-emerald-600 dark:active:text-emerald-400"
            >
              Con nota
            </button>
          )}

          {count > 0 && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="w-full rounded-2xl bg-zinc-50 py-3.5 text-sm font-semibold text-emerald-700 active:bg-emerald-50 dark:bg-zinc-900 dark:text-emerald-400"
            >
              Ver historial ({count})
            </button>
          )}
        </div>

        {menuOpen && (
          <div className="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
            {!confirmDelete ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setMenuOpen(false);
                    onOpenNotifications();
                  }}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-left active:bg-zinc-50 dark:active:bg-zinc-900"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      notificationsOn
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    <BellIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Recordatorios
                    </span>
                    {notificationsOn && notificationLabel ? (
                      <span className="mt-0.5 block truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {notificationLabel}
                      </span>
                    ) : (
                      <span className="mt-0.5 block text-xs text-zinc-500">
                        Configurar frecuencia
                      </span>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    hapticWarning();
                    setConfirmDelete(true);
                  }}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-left active:bg-red-50 dark:active:bg-red-950/30"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                    <TrashIcon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    Eliminar hábito
                  </span>
                </button>
                <p className="text-center text-xs text-zinc-400">
                  Desliza la tarjeta ← para deshacer un registro
                </p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="min-h-12 flex-1 rounded-2xl bg-zinc-100 text-sm font-semibold dark:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  className="min-h-12 flex-1 rounded-2xl bg-red-600 text-sm font-bold text-white"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
