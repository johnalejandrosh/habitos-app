import type { Metadata } from "next";
import { HabitTrackerClient } from "./HabitTrackerClient";

export const metadata: Metadata = {
  title: "Hábitos | Home",
  description: "Registra cada vez que completas un hábito",
};

export default function HomeHabitsPage() {
  return <HabitTrackerClient />;
}
