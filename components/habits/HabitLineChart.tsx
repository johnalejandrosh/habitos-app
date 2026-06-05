"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyCompletion } from "@/lib/habits-storage";

type HabitLineChartProps = {
  data: DailyCompletion[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
};

export function HabitLineChart({
  data,
  selectedDate,
  onSelectDate,
}: HabitLineChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40">
        Registra hábitos para ver la evolución en el tiempo
      </div>
    );
  }

  return (
    <div className="h-52 w-full touch-pan-x sm:h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 8, left: -8, bottom: 4 }}
        >
          <defs>
            <linearGradient id="habitAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-zinc-200 dark:stroke-zinc-800"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            domain={[0, maxCount]}
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e4e4e7",
              fontSize: "13px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value) => [`${value} registros`, "Total"]}
            labelFormatter={(label) => `Día ${label}`}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="none"
            fill="url(#habitAreaFill)"
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (cx == null || cy == null) return null;
              const point = payload as DailyCompletion;
              const active = selectedDate === point.date;
              return (
                <circle
                  key={point.date}
                  cx={cx}
                  cy={cy}
                  r={active ? 8 : 5}
                  fill={active ? "#059669" : "#10b981"}
                  stroke="#fff"
                  strokeWidth={2}
                  className="cursor-pointer"
                  onClick={() =>
                    onSelectDate(
                      selectedDate === point.date ? null : point.date,
                    )
                  }
                />
              );
            }}
            activeDot={{ r: 9, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-zinc-400">
        Toca un punto para ver el detalle por hábito
      </p>
    </div>
  );
}
