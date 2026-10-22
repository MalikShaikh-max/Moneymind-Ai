import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  AlertCircle,
  Repeat,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  DollarSign,
  Info,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ForecastProjectionChart } from '../charts/ForecastProjectionChart';
import { CATEGORIES } from '../../data/categories';

export const CashFlowForecastView: React.FC = () => {
  const { metrics, transactions, formatMoney } = useFinance();
  const [horizonDays, setHorizonDays] = useState<30 | 60 | 90>(30);

  // Extract upcoming recurring items from transactions
  const upcomingRecurring = useMemo(() => {
    const recurringTxs = transactions.filter((t) => t.recurring);
    const now = new Date();

    // Map each recurring transaction to its expected next date in next 30 days
    return recurringTxs
      .map((t) => {
        // Find next trigger day of the month based on original date
        const origDay = parseInt(t.date.split('-')[2] || '1', 10);
        let nextDate = new Date(now.getFullYear(), now.getMonth(), origDay);
        if (nextDate.getTime() < now.getTime()) {
          // If already passed this month, move to next month
          nextDate = new Date(now.getFullYear(), now.getMonth() + 1, origDay);
        }

        const daysAway = Math.max(0, Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));

        return {
          id: t.id,
          title: t.title,
          amount: t.amount,
          type: t.type,
          category: t.category,
          frequency: t.recurringFrequency || 'monthly',
          nextDateStr: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          daysAway,
        };
      })
      .sort((a, b) => a.daysAway - b.daysAway);
  }, [transactions]);

  // Daily rate calculations
  const netDailyVelocity = (metrics.currentMonthIncome - metrics.currentMonthExpenses) / 30;
  const projectedBalanceHorizon = Math.round(metrics.totalBalance + netDailyVelocity * horizonDays);
  const runwayMonths =
    metrics.currentMonthExpenses > 0
      ? (metrics.totalBalance / metrics.currentMonthExpenses).toFixed(1)
      : '12+';

  return (
    <div className="space-y-6 pb-16 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Predictive Cash Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Forward Cash-Flow Projection
          </h1>
          <p className="text-xs text-slate-400">
            Simulate your liquid reserve balances using actual velocity and scheduled recurring commitments
          </p>
        </div>

        {/* Horizon Selector */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          {([30, 60, 90] as const).map((days) => (
            <button
              key={days}
              onClick={() => setHorizonDays(days)}
              className={`px-3.5 py-1.5 rounded-lg font-mono font-semibold transition-all ${
                horizonDays === days
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Projection Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Projected Balance ({horizonDays}d)
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {formatMoney(projectedBalanceHorizon)}
          </div>
          <div className="text-[11px] text-slate-400">
            Net projected flow:{' '}
            <span className={netDailyVelocity >= 0 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
              {netDailyVelocity >= 0 ? '+' : ''}
              {formatMoney(netDailyVelocity * horizonDays)}
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Cash Velocity
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {netDailyVelocity >= 0 ? '+' : ''}
            {formatMoney(netDailyVelocity)}/day
          </div>
          <div className="text-[11px] text-slate-400">
            Historical daily income minus daily expenses
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Runway Safety Buffer
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ~{runwayMonths} Months
          </div>
          <div className="text-[11px] text-slate-400">
            Without any new income at current burn
          </div>
        </div>
      </div>

      {/* Interactive Forecast Curve */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Estimated Balance Corridor
          </h3>
          <p className="text-xs text-slate-400">
            Projected trajectory with upper savings scenario and conservative spending shock buffer
          </p>
        </div>

        <ForecastProjectionChart
          days={horizonDays}
          recurringCommitments={metrics.recurringMonthlyCommitments}
        />
      </div>

      {/* Upcoming Recurring Obligations & Timeline */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-emerald-400" />
              Scheduled Recurring Obligations
            </h3>
            <p className="text-xs text-slate-400">
              Active subscriptions, payroll deposits, and leases detected in your registry
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {upcomingRecurring.length} scheduled items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {upcomingRecurring.length === 0 ? (
            <div className="col-span-2 py-8 text-center text-slate-500 text-xs">
              No recurring transactions marked yet. Edit any transaction and check "Recurring" to include it in schedules.
            </div>
          ) : (
            upcomingRecurring.map((item) => {
              const meta = CATEGORIES[item.category] || {
                color: '#64748b',
                bgColor: 'rgba(100,116,139,0.15)',
              };

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: meta.bgColor, color: meta.color }}
                    >
                      {item.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-xs sm:text-sm text-slate-200 truncate">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>Due {item.nextDateStr}</span>
                        <span>•</span>
                        <span className="text-cyan-400">
                          {item.daysAway === 0 ? 'Today' : `In ${item.daysAway} days`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <div
                      className={`text-xs sm:text-sm font-bold ${
                        item.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {item.type === 'income' ? '+' : '-'}
                      {formatMoney(item.amount)}
                    </div>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {item.frequency}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Model Transparency Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Model Methodology & Transparency:</strong> Cash-flow forecasts are algorithmic estimates computed directly from your historical daily run rates and recurring transactions. They illustrate hypothetical trajectory scenarios and are never presented as guaranteed financial results.
        </p>
      </div>
    </div>
  );
};
