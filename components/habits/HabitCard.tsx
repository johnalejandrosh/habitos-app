"use client";

import { useState } from "react";
import { DAILY_VISUAL_GOAL } from "@/lib/habit-feedback";
import { hapticLight, hapticSuccess, hapticWarning } from "@/lib/haptics";
import type { Habit } from "@/lib/habits-storage";
import { playTick } from "@/lib/sounds";
import { AnimatedNumber } from "./AnimatedNumber";
import { HabitLogButton } from "./HabitLogButton";
import { QuickLogChips } from "./QuickLogChips";
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
  onHoldLog?: () => void;
  onLogMany: (n: number) => void;
  onUndo: () => void;
  onRemove: () => void;
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
  onHoldLog,
  onLogMany,
  onUndo,
  onRemove,
}: HabitCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const goalReached = count >= DAILY_VISUAL_GOAL;
  const emoji = habit.emoji ?? "✅";

  const { offset, handlers, reset } = useSwipeAction(() => {
    if (count > 0) {
      hapticLight();
      onUndo();
    }
    reset();
  });

  function handleQuickMany(n: number) {
    hapticSuccess();
    onLogMany(n);
  }

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
                ringPulse ? "habit-counter-bump bg-emerald-100 dark:bg-emerald-950" : "bg-zinc-100 dark:bg-zinc-900"
              }`}
              aria-label={`Registrar ${habit.name}`}
            >
              {emoji}
            </button>

            <button
              type="button"
              onClick={() => {
                hapticLight();
                onRequestLog();
              }}
              className="min-w-0 flex-1 pt-0.5 text-left active:opacity-80"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
                  {habit.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="shrink-0 rounded-lg px-2 py-1 text-zinc-400 active:bg-zinc-100 dark:active:bg-zinc-800"
                  aria-label="Opciones"
                >
                  ···
                </button>
              </div>

              <p className="mt-2 text-sm text-zinc-500">
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

          <QuickLogChips onLogMany={handleQuickMany} />

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
                    hapticWarning();
                    setConfirmDelete(true);
                  }}
                  className="rounded-2xl py-3 text-sm font-medium text-red-600 active:bg-red-50 dark:active:bg-red-950/30"
                >
                  Eliminar hábito
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
