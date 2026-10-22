import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryType, Transaction, TransactionType } from '../../types/finance';
import { CATEGORIES } from '../../data/categories';
import { getCurrentMonthStr } from '../../data/seedData';

interface TransactionsViewProps {
  onOpenAddTransaction: () => void;
  onOpenCsvImport: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddTransaction,
  onOpenCsvImport,
  onEditTransaction,
}) => {
  const { transactions, deleteTransaction, formatMoney, currency } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CategoryType>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'this_month' | 'last_30' | 'last_90'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const curMonth = getCurrentMonthStr();

    return transactions
      .filter((tx) => {
        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = tx.title.toLowerCase().includes(q);
          const matchMerchant = tx.merchant?.toLowerCase().includes(q);
          const matchNotes = tx.notes?.toLowerCase().includes(q);
          const matchCat = tx.category.toLowerCase().includes(q);
          if (!matchTitle && !matchMerchant && !matchNotes && !matchCat) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

        // Period filter
        if (periodFilter === 'this_month') {
          if (!tx.date.startsWith(curMonth)) return false;
        } else if (periodFilter === 'last_30') {
          const txDate = new Date(tx.date);
          const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30) return false;
        } else if (periodFilter === 'last_90') {
          const txDate = new Date(tx.date);
          const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 90) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'date') {
          cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else {
          cmp = a.amount - b.amount;
        }
        return sortDirection === 'desc' ? -cmp : cmp;
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter, periodFilter, sortField, sortDirection]);

  // Aggregate stats of filtered transactions
  const filteredStats = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });

    return {
      count: filteredTransactions.length,
      income,
      expense,
      net: income - expense,
    };
  }, [filteredTransactions]);

  const handleExportCsv = () => {
    const headers = ['Date', 'Title', 'Category', 'Type', 'Amount', 'PaymentMethod', 'Recurring', 'Merchant', 'Notes'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      t.type,
      t.amount,
      t.paymentMethod,
      t.recurring ? 'Yes' : 'No',
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneymind_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Transactions Registry
          </h1>
          <p className="text-xs text-slate-400">
            Audit, categorize, filter, and import your cash transactions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCsvImport}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddTransaction}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Record</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search description, merchant, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Flow Types (Expense & Income)</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {Object.keys(CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Period Filter */}
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Time</option>
            <option value="this_month">Current Month</option>
            <option value="last_30">Past 30 Days</option>
            <option value="last_90">Past 90 Days</option>
          </select>
        </div>

        {/* Filter Summary & Sorting Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-4 font-mono">
            <span>
              Showing <strong className="text-slate-200">{filteredStats.count}</strong> transactions
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-emerald-400">
              +{formatMoney(filteredStats.income)}
            </span>
            <span className="hidden sm:inline text-rose-400">
              -{formatMoney(filteredStats.expense)}
            </span>
            <span className="hidden sm:inline">
              Net:{' '}
              <strong className={filteredStats.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {formatMoney(filteredStats.net)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Sort:</span>
            <button
              onClick={() => {
                if (sortField === 'date') {
                  setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                } else {
                  setSortField('date');
                  setSortDirection('desc');
                }
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1 transition-colors ${
                sortField === 'date'
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-900'
              }`}
            >
              Date {sortField === 'date' && (sortDirection === 'desc' ? '↓' : '↑')}
            </button>
            <button
              onClick={() => {
                if (sortField === 'amount') {
                  setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                } else {
                  setSortField('amount');
                  setSortDirection('desc');
                }
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1 transition-colors ${
                sortField === 'amount'
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-transparent border-slate-800 text-slate-400 hover:bg-slate-900'
              }`}
            >
              Amount {sortField === 'amount' && (sortDirection === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 select-none">
              <tr>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Method</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const meta = CATEGORIES[tx.category] || {
                    color: '#64748b',
                    bgColor: 'rgba(100, 116, 139, 0.15)',
                  };
                  const isDeleting = deleteConfirmId === tx.id;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-900/60 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Description & Merchant & Recurring badge */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          <span className="truncate max-w-[220px] sm:max-w-[320px]">
                            {tx.title}
                          </span>
                          {tx.recurring && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono shrink-0">
                              Recurring ({tx.recurringFrequency || 'mo'})
                            </span>
                          )}
                        </div>
                        {tx.merchant && (
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[250px]">
                            {tx.merchant} {tx.notes ? `• ${tx.notes}` : ''}
                          </div>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 font-sans whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium inline-flex items-center gap-1.5"
                          style={{ backgroundColor: meta.bgColor, color: meta.color }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          ></span>
                          {tx.category}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] font-sans capitalize whitespace-nowrap">
                        {tx.paymentMethod.replace('_', ' ')}
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-3.5 px-4 text-right font-bold text-sm whitespace-nowrap ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatMoney(tx.amount)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isDeleting ? (
                          <div className="flex items-center justify-center gap-1.5 font-sans">
                            <button
                              onClick={() => {
                                deleteTransaction(tx.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1.5 py-0.5 text-slate-400 hover:text-slate-200 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditTransaction(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(tx.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
