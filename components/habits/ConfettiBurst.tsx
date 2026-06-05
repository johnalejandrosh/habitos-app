"use client";

import { useEffect, useState } from "react";

const COLORS = ["#10b981", "#34d399", "#fbbf24", "#60a5fa", "#a78bfa"];

type ConfettiBurstProps = {
  trigger: number;
};

export function ConfettiBurst({ trigger }: ConfettiBurstProps) {
  const [pieces, setPieces] = useState<
    { id: number; color: string; tx: string; ty: string; left: string }[]
  >([]);

  useEffect(() => {
    if (trigger === 0) return;

    const next = Array.from({ length: 18 }, (_, i) => ({
      id: trigger * 100 + i,
      color: COLORS[i % COLORS.length],
      tx: `${(Math.random() - 0.5) * 120}px`,
      ty: `${-40 - Math.random() * 80}px`,
      left: `${20 + Math.random() * 60}%`,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 900);
    return () => clearTimeout(t);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-1/3 h-2 w-2 rounded-sm"
          style={
            {
              left: p.left,
              backgroundColor: p.color,
              "--tx": p.tx,
              "--ty": p.ty,
              animation: "habit-confetti 0.85s ease-out forwards",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
