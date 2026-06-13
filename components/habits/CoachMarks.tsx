"use client";

import { useEffect, useState } from "react";

const COACH_KEY = "habitos-coach-seen";

type CoachMarksProps = {
  hasHabits: boolean;
};

export function CoachMarks({ hasHabits }: CoachMarksProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(COACH_KEY)) return;
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    localStorage.setItem(COACH_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  const steps = hasHabits
    ? [
        {
          title: "Registra con calma",
          body: "Toca +1 para registrar al instante. Usa «Con nota» si quieres añadir detalle.",
        },
        {
          title: "Deshacer",
          body: "Desliza la tarjeta ← para deshacer el último registro.",
        },
        {
          title: "Estadísticas",
          body: "Cambia 7/14/30 días, toca la semana o el gráfico y mira el detalle por hábito.",
        },
      ]
    : [
        {
          title: "Bienvenido",
          body: "Pulsa el botón + flotante para crear tu primer hábito.",
        },
      ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center p-4 pb-32">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={dismiss}
        aria-label="Cerrar guía"
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl habit-sheet-panel dark:bg-zinc-950">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Tip {step + 1}/{steps.length}
        </p>
        <h3 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
          {current.title}
        </h3>
        <p className="mt-2 text-sm text-zinc-500">{current.body}</p>
        <div className="mt-4 flex gap-2">
          {step < steps.length - 1 ? (
            <>
              <button
                type="button"
                onClick={dismiss}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-zinc-500 active:bg-zinc-100 dark:active:bg-zinc-900"
              >
                Saltar
              </button>
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white active:bg-emerald-700"
              >
                Siguiente
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={dismiss}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white active:bg-emerald-700"
            >
              ¡Empezar!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
