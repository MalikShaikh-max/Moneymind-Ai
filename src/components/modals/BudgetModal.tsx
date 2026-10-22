import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Budget, CategoryType } from '../../types/finance';
import { EXPENSE_CATEGORIES } from '../../data/categories';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budgetToEdit,
}) => {
  const { addBudget, updateBudget, currency, budgets } = useFinance();

  const [category, setCategory] = useState<CategoryType>('Food & Dining');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (budgetToEdit) {
      setCategory(budgetToEdit.category);
      setMonthlyLimit(budgetToEdit.monthlyLimit.toString());
      setAlertThreshold(budgetToEdit.alertThreshold || 80);
    } else {
      // Pick first unallocated category if any
      const allocated = new Set(budgets.map((b) => b.category));
      const available = EXPENSE_CATEGORIES.find((c) => !allocated.has(c));
      setCategory(available || 'Food & Dining');
      setMonthlyLimit('400');
      setAlertThreshold(80);
    }
    setError(null);
  }, [budgetToEdit, isOpen, budgets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);

    if (isNaN(limit) || limit <= 0) {
      setError('Please provide a valid monthly budget limit.');
      return;
    }

    if (budgetToEdit) {
      updateBudget({
        ...budgetToEdit,
        monthlyLimit: limit,
        alertThreshold,
      });
    } else {
      addBudget({
        category,
        monthlyLimit: limit,
        alertThreshold,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              {budgetToEdit ? `Edit ${budgetToEdit.category} Budget` : 'Set Category Budget'}
            </h3>
            <p className="text-xs text-slate-400">
              Establish monthly spending caps & warning alerts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Expense Category
            </label>
            <select
              disabled={Boolean(budgetToEdit)}
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 text-xs disabled:opacity-60"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Monthly Budget Limit ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                {currency}
              </span>
              <input
                type="number"
                step="10"
                required
                placeholder="500"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-base"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Warning Threshold
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
                {alertThreshold}% of limit
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Warn me when spending reaches {alertThreshold}% of this budget
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
