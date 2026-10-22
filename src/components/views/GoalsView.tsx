import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Edit2,
  Trash2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Coins,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialGoal } from '../../types/finance';
import { GoalModal } from '../modals/GoalModal';
import { GoalActionModal } from '../modals/GoalActionModal';

export const GoalsView: React.FC = () => {
  const { goals, deleteGoal, formatMoney, metrics } = useFinance();

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<FinancialGoal | null>(null);

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionGoal, setActionGoal] = useState<FinancialGoal | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleOpenAction = (goal: FinancialGoal, type: 'deposit' | 'withdraw') => {
    setActionGoal(goal);
    setActionType(type);
    setActionModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Target className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Wealth Milestones
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Financial Goals & Savings Targets
          </h1>
          <p className="text-xs text-slate-400">
            Allocate surplus cash toward major life milestones and track completion timelines
          </p>
        </div>

        <button
          onClick={() => {
            setGoalToEdit(null);
            setGoalModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Target</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Goal Portfolio
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                {formatMoney(totalSaved)}
              </span>
              <span className="text-sm font-mono text-slate-400">
                of {formatMoney(totalTarget)} target
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-right">
              <div className="text-slate-400 text-[10px] uppercase font-sans">Active Targets</div>
              <div className="text-sm font-bold text-slate-200">
                {goals.length} goals
              </div>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-right">
              <div className="text-slate-400 text-[10px] uppercase font-sans">Monthly Surplus</div>
              <div className="text-sm font-bold text-emerald-400">
                +{formatMoney(metrics.netSavings)}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>{overallProgress.toFixed(1)}% achieved overall</span>
            <span className="text-cyan-400 font-semibold">
              {formatMoney(Math.max(0, totalTarget - totalSaved))} remaining
            </span>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          const isCompleted = goal.currentAmount >= goal.targetAmount;

          // Days and months remaining
          const now = new Date();
          const targetD = new Date(goal.targetDate);
          const daysLeft = Math.max(0, Math.ceil((targetD.getTime() - now.getTime()) / (1000 * 3600 * 24)));
          const monthsLeft = Math.max(1, daysLeft / 30.4);

          const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
          const requiredMonthly = remainingAmount / monthsLeft;

          // Feasibility check against user's actual monthly net savings
          const isFeasible = metrics.netSavings >= requiredMonthly;

          return (
            <div
              key={goal.id}
              className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-5 border border-slate-800 hover:border-slate-700 transition-colors relative overflow-hidden"
            >
              {isCompleted && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider font-mono">
                  Target Achieved! 🎉
                </div>
              )}

              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: goal.color }}
                    ></span>
                    <h3 className="font-bold text-base text-slate-100">{goal.title}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setGoalToEdit(goal);
                        setGoalModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Edit goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {goal.notes && (
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {goal.notes}
                  </p>
                )}

                {/* Amounts and Progress Bar */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-baseline justify-between font-mono">
                    <div className="text-xl font-extrabold text-slate-100">
                      {formatMoney(goal.currentAmount)}
                    </div>
                    <div className="text-xs text-slate-400">
                      Target: {formatMoney(goal.targetAmount)}
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: goal.color,
                        width: `${Math.min(100, progress)}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {progress.toFixed(1)}% saved
                    </span>
                    <span>
                      {isCompleted ? 'Goal reached' : `${formatMoney(remainingAmount)} remaining`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feasibility & Target Date Info */}
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Target Date:
                  </span>
                  <span className="font-mono text-slate-200">{goal.targetDate} ({daysLeft}d)</span>
                </div>

                {!isCompleted && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Required Pace:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatMoney(requiredMonthly)}/month
                    </span>
                  </div>
                )}

                {!isCompleted && (
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">AI Pace Feasibility:</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFeasible
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isFeasible ? '✓ On Track at Current Savings' : '⚠ Pacing Below Monthly Surplus'}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleOpenAction(goal, 'deposit')}
                  className="flex-1 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Deposit Funds</span>
                </button>
                <button
                  onClick={() => handleOpenAction(goal, 'withdraw')}
                  disabled={goal.currentAmount <= 0}
                  className="py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-40"
                >
                  Withdraw
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        goalToEdit={goalToEdit}
      />

      <GoalActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        goal={actionGoal}
        mode={actionType}
      />
    </div>
  );
};
