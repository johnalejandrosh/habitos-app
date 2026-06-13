"use client";

import dynamic from "next/dynamic";

const HabitReportView = dynamic(
  () =>
    import("@/components/habits/HabitReportView").then((m) => m.HabitReportView),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-black">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    ),
  },
);

export function HabitReportClient() {
  return <HabitReportView />;
}
