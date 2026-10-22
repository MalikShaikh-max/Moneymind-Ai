import React, { useState, useEffect } from 'react';
import { X, Check, Target } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialGoal } from '../../types/finance';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: FinancialGoal | null;
}

const GOAL_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addGoal, updateGoal, currency } = useFinance();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<FinancialGoal['category']>('emergency');
  const [color, setColor] = useState('#10b981');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setTargetAmount(goalToEdit.targetAmount.toString());
      setCurrentAmount(goalToEdit.currentAmount.toString());
      setTargetDate(goalToEdit.targetDate);
      setCategory(goalToEdit.category);
      setColor(goalToEdit.color);
      setNotes(goalToEdit.notes || '');
    } else {
      // Default 6 months in future
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate(d.toISOString().split('T')[0]);
      setCategory('emergency');
      setColor('#10b981');
      setNotes('');
    }
    setError(null);
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;

    if (!title.trim()) {
      setError('Please provide a goal title.');
      return;
    }

    if (isNaN(target) || target <= 0) {
      setError('Target amount must be greater than 0.');
      return;
    }

    if (goalToEdit) {
      updateGoal({
        ...goalToEdit,
        title: title.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate,
        category,
        color,
        notes: notes.trim() || undefined,
      });
    } else {
      addGoal({
        title: title.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate,
        category,
        color,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {goalToEdit ? 'Edit Financial Goal' : 'Create New Savings Goal'}
              </h3>
              <p className="text-xs text-slate-400">
                Define savings milestones and target timelines
              </p>
            </div>
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
              Goal Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 6-Month Emergency Fund, Japan Trip, Home Downpayment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Amount ({currency})
              </label>
              <input
                type="number"
                step="100"
                required
                placeholder="10000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Initial Saved Amount ({currency})
              </label>
              <input
                type="number"
                step="50"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Date
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="emergency">Emergency Fund</option>
                <option value="travel">Vacation & Travel</option>
                <option value="home">Home & Real Estate</option>
                <option value="investment">Wealth & Investments</option>
                <option value="purchase">Large Purchase</option>
                <option value="other">Other Goal</option>
              </select>
            </div>
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Goal Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Why this goal matters, account held at, or milestone strategy..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500 resize-none"
            />
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
              {goalToEdit ? 'Update Goal' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
