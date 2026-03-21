import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, Target, TrendingDown, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BudgetsView({ isDarkMode }: { isDarkMode: boolean }) {
  const { budgets, transactions, addBudget, deleteBudget, seedSampleData } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ 
    category: 'Food', 
    limit: '',
    thresholds: [75, 90, 100]
  });
  const [isSeeding, setIsSeeding] = useState(false);

  const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

  const categories = [
    { name: 'Food', emoji: '🍔' },
    { name: 'Transport', emoji: '🚗' },
    { name: 'Entertainment', emoji: '🎬' },
    { name: 'Shopping', emoji: '🛍️' },
    { name: 'Health', emoji: '🏥' },
    { name: 'Bills', emoji: '🧾' },
    { name: 'Education', emoji: '🎓' },
    { name: 'Other', emoji: '📦' }
  ];

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBudget({
      category: formData.category,
      limit: parseFloat(formData.limit),
      month: currentMonth,
      thresholds: formData.thresholds
    });
    setShowAddModal(false);
    setFormData({ category: 'Food', limit: '', thresholds: [75, 90, 100] });
  };

  const toggleThreshold = (val: number) => {
    setFormData(prev => ({
      ...prev,
      thresholds: prev.thresholds.includes(val)
        ? prev.thresholds.filter(t => t !== val)
        : [...prev.thresholds, val].sort((a, b) => a - b)
    }));
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    await seedSampleData();
    setIsSeeding(false);
  };

  const getSpendingForCategory = (category: string) => {
    return Math.abs(transactions
      .filter(t => t.category === category && t.amount < 0 && t.date.includes(currentMonth.split(' ')[0]))
      .reduce((acc, t) => acc + t.amount, 0));
  };

  const overBudgets = budgets.filter(b => getSpendingForCategory(b.category) >= b.limit);
  const nearBudgets = budgets.filter(b => {
    const spending = getSpendingForCategory(b.category);
    const percentage = (spending / b.limit) * 100;
    const thresholds = b.thresholds || [80, 100];
    const lowestThreshold = Math.min(...thresholds);
    return percentage >= lowestThreshold && percentage < 100;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold">Monthly Budgets</h2>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Manage spending for {currentMonth}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/40 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Set Budget</span>
        </button>
      </div>

      {/* Alerts Summary */}
      {(overBudgets.length > 0 || nearBudgets.length > 0) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`p-4 rounded-2xl border ${
            overBudgets.length > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${overBudgets.length > 0 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
              <TrendingDown size={20} />
            </div>
            <div>
              <h3 className={`font-bold ${overBudgets.length > 0 ? 'text-red-500' : 'text-amber-500'}`}>
                {overBudgets.length > 0 ? 'Budget Overrun Alert' : 'Budget Warning'}
              </h3>
              <p className="text-sm text-gray-500">
                {overBudgets.length > 0 
                  ? `You have exceeded your budget in ${overBudgets.length} categories.`
                  : `You are close to reaching your limit in ${nearBudgets.length} categories.`}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {budgets.map((budget) => {
          const spending = getSpendingForCategory(budget.category);
          const percent = Math.min((spending / budget.limit) * 100, 100);
          const isOver = spending > budget.limit;

          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-8 rounded-[2rem] border flex flex-col gap-6 transition-all duration-500 card-shadow card-shadow-hover group",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-4 rounded-2xl shadow-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110",
                    isDarkMode ? "bg-zinc-800 text-blue-400" : "bg-blue-50 text-blue-500"
                  )}>
                    <PieChart size={24} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold">
                      {categories.find(c => c.name === budget.category)?.emoji || '💰'} {budget.category}
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Limit: ₹{budget.limit.toLocaleString()}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      {(budget.thresholds || [80, 100]).map(t => (
                        <span key={t} className="text-[8px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 font-bold tracking-widest">
                          {t}%
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteBudget(budget.id)}
                  className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Spent</span>
                    <span className="text-xl font-bold">₹{spending.toLocaleString()}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest",
                    isOver ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {isOver ? 'Over Budget' : `${Math.round(100 - percent)}% Left`}
                  </span>
                </div>
                <div className={cn(
                  "h-3 rounded-full overflow-hidden",
                  isDarkMode ? "bg-zinc-800" : "bg-zinc-100"
                )}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    className={cn(
                      "h-full rounded-full shadow-lg transition-all duration-1000",
                      isOver ? "bg-red-500 shadow-red-500/40" : percent > 80 ? "bg-amber-500 shadow-amber-500/40" : "bg-blue-500 shadow-blue-500/40"
                    )}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}

        {budgets.length === 0 && (
          <div className={`col-span-full p-12 text-center rounded-2xl border-2 border-dashed ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <PieChart size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Budgets Set</h3>
            <p className="text-gray-500 mb-6">Set monthly limits for your spending categories to stay on track.</p>
            <button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              {isSeeding ? 'Seeding...' : 'Seed All Sample Data'}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative overflow-hidden",
                isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
              )}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">Set Category Budget</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddBudget} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                      isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                    )}
                  >
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Monthly Limit (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    placeholder="e.g. 5000"
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                      isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Notification Thresholds</label>
                  <div className="flex flex-wrap gap-2">
                    {[50, 75, 80, 90, 100].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleThreshold(t)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                          formData.thresholds.includes(t)
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                            : isDarkMode ? "bg-zinc-800 text-zinc-500" : "bg-zinc-100 text-zinc-400"
                        )}
                      >
                        {t}%
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium italic">
                    You will receive alerts when spending reaches these percentages.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={cn(
                      "flex-1 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all",
                      isDarkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    Save Budget
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
