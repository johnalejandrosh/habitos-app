type HabitReportMiniRingProps = {
  completed: number;
  total: number;
  accentTextClass: string;
};

export function HabitReportMiniRing({
  completed,
  total,
  accentTextClass,
}: HabitReportMiniRingProps) {
  const size = 40;
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total === 0 ? 0 : completed / total;
  const offset = circumference * (1 - progress);

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
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums text-zinc-700 dark:text-zinc-300">
        {completed}/{total}
      </span>
    </div>
  );
}
