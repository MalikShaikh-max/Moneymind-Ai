import { CategoryMeta, CategoryType } from '../types/finance';

export const CATEGORIES: Record<CategoryType, CategoryMeta> = {
  Housing: {
    name: 'Housing',
    color: '#3b82f6', // blue
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: 'Home',
    isEssential: true,
  },
  'Food & Dining': {
    name: 'Food & Dining',
    color: '#f97316', // orange
    bgColor: 'rgba(249, 115, 22, 0.15)',
    icon: 'UtensilsCrossed',
    isEssential: false,
  },
  Groceries: {
    name: 'Groceries',
    color: '#10b981', // emerald
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: 'ShoppingBag',
    isEssential: true,
  },
  Transportation: {
    name: 'Transportation',
    color: '#06b6d4', // cyan
    bgColor: 'rgba(6, 182, 212, 0.15)',
    icon: 'Car',
    isEssential: true,
  },
  Utilities: {
    name: 'Utilities',
    color: '#8b5cf6', // purple
    bgColor: 'rgba(139, 92, 246, 0.15)',
    icon: 'Zap',
    isEssential: true,
  },
  Shopping: {
    name: 'Shopping',
    color: '#ec4899', // pink
    bgColor: 'rgba(236, 72, 153, 0.15)',
    icon: 'ShoppingBag',
    isEssential: false,
  },
  Entertainment: {
    name: 'Entertainment',
    color: '#a855f7', // purple-500
    bgColor: 'rgba(168, 85, 247, 0.15)',
    icon: 'Tv',
    isEssential: false,
  },
  'Health & Fitness': {
    name: 'Health & Fitness',
    color: '#14b8a6', // teal
    bgColor: 'rgba(20, 184, 166, 0.15)',
    icon: 'Activity',
    isEssential: true,
  },
  'Personal Care': {
    name: 'Personal Care',
    color: '#f43f5e', // rose
    bgColor: 'rgba(244, 63, 94, 0.15)',
    icon: 'Sparkles',
    isEssential: false,
  },
  Investments: {
    name: 'Investments',
    color: '#eab308', // amber
    bgColor: 'rgba(234, 179, 8, 0.15)',
    icon: 'TrendingUp',
    isEssential: false,
  },
  Salary: {
    name: 'Salary',
    color: '#22c55e', // green
    bgColor: 'rgba(34, 197, 94, 0.15)',
    icon: 'Briefcase',
    isEssential: true,
  },
  Freelance: {
    name: 'Freelance',
    color: '#10b981', // emerald
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: 'Laptop',
    isEssential: true,
  },
  Other: {
    name: 'Other',
    color: '#64748b', // slate
    bgColor: 'rgba(100, 116, 139, 0.15)',
    icon: 'Layers',
    isEssential: false,
  },
};

export const EXPENSE_CATEGORIES: CategoryType[] = [
  'Housing',
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Health & Fitness',
  'Personal Care',
  'Investments',
  'Other',
];

export const INCOME_CATEGORIES: CategoryType[] = [
  'Salary',
  'Freelance',
  'Investments',
  'Other',
];
