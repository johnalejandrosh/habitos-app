const HABIT_MESSAGES = [
  "¡Bien hecho!",
  "¡Sigue así!",
  "¡Uno más!",
  "¡Excelente!",
  "¡Gran trabajo!",
  "¡Imparable!",
];

const MILESTONE_MESSAGES: Record<number, string> = {
  1: "¡Primer registro del día!",
  5: "¡5 veces hoy! 🔥",
  10: "¡10 registros! Increíble",
  20: "¡20 registros! Eres una máquina",
};

export function pickEncouragement(countForHabit: number): string {
  const milestone = MILESTONE_MESSAGES[countForHabit];
  if (milestone) return milestone;
  return HABIT_MESSAGES[Math.floor(Math.random() * HABIT_MESSAGES.length)];
}

export function pickComboMessage(combo: number): string {
  if (combo >= 8) return `¡Combo x${combo}! Ritmo legendario`;
  if (combo >= 5) return `¡Combo x${combo}! En racha`;
  if (combo >= 3) return `¡Combo x${combo}!`;
  return pickEncouragement(combo);
}

export function pickDailyTotalMessage(total: number): string | null {
  if (total === 10) return "¡10 registros hoy en total!";
  if (total === 25) return "¡25 registros hoy! Día épico";
  if (total % 15 === 0 && total >= 15) return `¡${total} registros hoy!`;
  return null;
}

export const DAILY_VISUAL_GOAL = 5;
export const DAILY_TOTAL_GOAL = 10;

export function ringProgress(count: number): number {
  return Math.min(count / DAILY_VISUAL_GOAL, 1);
}

export function dailyTotalProgress(total: number): number {
  return Math.min(total / DAILY_TOTAL_GOAL, 1);
}

export function isMilestoneCount(count: number): boolean {
  return [1, 5, 10, 15, 20].includes(count);
}
