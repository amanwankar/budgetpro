import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  Lock, 
  Unlock, 
  History, 
  Users, 
  ArrowUpRight, 
  PiggyBank, 
  Coins, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  X,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Edit2,
  Share2,
  Info
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { GullakPot, GullakDeposit } from '../context/FinanceContext';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function GoalsView({ isDarkMode }: { isDarkMode: boolean }) {
  const { 
    goals, 
    addGoal, 
    updateGoalFunds, 
    deleteGoal,
    gullakPots,
    gullakDeposits,
    addGullakPot,
    updateGullakPot,
    deleteGullakPot,
    depositToGullak,
    roundUpHistory,
    roundUpSetting,
    updateRoundUpSetting,
    savingStreak,
    user
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'goals' | 'gullak'>('gullak');
  const [isAddPotModalOpen, setIsAddPotModalOpen] = useState(false);
  const [selectedPot, setSelectedPot] = useState<GullakPot | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [isBreakPotModalOpen, setIsBreakPotModalOpen] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebrationPotName, setCelebrationPotName] = useState('');

  // New Pot Form State
  const [newPot, setNewPot] = useState({
    name: '',
    emoji: '💰',
    targetAmount: '',
    lockDate: '',
    color: '#4fffb0',
    contributors: [] as string[]
  });

  const totalSavings = gullakPots.reduce((acc, pot) => acc + pot.current, 0);
  const totalTarget = gullakPots.reduce((acc, pot) => acc + pot.target, 0);
  const overallProgress = totalTarget > 0 ? (totalSavings / totalTarget) * 100 : 0;

  const calculateMonthlyRequired = (pot: GullakPot) => {
    if (!pot.lockDate) return 0;
    const target = new Date(pot.lockDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);
    if (diffMonths <= 0) return pot.target - pot.current;
    return Math.max(0, (pot.target - pot.current) / diffMonths);
  };

  const handleAddPot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPot.name || !newPot.targetAmount) return;

    await addGullakPot({
      name: newPot.name,
      emoji: newPot.emoji,
      target: parseFloat(newPot.targetAmount),
      lockDate: newPot.lockDate || null,
      color: newPot.color,
      contributors: [{ name: user?.displayName || 'Me', avatar: user?.photoURL || '', share: 100, uid: user?.uid || '' }]
    });

    setIsAddPotModalOpen(false);
    setNewPot({
      name: '',
      emoji: '💰',
      targetAmount: '',
      lockDate: '',
      color: '#4fffb0',
      contributors: []
    });
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPot || !depositAmount) return;

    const amount = parseFloat(depositAmount);
    
    // Trigger coin animation
    setShowCoinAnimation(true);
    setTimeout(() => setShowCoinAnimation(false), 1000);

    await depositToGullak(selectedPot.id, amount, 'manual', depositNote);

    // Check if goal reached
    if (selectedPot.current + amount >= selectedPot.target) {
      setCelebrationPotName(selectedPot.name);
      setShowCelebrationModal(true);

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [selectedPot.color, '#ffffff', '#4fffb0']
      });
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#ffd700', '#ff0000', '#00ff00']
        });
      }, 500);
    }

    setDepositAmount('');
    setDepositNote('');
    setIsDepositModalOpen(false);
  };

  const [isBreaking, setIsBreaking] = useState(false);

  const handleBreakPot = async () => {
    if (!selectedPot) return;
    
    setIsBreaking(true);
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 1500));

    await deleteGullakPot(selectedPot.id);
    setIsBreakPotModalOpen(false);
    setIsBreaking(false);
    setSelectedPot(null);
    
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#4fffb0', '#ffffff', '#ffd700']
    });
  };

  const getDaysRemaining = (dateStr?: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const isPotLocked = (pot: GullakPot) => {
    if (!pot.lockDate) return false;
    const days = getDaysRemaining(pot.lockDate);
    return days !== null && days > 0;
  };

  return (
    <div className="p-4 pb-24 max-w-6xl mx-auto space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Savings & Goals</h1>
            <p className="text-zinc-500 font-medium">Manage your savings pots and financial targets</p>
          </div>
          <div className={cn(
            "flex items-center gap-2 p-1.5 rounded-2xl border self-start",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200"
          )}>
            <button
              onClick={() => setActiveTab('gullak')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                activeTab === 'gullak' 
                  ? "bg-white dark:bg-[#1a2333] text-[#4fffb0] shadow-xl" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              Gullak
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                activeTab === 'goals' 
                  ? "bg-white dark:bg-[#1a2333] text-[#4fffb0] shadow-xl" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              Goals
            </button>
          </div>
        </div>

        {activeTab === 'gullak' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Savings Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "md:col-span-2 p-8 rounded-[2.5rem] border relative overflow-hidden card-shadow",
                isDarkMode ? "bg-gradient-to-br from-[#1a2333] to-[#0f1623] border-white/5" : "bg-white border-zinc-100"
              )}
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Total Gullak Savings</p>
                  <h2 className={cn(
                    "text-5xl font-bold mt-2",
                    isDarkMode ? "text-[#4fffb0]" : "text-zinc-900"
                  )}>₹{totalSavings.toLocaleString()}</h2>
                </div>
                
                <div className="mt-8">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                    <span>Overall Progress</span>
                    <span>{overallProgress.toFixed(1)}%</span>
                  </div>
                  <div className={cn(
                    "h-4 rounded-full overflow-hidden",
                    isDarkMode ? "bg-white/5" : "bg-zinc-100"
                  )}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${overallProgress}%` }}
                      className="h-full bg-[#4fffb0] rounded-full shadow-[0_0_20px_rgba(79,255,176,0.3)]"
                    />
                  </div>
                </div>
              </div>
              
              {/* Animated Piggy Bank Background */}
              <div className="absolute -right-12 -bottom-12 opacity-10 transform rotate-12">
                <PiggyBank size={240} className="text-[#4fffb0] animate-float" />
              </div>
            </motion.div>

            {/* Streak Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "p-8 rounded-[2.5rem] border flex flex-col items-center justify-center text-center card-shadow",
                isDarkMode ? "bg-[#1a2333] border-white/5" : "bg-white border-zinc-100"
              )}
            >
              <div className="w-20 h-20 bg-[#4fffb0]/10 rounded-full flex items-center justify-center mb-6 relative">
                <Zap size={40} className="text-[#4fffb0]" />
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#4fffb0] rounded-full flex items-center justify-center text-xs font-bold text-[#080d18] shadow-lg">
                  {savingStreak}
                </div>
              </div>
              <h3 className="text-2xl font-bold">Saving Streak</h3>
              <p className="text-zinc-500 text-sm font-medium mt-2">You've saved for {savingStreak} days in a row!</p>
              <div className="mt-6 flex gap-1.5">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      i < (savingStreak % 7) || savingStreak >= 7 ? "bg-[#4fffb0]" : "bg-zinc-200 dark:bg-white/10"
                    )} 
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {activeTab === 'gullak' ? (
        <div className="space-y-8">
          {/* Gullak Pots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {gullakPots.map((pot) => (
                <motion.div
                  key={pot.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8 }}
                  className={cn(
                    "group rounded-[2.5rem] border overflow-hidden cursor-pointer card-shadow card-shadow-hover transition-all duration-500",
                    isDarkMode ? "bg-[#0f1623] border-white/5" : "bg-white border-zinc-100"
                  )}
                  onClick={() => {
                    setSelectedPot(pot);
                    setIsDepositModalOpen(true);
                  }}
                >
                  <div className="p-7">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                          style={{ backgroundColor: `${pot.color}20`, color: pot.color }}
                        >
                          {pot.emoji}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl">{pot.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {isPotLocked(pot) ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-500">
                                <Lock size={10} /> {getDaysRemaining(pot.lockDate)} days left
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                                <Unlock size={10} /> Unlocked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="relative w-12 h-12">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              className="text-zinc-100 dark:text-white/5"
                            />
                            <motion.circle
                              cx="24"
                              cy="24"
                              r="20"
                              stroke={pot.color}
                              strokeWidth="4"
                              fill="transparent"
                              strokeDasharray={125.6}
                              initial={{ strokeDashoffset: 125.6 }}
                              animate={{ strokeDashoffset: 125.6 - (125.6 * Math.min(100, (pot.current / pot.target) * 100)) / 100 }}
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">
                            {Math.round((pot.current / pot.target) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Saved</span>
                          <span className="text-3xl font-bold text-[#4fffb0]">₹{pot.current.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Goal</span>
                          <span className="text-xl font-bold text-zinc-400">₹{pot.target.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Progress Bar with Wave Effect */}
                      <div className={cn(
                        "relative h-4 rounded-full overflow-hidden",
                        isDarkMode ? "bg-white/5" : "bg-zinc-100"
                      )}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(pot.current / pot.target) * 100}%` }}
                          className="absolute inset-0 h-full rounded-full"
                          style={{ backgroundColor: pot.color }}
                        >
                          <div className="absolute inset-0 opacity-20 animate-fill-wave bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat-x" />
                        </motion.div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex -space-x-2.5">
                          {pot.contributors.map((c, i) => (
                            <div 
                              key={i} 
                              className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0f1623] overflow-hidden bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white relative group/avatar cursor-help"
                              title={`${c.name} (${c.share}%)`}
                            >
                              {c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" /> : c.name.substring(0, 2).toUpperCase()}
                              <div className="absolute -top-1 -right-1 bg-[#4fffb0] text-[#080d18] text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center scale-0 group-hover/avatar:scale-100 transition-transform shadow-lg">
                                {c.share}
                              </div>
                            </div>
                          ))}
                          <button className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0f1623] bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Monthly Req.</p>
                          <p className="text-xs font-bold text-[#4fffb0]">₹{Math.round(calculateMonthlyRequired(pot)).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Add Pot Button */}
              <motion.button
                layout
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddPotModalOpen(true)}
                className={cn(
                  "h-full min-h-[280px] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all duration-500 group",
                  isDarkMode ? "border-white/10 bg-zinc-900/50 text-zinc-500 hover:text-[#4fffb0] hover:border-[#4fffb0]/50" : "border-zinc-200 bg-zinc-50/50 text-zinc-400 hover:text-zinc-900 hover:border-zinc-900"
                )}
              >
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110">
                  <Plus size={32} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl font-black tracking-tight">New Gullak Pot</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Start a new savings journey</span>
                </div>
              </motion.button>
            </AnimatePresence>
          </div>

          {/* Round-Up History Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={cn(
              "lg:col-span-2 rounded-[2.5rem] border overflow-hidden card-shadow",
              isDarkMode ? "bg-[#0f1623] border-white/5" : "bg-white border-zinc-100"
            )}>
              <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#4fffb0]/10 rounded-2xl flex items-center justify-center">
                    <TrendingUp size={24} className="text-[#4fffb0]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Auto Round-Ups</h3>
                    <p className="text-xs font-medium text-zinc-500">Saving small change automatically from every spend</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    value={roundUpSetting} 
                    onChange={(e) => updateRoundUpSetting(Number(e.target.value))}
                    className="px-4 py-2 bg-zinc-100 dark:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 border border-zinc-200 dark:border-white/10 outline-none cursor-pointer appearance-none text-center min-w-[120px]"
                  >
                    <option value={10}>₹10 Round-up</option>
                    <option value={50}>₹50 Round-up</option>
                    <option value={100}>₹100 Round-up</option>
                    <option value={0}>Disabled</option>
                  </select>
                </div>
              </div>
              
              <div className="divide-y divide-zinc-100 dark:divide-white/5 max-h-[400px] overflow-y-auto">
                {roundUpHistory.length > 0 ? (
                  roundUpHistory.slice(0, 10).map((item) => (
                    <div key={item.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-110">
                          🐷
                        </div>
                        <div>
                          <p className="text-sm font-bold">Round-up to {item.potName}</p>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.date}</p>
                          <p className="text-[10px] font-medium text-zinc-400 mt-1">Spent: ₹{item.originalAmount.toLocaleString()} • Rounded: ₹{item.roundedAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#4fffb0]">+₹{item.savedAmount}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Saved</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center space-y-4">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
                      <TrendingUp size={32} className="text-zinc-300 dark:text-zinc-700" />
                    </div>
                    <p className="text-zinc-500 font-medium">No round-up history yet. Start spending to save!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Suggestions */}
            <div className={cn(
              "rounded-[2.5rem] border p-8 card-shadow flex flex-col gap-6",
              isDarkMode ? "bg-[#0f1623] border-white/5" : "bg-white border-zinc-100"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
                  <Zap size={20} />
                </div>
                <h3 className="text-lg font-black tracking-tight">Smart Suggestions</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: 'Budget Surplus', desc: 'You have ₹2,400 left in your Food budget. Move it to Gullak?', icon: '🍔', action: 'Save Now' },
                  { title: 'Streak Bonus', desc: 'Save today to keep your 5-day streak alive!', icon: '🔥', action: 'Deposit' },
                  { title: 'Goal Near', desc: 'You are ₹1,200 away from your MacBook goal!', icon: '💻', action: 'Top Up' }
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 space-y-3">
                    <div className="flex gap-3">
                      <span className="text-xl">{s.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-black tracking-tight">{s.title}</span>
                        <span className="text-[10px] text-zinc-500 font-medium leading-relaxed">{s.desc}</span>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all">
                      {s.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Original Goals View (Styled) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-8 rounded-[2.5rem] border flex flex-col gap-6 transition-all duration-500 card-shadow card-shadow-hover group",
                isDarkMode ? "bg-[#0f1623] border-white/5" : "bg-white border-zinc-100"
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 text-2xl",
                  isDarkMode ? "bg-zinc-800" : "bg-blue-50"
                )}>
                  🎯
                </div>
                <button 
                  onClick={() => deleteGoal(goal.id)}
                  className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black tracking-tight group-hover:text-blue-500 transition-colors">{goal.name}</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Deadline: {goal.deadline}</p>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Saved</span>
                    <span className="text-3xl font-black tracking-tighter text-blue-500">₹{goal.current.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Goal</span>
                    <span className="text-2xl font-black tracking-tighter">₹{goal.target.toLocaleString()}</span>
                  </div>
                </div>
                <div className={cn(
                  "h-3 w-full rounded-full overflow-hidden",
                  isDarkMode ? "bg-zinc-800" : "bg-zinc-100"
                )}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    className={cn(
                      "h-full rounded-full shadow-lg transition-all duration-1000",
                      goal.progress > 80 ? "bg-emerald-500 shadow-emerald-500/40" : goal.progress > 40 ? "bg-blue-500 shadow-blue-500/40" : "bg-red-500 shadow-red-500/40"
                    )}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{goal.progress}% Completed</span>
                  {goal.progress >= 100 && (
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      Goal Reached!
                    </span>
                  )}
                </div>
              </div>

              <button 
                onClick={() => updateGoalFunds(goal.id, 1000)} // Example
                className="w-full py-4 rounded-2xl bg-blue-500 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/40 active:scale-95"
              >
                Add Funds
              </button>
            </motion.div>
          ))}
          
          <button 
            onClick={() => setIsAddPotModalOpen(true)}
            className={cn(
              "p-8 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-6 text-zinc-400 hover:text-blue-500 hover:border-blue-500 transition-all min-h-[350px] group",
              isDarkMode ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-zinc-50/50"
            )}
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110">
              <Plus size={32} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-black tracking-tight">Create New Goal</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Start saving for your dreams</span>
            </div>
          </button>
        </div>
      )}

      {/* Add Pot Modal */}
      <AnimatePresence>
        {isAddPotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddPotModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl",
                isDarkMode ? "bg-[#0f1623] text-white" : "bg-white text-zinc-900"
              )}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black tracking-tight">Create New Gullak</h2>
                  <button onClick={() => setIsAddPotModalOpen(false)} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddPot} className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pot Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., iPhone 16 Pro"
                          value={newPot.name}
                          onChange={(e) => setNewPot({ ...newPot, name: e.target.value })}
                          className={cn(
                            "w-full border-none rounded-2xl p-4 font-black tracking-tight focus:ring-2 focus:ring-[#4fffb0] transition-all",
                            isDarkMode ? "bg-white/5 text-white" : "bg-zinc-100 text-zinc-900"
                          )}
                        />
                      </div>
                      <div className="w-24 space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center block">Emoji</label>
                        <input
                          type="text"
                          value={newPot.emoji}
                          onChange={(e) => setNewPot({ ...newPot, emoji: e.target.value })}
                          className={cn(
                            "w-full border-none rounded-2xl p-4 text-center text-2xl focus:ring-2 focus:ring-[#4fffb0] transition-all",
                            isDarkMode ? "bg-white/5 text-white" : "bg-zinc-100 text-zinc-900"
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Amount (₹)</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={newPot.targetAmount}
                        onChange={(e) => setNewPot({ ...newPot, targetAmount: e.target.value })}
                        className={cn(
                          "w-full border-none rounded-2xl p-4 text-xl font-black tracking-tight focus:ring-2 focus:ring-[#4fffb0] transition-all",
                          isDarkMode ? "bg-white/5 text-white" : "bg-zinc-100 text-zinc-900"
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Lock Until (Optional)</label>
                        <input
                          type="date"
                          value={newPot.lockDate}
                          onChange={(e) => setNewPot({ ...newPot, lockDate: e.target.value })}
                          className={cn(
                            "w-full border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-[#4fffb0] transition-all",
                            isDarkMode ? "bg-white/5 text-white" : "bg-zinc-100 text-zinc-900"
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pot Color</label>
                        <div className={cn(
                          "flex gap-2 p-2 rounded-2xl",
                          isDarkMode ? "bg-white/5" : "bg-zinc-100"
                        )}>
                          {['#4fffb0', '#ff4f4f', '#4f9fff', '#ffb04f', '#b04fff'].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setNewPot({ ...newPot, color })}
                              className={cn(
                                "w-7 h-7 rounded-full transition-all",
                                newPot.color === color ? "ring-2 ring-offset-2 ring-zinc-400 scale-110" : "opacity-40 hover:opacity-100"
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-zinc-900 dark:bg-[#4fffb0] text-white dark:text-[#080d18] font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl shadow-2xl hover:shadow-[#4fffb0]/20 transition-all active:scale-95"
                  >
                    Create Gullak Pot
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {isDepositModalOpen && selectedPot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDepositModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl",
                isDarkMode ? "bg-[#0f1623] text-white" : "bg-white text-zinc-900"
              )}
            >
              {/* Coin Animation Container */}
              {showCoinAnimation && (
                <div className="absolute inset-0 pointer-events-none z-50 flex justify-center">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute animate-coin-drop"
                      style={{ 
                        left: `${30 + i * 6}%`, 
                        animationDelay: `${i * 0.08}s`,
                        color: selectedPot.color
                      }}
                    >
                      <Coins size={36} />
                    </div>
                  ))}
                </div>
              )}

              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl transition-transform hover:scale-110 duration-500">{selectedPot.emoji}</div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">Add to {selectedPot.name}</h2>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Current: ₹{selectedPot.current.toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsDepositModalOpen(false)} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleDeposit} className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center block">Amount to Save (₹)</label>
                      <input
                        type="number"
                        required
                        autoFocus
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className={cn(
                          "w-full border-none rounded-[2rem] p-8 text-5xl font-black text-center tracking-tighter focus:ring-2 focus:ring-[#4fffb0] transition-all",
                          isDarkMode ? "bg-white/5 text-white" : "bg-zinc-100 text-zinc-900"
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Add a Note</label>
                      <input
                        type="text"
                        placeholder="Saved from lunch money..."
                        value={depositNote}
                        onChange={(e) => setDepositNote(e.target.value)}
                        className={cn(
                          "w-full border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-[#4fffb0] transition-all",
                          isDarkMode ? "bg-white/5 text-white" : "bg-zinc-100 text-zinc-900"
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsBreakPotModalOpen(true)}
                      className={cn(
                        "flex-1 font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl border transition-all active:scale-95",
                        isDarkMode ? "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                      )}
                    >
                      Break Gullak
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] bg-zinc-900 dark:bg-[#4fffb0] text-white dark:text-[#080d18] font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl shadow-2xl hover:shadow-[#4fffb0]/20 transition-all active:scale-95"
                    >
                      Drop Coin 🪙
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedPot && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border flex flex-col max-h-[80vh]",
                isDarkMode ? "bg-[#0f1623] border-white/5" : "bg-white border-zinc-100"
              )}
            >
              <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#4fffb0]/10 rounded-2xl flex items-center justify-center text-2xl">
                    {selectedPot.emoji}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{selectedPot.name} Passbook</h2>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Transaction History</p>
                  </div>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Saved</p>
                      <p className="text-2xl font-black text-emerald-500">₹{selectedPot.current.toLocaleString()}</p>
                    </div>
                    <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Target</p>
                      <p className="text-2xl font-black text-amber-500">₹{selectedPot.target.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {gullakDeposits
                      .filter(d => d.potId === selectedPot.id)
                      .map((deposit) => (
                        <div key={deposit.id} className="flex items-center justify-between p-5 rounded-3xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 group hover:border-[#4fffb0]/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                              deposit.method === 'auto' ? "bg-blue-500/10 text-blue-500" : "bg-emerald-500/10 text-emerald-500"
                            )}>
                              {deposit.method === 'auto' ? <TrendingUp size={18} /> : <Coins size={18} />}
                            </div>
                            <div>
                              <p className="text-sm font-black tracking-tight">{deposit.note}</p>
                              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{deposit.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-[#4fffb0]">+₹{deposit.amount.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{deposit.method === 'auto' ? 'Round-up' : 'Manual'}</p>
                          </div>
                        </div>
                      ))}
                    
                    {gullakDeposits.filter(d => d.potId === selectedPot.id).length === 0 && (
                      <div className="py-12 text-center">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                          <History size={32} className="text-zinc-300 dark:text-zinc-700" />
                        </div>
                        <p className="text-zinc-500 font-medium">No deposits yet. Drop your first coin!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Break Pot Confirmation Modal */}
      <AnimatePresence>
        {isBreakPotModalOpen && selectedPot && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isBreaking && setIsBreakPotModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "relative w-full max-w-md rounded-[3rem] p-10 text-center overflow-hidden shadow-2xl",
                isDarkMode ? "bg-[#0f1623] border border-white/5" : "bg-white border border-zinc-100"
              )}
            >
              {isBreaking ? (
                <div className="py-10 space-y-8">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 0.8, 1.5, 0],
                      rotate: [0, -10, 10, -20, 45],
                      opacity: [1, 1, 1, 1, 0]
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="text-8xl flex justify-center"
                  >
                    🐷
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <h2 className="text-3xl font-black tracking-tighter text-[#4fffb0]">BREAKING...</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Collecting your hard-earned savings!</p>
                  </motion.div>
                </div>
              ) : (
                <>
                  <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <AlertTriangle size={48} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter mb-4">Break this Gullak?</h2>
                  
                  {isPotLocked(selectedPot) ? (
                    <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 mb-8">
                      <p className="text-amber-500 font-black text-sm leading-relaxed">
                        Wait! This pot is locked for {getDaysRemaining(selectedPot.lockDate)} more days. 
                        <b> Breaking gullak early! You will lose ₹200 progress.</b>
                      </p>
                    </div>
                  ) : (
                    <p className="text-zinc-500 font-medium mb-8 leading-relaxed">
                      You've saved <span className="text-[#4fffb0] font-black">₹{selectedPot.current.toLocaleString()}</span>. 
                      Ready to withdraw and celebrate your achievement?
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setIsBreakPotModalOpen(false)}
                      className="py-5 rounded-2xl font-black uppercase tracking-widest text-xs bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all"
                    >
                      Not Yet
                    </button>
                    <button
                      onClick={handleBreakPot}
                      className="py-5 rounded-2xl font-black uppercase tracking-widest text-xs bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
                    >
                      Break Now
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebrationModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 20 }}
              className="relative z-10 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 0.8, 1.5, 0],
                  rotate: [0, -10, 10, -20, 45],
                  opacity: [1, 1, 1, 1, 0]
                }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                className="text-8xl flex justify-center mb-8"
              >
                🐷
              </motion.div>
              <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4fffb0] to-blue-500 mb-4 tracking-tighter">Goal Achieved!</h2>
              <p className="text-white text-xl font-bold mb-12">You've successfully saved up for your <span className="text-[#4fffb0]">{celebrationPotName}</span>!</p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCelebrationModal(false)}
                className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all"
              >
                Awesome!
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
