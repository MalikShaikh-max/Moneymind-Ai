import React from 'react';
import {
  Sparkles,
  Plus,
  SlidersHorizontal,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useFinance, CurrencySymbol } from '../../context/FinanceContext';

interface NavbarProps {
  onOpenAddTransaction: () => void;
  onOpenSettings: () => void;
  onRunAiAnalysis: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddTransaction,
  onOpenSettings,
  onRunAiAnalysis,
}) => {
  const { metrics, currency, setCurrency, formatMoney, isAnalyzing } = useFinance();

  const currencies: CurrencySymbol[] = ['$', '€', '£', '¥', 'C$', 'A$'];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)] shrink-0">
            <span className="font-mono font-extrabold text-slate-950 text-xl tracking-tighter">
              M
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-100">
                MoneyMind
              </span>
              <span className="text-xs font-extrabold font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
              Intelligent Wealth Copilot
            </p>
          </div>
        </div>

        {/* Center / Balance Preview Badge */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-left font-mono">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              Total Cash Balance
            </div>
            <div className="text-sm font-bold text-slate-100">
              {formatMoney(metrics.totalBalance)}
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800 mx-1"></div>
          {/* Quick Currency Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-xs font-mono font-semibold text-slate-300 hover:text-emerald-400 px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-800 transition-colors">
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-1 z-50 min-w-[70px]">
              {currencies.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-1 text-xs text-left rounded font-mono ${
                    currency === c ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Run AI Analysis Action */}
          <button
            onClick={onRunAiAnalysis}
            disabled={isAnalyzing}
            className="relative group px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)] disabled:opacity-50"
          >
            <Sparkles
              className={`w-4 h-4 text-emerald-400 transition-transform ${
                isAnalyzing ? 'animate-spin' : 'group-hover:rotate-12'
              }`}
            />
            <span className="hidden sm:inline">
              {isAnalyzing ? 'Analyzing...' : 'AI Financial Audit'}
            </span>
            <span className="sm:hidden">Audit</span>
          </button>

          {/* Record Transaction Button */}
          <button
            onClick={onOpenAddTransaction}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_16px_rgba(16,185,129,0.35)] shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* Settings / Preferences Button */}
          <button
            onClick={onOpenSettings}
            title="Settings & Data Management"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
