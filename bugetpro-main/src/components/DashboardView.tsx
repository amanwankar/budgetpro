import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Wallet, TrendingUp, TrendingDown, Target, Edit2, Check, ArrowUpRight, ArrowDownLeft, X, Plus, Database, RefreshCw, Zap, ShieldCheck, PiggyBank, CreditCard, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardView({ isDarkMode }: { isDarkMode: boolean }) {
  const { 
    transactions, 
    goals, 
    gullakPots,
    investments,
    chartData, 
    totalBalance, 
    totalIncome, 
    totalExpense, 
    totalSavings,
    addGoal,
    addTransaction,
    updateBalance,
    updateIncome,
    updateExpense,
    updateSavings,
    seedSampleData
  } = useFinance();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: '', target: '', current: '', deadline: '', emoji: '🎯' });
  const [txForm, setTxForm] = useState({ name: '', amount: '', category: 'Food', method: 'UPI', status: 'Completed', date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) });
  
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncStep, setSyncStep] = useState(0);

  const startSyncProcess = async () => {
    setSyncStep(1); // Connecting
    await new Promise(r => setTimeout(r, 1500));
    setSyncStep(2); // Fetching UPI Transactions
    await new Promise(r => setTimeout(r, 2000));
    
    // Auto-Add new sync transactions
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    
    await addTransaction({
      name: 'PhonePe - Starbucks',
      amount: -350,
      category: 'Food',
      method: 'UPI',
      status: 'Completed',
      date: today
    });
    
    await addTransaction({
      name: 'Amazon Pay - Jio Recharge',
      amount: -749,
      category: 'Bills',
      method: 'UPI',
      status: 'Completed',
      date: today
    });

    setSyncStep(3); // Success!
    setTimeout(() => {
      setShowSyncModal(false);
      setSyncStep(0);
    }, 2500);
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    await addGoal({
      name: `${goalForm.emoji} ${goalForm.name}`,
      target: parseFloat(goalForm.target),
      current: parseFloat(goalForm.current) || 0,
      deadline: goalForm.deadline
    });
    setShowAddGoalModal(false);
    setGoalForm({ name: '', target: '', current: '', deadline: '', emoji: '🎯' });
  };

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTransaction({
      ...txForm,
      amount: txForm.category === 'Income' ? parseFloat(txForm.amount) : -parseFloat(txForm.amount)
    });
    setShowAddTxModal(false);
    setTxForm({ name: '', amount: '', category: 'Food', method: 'UPI', status: 'Completed', date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) });
  };

  const cards = [
    { title: 'Total Balance', amount: totalBalance, update: updateBalance, change: '+12.1%', trend: 'up', color: 'bg-blue-500', icon: Wallet },
    { title: 'Income', amount: totalIncome, update: updateIncome, change: '-1.1%', trend: 'down', color: 'bg-emerald-500', icon: TrendingUp },
    { title: 'Expense', amount: totalExpense, update: updateExpense, change: '+2.5%', trend: 'up', color: 'bg-red-500', icon: TrendingDown },
    { title: 'Total Savings', amount: totalSavings, update: updateSavings, change: '+2.8%', trend: 'up', color: 'bg-blue-600', icon: Target },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className={cn(
          "text-sm font-bold uppercase tracking-widest",
          isDarkMode ? "text-zinc-500" : "text-zinc-400"
        )}>Financial Overview</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => seedSampleData()}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              isDarkMode ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            )}
            title="Seed Sample Data"
          >
            <Database size={16} /> Seed Data
          </button>
          <button 
            onClick={() => setShowSyncModal(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all relative overflow-hidden group border",
              isDarkMode ? "bg-zinc-800 text-purple-400 border-purple-500/20 hover:border-purple-500/50" : "bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-300"
            )}
            title="Auto-Sync UPI Devices"
          >
            <Zap size={16} className="text-purple-500" /> Auto-Sync UPI
          </button>
          <button 
            onClick={() => setShowAddTxModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all"
          >
            <Plus size={16} /> Add Transaction
          </button>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              isEditing 
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                : isDarkMode ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            )}
          >
            {isEditing ? <><Check size={16} /> Done</> : <><Edit2 size={16} /> Customize</>}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className={cn(
              "p-7 rounded-[2rem] border flex flex-col gap-5 relative overflow-hidden group card-shadow card-shadow-hover",
              isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
            )}
          >
            {/* Background Accent */}
            <div className={cn(
              "absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.08] blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-20",
              card.color
            )} />

            <div className="flex items-center justify-between relative z-10">
              <span className={cn(
                "text-xs font-bold uppercase tracking-widest opacity-60",
                isDarkMode ? "text-zinc-400" : "text-zinc-500"
              )}>{card.title}</span>
              <div className={cn(
                "p-3 rounded-2xl text-white shadow-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110",
                card.color
              )}>
                <card.icon size={20} />
              </div>
            </div>

            <div className="flex flex-col gap-1 relative z-10">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold">₹</span>
                  <input 
                    type="number"
                    value={card.amount}
                    onChange={(e) => card.update(parseFloat(e.target.value) || 0)}
                    className={cn(
                      "w-full bg-transparent border-b-2 border-blue-500/30 outline-none text-2xl font-bold focus:border-blue-500 transition-all",
                      isDarkMode ? "text-white" : "text-zinc-900"
                    )}
                  />
                </div>
              ) : (
                <span className="text-3xl font-bold">₹{card.amount.toLocaleString()}</span>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  "text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider",
                  card.trend === 'up' 
                    ? "bg-emerald-500/10 text-emerald-500" 
                    : "bg-red-500/10 text-red-500"
                )}>
                  {card.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                  {card.change}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">vs last month</span>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Yearly Overview Chart */}
      <section className={cn(
        "p-10 rounded-[2.5rem] border flex flex-col gap-8 transition-all duration-500 card-shadow hover:shadow-2xl hover:border-blue-500/20",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">Yearly Overview</h2>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Income vs Expenses performance</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow-xl shadow-blue-500/40"></div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Income</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/40"></div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Expense</span>
            </div>
          </div>
        </div>
        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#27272a" : "#f4f4f5"} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip 
                cursor={{ fill: '#3b82f6', fillOpacity: 0.1 }}
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                  borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '12px'
                }}
                itemStyle={{ padding: '2px 0' }}
              />
              <Bar 
                dataKey="income" 
                fill="url(#incomeGradient)" 
                radius={[6, 6, 0, 0]} 
                barSize={20}
                animationDuration={1500}
              />
              <Bar 
                dataKey="expense" 
                fill="url(#expenseGradient)" 
                radius={[6, 6, 0, 0]} 
                barSize={20}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8">
        <section className={cn(
          "p-8 rounded-3xl border flex flex-col gap-6 transition-all duration-300 hover:shadow-2xl",
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        )}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recent transactions</h2>
            <button className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={cn(
                  "text-left text-[11px] uppercase tracking-wider font-bold",
                  isDarkMode ? "text-zinc-500" : "text-zinc-400"
                )}>
                  <th className="pb-4 px-4 py-2">Date</th>
                  <th className="pb-4 px-4 py-2">Amount</th>
                  <th className="pb-4 px-4 py-2">Payment Name</th>
                  <th className="pb-4 px-4 py-2">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800 divide-zinc-100">
                {transactions.slice(0, 5).map((tx, i) => (
                  <tr key={tx.id} className="group hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all duration-200 cursor-pointer">
                    <td className="py-4 px-4 text-xs font-medium text-zinc-500">{tx.date}</td>
                    <td className={cn(
                      "py-4 px-4 text-xs font-bold",
                      tx.amount < 0 ? "text-zinc-900 dark:text-white" : "text-emerald-500"
                    )}>{tx.amount < 0 ? `-₹${Math.abs(tx.amount).toLocaleString()}` : `+₹${tx.amount.toLocaleString()}`}</td>
                    <td className="py-4 px-4 text-xs font-bold group-hover:text-blue-500 transition-colors">{tx.name}</td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-lg",
                        isDarkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                      )}>{tx.category}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        <section className={cn(
          "p-8 rounded-3xl border flex flex-col gap-6 transition-all duration-300 hover:shadow-2xl",
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        )}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Saving Goals</h2>
            <button 
              onClick={() => setShowAddGoalModal(true)}
              className="text-xs font-bold text-blue-500 hover:text-blue-600"
            >
              Add New
            </button>
          </div>
          <div className="flex flex-col gap-6">
            {goals.slice(0, 3).map((goal, i) => (
              <div key={goal.id} className="flex flex-col gap-2 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold group-hover:text-blue-500 transition-colors">{goal.name}</span>
                  <span className="text-xs font-bold text-zinc-500">₹{goal.target.toLocaleString()}</span>
                </div>
                <div className="h-6 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    className={cn(
                      "h-full flex items-center justify-center transition-all duration-500",
                      goal.progress > 80 ? "bg-emerald-500" : goal.progress > 40 ? "bg-blue-500" : "bg-amber-500"
                    )}
                  >
                    <span className="text-[9px] font-bold text-white shadow-sm">{goal.progress}%</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={cn(
          "p-8 rounded-3xl border flex flex-col gap-6 transition-all duration-300 hover:shadow-2xl",
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        )}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Gullak Pots</h2>
            <button className="text-xs font-bold text-blue-500 hover:text-blue-600">Save More</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {gullakPots.slice(0, 2).map((pot, i) => {
              const potProgress = Math.round((pot.current / pot.target) * 100);
              return (
              <motion.div 
                key={pot.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-5 rounded-3xl relative overflow-hidden group cursor-pointer border hover:border-blue-500/50 transition-all",
                  isDarkMode ? "bg-zinc-800/50 border-zinc-700/50" : "bg-zinc-50 border-zinc-100"
                )}
              >
                <div className={cn("absolute inset-0 opacity-[0.05] bg-gradient-to-br", pot.color)} />
                <div className="flex flex-col gap-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{pot.emoji}</span>
                    <span className="text-xs font-black px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">{potProgress}%</span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className={cn("font-bold tracking-tight truncate", isDarkMode ? "text-white" : "text-zinc-900")}>{pot.name}</h4>
                    <span className="text-xs font-bold text-zinc-500">₹{pot.current.toLocaleString()} saved</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mt-1">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${potProgress}%` }}
                      className={cn("h-full bg-gradient-to-r", pot.color)}
                    />
                  </div>
                </div>
              </motion.div>
            )})}
          </div>
        </section>
      </div>

      {/* Active Investments section */}
      <div className="flex items-center justify-between mt-4">
        <h2 className={cn(
          "text-sm font-bold uppercase tracking-widest",
          isDarkMode ? "text-zinc-500" : "text-zinc-400"
        )}>Active Obligations & Investments</h2>
        <button className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors">Manage All</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {investments.slice(0, 4).map((inv, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={inv.id}
            className={cn(
              "p-6 rounded-[2rem] border flex flex-col gap-4 relative overflow-hidden group transition-all hover:shadow-2xl",
              isDarkMode ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-100 hover:border-zinc-300"
            )}
          >
            <div className="flex items-center justify-between z-10">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                inv.type === 'EMI' ? isDarkMode ? "bg-red-500/10 text-red-500" : "bg-red-50 text-red-500" : 
                isDarkMode ? "bg-emerald-500/10 text-emerald-500" : "bg-emerald-50 text-emerald-500"
              )}>{inv.type}</span>
              <div className={cn(
                "p-2.5 rounded-xl text-white shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3",
                inv.type === 'EMI' ? "bg-red-500" : inv.type === 'SIP' ? "bg-purple-500" : inv.type === 'FD' ? "bg-blue-500" : "bg-emerald-500"
              )}>
                {inv.type === 'EMI' ? <CreditCard size={18} /> : inv.type === 'FD' ? <PiggyBank size={18} /> : inv.type === 'RD' ? <Clock size={18} /> : <TrendingUp size={18} />}
              </div>
            </div>
            
            <div className="flex flex-col z-10 mt-2">
              <h3 className={cn("text-base font-bold tracking-tight", isDarkMode ? "text-white" : "text-zinc-900")}>{inv.name}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black tracking-tight">₹{inv.amount.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12} /> {inv.dueDate}
                </p>
                {inv.interestRate && <span className="text-[10px] font-black text-emerald-500 uppercase">+{inv.interestRate}% APR</span>}
              </div>
            </div>
            
            {/* Background Accent */}
            <div className={cn(
              "absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-[0.03] blur-3xl group-hover:scale-150 transition-all duration-700",
              inv.type === 'EMI' ? "bg-red-500" : inv.type === 'SIP' ? "bg-purple-500" : inv.type === 'FD' ? "bg-blue-500" : "bg-emerald-500"
            )} />
          </motion.div>
        ))}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col gap-8",
                isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight">Create New Goal</h3>
                <button 
                  onClick={() => setShowAddGoalModal(false)} 
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Goal Name</label>
                    <input 
                      required
                      type="text" 
                      value={goalForm.name}
                      onChange={(e) => setGoalForm({...goalForm, name: e.target.value})}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                      )}
                      placeholder="e.g. New Laptop"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Icon</label>
                    <div className={cn(
                      "flex items-center gap-2 p-1 rounded-2xl border-2",
                      isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-100"
                    )}>
                      {['✈️', '🏠', '🚗', '💻', '🎓', '💰'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setGoalForm({...goalForm, emoji})}
                          className={cn(
                            "flex-1 py-2 rounded-xl text-lg transition-all",
                            goalForm.emoji === emoji 
                              ? "bg-white dark:bg-zinc-700 shadow-sm scale-110" 
                              : "opacity-50 hover:opacity-100"
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Target (₹)</label>
                    <input 
                      required
                      type="number" 
                      value={goalForm.target}
                      onChange={(e) => setGoalForm({...goalForm, target: e.target.value})}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                      )}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Initial (₹)</label>
                    <input 
                      type="number" 
                      value={goalForm.current}
                      onChange={(e) => setGoalForm({...goalForm, current: e.target.value})}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                      )}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Deadline</label>
                  <input 
                    required
                    type="text" 
                    value={goalForm.deadline}
                    onChange={(e) => setGoalForm({...goalForm, deadline: e.target.value})}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                      isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                    )}
                    placeholder="e.g. Dec 2026"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 mt-4 active:scale-95"
                >
                  Create Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddTxModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col gap-8",
                isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight">Quick Add Transaction</h3>
                <button 
                  onClick={() => setShowAddTxModal(false)} 
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddTx} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Transaction Name</label>
                  <input 
                    required
                    type="text" 
                    value={txForm.name}
                    onChange={(e) => setTxForm({...txForm, name: e.target.value})}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                      isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                    )}
                    placeholder="e.g. Grocery, Salary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Amount (₹)</label>
                    <input 
                      required
                      type="number" 
                      value={txForm.amount}
                      onChange={(e) => setTxForm({...txForm, amount: e.target.value})}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                      )}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</label>
                    <select 
                      value={txForm.category}
                      onChange={(e) => setTxForm({...txForm, category: e.target.value})}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                      )}
                    >
                      <option value="Food">🍔 Food</option>
                      <option value="Transport">🚗 Transport</option>
                      <option value="Entertainment">🎬 Entertainment</option>
                      <option value="Shopping">🛍️ Shopping</option>
                      <option value="Bills">🧾 Bills</option>
                      <option value="Income">💰 Income</option>
                      <option value="Other">📦 Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Method</label>
                    <input 
                      required
                      type="text" 
                      value={txForm.method}
                      onChange={(e) => setTxForm({...txForm, method: e.target.value})}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                      )}
                      placeholder="UPI, Cash, etc."
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Date</label>
                    <input 
                      required
                      type="text" 
                      value={txForm.date}
                      onChange={(e) => setTxForm({...txForm, date: e.target.value})}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                      )}
                      placeholder="e.g. 21 Mar 2026"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 mt-4 active:scale-95"
                >
                  Add Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auto-Sync Modal */}
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col gap-8 text-center",
                isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-100"
              )}
            >
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-purple-500/5 blur-[100px] pointer-events-none" />
              
              {syncStep === 0 && (
                <div className="flex flex-col items-center gap-6 relative z-10">
                  <div className="w-20 h-20 bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 rounded-3xl flex items-center justify-center rotate-3">
                    <Zap size={40} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className={cn("text-2xl font-black tracking-tight", isDarkMode ? "text-white" : "text-zinc-900")}>Link UPI Accounts</h3>
                    <p className="text-sm font-bold text-zinc-500 tracking-wide leading-relaxed">
                      Connect your bank via the Account Aggregator framework to automatically sync transactions from PhonePe, GPay, and Paytm.
                    </p>
                  </div>
                  <div className={cn("w-full p-4 rounded-2xl flex items-center gap-3 text-left border", isDarkMode ? "bg-zinc-800/50 border-purple-500/20" : "bg-purple-50/50 border-purple-100")}>
                    <ShieldCheck size={24} className="text-emerald-500 shrink-0" />
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bank-grade encryption. Read-only access via RBI guidelines.</p>
                  </div>
                  <div className="flex w-full gap-3 mt-2">
                    <button 
                      onClick={() => setShowSyncModal(false)}
                      className={cn("flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all", isDarkMode ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200")}
                    >Cancel</button>
                    <button 
                      onClick={startSyncProcess}
                      className="flex-[2] py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Fast Sync
                    </button>
                  </div>
                </div>
              )}

              {(syncStep === 1 || syncStep === 2) && (
                <div className="flex flex-col items-center gap-8 py-8 relative z-10">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-t-purple-500 relative"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw size={24} className={isDarkMode ? "text-white" : "text-zinc-900"} />
                    </div>
                  </motion.div>
                  <div className="flex flex-col gap-2">
                    <h3 className={cn("text-xl font-black tracking-tight", isDarkMode ? "text-white" : "text-zinc-900")}>
                      {syncStep === 1 ? 'Connecting securely...' : 'Scanning UPI Apps...'}
                    </h3>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Please do not close this window</p>
                  </div>
                </div>
              )}

              {syncStep === 3 && (
                <div className="flex flex-col items-center gap-6 py-6 relative z-10">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30"
                  >
                    <Check size={48} strokeWidth={3} />
                  </motion.div>
                  <div className="flex flex-col gap-2">
                    <h3 className={cn("text-2xl font-black tracking-tight", isDarkMode ? "text-white" : "text-zinc-900")}>Sync Complete!</h3>
                    <p className="text-sm font-bold text-zinc-500 tracking-wide">Successfully fetched 2 recent UPI transactions.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
