import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';

interface ForecastProjectionChartProps {
  days: 30 | 60 | 90;
  recurringCommitments: number;
}

export const ForecastProjectionChart: React.FC<ForecastProjectionChartProps> = ({
  days,
  recurringCommitments,
}) => {
  const { metrics, formatMoney } = useFinance();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Calculate daily burn and income rate from transactions
  const dailyIncome = metrics.currentMonthIncome / 30 || 250;
  const dailyExpense = metrics.currentMonthExpenses / 30 || 180;
  const netDaily = dailyIncome - dailyExpense;

  const currentBalance = metrics.totalBalance;

  // Generate data points for every 5 days
  const stepDays = days === 30 ? 3 : days === 60 ? 5 : 10;
  const pointsCount = Math.floor(days / stepDays) + 1;

  const projectionData = React.useMemo(() => {
    const list = [];
    const now = new Date();

    for (let i = 0; i < pointsCount; i++) {
      const dayOffset = i * stepDays;
      const date = new Date(now);
      date.setDate(date.getDate() + dayOffset);

      // Baseline projection
      const baseline = Math.round(currentBalance + netDaily * dayOffset);
      
      // Optimistic projection (12% less discretionary spending)
      const optimistic = Math.round(currentBalance + (netDaily + dailyExpense * 0.15) * dayOffset);
      
      // Conservative projection (unexpected $400 expense + 10% inflation)
      const conservative = Math.round(currentBalance + (netDaily - dailyExpense * 0.12) * dayOffset - (dayOffset > 10 ? 450 : 0));

      list.push({
        dayOffset,
        dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        baseline,
        optimistic,
        conservative,
      });
    }

    return list;
  }, [currentBalance, netDaily, dailyExpense, days, stepDays, pointsCount]);

  const allValues = projectionData.flatMap((d) => [d.baseline, d.optimistic, d.conservative]);
  const minVal = Math.min(...allValues, 0);
  const maxVal = Math.max(...allValues, currentBalance + 1000);
  const valRange = maxVal - minVal || 1;

  // SVG Geometry
  const width = 640;
  const height = 240;
  const padding = { top: 25, right: 35, bottom: 40, left: 65 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const getX = (idx: number) => padding.left + (idx / (pointsCount - 1)) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - ((val - minVal) / valRange) * graphHeight;

  // Lines
  const baselinePoints = projectionData.map((d, i) => `${getX(i)},${getY(d.baseline)}`);
  const optimisticPoints = projectionData.map((d, i) => `${getX(i)},${getY(d.optimistic)}`);
  const conservativePoints = projectionData.map((d, i) => `${getX(i)},${getY(d.conservative)}`);

  // Area between optimistic and conservative
  const reverseConservative = [...conservativePoints].reverse();
  const confidenceBandArea = `${optimisticPoints.join(' ')} ${reverseConservative.join(' ')}`;

  const hoveredData = hoverIndex !== null ? projectionData[hoverIndex] : null;

  return (
    <div className="relative w-full overflow-hidden select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"></span>
            <span className="font-medium text-slate-300">Baseline Trajectory</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400">Optimistic (+15% Savings)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-400">Conservative (Shock Buffer)</span>
          </div>
        </div>
        <span className="text-slate-500 font-mono text-[11px]">{days}-Day Predictive Horizon</span>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = padding.top + graphHeight * (1 - pct);
            const val = minVal + valRange * pct;
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

          {/* Confidence corridor area */}
          <polygon points={confidenceBandArea} fill="url(#confidenceGrad)" />

          {/* Conservative line */}
          <polyline
            points={conservativePoints.join(' ')}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />

          {/* Optimistic line */}
          <polyline
            points={optimisticPoints.join(' ')}
            fill="none"
            stroke="#34d399"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />

          {/* Baseline Main Trajectory */}
          <polyline
            points={baselinePoints.join(' ')}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive hover points */}
          {projectionData.map((d, i) => {
            const x = getX(i);
            const y = getY(d.baseline);
            const isHovered = hoverIndex === i;

            return (
              <g key={d.dayOffset}>
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

                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill="#06b6d4"
                  stroke="#0b0f19"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200"
                />

                <text
                  x={x}
                  y={height - 12}
                  fill={isHovered ? '#f1f5f9' : '#94a3b8'}
                  fontSize="10"
                  fontWeight={isHovered ? '600' : '400'}
                  textAnchor="middle"
                >
                  {d.dateStr}
                </text>

                <rect
                  x={x - graphWidth / (pointsCount * 2)}
                  y={padding.top}
                  width={graphWidth / pointsCount}
                  height={graphHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                />
              </g>
            );
          })}
        </svg>

        {hoveredData && hoverIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none p-3 rounded-lg bg-slate-900/95 border border-cyan-800/80 shadow-2xl backdrop-blur-md text-xs animate-fade-in"
            style={{
              left: Math.min(Math.max(getX(hoverIndex) - 80, 10), width - 180),
              top: Math.max(getY(hoveredData.baseline) - 100, 5),
            }}
          >
            <div className="font-semibold text-cyan-300 mb-1 border-b border-slate-800 pb-1 flex justify-between">
              <span>{hoveredData.dateStr}</span>
              <span className="text-[10px] text-slate-400 font-mono">+{hoveredData.dayOffset} days</span>
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between gap-3">
                <span className="text-cyan-400">Baseline:</span>
                <span className="font-bold text-slate-100">{formatMoney(hoveredData.baseline)}</span>
              </div>
              <div className="flex justify-between gap-3 text-emerald-400">
                <span>Optimistic:</span>
                <span>{formatMoney(hoveredData.optimistic)}</span>
              </div>
              <div className="flex justify-between gap-3 text-amber-400">
                <span>Conservative:</span>
                <span>{formatMoney(hoveredData.conservative)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
