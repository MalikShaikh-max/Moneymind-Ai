import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../data/categories';
import { CategoryType } from '../../types/finance';

interface CategoryDonutChartProps {
  data: Record<CategoryType, number>;
  totalExpenses: number;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  totalExpenses,
}) => {
  const { formatMoney } = useFinance();
  const [activeCategory, setActiveCategory] = useState<CategoryType | null>(null);

  // Filter items with spending > 0, sort by amount desc
  const items = React.useMemo(() => {
    return (Object.entries(data) as [CategoryType, number][])
      .filter(([_, amt]) => amt > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [data]);

  const total = totalExpenses || items.reduce((acc, curr) => acc + curr[1], 0) || 1;

  // Donut geometry
  const size = 260;
  const strokeWidth = 36;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const slices = items.map(([category, amount]) => {
    const percentage = (amount / total) * 100;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percentage;

    const meta = CATEGORIES[category] || {
      color: '#64748b',
      bgColor: 'rgba(100, 116, 139, 0.15)',
    };

    return {
      category,
      amount,
      percentage,
      strokeDasharray,
      strokeDashoffset,
      color: meta.color,
    };
  });

  const displayCategory = activeCategory || (slices[0]?.category ?? null);
  const displayAmount = displayCategory ? data[displayCategory] || 0 : total;
  const displayPct = displayCategory && total > 0 ? (displayAmount / total) * 100 : 100;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 justify-between select-none">
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Base background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {slices.map((slice) => {
            const isHovered = activeCategory === slice.category;
            return (
              <circle
                key={slice.category}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer opacity-90 hover:opacity-100"
                onMouseEnter={() => setActiveCategory(slice.category)}
                onMouseLeave={() => setActiveCategory(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate max-w-[120px]">
            {displayCategory || 'Total Spent'}
          </span>
          <span className="text-xl font-bold font-mono text-slate-100 mt-0.5">
            {formatMoney(displayAmount)}
          </span>
          <span className="text-[11px] font-mono text-emerald-400 mt-0.5">
            {displayPct.toFixed(1)}% of total
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full max-h-[260px] overflow-y-auto pr-1 space-y-2">
        {slices.length === 0 ? (
          <div className="text-slate-500 text-sm py-8 text-center">
            No expenses recorded for this period.
          </div>
        ) : (
          slices.map((slice) => {
            const isHovered = activeCategory === slice.category;
            return (
              <div
                key={slice.category}
                onMouseEnter={() => setActiveCategory(slice.category)}
                onMouseLeave={() => setActiveCategory(null)}
                className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                  isHovered ? 'bg-slate-800/80 border border-slate-700' : 'hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="w-3 h-3 rounded-md shrink-0 shadow-sm"
                    style={{ backgroundColor: slice.color }}
                  ></span>
                  <span className="font-medium text-slate-200 truncate">
                    {slice.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono shrink-0">
                  <span className="text-slate-400 text-[11px]">
                    {slice.percentage.toFixed(1)}%
                  </span>
                  <span className="font-semibold text-slate-200">
                    {formatMoney(slice.amount)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
