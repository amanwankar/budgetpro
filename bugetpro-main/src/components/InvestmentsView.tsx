import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, Calendar, CreditCard, Landmark, ExternalLink, Image as ImageIcon, Scan, Loader2, Camera, TrendingUp, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function InvestmentsView({ isDarkMode }: { isDarkMode: boolean }) {
  const { investments, addInvestment, deleteInvestment } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    type: 'FD' as 'FD' | 'EMI' | 'SIP' | 'RD',
    name: '',
    amount: '',
    dueDate: '',
    interestRate: '',
    imageUrl: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, autoScan = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setFormData(prev => ({ ...prev, imageUrl: imageData }));
        if (autoScan) {
          scanDocument(imageData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const scanDocument = async (imageData?: string) => {
    const targetImage = imageData || formData.imageUrl;
    if (!targetImage) return;
    setIsScanning(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = targetImage.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            parts: [
              { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
              { text: "Extract investment details from this document. Return a JSON object with: name (string), amount (number), type ('FD', 'EMI', 'SIP', or 'RD'), dueDate (string in YYYY-MM-DD format), interestRate (number). If a field is not found, use null. Only return the JSON." }
            ]
          }
        ],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text);
      if (result) {
        setFormData(prev => ({
          ...prev,
          name: result.name || prev.name,
          amount: result.amount?.toString() || prev.amount,
          type: (['FD', 'EMI', 'SIP', 'RD'].includes(result.type)) ? result.type : prev.type,
          dueDate: result.dueDate || prev.dueDate,
          interestRate: result.interestRate?.toString() || prev.interestRate
        }));
      }
    } catch (error) {
      console.error("Scanning error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    await addInvestment({
      type: formData.type,
      name: formData.name,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      interestRate: parseFloat(formData.interestRate) || 0,
      imageUrl: formData.imageUrl
    });
    setShowAddModal(false);
    setFormData({ type: 'FD', name: '', amount: '', dueDate: '', interestRate: '', imageUrl: '' });
  };

  const today = new Date();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold">Investments, SIPs & EMIs</h2>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Track your FDs, SIPs, RDs and EMI commitments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/40 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Add Investment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {investments.map((inv) => {
          const dueDate = new Date(inv.dueDate);
          const diffTime = dueDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const isNear = diffDays <= 7 && diffDays > 0;
          const isOverdue = diffDays <= 0;

          return (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-8 rounded-[2rem] border flex flex-col gap-6 transition-all duration-500 card-shadow card-shadow-hover group relative overflow-hidden",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
              )}
            >
              {isNear && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-lg">
                  Due Soon
                </div>
              )}
              {isOverdue && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-lg">
                  {inv.type === 'FD' ? 'Matured' : inv.type === 'SIP' ? 'Next SIP' : inv.type === 'RD' ? 'Matured' : 'Overdue'}
                </div>
              )}

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-4 rounded-2xl shadow-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110",
                    inv.type === 'FD' 
                      ? (isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-500")
                      : inv.type === 'SIP'
                      ? (isDarkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-50 text-emerald-500")
                      : inv.type === 'RD'
                      ? (isDarkMode ? "bg-amber-900/30 text-amber-400" : "bg-amber-50 text-amber-500")
                      : (isDarkMode ? "bg-purple-900/30 text-purple-400" : "bg-purple-50 text-purple-500")
                  )}>
                    {inv.type === 'FD' ? (
                      <Landmark size={24} strokeWidth={2.5} />
                    ) : inv.type === 'SIP' ? (
                      <TrendingUp size={24} strokeWidth={2.5} />
                    ) : inv.type === 'RD' ? (
                      <Repeat size={24} strokeWidth={2.5} />
                    ) : (
                      <CreditCard size={24} strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold">{inv.name}</h3>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      inv.type === 'FD' ? "text-blue-500" : 
                      inv.type === 'SIP' ? "text-emerald-500" :
                      inv.type === 'RD' ? "text-amber-500" :
                      "text-purple-500"
                    )}>{inv.type}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteInvestment(inv.id)}
                  className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Amount</span>
                    <span className="text-2xl font-bold">₹{inv.amount.toLocaleString()}</span>
                  </div>
                  {inv.interestRate > 0 && (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Interest</span>
                      <span className="text-sm font-bold text-emerald-500">+{inv.interestRate}% p.a.</span>
                    </div>
                  )}
                </div>

                <div className={cn(
                  "p-4 rounded-2xl flex items-center gap-4 transition-colors duration-300",
                  isDarkMode ? "bg-zinc-800 group-hover:bg-zinc-700" : "bg-zinc-50 group-hover:bg-zinc-100"
                )}>
                  <div className={cn(
                    "p-2 rounded-lg",
                    isOverdue ? "bg-red-500/10 text-red-500" : isNear ? "bg-amber-500/10 text-amber-500" : "bg-zinc-400/10 text-zinc-400"
                  )}>
                    <Calendar size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Due Date</p>
                    <p className={cn(
                      "text-sm font-bold",
                      isOverdue ? "text-red-500" : isNear ? "text-amber-500" : isDarkMode ? "text-zinc-300" : "text-zinc-700"
                    )}>
                      {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {inv.imageUrl && (
                  <a
                    href={inv.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-center gap-3 w-full py-4 rounded-2xl border-2 border-dashed font-bold uppercase tracking-widest text-[10px] transition-all duration-300",
                      isDarkMode 
                        ? "border-zinc-800 text-zinc-500 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5" 
                        : "border-zinc-200 text-zinc-400 hover:border-blue-500/50 hover:text-blue-500 hover:bg-blue-50"
                    )}
                  >
                    <ImageIcon size={16} strokeWidth={2.5} />
                    View Document
                    <ExternalLink size={14} strokeWidth={2.5} />
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}

        {investments.length === 0 && (
          <div className={`col-span-full p-12 text-center rounded-2xl border-2 border-dashed ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Landmark size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Investments Yet</h3>
            <p className="text-gray-500">Add your Fixed Deposits, SIPs, RDs or EMI plans to track their maturity and payments.</p>
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
                <h3 className="text-2xl font-black tracking-tight">Add Investment/EMI</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddInvestment} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="p-4 rounded-2xl border-2 border-dashed border-blue-500/30 bg-blue-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Scan size={18} className="text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">AI Document Scanner</span>
                    </div>
                    {isScanning && <Loader2 size={18} className="text-blue-500 animate-spin" />}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium italic mb-4">Scan receipt to auto-fill using AI.</p>
                  <div className="flex gap-3">
                    <label className={cn(
                      "flex-1 flex items-center justify-center gap-3 p-3 rounded-xl border-2 border-dashed transition-all duration-300",
                      isScanning ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                      isDarkMode ? "border-zinc-700 hover:border-blue-500 bg-zinc-800/50" : "border-zinc-200 hover:border-blue-500 bg-zinc-50"
                    )}>
                      {isScanning ? (
                        <>
                          <Loader2 size={18} className="text-blue-500 animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Scanning...</span>
                        </>
                      ) : (
                        <>
                          <Camera size={18} className="text-blue-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Scan</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        onChange={(e) => handleFileUpload(e, true)} 
                        className="hidden" 
                        disabled={isScanning}
                      />
                    </label>
                    <label className={cn(
                      "flex items-center justify-center p-3 rounded-xl border-2 border-dashed transition-all duration-300",
                      isScanning ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                      isDarkMode ? "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50" : "border-zinc-200 hover:border-zinc-300 bg-zinc-50"
                    )} title="Upload from Gallery">
                      {isScanning ? (
                        <Loader2 size={18} className="text-zinc-400 animate-spin" />
                      ) : (
                        <ImageIcon size={18} className="text-zinc-400" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, true)} 
                        className="hidden" 
                        disabled={isScanning}
                      />
                    </label>
                  </div>
                </div>

                <div className={cn(
                  "flex flex-wrap gap-2 p-2 rounded-2xl",
                  isDarkMode ? "bg-zinc-800" : "bg-zinc-100"
                )}>
                  {[
                    { id: 'FD', label: 'FD', color: 'text-blue-500' },
                    { id: 'SIP', label: 'SIP', color: 'text-emerald-500' },
                    { id: 'RD', label: 'RD', color: 'text-amber-500' },
                    { id: 'EMI', label: 'EMI', color: 'text-purple-500' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.id as any })}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                        formData.type === type.id 
                          ? (isDarkMode ? "bg-zinc-700 shadow-lg " : "bg-white shadow-md ") + type.color 
                          : "text-zinc-500"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Name / Bank</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={
                      formData.type === 'FD' ? "e.g. HDFC Bank FD" : 
                      formData.type === 'SIP' ? "e.g. Nifty 50 SIP" :
                      formData.type === 'RD' ? "e.g. Post Office RD" :
                      "e.g. Home Loan EMI"
                    }
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                      isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      {formData.type === 'EMI' || formData.type === 'SIP' || formData.type === 'RD' ? 'Monthly (₹)' : 'Principal (₹)'}
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder={formData.type === 'SIP' ? "5000" : "50000"}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      {formData.type === 'SIP' ? 'Return (%)' : 'Rate (%)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                      placeholder={formData.type === 'SIP' ? "12" : "7.5"}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {formData.type === 'FD' ? 'Maturity Date' : 
                     formData.type === 'EMI' ? 'Next EMI Date' :
                     formData.type === 'SIP' ? 'Next SIP Date' :
                     'Next RD Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                      isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                    )}
                  />
                </div>

                {formData.imageUrl && (
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, imageUrl: ''})}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <Plus size={16} className="rotate-45" />
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Doc URL (Opt.)</label>
                  <input
                    type="url"
                    value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/receipt.jpg"
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                      isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                    )}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={cn(
                      "flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                      isDarkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    Save
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
