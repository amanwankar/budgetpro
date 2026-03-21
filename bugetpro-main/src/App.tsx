/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LogOut, 
  Bell, 
  Sun, 
  Moon,
  HelpCircle,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Import views
import DashboardView from './components/DashboardView';
import TransactionsView from './components/TransactionsView';
import StatisticsView from './components/StatisticsView';
import BudgetsView from './components/BudgetsView';
import InvestmentsView from './components/InvestmentsView';
import GoalsView from './components/GoalsView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import HelpView from './components/HelpView';
import AuthPage from './components/AuthPage';

// Import data
import { SIDEBAR_ITEMS } from './data';

import { FinanceProvider, useFinance } from './context/FinanceContext';
import { logout } from './firebase';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isAuthReady, notifications, markNotificationRead, roundUpPopup } = useFinance();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Toggle dark class on document element
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!isAuthReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView isDarkMode={isDarkMode} />;
      case 'Transactions':
        return <TransactionsView isDarkMode={isDarkMode} />;
      case 'Statistics':
        return <StatisticsView isDarkMode={isDarkMode} />;
      case 'Budgets':
        return <BudgetsView isDarkMode={isDarkMode} />;
      case 'Investments':
        return <InvestmentsView isDarkMode={isDarkMode} />;
      case 'Goals':
        return <GoalsView isDarkMode={isDarkMode} />;
      case 'Profile':
        return <ProfileView isDarkMode={isDarkMode} />;
      case 'Settings':
        return <SettingsView isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
      case 'Help':
        return <HelpView isDarkMode={isDarkMode} />;
      default:
        return <DashboardView isDarkMode={isDarkMode} />;
    }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  return (
    <div className={cn(
      "flex h-screen w-full overflow-hidden transition-colors duration-300",
      isDarkMode ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Sidebar */}
      <aside className={cn(
        "w-64 border-r flex flex-col p-6 gap-8 shrink-0 relative z-10 transition-all duration-500",
        isDarkMode 
          ? "border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl" 
          : "border-zinc-200 bg-white"
      )}>
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-all duration-500">
            <Wallet className="text-white" size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter leading-none">BudgetPro</span>
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">Premium</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                activeTab === item.name 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]" 
                  : "hover:bg-blue-500/10 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
              )}
            >
              {activeTab === item.name && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={18} className={cn(
                "transition-all duration-300 group-hover:scale-110 group-active:scale-90",
                activeTab === item.name ? "text-white" : "group-hover:text-blue-500"
              )} />
              <span className={cn(
                "font-bold text-sm tracking-tight transition-all duration-300",
                activeTab === item.name ? "text-white" : "group-hover:translate-x-1"
              )}>{item.name}</span>
              
              {/* Subtle hover glow effect */}
              {activeTab !== item.name && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-1.5 pt-6 border-t dark:border-zinc-800/50 border-zinc-100">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all group relative overflow-hidden"
          >
            <LogOut size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-bold text-sm">Log out</span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{activeTab}</h1>
            <p className={cn(
              "text-sm mt-1",
              isDarkMode ? "text-zinc-400" : "text-zinc-500"
            )}>
              {activeTab === 'Dashboard' ? `Hi, ${user.displayName?.split(' ')[0] || 'Aman'}. Here's the summary of your finances.` : `Manage your ${activeTab.toLowerCase()} and preferences.`}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className={cn(
              "flex items-center p-1.5 rounded-2xl border",
              isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200"
            )}>
              <button 
                onClick={() => setIsDarkMode(false)}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  !isDarkMode ? "bg-white text-blue-500 shadow-md" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Sun size={18} />
              </button>
              <button 
                onClick={() => setIsDarkMode(true)}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isDarkMode ? "bg-zinc-800 text-blue-500 shadow-md" : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                <Moon size={18} />
              </button>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "p-3 rounded-2xl border relative transition-all duration-300 hover:scale-105 active:scale-95",
                  isDarkMode ? "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white" : "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900"
                )}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={cn(
                        "absolute right-0 mt-2 w-80 rounded-2xl border shadow-xl z-50 overflow-hidden",
                        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                      )}
                    >
                      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold">Notifications</h3>
                        <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {unreadCount} New
                        </span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-zinc-500 text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div 
                              key={n.id} 
                              onClick={() => markNotificationRead(n.id)}
                              className={cn(
                                "p-4 border-b border-zinc-800/50 cursor-pointer transition-colors",
                                !n.read && (isDarkMode ? "bg-blue-500/5" : "bg-blue-50"),
                                isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-50"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-2 h-2 mt-1.5 rounded-full shrink-0",
                                  n.type === 'error' ? 'bg-red-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                )} />
                                <div>
                                  <p className="text-sm font-bold leading-tight mb-1">{n.title}</p>
                                  <p className="text-xs text-zinc-500 leading-normal">{n.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div 
              className="flex items-center gap-3 pl-2 cursor-pointer group"
              onClick={() => setActiveTab('Profile')}
            >
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=6366f1&color=fff`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/20 group-hover:border-blue-500 transition-all"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "relative w-full max-w-sm p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-6",
                isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
              )}
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                <LogOut size={32} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">Log Out?</h3>
                <p className="text-sm text-zinc-500">Are you sure you want to log out of your account?</p>
              </div>
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                    isDarkMode ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-100 hover:bg-zinc-200"
                  )}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Round-up Popup */}
      <AnimatePresence>
        {roundUpPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 bg-[#0f1623] border border-[#4fffb0]/30"
          >
            <div className="w-10 h-10 rounded-full bg-[#4fffb0]/20 flex items-center justify-center text-xl animate-bounce">🐷</div>
            <div className="flex flex-col">
              <span className="text-[#4fffb0] font-black text-sm">Auto Round-Up!</span>
              <span className="text-white text-xs font-medium">We saved ₹{roundUpPopup.amount} into your {roundUpPopup.potName} Gullak!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
