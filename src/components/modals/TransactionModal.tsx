import React, { useState, useEffect } from 'react';
import { X, Check, ArrowDownRight, ArrowUpRight, Calendar, Tag, CreditCard, Repeat, Building2, AlignLeft } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryType, PaymentMethod, Transaction, TransactionType } from '../../types/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORIES } from '../../data/categories';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
}) => {
  const { addTransaction, updateTransaction, currency } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('Food & Dining');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [recurring, setRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'yearly'>('monthly');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setTitle(transactionToEdit.title);
      setAmount(transactionToEdit.amount.toString());
      setCategory(transactionToEdit.category);
      setDate(transactionToEdit.date);
      setPaymentMethod(transactionToEdit.paymentMethod);
      setRecurring(Boolean(transactionToEdit.recurring));
      setRecurringFrequency(transactionToEdit.recurringFrequency || 'monthly');
      setMerchant(transactionToEdit.merchant || '');
      setNotes(transactionToEdit.notes || '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setCategory('Food & Dining');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('credit_card');
      setRecurring(false);
      setRecurringFrequency('monthly');
      setMerchant('');
      setNotes('');
    }
    setError(null);
  }, [transactionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!title.trim()) {
      setError('Please provide a title or description.');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (transactionToEdit) {
      updateTransaction({
        ...transactionToEdit,
        type,
        title: title.trim(),
        amount: parsedAmount,
        category,
        date,
        paymentMethod,
        recurring,
        recurringFrequency: recurring ? recurringFrequency : undefined,
        merchant: merchant.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addTransaction({
        type,
        title: title.trim(),
        amount: parsedAmount,
        category,
        date,
        paymentMethod,
        recurring,
        recurringFrequency: recurring ? recurringFrequency : undefined,
        merchant: merchant.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  const availableCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              {transactionToEdit ? 'Edit Transaction' : 'Record Transaction'}
            </h3>
            <p className="text-xs text-slate-400">
              Track your real-time expenses and cash flow
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Type Selector (Expense vs Income) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (!EXPENSE_CATEGORIES.includes(category)) setCategory('Food & Dining');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                if (!INCOME_CATEGORIES.includes(category)) setCategory('Salary');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              Income
            </button>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Amount ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                  {currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description / Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Trader Joe's Groceries, Tech Salary, Netflix"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer / ACH</option>
                <option value="apple_pay">Apple Pay / Google Pay</option>
                <option value="paypal">PayPal</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Merchant (Optional) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Merchant / Payee (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Whole Foods, Amazon, Uber"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Recurring Option */}
          <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-slate-900"
                />
                <span>Recurring Transaction</span>
              </label>
              {recurring && (
                <span className="text-[10px] text-emerald-400 font-mono">
                  Included in Cash-Flow Forecast
                </span>
              )}
            </div>

            {recurring && (
              <div className="pt-2 border-t border-slate-800/60 flex items-center gap-3">
                <span className="text-xs text-slate-400">Frequency:</span>
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value as any)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="Additional memo, tax tags, or receipt details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {transactionToEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
