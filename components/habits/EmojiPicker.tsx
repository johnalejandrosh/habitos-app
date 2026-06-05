"use client";

import { HABIT_EMOJIS } from "@/lib/habit-emojis";

type EmojiPickerProps = {
  value: string;
  onChange: (emoji: string) => void;
};

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
      {HABIT_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className={`flex aspect-square min-h-[3.25rem] items-center justify-center rounded-2xl text-2xl transition active:scale-95 ${
            value === emoji
              ? "bg-emerald-100 ring-2 ring-emerald-500 dark:bg-emerald-950"
              : "bg-zinc-100 dark:bg-zinc-800"
          }`}
          aria-label={`Emoji ${emoji}`}
          aria-pressed={value === emoji}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
