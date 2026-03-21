import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Settings, Bell, ArrowUpRight, ChevronRight, Plus, User, Shield, CreditCard, Mail, Globe, Moon, Sun, Check, Camera, Scan } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SettingsView({ isDarkMode, setIsDarkMode }: { isDarkMode: boolean, setIsDarkMode: (val: boolean) => void }) {
  const { 
    faceIdEnabled, 
    setFaceIdEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    twoFactorEnabled,
    setTwoFactorEnabled,
    roundUpSetting,
    updateRoundUpSetting
  } = useFinance();
  const [userProfile, setUserProfile] = useState({
    name: 'Aman',
    email: 'amanwankar18@gmail.com',
    role: 'Premium Member',
    avatar: 'https://picsum.photos/seed/aman/200/200'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserProfile(prev => ({ ...prev, avatar: imageUrl }));
    }
  };

  const renderSubSection = () => {
    switch (activeSection) {
      case 'Security & Password':
        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Password</label>
              <input type="password" placeholder="••••••••" className={cn("px-4 py-3 rounded-xl border outline-none focus:border-blue-500 transition-all", isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200")} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">New Password</label>
              <input type="password" placeholder="••••••••" className={cn("px-4 py-3 rounded-xl border outline-none focus:border-blue-500 transition-all", isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200")} />
            </div>
            <button className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
              Update Password
            </button>
          </div>
        );
      case 'Payment Methods':
        return (
          <div className="flex flex-col gap-4">
            <div className={cn("p-4 rounded-2xl border flex items-center justify-between", isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200")}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-zinc-900 rounded flex items-center justify-center text-[8px] font-bold text-white">VISA</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">•••• 4242</span>
                  <span className="text-[10px] text-zinc-500">Expires 12/24</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-500">Primary</span>
            </div>
            <button className="w-full py-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-zinc-400 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
              <Plus size={14} /> Add New Card
            </button>
          </div>
        );
      case 'Connected Apps':
        return (
          <div className="flex flex-col gap-4">
            {[
              { name: 'Google Finance', status: 'Connected', icon: 'G' },
              { name: 'Plaid', status: 'Connected', icon: 'P' },
              { name: 'Stripe', status: 'Disconnected', icon: 'S' },
            ].map((app, i) => (
              <div key={i} className={cn("p-4 rounded-2xl border flex items-center justify-between", isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200")}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center font-bold">{app.icon}</div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{app.name}</span>
                    <span className={cn("text-[10px]", app.status === 'Connected' ? "text-emerald-500" : "text-zinc-500")}>{app.status}</span>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-zinc-400 hover:text-red-500 transition-colors">
                  {app.status === 'Connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        );
      case 'Privacy Settings':
        return (
          <div className="flex flex-col gap-6">
            {[
              { label: 'Public Profile', desc: 'Allow others to see your financial goals' },
              { label: 'Share Analytics', desc: 'Help us improve by sharing anonymous data' },
              { label: 'Search Visibility', desc: 'Show your profile in global search' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{item.label}</span>
                  <span className="text-[10px] text-zinc-500">{item.desc}</span>
                </div>
                <button className={cn("w-10 h-6 rounded-full p-1 transition-all", i === 0 ? "bg-zinc-300" : "bg-emerald-500")}>
                  <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm", i === 0 ? "" : "translate-x-4")} />
                </button>
              </div>
            ))}
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
                src={userProfile.avatar} 
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
                  <h3 className="text-3xl font-bold tracking-tight">{userProfile.name}</h3>
                  <p className="text-zinc-500 font-medium">{userProfile.email}</p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="text-[10px] font-bold px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg uppercase tracking-wider">
                    {userProfile.role}
                  </span>
                  <span className="text-[10px] font-bold px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg uppercase tracking-wider">
                    Verified Account
                  </span>
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className={cn(
                    "mt-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all w-fit mx-auto md:mx-0",
                    isDarkMode 
                      ? "bg-zinc-800 text-zinc-300 hover:bg-blue-500 hover:text-white" 
                      : "bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white"
                  )}
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 w-full max-w-md">
                <input 
                  type="text" 
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                  className={cn(
                    "px-4 py-3 rounded-xl border outline-none focus:border-blue-500 transition-all font-bold",
                    isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                  )}
                />
                <input 
                  type="email" 
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                  className={cn(
                    "px-4 py-3 rounded-xl border outline-none focus:border-blue-500 transition-all",
                    isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                  )}
                />
                <div className="flex gap-3">
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
          {/* Account Settings */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                <User size={18} />
              </div>
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Account & Security</h4>
            </div>
            
            <div className="flex flex-col gap-2">
              {[
                { label: 'Security & Password', icon: Shield, desc: 'Manage your password and 2FA', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Payment Methods', icon: CreditCard, desc: 'Add or remove payment cards', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Connected Apps', icon: Globe, desc: 'Manage third-party integrations', color: 'text-purple-500', bg: 'bg-purple-500/10' },
                { label: 'Privacy Settings', icon: Settings, desc: 'Control your data visibility', color: 'text-amber-500', bg: 'bg-amber-500/10' },
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveSection(item.label)}
                  className="flex items-center justify-between p-5 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all text-left group border border-transparent hover:border-blue-500/20"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-all group-hover:scale-110",
                      isDarkMode ? "bg-zinc-800" : item.bg,
                      isDarkMode ? "text-zinc-400 group-hover:text-white group-hover:bg-blue-500" : item.color
                    )}>
                      <item.icon size={20} />
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

          {/* Preferences */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                <Settings size={18} />
              </div>
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">App Preferences</h4>
            </div>

            <div className="flex flex-col gap-4">
              {/* Theme Toggle */}
              <div className={cn(
                "flex items-center justify-between p-6 rounded-3xl border transition-all",
                isDarkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-zinc-50 border-zinc-200"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    isDarkMode ? "bg-blue-500/20 text-blue-500" : "bg-amber-500/20 text-amber-500"
                  )}>
                    {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Appearance</span>
                    <span className="text-[10px] text-zinc-500">Current: {isDarkMode ? 'Dark' : 'Light'} Mode</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={cn(
                    "w-14 h-8 rounded-full p-1.5 transition-all duration-500 relative",
                    isDarkMode ? "bg-blue-500" : "bg-zinc-300"
                  )}
                >
                  <motion.div 
                    animate={{ x: isDarkMode ? 24 : 0 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>

              {/* Notifications Toggle */}
              <div className={cn(
                "flex items-center justify-between p-6 rounded-3xl border transition-all",
                isDarkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-zinc-50 border-zinc-200"
              )}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-xl">
                    <Bell size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Email Notifications</span>
                    <span className="text-[10px] text-zinc-500">Weekly financial insights</span>
                  </div>
                </div>
                <button 
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={cn(
                    "w-14 h-8 rounded-full p-1.5 transition-all duration-500 relative",
                    notificationsEnabled ? "bg-emerald-500" : "bg-zinc-300"
                  )}
                >
                  <motion.div 
                    animate={{ x: notificationsEnabled ? 24 : 0 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>

              {/* 2FA Toggle */}
              <div className={cn(
                "flex items-center justify-between p-6 rounded-3xl border transition-all",
                isDarkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-zinc-50 border-zinc-200"
              )}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/20 text-red-500 rounded-xl">
                    <Shield size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Two-Factor Auth</span>
                    <span className="text-[10px] text-zinc-500">Extra layer of security</span>
                  </div>
                </div>
                <button 
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={cn(
                    "w-14 h-8 rounded-full p-1.5 transition-all duration-500 relative",
                    twoFactorEnabled ? "bg-blue-500" : "bg-zinc-300"
                  )}
                >
                  <motion.div 
                    animate={{ x: twoFactorEnabled ? 24 : 0 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>

              {/* Face ID Toggle */}
              <div className={cn(
                "flex items-center justify-between p-6 rounded-3xl border transition-all",
                isDarkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-zinc-50 border-zinc-200"
              )}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 text-blue-500 rounded-xl">
                    <Scan size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Face ID Login</span>
                    <span className="text-[10px] text-zinc-500">Biometric authentication</span>
                  </div>
                </div>
                <button 
                  onClick={() => setFaceIdEnabled(!faceIdEnabled)}
                  className={cn(
                    "w-14 h-8 rounded-full p-1.5 transition-all duration-500 relative",
                    faceIdEnabled ? "bg-blue-500" : "bg-zinc-300"
                  )}
                >
                  <motion.div 
                    animate={{ x: faceIdEnabled ? 24 : 0 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>

              {/* Gullak Round-Up Setting */}
              <div className={cn(
                "flex flex-col gap-4 p-6 rounded-3xl border transition-all",
                isDarkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-zinc-50 border-zinc-200"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/20 text-amber-500 rounded-xl">
                      <ArrowUpRight size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">Gullak Round-Up</span>
                      <span className="text-[10px] text-zinc-500">Round to nearest amount</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {[10, 50, 100].map((val) => (
                      <button
                        key={val}
                        onClick={() => updateRoundUpSetting(val)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                          roundUpSetting === val
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                            : isDarkMode ? "bg-zinc-700 text-zinc-400" : "bg-white text-zinc-500"
                        )}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                  Every transaction will be rounded up to the nearest ₹{roundUpSetting}. The difference will be automatically added to your primary Gullak.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-4 pt-10 border-t dark:border-zinc-800 border-zinc-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-[2rem] bg-red-500/5 border border-red-500/20">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <h4 className="text-lg font-bold text-red-500 tracking-tight">Danger Zone</h4>
              <p className="text-sm text-zinc-500">Permanently delete your account and all financial data.</p>
            </div>
            <button className="px-8 py-3 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
              Delete Account
            </button>
          </div>
        </div>
      </section>

      {/* Sub-section Modal */}
      <AnimatePresence>
        {activeSection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSection(null)}
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
                    <h3 className="text-2xl font-bold">{activeSection}</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Settings Configuration</p>
                  </div>
                  <button 
                    onClick={() => setActiveSection(null)}
                    className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-red-500 hover:text-white transition-all group"
                  >
                    <Plus size={20} className="rotate-45 text-zinc-500 dark:text-zinc-400 group-hover:text-white transition-colors" />
                  </button>
                </div>

                <div className="min-h-[200px]">
                  {renderSubSection()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
