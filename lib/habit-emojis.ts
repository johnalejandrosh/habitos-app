export const HABIT_EMOJIS = ["✅", "💧", "🏃", "📚", "🧘", "💪", "🥗", "😴"] as const;

export type HabitEmoji = (typeof HABIT_EMOJIS)[number];

export function pickDefaultEmoji(index: number): string {
  return HABIT_EMOJIS[index % HABIT_EMOJIS.length];
}
