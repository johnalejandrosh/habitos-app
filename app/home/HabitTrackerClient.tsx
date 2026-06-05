"use client";

import dynamic from "next/dynamic";

const HabitTracker = dynamic(
  () =>
    import("@/components/habits/HabitTracker").then((m) => m.HabitTracker),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-black">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    ),
  },
);

export function HabitTrackerClient() {
  return <HabitTracker />;
}
