import type { Metadata } from "next";
import { HabitReportClient } from "./HabitReportClient";

export const metadata: Metadata = {
  title: "Hábitos | Reporte",
  description: "Consulta tu progreso semanal, mensual y anual",
};

export default function ReportPage() {
  return <HabitReportClient />;
}
