import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AIAnalysisResult,
  Budget,
  CategoryType,
  ChatMessage,
  FinancialGoal,
  Transaction,
} from '../types/finance';
import {
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_TRANSACTIONS,
  getCurrentMonthStr,
} from '../data/seedData';
import { EXPENSE_CATEGORIES } from '../data/categories';

export type CurrencySymbol = '$' | '€' | '£' | '¥' | 'C$' | 'A$';

export interface BudgetUtilization {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger' | 'over';
}

export interface FinanceMetrics {
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  netSavings: number;
  savingsRate: number;
  previousMonthIncome: number;
  previousMonthExpenses: number;
  incomeMoMChangePct: number;
  expenseMoMChangePct: number;
  categorySpending: Record<CategoryType, number>;
  budgetProgress: BudgetUtilization[];
  overBudgetCount: number;
  nearBudgetCount: number;
  recurringMonthlyCommitments: number;
}

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
  currency: CurrencySymbol;
  setCurrency: (c: CurrencySymbol) => void;
  formatMoney: (amount: number, compact?: boolean) => string;
  metrics: FinanceMetrics;
  
  // Transaction CRUD
  addTransaction: (tx: Omit<Transaction, 'id'>) => Transaction;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  importTransactions: (txs: Omit<Transaction, 'id'>[]) => number;
  
  // Budget CRUD
  updateBudget: (budget: Budget) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
  autoSuggestBudgets: () => void;

  // Goals CRUD
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateGoal: (goal: FinancialGoal) => void;
  deleteGoal: (id: string) => void;
  depositToGoal: (goalId: string, amount: number) => boolean;
  withdrawFromGoal: (goalId: string, amount: number) => boolean;

  // AI Analyst
  latestAIAnalysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  runSpendingAnalysis: () => Promise<AIAnalysisResult | null>;
  
  // Advisor Chat
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  sendAdvisorMessage: (question: string) => Promise<string | null>;
  clearChat: () => void;

  // Reset & Persistence
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'moneymind_transactions_v2',
  BUDGETS: 'moneymind_budgets_v2',
  GOALS: 'moneymind_goals_v2',
  ANALYSIS: 'moneymind_analysis_v2',
  CURRENCY: 'moneymind_currency_v2',
  INITIAL_CASH: 'moneymind_initial_cash_v2',
  CHAT: 'moneymind_chat_history_v2',
};

