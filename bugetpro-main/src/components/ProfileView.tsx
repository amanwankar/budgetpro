import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { logout } from '../firebase';
import { 
  LogOut, User, Mail, Shield, Bell, Settings, ChevronRight, 
  Wallet, CreditCard, Landmark, Phone, Camera, Check, Plus,
  MapPin, Globe, Award, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ProfileView({ isDarkMode }: { isDarkMode: boolean }) {
  const { 
    user, 
    totalBalance, 
    totalIncome, 
    totalExpense, 
    seedSampleData,
    notificationsEnabled,
    setNotificationsEnabled,
    twoFactorEnabled,
    setTwoFactorEnabled
  } = useFinance();
  const [isSeeding, setIsSeeding] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: user?.displayName || 'Aman',
    email: 'amanwankar18@gmail.com',
    phone: '7820954891',
    location: 'Mumbai, India',
    bio: 'Financial enthusiast and premium member.',
    avatar: user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=6366f1&color=fff`
  });

  const handleLogout = async () => {
    await logout();
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedSampleData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (error) {
      console.error("Seeding failed:", error);
    } finally {
      setIsSeeding(false);
      setShowSeedConfirm(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, avatar: imageUrl }));
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Security':
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <Shield className="text-blue-500" size={20} />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Two-Factor Authentication</span>
                  <span className="text-[10px] text-zinc-500">Secure your account with 2FA</span>
                </div>
              </div>
              <button 
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={cn(
                  "w-10 h-6 rounded-full p-1 transition-all duration-300",
                  twoFactorEnabled ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-700"
                )}
              >
                <motion.div 
                  animate={{ x: twoFactorEnabled ? 16 : 0 }}
                  className="w-4 h-4 bg-white rounded-full shadow-sm" 
                />
              </button>
            </div>
            <button className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all">
              Change Password
            </button>
          </div>
        );
      case 'Notifications':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
              <span className="text-sm font-bold">App Notifications</span>
              <button 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={cn(
                  "w-10 h-6 rounded-full p-1 transition-all duration-300",
                  notificationsEnabled ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                )}
              >
                <motion.div 
                  animate={{ x: notificationsEnabled ? 16 : 0 }}
                  className="w-4 h-4 bg-white rounded-full shadow-sm" 
                />
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      <section className={cn(
        "p-8 rounded-[2.5rem] border flex flex-col gap-10 shadow-xl shadow-blue-500/5",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      )}>
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b dark:border-zinc-800 border-zinc-100">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-blue-500/20 group-hover:border-blue-500 transition-all duration-500">
              <img 
                src={profileData.avatar} 
                alt="Profile" 
                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-3 bg-blue-500 text-white rounded-2xl shadow-xl hover:scale-110 hover:bg-blue-600 transition-all"
            >
              <Camera size={20} />
            </button>
          </div>
          
          <div className="flex flex-col gap-4 flex-1 text-center md:text-left">
            {!isEditing ? (
              <>
                <div className="flex flex-col gap-1">
                  <h3 className="text-3xl font-bold">{profileData.name}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-1">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Mail size={14} />
                      <span className="text-xs font-bold">{profileData.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Phone size={14} />
                      <span className="text-xs font-bold">{profileData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <MapPin size={14} />
                      <span className="text-xs font-bold">{profileData.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="text-[10px] font-bold px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg uppercase tracking-wider flex items-center gap-2">
                    <Award size={12} /> Premium Member
                  </span>
                  <span className="text-[10px] font-bold px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg uppercase tracking-wider flex items-center gap-2">
                    <Zap size={12} /> Verified Account
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                      isDarkMode 
                        ? "bg-zinc-800 text-zinc-300 hover:bg-blue-500 hover:text-white" 
                        : "bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white"
                    )}
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="px-6 py-2.5 bg-red-500/10 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className={cn(
                      "px-4 py-3 rounded-xl border outline-none focus:border-blue-500 transition-all font-bold",
                      isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className={cn(
                      "px-4 py-3 rounded-xl border outline-none focus:border-blue-500 transition-all",
                      isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="text" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className={cn(
                      "px-4 py-3 rounded-xl border outline-none focus:border-blue-500 transition-all",
                      isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Location</label>
                  <input 
                    type="text" 
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className={cn(
                      "px-4 py-3 rounded-xl border outline-none focus:border-blue-500 transition-all",
                      isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                    )}
                  />
                </div>
                <div className="flex gap-3 md:col-span-2">
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all flex items-center gap-2"
                  >
                    <Check size={16} /> Save Changes
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Financial Overview */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                <Wallet size={18} />
              </div>
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Financial Overview</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className={cn("p-6 rounded-3xl border", isDarkMode ? "bg-zinc-800/50 border-zinc-800" : "bg-zinc-50 border-zinc-100")}>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Balance</p>
                <p className="text-2xl font-bold">₹{totalBalance.toLocaleString()}</p>
              </div>
              <div className={cn("p-6 rounded-3xl border", isDarkMode ? "bg-zinc-800/50 border-zinc-800" : "bg-zinc-50 border-zinc-100")}>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Monthly Income</p>
                <p className="text-2xl font-bold text-emerald-500">₹{totalIncome.toLocaleString()}</p>
              </div>
              <div className={cn("p-6 rounded-3xl border", isDarkMode ? "bg-zinc-800/50 border-zinc-800" : "bg-zinc-50 border-zinc-100")}>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Monthly Expense</p>
                <p className="text-2xl font-bold text-red-500">₹{totalExpense.toLocaleString()}</p>
              </div>
              <div className={cn("p-6 rounded-3xl border", isDarkMode ? "bg-zinc-800/50 border-zinc-800" : "bg-zinc-50 border-zinc-100")}>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Savings Rate</p>
                <p className="text-2xl font-bold text-blue-500">
                  {totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center">
                <Settings size={18} />
              </div>
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Account Management</h4>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { label: 'Notifications', icon: Bell, desc: 'Manage alerts and reports', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Security', icon: Shield, desc: 'Password and 2FA settings', color: 'text-red-500', bg: 'bg-red-500/10' },
                { label: 'Seed Data', icon: Landmark, desc: 'Reset with sample data', color: 'text-emerald-500', bg: 'bg-emerald-500/10', action: () => setShowSeedConfirm(true), loading: isSeeding },
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => item.action ? item.action() : setActiveTab(item.label)}
                  disabled={item.loading}
                  className="flex items-center justify-between p-5 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all text-left group border border-transparent hover:border-blue-500/20"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-all group-hover:scale-110",
                      isDarkMode ? "bg-zinc-800" : item.bg,
                      isDarkMode ? "text-zinc-400 group-hover:text-white group-hover:bg-blue-500" : item.color
                    )}>
                      {item.loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <item.icon size={20} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold group-hover:text-blue-500 transition-colors">{item.label}</span>
                      <span className="text-[10px] text-zinc-500">{item.desc}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tab Modal */}
      <AnimatePresence>
        {activeTab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveTab(null)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative w-full max-w-lg rounded-[2.5rem] border shadow-2xl overflow-hidden",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
              )}
            >
              <div className="p-8 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-bold">{activeTab}</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Profile Configuration</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab(null)}
                    className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-red-500 hover:text-white transition-all group"
                  >
                    <Plus size={20} className="rotate-45 text-zinc-900 dark:text-zinc-100 group-hover:text-white transition-colors" />
                  </button>
                </div>

                <div className="min-h-[150px]">
                  {renderActiveTab()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Seed Data Confirmation Modal */}
      <AnimatePresence>
        {showSeedConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSeedConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "relative w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center gap-6",
                isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
              )}
            >
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                <Landmark size={32} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">Seed Sample Data?</h3>
                <p className="text-sm text-zinc-500">This will populate your account with sample transactions, budgets, and goals for testing.</p>
              </div>
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setShowSeedConfirm(false)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                    isDarkMode ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-100 hover:bg-zinc-200"
                  )}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSeed}
                  disabled={isSeeding}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isSeeding ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Seed Data"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {seedSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 bg-emerald-500 text-white rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <Check size={18} />
            Sample data seeded successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
