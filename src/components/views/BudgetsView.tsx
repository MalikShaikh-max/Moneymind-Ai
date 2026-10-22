import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Edit2,
  Trash2,
  Sliders,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types/finance';
import { CATEGORIES } from '../../data/categories';
import { BudgetModal } from '../modals/BudgetModal';

export const BudgetsView: React.FC = () => {
  const {
    budgets,
    metrics,
    formatMoney,
    deleteBudget,
    autoSuggestBudgets,
  } = useFinance();

  const [modalOpen, setModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  // Aggregated Budget Totals
  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalBudgetSpent = metrics.budgetProgress.reduce((acc, b) => acc + b.spent, 0);
  const totalBudgetRemaining = Math.max(0, totalBudgetLimit - totalBudgetSpent);
  const totalBudgetPct = totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit) * 100 : 0;

  // Days remaining in current month
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, lastDayOfMonth - now.getDate());

  return (
    <div className="space-y-6 pb-16 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PieChart className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Smart Budget Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Category Spending Limits & Safeguards
          </h1>
          <p className="text-xs text-slate-400">
            Set guardrails to stop overspending before month-end
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => autoSuggestBudgets()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Auto-Suggest Caps</span>
          </button>

          <button
            onClick={() => {
              setBudgetToEdit(null);
              setModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>New Budget</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Monthly Budget Pool
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100">
                {formatMoney(totalBudgetSpent)}
              </span>
              <span className="text-sm font-mono text-slate-400">
                of {formatMoney(totalBudgetLimit)} planned
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-right">
              <div className="text-slate-400 text-[10px] uppercase font-sans">Remaining Pool</div>
              <div className="text-sm font-bold text-cyan-400">
                {formatMoney(totalBudgetRemaining)}
              </div>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-right">
              <div className="text-slate-400 text-[10px] uppercase font-sans">Days Left in Month</div>
              <div className="text-sm font-bold text-slate-200">
                {daysLeft} days
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalBudgetPct > 100
                  ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                  : totalBudgetPct > 80
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, totalBudgetPct)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>{totalBudgetPct.toFixed(1)}% consumed</span>
            <span>
              {totalBudgetPct > 100 ? (
                <strong className="text-rose-400">Exceeded by {formatMoney(totalBudgetSpent - totalBudgetLimit)}</strong>
              ) : (
                <strong className="text-emerald-400">{formatMoney(totalBudgetRemaining)} remaining buffer</strong>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Warnings & Alerts Feed (if any near or over) */}
      {(metrics.overBudgetCount > 0 || metrics.nearBudgetCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.budgetProgress
            .filter((bp) => bp.status === 'over' || bp.status === 'danger')
            .map((bp) => {
              const meta = CATEGORIES[bp.budget.category] || {
                color: '#64748b',
                bgColor: 'rgba(100,116,139,0.15)',
              };

              return (
                <div
                  key={bp.budget.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    bp.status === 'over'
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      bp.status === 'over'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-bold uppercase tracking-wider ${
                          bp.status === 'over' ? 'text-rose-300' : 'text-amber-300'
                        }`}
                      >
                        {bp.status === 'over' ? 'Over Budget' : 'Critical Threshold'}
                      </h4>
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {bp.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      {bp.budget.category}: Spent {formatMoney(bp.spent)} of {formatMoney(bp.budget.monthlyLimit)}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {bp.status === 'over'
                        ? `Over by ${formatMoney(bp.spent - bp.budget.monthlyLimit)} with ${daysLeft} days remaining.`
                        : `Only ${formatMoney(bp.remaining)} left to spend across the next ${daysLeft} days.`}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.budgetProgress.map((bp) => {
          const meta = CATEGORIES[bp.budget.category] || {
            color: '#64748b',
            bgColor: 'rgba(100, 116, 139, 0.15)',
          };

          return (
            <div
              key={bp.budget.id}
              className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-md"
                      style={{ backgroundColor: meta.color }}
                    ></span>
                    <span className="font-bold text-sm text-slate-200">
                      {bp.budget.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setBudgetToEdit(bp.budget);
                        setModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded transition-colors"
                      title="Edit budget"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBudget(bp.budget.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                      title="Delete budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Numbers */}
                <div className="flex items-baseline justify-between font-mono mb-2">
                  <div className="text-lg font-bold text-slate-100">
                    {formatMoney(bp.spent)}
                  </div>
                  <div className="text-xs text-slate-400">
                    Cap: {formatMoney(bp.budget.monthlyLimit)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      bp.status === 'over'
                        ? 'bg-rose-500'
                        : bp.status === 'danger'
                        ? 'bg-amber-400'
                        : bp.status === 'warning'
                        ? 'bg-amber-300'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, bp.percentage)}%` }}
                  ></div>
                </div>
              </div>

              {/* Bottom footer status */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span
                  className={
                    bp.status === 'over'
                      ? 'text-rose-400 font-bold'
                      : bp.status === 'danger'
                      ? 'text-amber-400 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  {bp.percentage.toFixed(0)}% used
                </span>
                <span className="text-slate-300 font-medium font-sans">
                  {bp.spent > bp.budget.monthlyLimit ? (
                    <span className="text-rose-400">-{formatMoney(bp.spent - bp.budget.monthlyLimit)} over</span>
                  ) : (
                    <span className="text-emerald-400">{formatMoney(bp.remaining)} left</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        budgetToEdit={budgetToEdit}
      />
    </div>
  );
};
