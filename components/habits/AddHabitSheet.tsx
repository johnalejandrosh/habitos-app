"use client";

import { useEffect } from "react";
import { EmojiPicker } from "./EmojiPicker";

type AddHabitSheetProps = {
  open: boolean;
  onClose: () => void;
  name: string;
  emoji: string;
  onNameChange: (name: string) => void;
  onEmojiChange: (emoji: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function AddHabitSheet({
  open,
  onClose,
  name,
  emoji,
  onNameChange,
  onEmojiChange,
  onSubmit,
}: AddHabitSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      document.getElementById("new-habit-input")?.focus();
    }, 300);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 habit-sheet-backdrop"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="relative mx-auto w-full max-w-lg rounded-t-3xl bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 habit-sheet-panel dark:bg-zinc-950">
        <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />

        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Nuevo hábito
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Elige un icono y escribe el nombre
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Icono
            </p>
            <EmojiPicker value={emoji} onChange={onEmojiChange} />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="new-habit-input"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
            >
              Nombre
            </label>
            <input
              id="new-habit-input"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ej. Beber agua, Meditar…"
              className="min-h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              maxLength={80}
              enterKeyHint="done"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-14 flex-1 rounded-2xl bg-zinc-100 text-base font-semibold text-zinc-700 active:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-base font-bold text-white active:bg-emerald-700 disabled:opacity-40"
            >
              <span className="text-xl">{emoji}</span>
              Crear hábito
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
