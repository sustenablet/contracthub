"use client";

import { useState, useEffect } from "react";

export type RevenueDataPoint = { month: string; amount: number };

const CHART_H = 180;
const PADDING_LEFT = 44;
const PADDING_BOTTOM = 28;
const PADDING_TOP = 16;
const BAR_W = 40;
const BAR_GAP = 36;

export function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[180px] text-xs text-gray-400">
        No revenue data yet
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.amount)) || 1;
  const avgVal = data.reduce((a, b) => a + b.amount, 0) / data.length;
  const plotH = CHART_H - PADDING_BOTTOM - PADDING_TOP;
  const totalW = PADDING_LEFT + data.length * (BAR_W + BAR_GAP) - BAR_GAP + 24;

  function barH(amount: number) {
    return (amount / maxVal) * plotH;
  }
  function barTop(amount: number) {
    return PADDING_TOP + plotH - barH(amount);
  }
  function barX(i: number) {
    return PADDING_LEFT + i * (BAR_W + BAR_GAP);
  }

  const avgY = PADDING_TOP + plotH - (avgVal / maxVal) * plotH;
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width="100%"
        viewBox={`0 0 ${totalW} ${CHART_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {/* Y-axis grid lines + labels */}
        {yTicks.map((val, i) => {
          const y = PADDING_TOP + plotH - (val / maxVal) * plotH;
          return (
            <g key={i}>
              <line
                x1={PADDING_LEFT}
                y1={y}
                x2={totalW - 8}
                y2={y}
                stroke="#ECEAE6"
                strokeWidth="1"
              />
              <text
                x={PADDING_LEFT - 6}
                y={y + 4}
                textAnchor="end"
                fontSize="9"
                fill="#C4C4C4"
              >
                ${(val / 1000).toFixed(0)}K
              </text>
            </g>
          );
        })}

        {/* Average dashed line */}
        <line
          x1={PADDING_LEFT}
          y1={avgY}
          x2={totalW - 8}
          y2={avgY}
          stroke="#18181B"
          strokeWidth="1.5"
          strokeDasharray="5,4"
          opacity="0.2"
        />
        {/* Avg label pill */}
        <rect
          x={PADDING_LEFT}
          y={avgY - 11}
          width={28}
          height={14}
          rx={4}
          fill="#18181B"
          opacity="0.18"
        />
        <text
          x={PADDING_LEFT + 14}
          y={avgY + 1}
          textAnchor="middle"
          fontSize="8"
          fill="#18181B"
          fontWeight="700"
          opacity="0.7"
        >
          Avg
        </text>

        {/* Bars */}
        {data.map((d, i) => {
          const x = barX(i);
          const bH = barH(d.amount);
          const bTop = barTop(d.amount);
          const isHov = hovered === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Track bar (full height bg) */}
              <rect
                x={x}
                y={PADDING_TOP}
                width={BAR_W}
                height={plotH}
                rx={8}
                fill="#EEECEA"
              />
              {/* Actual bar */}
              <rect
                x={x}
                y={bTop}
                width={BAR_W}
                height={bH}
                rx={8}
                fill={isHov ? "#2A7C6F" : "#C8E6E2"}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "bottom",
                  transform: `scaleY(${animated ? 1 : 0})`,
                  transition: `transform 0.65s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.07}s, fill 0.2s ease`,
                }}
              />
              {/* Month label */}
              <text
                x={x + BAR_W / 2}
                y={CHART_H - 6}
                textAnchor="middle"
                fontSize="10"
                fill={isHov ? "#2A7C6F" : "#B8B4AE"}
                fontWeight={isHov ? "700" : "500"}
              >
                {d.month}
              </text>

              {/* Tooltip */}
              {isHov && (
                <g>
                  <rect
                    x={x + BAR_W / 2 - 34}
                    y={bTop - 32}
                    width={68}
                    height={24}
                    rx={8}
                    fill="#18181B"
                  />
                  {/* Tooltip tail */}
                  <polygon
                    points={`${x + BAR_W / 2 - 5},${bTop - 8} ${x + BAR_W / 2 + 5},${bTop - 8} ${x + BAR_W / 2},${bTop - 2}`}
                    fill="#18181B"
                  />
                  <text
                    x={x + BAR_W / 2}
                    y={bTop - 16}
                    textAnchor="middle"
                    fontSize="11"
                    fill="white"
                    fontWeight="700"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    ${d.amount.toLocaleString()}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
