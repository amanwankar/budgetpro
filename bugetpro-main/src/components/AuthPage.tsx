import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Wallet, ShieldCheck, ArrowRight, TrendingUp, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AuthPage() {
  const { loginAsGuest } = useFinance();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4fffb0]/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="p-1 rounded-[3rem] bg-gradient-to-b from-blue-500/20 to-transparent">
          <div className="bg-white dark:bg-[#0f1623] rounded-[2.8rem] shadow-2xl border border-zinc-200 dark:border-white/5 overflow-hidden">
            
            <div className="p-12 pb-8 flex flex-col items-center text-center gap-6">
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-2"
              >
                <Wallet className="text-white" size={48} />
              </motion.div>
              
              <div className="flex flex-col gap-3">
                <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                  BudgetPro
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                  Premium Financial Intelligence
                </p>
              </div>
            </div>

            <div className="px-10 pb-10 space-y-6">
              <div className="grid gap-3">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Smart Tracking</span>
                    <span className="text-[10px] text-zinc-500 font-medium tracking-wide">Automated insights & categorisation</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-[#4fffb0]/10 text-[#4fffb0] flex items-center justify-center shrink-0">
                    <Target size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Gullak Savings</span>
                    <span className="text-[10px] text-zinc-500 font-medium tracking-wide">Round-ups and goal completion</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                    <Zap size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Lightning Fast</span>
                    <span className="text-[10px] text-zinc-500 font-medium tracking-wide">Instant synchronization & analysis</span>
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => loginAsGuest()}
                className="w-full mt-4 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black uppercase tracking-[0.15em] text-sm hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-2xl group"
              >
                Get Started
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </motion.button>
            </div>

            {/* Footer */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">No Signup Required</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
