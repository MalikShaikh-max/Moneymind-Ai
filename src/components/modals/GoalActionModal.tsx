import React, { useState } from 'react';
import { X, Plus, Minus, Check, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialGoal } from '../../types/finance';

interface GoalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoal | null;
  mode: 'deposit' | 'withdraw';
}

export const GoalActionModal: React.FC<GoalActionModalProps> = ({
  isOpen,
  onClose,
  goal,
  mode,
}) => {
  const { depositToGoal, withdrawFromGoal, currency, metrics, formatMoney } = useFinance();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  const remainingNeeded = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);

    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (mode === 'deposit') {
      if (val > metrics.totalBalance) {
        setError(`Insufficient cash balance (${formatMoney(metrics.totalBalance)} available).`);
        return;
      }
      depositToGoal(goal.id, val);
    } else {
      if (val > goal.currentAmount) {
        setError(`Cannot withdraw more than current saved amount (${formatMoney(goal.currentAmount)}).`);
        return;
      }
      withdrawFromGoal(goal.id, val);
    }

    onClose();
  };

  const quickAmounts = mode === 'deposit' ? [50, 100, 250, 500] : [50, 100, 200];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                mode === 'deposit'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {mode === 'deposit' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {mode === 'deposit' ? 'Add Funds to Goal' : 'Withdraw Funds from Goal'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {goal.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Goal Target:</span>
              <span className="font-mono text-slate-200">{formatMoney(goal.targetAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Currently Saved:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {formatMoney(goal.currentAmount)}
              </span>
            </div>
            {mode === 'deposit' && (
              <div className="flex justify-between text-slate-400">
                <span>Remaining Needed:</span>
                <span className="font-mono text-cyan-400">{formatMoney(remainingNeeded)}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Amount to {mode === 'deposit' ? 'Deposit' : 'Withdraw'} ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                {currency}
              </span>
              <input
                type="number"
                step="10"
                required
                autoFocus
                placeholder="100"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-base"
              />
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q.toString())}
                className="flex-1 py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-slate-100 text-xs font-mono transition-colors"
              >
                +{currency}{q}
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
                mode === 'deposit'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              }`}
            >
              <Check className="w-4 h-4" />
              Confirm {mode === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
