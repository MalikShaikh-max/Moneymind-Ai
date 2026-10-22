import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Printer,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Sparkles,
  TrendingDown,
  Building,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../data/categories';
import { CategoryType } from '../../types/finance';

export const ReportsView: React.FC = () => {
  const { transactions, metrics, formatMoney, currency, latestAIAnalysis } = useFinance();

  // Find unique months present in transactions
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      const monthPrefix = t.date.substring(0, 7); // YYYY-MM
      set.add(monthPrefix);
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    availableMonths[0] || new Date().toISOString().substring(0, 7)
  );

  // Month-specific stats
  const monthStats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    const catTotals: Record<CategoryType, number> = {
      Housing: 0,
      'Food & Dining': 0,
      Groceries: 0,
      Transportation: 0,
      Utilities: 0,
      Shopping: 0,
      Entertainment: 0,
      'Health & Fitness': 0,
      'Personal Care': 0,
      Investments: 0,
      Salary: 0,
      Freelance: 0,
      Other: 0,
    };
    const merchantMap = new Map<string, { count: number; total: number; category: CategoryType }>();

    transactions.forEach((tx) => {
      if (tx.date.startsWith(selectedMonth)) {
        if (tx.type === 'income') {
          income += tx.amount;
        } else {
          expenses += tx.amount;
          catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount;

          // Merchant tracking
          const mName = tx.merchant || tx.title;
          const currentM = merchantMap.get(mName) || { count: 0, total: 0, category: tx.category };
          currentM.count++;
          currentM.total += tx.amount;
          merchantMap.set(mName, currentM);
        }
      }
    });

    const net = income - expenses;
    const rate = income > 0 ? (net / income) * 100 : 0;

    // Top merchants array
    const topMerchants = Array.from(merchantMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    return {
      income,
      expenses,
      net,
      rate: Math.max(0, rate),
      categoryBreakdown: catTotals,
      topMerchants,
    };
  }, [transactions, selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-8">
      {/* View Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Financial Accounting & Intelligence
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Monthly Performance Reports
          </h1>
          <p className="text-xs text-slate-400">
            Comprehensive audit reports, merchant rankings, and percentage allocations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-slate-100 font-mono font-semibold focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => {
                const [y, mon] = m.split('-');
                const d = new Date(parseInt(y, 10), parseInt(mon, 10) - 1, 1);
                return (
                  <option key={m} value={m} className="bg-slate-900 text-slate-100">
                    {d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Print or export as PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Month Executive Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Total Inflow
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            {formatMoney(monthStats.income)}
          </div>
          <div className="text-[11px] text-slate-400">
            100% of incoming revenue
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Total Outflow
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            {formatMoney(monthStats.expenses)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {monthStats.income > 0 ? ((monthStats.expenses / monthStats.income) * 100).toFixed(1) : 0}% of gross income
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Net Surplus
          </div>
          <div
            className={`text-2xl font-extrabold font-mono ${
              monthStats.net >= 0 ? 'text-cyan-400' : 'text-rose-400'
            }`}
          >
            {formatMoney(monthStats.net)}
          </div>
          <div className="text-[11px] text-slate-400">
            Retained cash flow
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Monthly Savings Rate
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            {monthStats.rate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400">
            Goal baseline is &ge; 20%
          </div>
        </div>
      </div>

      {/* Category Spending Matrix Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 space-y-4 p-6">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Category Spending Distribution
          </h3>
          <p className="text-xs text-slate-400">
            Detailed breakdown of expenses by category for {selectedMonth}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Total Spent</th>
                <th className="py-3 px-4 font-semibold text-right">% of Expenses</th>
                <th className="py-3 px-4 font-semibold text-right">% of Income</th>
                <th className="py-3 px-4 font-semibold">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {(Object.entries(monthStats.categoryBreakdown) as [CategoryType, number][])
                .filter(([_, amt]) => amt > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => {
                  const meta = CATEGORIES[cat] || {
                    color: '#64748b',
                    bgColor: 'rgba(100,116,139,0.15)',
                    isEssential: false,
                  };
                  const pctExpenses = monthStats.expenses > 0 ? (amt / monthStats.expenses) * 100 : 0;
                  const pctIncome = monthStats.income > 0 ? (amt / monthStats.income) * 100 : 0;

                  return (
                    <tr key={cat} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-200 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        ></span>
                        <span>{cat}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-100">
                        {formatMoney(amt)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {pctExpenses.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {pctIncome.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            meta.isEssential
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {meta.isEssential ? 'Essential Need' : 'Discretionary Want'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Merchants Leaderboard */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-400" />
            Top Expense Payees & Merchants Leaderboard
          </h3>
          <p className="text-xs text-slate-400">
            High-volume destinations consuming the largest share of your funds
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {monthStats.topMerchants.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500 text-[10px]">#{idx + 1} Merchant</span>
                <span className="text-[10px] text-slate-400 font-mono">{m.count} charges</span>
              </div>
              <div className="font-bold text-sm text-slate-100 truncate" title={m.name}>
                {m.name}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-mono text-xs">
                <span className="text-slate-400 text-[11px] font-sans">{m.category}</span>
                <span className="font-bold text-rose-400">{formatMoney(m.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
