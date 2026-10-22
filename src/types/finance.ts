export type TransactionType = 'expense' | 'income';

export type CategoryType =
  | 'Housing'
  | 'Food & Dining'
  | 'Groceries'
  | 'Transportation'
  | 'Utilities'
  | 'Shopping'
  | 'Entertainment'
  | 'Health & Fitness'
  | 'Personal Care'
  | 'Investments'
  | 'Salary'
  | 'Freelance'
  | 'Other';

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'cash'
  | 'apple_pay'
  | 'paypal';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  amount: number;
  type: TransactionType;
  category: CategoryType;
  paymentMethod: PaymentMethod;
  recurring: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  merchant?: string;
  notes?: string;
}

export interface Budget {
  id: string;
  category: CategoryType;
  monthlyLimit: number;
  alertThreshold: number; // e.g. 80 for 80%
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: 'emergency' | 'travel' | 'investment' | 'purchase' | 'home' | 'other';
  color: string;
  notes?: string;
}

export interface SpendingLeak {
  category: string;
  title: string;
  detectedLeak: string;
  estimatedMonthlyLoss: number;
  actionableFix: string;
}

export interface SavingsOpportunity {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  strategy: string;
  description: string;
  potentialAnnualSavings: number;
}

export interface AIAnalysisResult {
  financialHealthScore: number;
  healthGrade: 'Excellent' | 'Good' | 'Fair' | 'Attention Needed';
  summary: string;
  spendingLeaks: SpendingLeak[];
  savingsOpportunities: SavingsOpportunity[];
  budgetRuleBreakdown: {
    needsPct: number;
    wantsPct: number;
    savingsPct: number;
    assessment: string;
  };
  positiveHighlights: string[];
  emergencyBufferMonths: number;
  analyzedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface CategoryMeta {
  name: CategoryType;
  color: string;
  bgColor: string;
  icon: string;
  isEssential: boolean; // For 50/30/20 needs vs wants
}
