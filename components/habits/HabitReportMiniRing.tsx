type HabitReportMiniRingProps = {
  completed: number;
  total: number;
  accentTextClass: string;
  size?: number;
};

export function HabitReportMiniRing({
  completed,
  total,
  accentTextClass,
  size = 44,
}: HabitReportMiniRingProps) {
  const stroke = size <= 40 ? 3.5 : 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total === 0 ? 0 : completed / total;
  const offset = circumference * (1 - progress);
  const fontSize = size <= 40 ? "text-[10px]" : "text-[11px]";

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-label={`${completed} de ${total}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-zinc-100 dark:text-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${accentTextClass} transition-[stroke-dashoffset] duration-500`}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-bold tabular-nums text-zinc-700 dark:text-zinc-300 ${fontSize}`}
      >
        {completed}/{total}
      </span>
    </div>
  );
}
