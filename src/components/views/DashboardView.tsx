import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  AlertTriangle,
  Sparkles,
  Plus,
  Upload,
  PieChart,
  Target,
  ArrowRight,
  ExternalLink,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CashFlowAreaChart } from '../charts/CashFlowAreaChart';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { Transaction } from '../../types/finance';
import { CATEGORIES } from '../../data/categories';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenAddTransaction: () => void;
  onOpenCsvImport: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onRunAiAnalysis: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenAddTransaction,
  onOpenCsvImport,
  onEditTransaction,
  onRunAiAnalysis,
}) => {
  const { metrics, formatMoney, transactions, latestAIAnalysis, isAnalyzing } = useFinance();
  const [recentFilter, setRecentFilter] = useState<'all' | 'expense' | 'income'>('all');

  const filteredRecent = transactions
    .filter((tx) => (recentFilter === 'all' ? true : tx.type === recentFilter))
    .slice(0, 7);

  return (
    <div className="space-y-6 pb-16 lg:pb-8">
      {/* Welcome & AI Quick Action Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 md:p-8">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Intelligence Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Master Your Money with Clarity.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {latestAIAnalysis
                ? latestAIAnalysis.summary
                : 'Track incoming cash flow, manage category budgets, and let Gemini detect unnecessary leaks before they compound.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRunAiAnalysis}
              disabled={isAnalyzing}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing Spending...' : 'Run Financial Audit'}
            </button>
            <button
              onClick={onOpenAddTransaction}
              className="px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Record Expense
            </button>
          </div>
        </div>
      </div>

      {/* Budget Over Limit Alert Banner (if any) */}
      {metrics.overBudgetCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-300">
                Budget Limit Exceeded ({metrics.overBudgetCount} {metrics.overBudgetCount === 1 ? 'category' : 'categories'})
              </h4>
              <p className="text-xs text-rose-400/80">
                Review your spending allocations to keep monthly net cash flow positive.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold whitespace-nowrap transition-colors"
          >
            Review Budgets
          </button>
        </div>
      )}

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cash Balance */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Balance</span>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {formatMoney(metrics.totalBalance)}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold font-mono">
              +{formatMoney(metrics.currentMonthIncome)}
            </span>
            <span>earned this month</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Month Income</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {formatMoney(metrics.currentMonthIncome)}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className={`font-mono font-semibold ${
                metrics.incomeMoMChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {metrics.incomeMoMChangePct >= 0 ? '+' : ''}
              {metrics.incomeMoMChangePct}%
            </span>
            <span>vs previous month</span>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Month Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {formatMoney(metrics.currentMonthExpenses)}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className={`font-mono font-semibold ${
                metrics.expenseMoMChangePct <= 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {metrics.expenseMoMChangePct >= 0 ? '+' : ''}
              {metrics.expenseMoMChangePct}%
            </span>
            <span>burn rate trend</span>
          </div>
        </div>

        {/* Net Savings & Rate */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Net Savings</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-bold font-mono ${
              metrics.netSavings >= 0 ? 'text-cyan-400' : 'text-rose-400'
            }`}
          >
            {formatMoney(metrics.netSavings)}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-cyan-300 font-bold font-mono">
              {metrics.savingsRate}%
            </span>
            <span>savings rate ({metrics.savingsRate >= 20 ? 'Optimal' : 'Needs attention'})</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Line/Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Cash Flow Velocity
              </h3>
              <p className="text-xs text-slate-400">
                Monthly income inflow compared to outflow expenses
              </p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Full Report <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <CashFlowAreaChart transactions={transactions} />
        </div>

        {/* Category Spending Donut Chart */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Category Breakdown
                </h3>
                <p className="text-xs text-slate-400">
                  Distribution of this month's spending
                </p>
              </div>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Budgets <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <CategoryDonutChart
              data={metrics.categorySpending}
              totalExpenses={metrics.currentMonthExpenses}
            />
          </div>

          {/* Quick AI Tip Callout */}
          <div className="mt-6 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                AI Health Metric
              </span>
              <span className="font-mono text-slate-200">
                {latestAIAnalysis ? `${latestAIAnalysis.financialHealthScore}/100` : 'Audit Ready'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {latestAIAnalysis
                ? `Current 50/30/20 balance: ${latestAIAnalysis.budgetRuleBreakdown?.needsPct}% Needs, ${latestAIAnalysis.budgetRuleBreakdown?.wantsPct}% Wants, ${latestAIAnalysis.budgetRuleBreakdown?.savingsPct}% Savings.`
                : 'Click "Run Financial Audit" above to analyze spending leaks and calculate your 50/30/20 balance with Gemini.'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenAddTransaction}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-left hover:bg-slate-850 transition-all group"
        >
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-2 group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-200">Add Transaction</div>
          <div className="text-[11px] text-slate-400">Expense or Income</div>
        </button>

        <button
          onClick={onOpenCsvImport}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-left hover:bg-slate-850 transition-all group"
        >
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-2 group-hover:scale-110 transition-transform">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-200">Import CSV File</div>
          <div className="text-[11px] text-slate-400">Upload bank statement</div>
        </button>

        <button
          onClick={() => setActiveTab('budgets')}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-left hover:bg-slate-850 transition-all group"
        >
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-2 group-hover:scale-110 transition-transform">
            <PieChart className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-200">Adjust Budgets</div>
          <div className="text-[11px] text-slate-400">Monthly category caps</div>
        </button>

        <button
          onClick={() => setActiveTab('forecast')}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-left hover:bg-slate-850 transition-all group"
        >
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-2 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-200">Cash Flow Forecast</div>
          <div className="text-[11px] text-slate-400">30-90 day projection</div>
        </button>
      </div>

      {/* Recent Transactions List with Quick Filtering */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-400">
              Latest activity across all accounts and categories
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setRecentFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  recentFilter === 'all'
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRecentFilter('expense')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  recentFilter === 'expense'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setRecentFilter('income')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  recentFilter === 'income'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Income
              </button>
            </div>

            <button
              onClick={() => setActiveTab('transactions')}
              className="px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Transactions Table/List */}
        <div className="space-y-2">
          {filteredRecent.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No transactions match this filter.
            </div>
          ) : (
            filteredRecent.map((tx) => {
              const meta = CATEGORIES[tx.category] || {
                color: '#64748b',
                bgColor: 'rgba(100, 116, 139, 0.15)',
              };

              return (
                <div
                  key={tx.id}
                  onClick={() => onEditTransaction(tx)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: meta.bgColor, color: meta.color }}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-emerald-300 transition-colors truncate">
                        {tx.title}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span
                          className="px-1.5 py-0.2 rounded text-[10px] font-sans font-medium"
                          style={{ backgroundColor: meta.bgColor, color: meta.color }}
                        >
                          {tx.category}
                        </span>
                        {tx.recurring && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-sans">
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono shrink-0 pl-3">
                    <div
                      className={`text-sm sm:text-base font-bold ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatMoney(tx.amount)}
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize">
                      {tx.paymentMethod.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
