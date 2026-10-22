import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  BrainCircuit,
  PieChart,
  TrendingUp,
  Target,
  BarChart3,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export type NavTab =
  | 'dashboard'
  | 'transactions'
  | 'analyst'
  | 'budgets'
  | 'forecast'
  | 'goals'
  | 'reports';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { metrics, latestAIAnalysis } = useFinance();

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number | null;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ReceiptText,
    },
    {
      id: 'analyst',
      label: 'AI Analyst',
      icon: BrainCircuit,
      badge: latestAIAnalysis ? `${latestAIAnalysis.financialHealthScore}/100` : 'New',
      badgeColor: latestAIAnalysis ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400',
    },
    {
      id: 'budgets',
      label: 'Smart Budgets',
      icon: PieChart,
      badge: metrics.overBudgetCount > 0 ? metrics.overBudgetCount : metrics.nearBudgetCount > 0 ? '!' : null,
      badgeColor: metrics.overBudgetCount > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400',
    },
    {
      id: 'forecast',
      label: 'Cash Flow Forecast',
      icon: TrendingUp,
    },
    {
      id: 'goals',
      label: 'Financial Goals',
      icon: Target,
    },
    {
      id: 'reports',
      label: 'Reports & Trends',
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/40 p-4 space-y-6">
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
            Navigation
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Health Status Card in Sidebar */}
        <div className="mt-auto p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Wealth Health
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              {metrics.savingsRate}% Saved
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(10, metrics.savingsRate * 2.5))}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            {metrics.netSavings >= 0 ? 'Cash flow positive this month' : 'Cash flow negative this month'}
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Dock */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium mt-0.5 max-w-[48px] truncate">
                {item.label}
              </span>
              {item.badge && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
