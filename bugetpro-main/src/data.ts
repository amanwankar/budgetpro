import { 
  LayoutDashboard, 
  Wallet, 
  BarChart3, 
  HelpCircle, 
  Info,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Target,
  Settings as SettingsIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  Landmark,
  User
} from 'lucide-react';

export const SUMMARY_CARDS = [
  { title: 'Total Balance', amount: '₹1,45,000.00', change: '+15.4%', trend: 'up', color: 'bg-blue-500', icon: Wallet },
  { title: 'Income', amount: '₹95,000.00', change: '+8.2%', trend: 'up', color: 'bg-emerald-500', icon: TrendingUp },
  { title: 'Expense', amount: '₹32,814.00', change: '-2.5%', trend: 'down', color: 'bg-red-500', icon: TrendingDown },
  { title: 'Total Savings', amount: '₹4,10,000.00', change: '+5.8%', trend: 'up', color: 'bg-blue-600', icon: Target },
];

export const CHART_DATA = [
  { name: 'Jan', income: 45000, expense: 32000 },
  { name: 'Feb', income: 52000, expense: 38000 },
  { name: 'Mar', income: 48000, expense: 35000 },
  { name: 'Apr', income: 55000, expense: 42000 },
  { name: 'May', income: 60000, expense: 45000 },
  { name: 'Jun', income: 58000, expense: 40000 },
  { name: 'Jul', income: 62000, expense: 48000 },
  { name: 'Aug', income: 65000, expense: 50000 },
  { name: 'Sep', income: 70000, expense: 52000 },
  { name: 'Oct', income: 72000, expense: 55000 },
  { name: 'Nov', income: 75000, expense: 58000 },
  { name: 'Dec', income: 80000, expense: 60000 },
];

export const TRANSACTIONS = [
  { id: 1, date: '12 Apr 1:00', amount: -7.99, name: 'YouTube', method: 'PayPal', category: 'Subscription', status: 'Completed' },
  { id: 2, date: '8 Apr 18:00', amount: -12.99, name: 'McDonald', method: 'Visa **1234', category: 'Food', status: 'Completed' },
  { id: 3, date: '8 Apr 15:00', amount: -159.99, name: 'Amazon', method: 'Visa **1234', category: 'Shopping', status: 'Completed' },
  { id: 4, date: '7 Apr 10:00', amount: 2500.00, name: 'Salary', method: 'Direct Deposit', category: 'Income', status: 'Completed' },
  { id: 5, date: '6 Apr 09:00', amount: -45.00, name: 'Shell Gas', method: 'MasterCard', category: 'Transport', status: 'Completed' },
  { id: 6, date: '5 Apr 20:00', amount: -80.00, name: 'Netflix', method: 'PayPal', category: 'Subscription', status: 'Completed' },
  { id: 7, date: '4 Apr 12:00', amount: -120.00, name: 'Walmart', method: 'Visa **1234', category: 'Groceries', status: 'Completed' },
  { id: 8, date: '3 Apr 14:00', amount: -50.00, name: 'Starbucks', method: 'UPI', category: 'Food', status: 'Completed' },
  { id: 9, date: '2 Apr 11:00', amount: -200.00, name: 'Apple Store', method: 'Credit Card', category: 'Shopping', status: 'Completed' },
  { id: 10, date: '1 Apr 09:00', amount: 1500.00, name: 'Freelance', method: 'Bank Transfer', category: 'Income', status: 'Completed' },
];

export const CATEGORY_DATA = [
  { name: 'Food', value: 400, color: '#10b981' },
  { name: 'Shopping', value: 300, color: '#3b82f6' },
  { name: 'Transport', value: 200, color: '#f59e0b' },
  { name: 'Subscription', value: 100, color: '#8b5cf6' },
  { name: 'Groceries', value: 150, color: '#ec4899' },
];

export const GOALS = [
  { id: 1, name: 'MacBook Pro', target: 750, current: 225, progress: 30, deadline: 'Dec 2026' },
  { id: 2, name: 'New Car', target: 20000, current: 14600, progress: 73, deadline: 'Jun 2027' },
  { id: 3, name: 'iPhone 16 Pro Max', target: 1080, current: 972, progress: 90, deadline: 'Apr 2026' },
  { id: 4, name: 'Emergency Fund', target: 5000, current: 2500, progress: 50, deadline: 'Jan 2027' },
];

export const SIDEBAR_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Transactions', icon: ArrowUpRight },
  { name: 'Statistics', icon: PieChartIcon },
  { name: 'Budgets', icon: BarChart3 },
  { name: 'Investments', icon: Landmark },
  { name: 'Goals', icon: Target },
  { name: 'Profile', icon: User },
  { name: 'Settings', icon: SettingsIcon },
  { name: 'Help', icon: HelpCircle },
];
