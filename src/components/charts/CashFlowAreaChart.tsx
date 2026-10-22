import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types/finance';

interface CashFlowAreaChartProps {
  transactions: Transaction[];
  days?: number;
}

export const CashFlowAreaChart: React.FC<CashFlowAreaChartProps> = ({ transactions }) => {
  const { formatMoney } = useFinance();
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    inflow: number;
    outflow: number;
    net: number;
    x: number;
    y: number;
  } | null>(null);

  // Group transactions by recent 6 months or past 30 days
  // Let's create a smooth 6-month view
  const monthsData = React.useMemo(() => {
    const list: { label: string; key: string; inflow: number; outflow: number; net: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });

      let inflow = 0;
      let outflow = 0;

      transactions.forEach((tx) => {
        if (tx.date.startsWith(key)) {
          if (tx.type === 'income') inflow += tx.amount;
          else outflow += tx.amount;
        }
      });

      list.push({
        label,
        key,
        inflow: Math.round(inflow),
        outflow: Math.round(outflow),
        net: Math.round(inflow - outflow),
      });
    }

    return list;
  }, [transactions]);

  const maxVal = Math.max(
    ...monthsData.map((d) => Math.max(d.inflow, d.outflow)),
    1000
  );

  // SVG Chart Geometry
  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const pointsCount = monthsData.length;
  const getX = (idx: number) => padding.left + (idx / (pointsCount - 1)) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - (val / maxVal) * graphHeight;

  // Inflow Path (Green)
  const inflowPoints = monthsData.map((d, i) => `${getX(i)},${getY(d.inflow)}`);
  const inflowArea = `${getX(0)},${padding.top + graphHeight} ${inflowPoints.join(' ')} ${getX(
    pointsCount - 1
  )},${padding.top + graphHeight}`;

  // Outflow Path (Rose)
  const outflowPoints = monthsData.map((d, i) => `${getX(i)},${getY(d.outflow)}`);
  const outflowArea = `${getX(0)},${padding.top + graphHeight} ${outflowPoints.join(' ')} ${getX(
    pointsCount - 1
  )},${padding.top + graphHeight}`;

  return (
    <div className="relative w-full overflow-hidden select-none">
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
            <span className="font-medium text-slate-300">Income (Inflow)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]"></span>
            <span className="font-medium text-slate-300">Expenses (Outflow)</span>
          </div>
        </div>
        <span className="text-slate-500 font-mono text-[11px]">6-Month Rolling View</span>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            {/* Emerald Gradient */}
            <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Rose Gradient */}
            <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + graphHeight * (1 - pct);
            const val = maxVal * pct;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {formatMoney(val, true)}
                </text>
              </g>
            );
          })}

          {/* Outflow Area & Line */}
          <polygon points={outflowArea} fill="url(#outflowGrad)" />
          <polyline
            points={outflowPoints.join(' ')}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inflow Area & Line */}
          <polygon points={inflowArea} fill="url(#inflowGrad)" />
          <polyline
            points={inflowPoints.join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Labels & Interactive Pillars */}
          {monthsData.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredPoint?.date === d.key;

            return (
              <g key={d.key}>
                {/* Hover vertical guide line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + graphHeight}
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Data point dots */}
                <circle
                  cx={x}
                  cy={getY(d.inflow)}
                  r={isHovered ? 6 : 4}
                  fill="#10b981"
                  stroke="#0b0f19"
                  strokeWidth="2"
                  className="transition-all duration-200 cursor-pointer"
                />
                <circle
                  cx={x}
                  cy={getY(d.outflow)}
                  r={isHovered ? 6 : 4}
                  fill="#f43f5e"
                  stroke="#0b0f19"
                  strokeWidth="2"
                  className="transition-all duration-200 cursor-pointer"
                />

                {/* X Axis Label */}
                <text
                  x={x}
                  y={height - 12}
                  fill={isHovered ? '#f1f5f9' : '#94a3b8'}
                  fontSize="11"
                  fontWeight={isHovered ? '600' : '500'}
                  textAnchor="middle"
                >
                  {d.label}
                </text>

                {/* Invisible hover trigger area */}
                <rect
                  x={x - graphWidth / (pointsCount * 2)}
                  y={padding.top}
                  width={graphWidth / pointsCount}
                  height={graphHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      date: d.key,
                      inflow: d.inflow,
                      outflow: d.outflow,
                      net: d.net,
                      x,
                      y: Math.min(getY(d.inflow), getY(d.outflow)),
                    })
                  }
                />
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none p-3 rounded-lg bg-slate-900/95 border border-slate-700 shadow-xl backdrop-blur-md text-xs animate-fade-in"
            style={{
              left: Math.min(Math.max(hoveredPoint.x - 70, 10), width - 150),
              top: Math.max(hoveredPoint.y - 85, 5),
            }}
          >
            <div className="font-semibold text-slate-200 mb-1.5 pb-1 border-b border-slate-800">
              {hoveredPoint.date}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono">
              <span className="text-emerald-400">Inflow:</span>
              <span className="text-right text-emerald-400 font-semibold">
                {formatMoney(hoveredPoint.inflow)}
              </span>
              <span className="text-rose-400">Outflow:</span>
              <span className="text-right text-rose-400 font-semibold">
                {formatMoney(hoveredPoint.outflow)}
              </span>
              <span className="text-slate-400">Net Flow:</span>
              <span
                className={`text-right font-semibold ${
                  hoveredPoint.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {hoveredPoint.net >= 0 ? '+' : ''}
                {formatMoney(hoveredPoint.net)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