const BASE_STARTING_CASH = 14250.0; // Starting baseline cushion before loaded transactions

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization with localStorage fallback
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed reading transactions from localStorage:', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed reading budgets from localStorage:', e);
    }
    return INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed reading goals from localStorage:', e);
    }
    return INITIAL_GOALS;
  });

  const [currency, setCurrencyState] = useState<CurrencySymbol>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (stored) return stored as CurrencySymbol;
    } catch {}
    return '$';
  });

  const [latestAIAnalysis, setLatestAIAnalysis] = useState<AIAnalysisResult | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        text: "Hello! I'm your **MoneyMind AI Financial Copilot**. I have real-time access to your transactions, active budgets, and savings goals. Ask me anything about your spending leaks, upcoming cash flow, or whether you can afford your next big purchase!",
        timestamp: new Date().toISOString(),
      },
    ];
  });
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  }, [currency]);

  useEffect(() => {
    if (latestAIAnalysis) {
      localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(latestAIAnalysis));
    }
  }, [latestAIAnalysis]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
  }, [chatMessages]);

  const setCurrency = (c: CurrencySymbol) => {
    setCurrencyState(c);
  };

  const formatMoney = (amount: number, compact: boolean = false): string => {
    const isNegative = amount < 0;
    const abs = Math.abs(amount);

    if (compact && abs >= 1000) {
      const formatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      });
      return `${isNegative ? '-' : ''}${currency}${formatter.format(abs)}`;
    }

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(abs);

    return `${isNegative ? '-' : ''}${currency}${formatted}`;
  };

  // ---------------- METRICS COMPUTATION ----------------
  const metrics: FinanceMetrics = useMemo(() => {
    const currentMonthPrefix = getCurrentMonthStr(); // e.g. "2026-10"

    // Calculate previous month prefix e.g. "2026-09"
    const now = new Date();
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthPrefix = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    let totalNetDelta = 0;
    let curMonthInc = 0;
    let curMonthExp = 0;
    let prevMonthInc = 0;
    let prevMonthExp = 0;
    let recurringMonthly = 0;

    const catSpending: Record<CategoryType, number> = {
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

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const isCurMonth = tx.date.startsWith(currentMonthPrefix);
      const isPrevMonth = tx.date.startsWith(prevMonthPrefix);

      if (tx.type === 'income') {
        totalNetDelta += amt;
        if (isCurMonth) curMonthInc += amt;
        if (isPrevMonth) prevMonthInc += amt;
      } else {
        totalNetDelta -= amt;
        if (isCurMonth) {
          curMonthExp += amt;
          catSpending[tx.category] = (catSpending[tx.category] || 0) + amt;
        }
        if (isPrevMonth) prevMonthExp += amt;

        if (tx.recurring) {
          if (tx.recurringFrequency === 'weekly') recurringMonthly += amt * 4.33;
          else if (tx.recurringFrequency === 'biweekly') recurringMonthly += amt * 2.16;
          else if (tx.recurringFrequency === 'yearly') recurringMonthly += amt / 12;
          else recurringMonthly += amt; // monthly default
        }
      }
    });

    const netSavings = curMonthInc - curMonthExp;
    const savingsRate = curMonthInc > 0 ? Math.max(0, (netSavings / curMonthInc) * 100) : 0;

    // Month-over-month calculation
    const incomeMoMChangePct =
      prevMonthInc > 0 ? ((curMonthInc - prevMonthInc) / prevMonthInc) * 100 : 0;
    const expenseMoMChangePct =
      prevMonthExp > 0 ? ((curMonthExp - prevMonthExp) / prevMonthExp) * 100 : 0;

    // Budget Progress calculation
    let overCount = 0;
    let nearCount = 0;

    const budgetProgress: BudgetUtilization[] = budgets.map((b) => {
      const spent = catSpending[b.category] || 0;
      const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      const remaining = Math.max(0, b.monthlyLimit - spent);

      let status: 'safe' | 'warning' | 'danger' | 'over' = 'safe';
      if (percentage >= 100) {
        status = 'over';
        overCount++;
      } else if (percentage >= b.alertThreshold) {
        status = 'danger';
        nearCount++;
      } else if (percentage >= 65) {
        status = 'warning';
      }

      return {
        budget: b,
        spent,
        remaining,
        percentage,
        status,
      };
    });

    return {
      totalBalance: BASE_STARTING_CASH + totalNetDelta,
      currentMonthIncome: curMonthInc,
      currentMonthExpenses: curMonthExp,
      netSavings,
      savingsRate: Number(savingsRate.toFixed(1)),
      previousMonthIncome: prevMonthInc,
      previousMonthExpenses: prevMonthExp,
      incomeMoMChangePct: Number(incomeMoMChangePct.toFixed(1)),
      expenseMoMChangePct: Number(expenseMoMChangePct.toFixed(1)),
      categorySpending: catSpending,
      budgetProgress,
      overBudgetCount: overCount,
      nearBudgetCount: nearCount,
      recurringMonthlyCommitments: Number(recurringMonthly.toFixed(2)),
    };
  }, [transactions, budgets]);

  // ---------------- CRUD ACTIONS ----------------

  const addTransaction = (tx: Omit<Transaction, 'id'>): Transaction => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      amount: Number(tx.amount) || 0,
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const updateTransaction = (tx: Transaction) => {
    setTransactions((prev) => prev.map((item) => (item.id === tx.id ? tx : item)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  const importTransactions = (newTxs: Omit<Transaction, 'id'>[]): number => {
    const created: Transaction[] = newTxs.map((tx, idx) => ({
      ...tx,
      id: `tx-import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      amount: Number(tx.amount) || 0,
    }));
    setTransactions((prev) => [...created, ...prev]);
    return created.length;
  };

  const updateBudget = (budget: Budget) => {
    setBudgets((prev) => prev.map((b) => (b.id === budget.id ? budget : b)));
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newB: Budget = {
      ...budget,
      id: `b-${Date.now()}`,
    };
    setBudgets((prev) => [...prev, newB]);
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const autoSuggestBudgets = () => {
    // Computes recommended budgets based on average category spending + 15% buffer
    const updated = EXPENSE_CATEGORIES.map((cat) => {
      const existing = budgets.find((b) => b.category === cat);
      const spent = metrics.categorySpending[cat] || 0;
      const suggestedLimit = spent > 0 ? Math.ceil((spent * 1.15) / 10) * 10 : 200;

      if (existing) {
        return {
          ...existing,
          monthlyLimit: suggestedLimit,
        };
      }
      return {
        id: `b-${cat.toLowerCase().replace(/[^a-z]/g, '')}`,
        category: cat,
        monthlyLimit: suggestedLimit,
        alertThreshold: 80,
      };
    });
    setBudgets(updated);
  };

  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      currentAmount: Number(goal.currentAmount) || 0,
      targetAmount: Number(goal.targetAmount) || 1,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (goal: FinancialGoal) => {
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const depositToGoal = (goalId: string, amount: number): boolean => {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) return false;

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return {
            ...g,
            currentAmount: Math.min(g.targetAmount, g.currentAmount + num),
          };
        }
        return g;
      })
    );

    // Record an investment/savings transaction
    const targetGoal = goals.find((g) => g.id === goalId);
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      title: `Goal Allocation: ${targetGoal?.title || 'Savings Goal'}`,
      amount: num,
      type: 'expense',
      category: 'Investments',
      paymentMethod: 'bank_transfer',
      recurring: false,
      notes: `Allocated directly toward ${targetGoal?.title}`,
    });

    return true;
  };

  const withdrawFromGoal = (goalId: string, amount: number): boolean => {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) return false;

    let success = false;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId && g.currentAmount >= num) {
          success = true;
          return {
            ...g,
            currentAmount: g.currentAmount - num,
          };
        }
        return g;
      })
    );

    if (success) {
      const targetGoal = goals.find((g) => g.id === goalId);
      addTransaction({
        date: new Date().toISOString().split('T')[0],
        title: `Withdrawal from Goal: ${targetGoal?.title || 'Goal'}`,
        amount: num,
        type: 'income',
        category: 'Investments',
        paymentMethod: 'bank_transfer',
        recurring: false,
        notes: `Funds transferred back to cash reserve from ${targetGoal?.title}`,
      });
    }

    return success;
  };

  // ---------------- AI FINANCIAL ANALYST ----------------

  const runSpendingAnalysis = async (): Promise<AIAnalysisResult | null> => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const payload = {
        transactions: transactions.slice(0, 75),
        budgets,
        metrics: {
          monthlyIncome: metrics.currentMonthIncome,
          monthlyExpenses: metrics.currentMonthExpenses,
          netSavings: metrics.netSavings,
          savingsRate: metrics.savingsRate,
          totalBalance: metrics.totalBalance,
        },
      };

      const res = await fetch('/api/ai/analyze-spending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      if (data.analysis) {
        const result: AIAnalysisResult = {
          ...data.analysis,
          analyzedAt: new Date().toISOString(),
        };
        setLatestAIAnalysis(result);
        return result;
      }
      throw new Error('Analysis payload was incomplete.');
    } catch (err: any) {
      console.error('Failed running spending analysis:', err);
      setAnalysisError(err.message || 'Unable to connect to financial intelligence service.');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendAdvisorMessage = async (question: string): Promise<string | null> => {
    if (!question.trim()) return null;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: question.trim(),
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const financialContext = {
        balance: metrics.totalBalance,
        monthlyIncome: metrics.currentMonthIncome,
        monthlyExpenses: metrics.currentMonthExpenses,
        topCategories: Object.entries(metrics.categorySpending)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([k, v]) => ({ category: k, spent: v })),
        goals: goals.map((g) => ({
          title: g.title,
          target: g.targetAmount,
          current: g.currentAmount,
          progressPct: Math.round((g.currentAmount / g.targetAmount) * 100),
        })),
        overBudgets: metrics.budgetProgress
          .filter((b) => b.percentage >= 100)
          .map((b) => ({ category: b.budget.category, overBy: b.spent - b.budget.monthlyLimit })),
        recentTransactions: transactions.slice(0, 10).map((t) => ({
          date: t.date,
          title: t.title,
          amount: t.amount,
          type: t.type,
          category: t.category,
        })),
      };

      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, financialContext }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Advisor service unavailable.');
      }

      const data = await res.json();
      const assistantText = data.answer || "I couldn't process your financial question right now.";

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: assistantText,
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
      return assistantText;
    } catch (err: any) {
      console.error('Advisor chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 2}`,
        role: 'assistant',
        text: `⚠️ **Error:** ${err.message || 'Failed to contact AI advisor.'}. Please check connection or try again.`,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
      return null;
    } finally {
      setIsChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: 'msg-welcome-new',
        role: 'assistant',
        text: 'Chat history cleared. How can I assist your wealth strategy today?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const resetToDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setGoals(INITIAL_GOALS);
    setLatestAIAnalysis(null);
    clearChat();
  };

  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setLatestAIAnalysis(null);
    clearChat();
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        goals,
        currency,
        setCurrency,
        formatMoney,
        metrics,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        importTransactions,
        updateBudget,
        addBudget,
        deleteBudget,
        autoSuggestBudgets,
        addGoal,
        updateGoal,
        deleteGoal,
        depositToGoal,
        withdrawFromGoal,
        latestAIAnalysis,
        isAnalyzing,
        analysisError,
        runSpendingAnalysis,
        chatMessages,
        isChatLoading,
        sendAdvisorMessage,
        clearChat,
        resetToDemoData,
        clearAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
