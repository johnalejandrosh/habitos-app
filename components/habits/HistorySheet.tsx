"use client";

import { useEffect } from "react";
import { formatTime, type Habit, type HabitEntry } from "@/lib/habits-storage";

type HistorySheetProps = {
  habit: Habit;
  entries: HabitEntry[];
  open: boolean;
  onClose: () => void;
  onUndo: () => void;
};

export function HistorySheet({
  habit,
  entries,
  open,
  onClose,
  onUndo,
}: HistorySheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] habit-sheet-backdrop"
        onClick={onClose}
        aria-label="Cerrar historial"
      />
      <div
        role="dialog"
        aria-labelledby="history-sheet-title"
        className="relative mx-auto w-full max-w-lg rounded-t-3xl bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl habit-sheet-panel dark:bg-zinc-950"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <h3
              id="history-sheet-title"
              className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              <span className="text-2xl">{habit.emoji ?? "✅"}</span>
              {habit.name}
            </h3>
            <p className="text-sm text-zinc-500">
              {entries.length}{" "}
              {entries.length === 1 ? "registro" : "registros"} hoy
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-600 active:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          >
            Cerrar
          </button>
        </div>

        <ul className="mt-5 max-h-[45vh] space-y-3 overflow-y-auto overscroll-contain">
          {entries.length === 0 ? (
            <li className="py-8 text-center text-sm text-zinc-500">
              Sin registros hoy
            </li>
          ) : (
            entries.map((entry, i) => (
              <li
                key={entry.id}
                className="habit-list-item rounded-2xl bg-zinc-50 px-4 py-3.5 dark:bg-zinc-900"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {entries.length - i}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-500">
                      {formatTime(entry.at)}
                    </p>
                    {entry.description ? (
                      <p className="mt-1 text-base leading-snug text-zinc-800 dark:text-zinc-200">
                        {entry.description}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm italic text-zinc-400">
                        Sin descripción
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>

        {entries.length > 0 && (
          <button
            type="button"
            onClick={onUndo}
            className="mt-5 w-full rounded-2xl border-2 border-red-200 py-3.5 text-sm font-semibold text-red-600 active:bg-red-50 dark:border-red-900/60 dark:active:bg-red-950/40"
          >
            Deshacer último registro
          </button>
        )}
      </div>
    </div>
  );
}
