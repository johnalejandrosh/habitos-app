"use client";

import { useEffect } from "react";
import { hapticSuccess } from "@/lib/haptics";
import { playSuccess } from "@/lib/sounds";

export type Celebration = {
  emoji: string;
  title: string;
  subtitle: string;
};

type CelebrationOverlayProps = {
  celebration: Celebration | null;
  onDone: () => void;
};

export function CelebrationOverlay({
  celebration,
  onDone,
}: CelebrationOverlayProps) {
  useEffect(() => {
    if (!celebration) return;
    hapticSuccess();
    playSuccess();
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [celebration, onDone]);

  if (!celebration) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 habit-sheet-backdrop"
        onClick={onDone}
        aria-label="Cerrar celebración"
      />
      <div
        role="alertdialog"
        className="relative w-full max-w-xs rounded-3xl bg-white px-6 py-8 text-center shadow-2xl habit-celebration-pop dark:bg-zinc-950"
      >
        <p className="text-6xl leading-none">{celebration.emoji}</p>
        <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
          {celebration.title}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">{celebration.subtitle}</p>
        <button
          type="button"
          onClick={onDone}
          className="mt-6 w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white active:bg-emerald-700"
        >
          ¡Genial!
        </button>
      </div>
    </div>
  );
}
