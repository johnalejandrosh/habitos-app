import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hábitos | Pequeños pasos, cada día",
  description:
    "Registra tus hábitos, sigue tu progreso diario y construye rachas que duran.",
};

const features = [
  {
    emoji: "👆",
    title: "Un toque basta",
    description: "Registra cada hábito al instante, sin formularios ni fricción.",
  },
  {
    emoji: "🔥",
    title: "Rachas y metas",
    description: "Visualiza tu progreso diario y celebra cuando superas ayer.",
  },
  {
    emoji: "📊",
    title: "Insights claros",
    description: "Estadísticas, historial y un mapa de actividad de tu constancia.",
  },
] as const;

const previewHabits = [
  { emoji: "💧", name: "Agua", count: 6, streak: 12 },
  { emoji: "📖", name: "Leer", count: 2, streak: 5 },
  { emoji: "🏃", name: "Moverme", count: 1, streak: 3 },
] as const;

export default function IntroPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-zinc-50 dark:bg-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]"
      />

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))]">
        <header className="flex flex-col items-center text-center">
          <div className="habit-float-gentle mb-6">
            <Image
              src="/icon-192.svg"
              alt=""
              width={88}
              height={88}
              priority
              className="rounded-[1.35rem] shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-500/20"
            />
          </div>

          <p className="habit-badge-pop text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Tu tracker personal
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Hábitos
          </h1>

          <p className="mt-3 max-w-sm text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Pequeños pasos, cada día. Construye la constancia que buscas con un
            registro simple y visual.
          </p>
        </header>

        <section
          aria-label="Vista previa"
          className="mt-10 rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-sm font-medium text-zinc-500">Hoy</p>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              9 registros
            </span>
          </div>

          <div className="space-y-2">
            {previewHabits.map((habit, index) => (
              <div
                key={habit.name}
                className="habit-list-item flex items-center gap-3 rounded-2xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-900/80"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span className="text-2xl" aria-hidden>
                  {habit.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {habit.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {habit.count} hoy ·{" "}
                    <span className="text-amber-600 dark:text-amber-400">
                      {habit.streak} días 🔥
                    </span>
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow-sm">
                  +
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Meta del día</span>
              <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
                9 / 10 · 90%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 habit-progress-shine" />
            </div>
          </div>
        </section>

        <section aria-label="Características" className="mt-8 space-y-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="habit-list-item flex gap-4 rounded-2xl border border-zinc-200/60 bg-white/80 px-4 py-3.5 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/80"
              style={{ animationDelay: `${120 + index * 80}ms` }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xl dark:bg-zinc-900"
                aria-hidden
              >
                {feature.emoji}
              </span>
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {feature.title}
                </h2>
                <p className="mt-0.5 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </section>

        <div className="mt-auto pt-10">
          <Link
            href="/home"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 active:scale-[0.98]"
          >
            Empezar
            <span aria-hidden>→</span>
          </Link>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Tus datos se guardan en este dispositivo. Sin cuenta, sin complicaciones.
          </p>
        </div>
      </main>
    </div>
  );
}
