"use client";

import { useEffect, useState } from "react";
import type { Habit } from "@/lib/habits-storage";

const MAX_DESCRIPTION = 200;

type LogEntrySheetProps = {
  habit: Habit | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (description?: string) => void;
};

export function LogEntrySheet({
  habit,
  open,
  onClose,
  onConfirm,
}: LogEntrySheetProps) {
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setDescription("");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      document.getElementById("log-entry-description")?.focus();
    }, 350);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open, habit?.id]);

  if (!open || !habit) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = description.trim();
    onConfirm(trimmed || undefined);
    setDescription("");
  }

  return (
    <div className="fixed inset-0 z-[55] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 habit-sheet-backdrop"
        onClick={onClose}
        aria-label="Cancelar registro"
      />
      <div
        role="dialog"
        aria-labelledby="log-entry-title"
        className="relative mx-auto w-full max-w-lg rounded-t-3xl bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 habit-sheet-panel dark:bg-zinc-950"
      >
        <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />

        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-950">
            {habit.emoji ?? "✅"}
          </span>
          <div>
            <h3
              id="log-entry-title"
              className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
            >
              {habit.name}
            </h3>
            <p className="text-sm text-zinc-500">¿Qué hiciste?</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="log-entry-description"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
            >
              Descripción (opcional)
            </label>
            <textarea
              id="log-entry-description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION))}
              placeholder="Ej. 2 vasos de agua, 15 min de lectura…"
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base leading-relaxed outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              maxLength={MAX_DESCRIPTION}
            />
            <p className="mt-1 text-right text-xs text-zinc-400">
              {description.length}/{MAX_DESCRIPTION}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <button
              type="submit"
              className="min-h-14 w-full rounded-2xl bg-emerald-600 text-base font-bold text-white active:bg-emerald-700"
            >
              Guardar registro
            </button>
            <button
              type="button"
              onClick={() => onConfirm(undefined)}
              className="min-h-12 w-full rounded-2xl text-sm font-semibold text-zinc-500 active:bg-zinc-100 dark:active:bg-zinc-900"
            >
              Guardar sin descripción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
