import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Trash2, Smartphone } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function TransactionsView({ isDarkMode }: { isDarkMode: boolean }) {
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Food',
    method: 'Cash',
    type: 'expense'
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(formData.amount) }),
      });
      const order = await response.json();

      const options = {
        key: "rzp_test_dummy_id", // In real app, fetch from server or env
        amount: order.amount,
        currency: order.currency,
        name: "BudgetPro",
        description: `Payment for ${formData.name || 'Transaction'}`,
        order_id: order.id,
        handler: async (response: any) => {
          // Verify payment on server
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.status === 'success') {
            await addTransaction({
              name: formData.name || 'UPI Payment',
              amount: -parseFloat(formData.amount),
              category: formData.category,
              method: 'UPI (PhonePe/GPay)',
              date: new Date().toLocaleString('default', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
              status: 'Completed'
            });
            setShowAddModal(false);
            setFormData({ name: '', amount: '', category: 'Food', method: 'Cash', type: 'expense' });
            alert("Payment Successful & Transaction Added!");
          } else {
            alert("Payment Verification Failed");
          }
        },
        prefill: {
          name: "Aman",
          email: "amanwankar18@gmail.com",
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Failed to initiate payment. Please check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    await addTransaction({
      name: formData.name,
      amount: formData.type === 'expense' ? -amount : amount,
      category: formData.category,
      method: formData.method,
      date: new Date().toLocaleString('default', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
      status: 'Completed'
    });
    setShowAddModal(false);
    setFormData({ name: '', amount: '', category: 'Food', method: 'Cash', type: 'expense' });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-6">
        <div className={cn(
          "flex-1 max-w-md flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 card-shadow focus-within:shadow-xl focus-within:border-blue-500/50",
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
        )}>
          <Search size={20} className="text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="bg-transparent border-none outline-none text-sm w-full font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/40 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Add Transaction</span>
        </button>
      </div>

      <section className={cn(
        "p-10 rounded-[2.5rem] border flex flex-col gap-8 card-shadow",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      )}>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black tracking-tight">All Transactions</h2>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Manage your financial history</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={cn(
                "text-left text-[11px] uppercase tracking-wider font-bold",
                isDarkMode ? "text-zinc-500" : "text-zinc-400"
              )}>
                <th className="pb-4 px-4">Date</th>
                <th className="pb-4 px-4">Name</th>
                <th className="pb-4 px-4">Category</th>
                <th className="pb-4 px-4">Method</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 px-4 text-right">Amount</th>
                <th className="pb-4 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800 divide-zinc-100">
              {transactions.filter(tx => tx.name.toLowerCase().includes(searchTerm.toLowerCase())).map((tx) => (
                <tr key={tx.id} className="group hover:bg-blue-500/5 transition-all duration-300">
                  <td className="py-6 px-4 text-xs font-black text-zinc-500 uppercase tracking-tighter">{tx.date}</td>
                  <td className="py-6 px-4 text-sm font-black tracking-tight">{tx.name}</td>
                  <td className="py-6 px-4">
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest",
                      isDarkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                    )}>
                      {tx.category === 'Food' && '🍔 '}
                      {tx.category === 'Shopping' && '🛍️ '}
                      {tx.category === 'Transport' && '🚗 '}
                      {tx.category === 'Subscription' && '📺 '}
                      {tx.category === 'Groceries' && '🛒 '}
                      {tx.category === 'Income' && '💰 '}
                      {tx.category === 'Other' && '📦 '}
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">{tx.method}</td>
                  <td className="py-6 px-4">
                    <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-pulse"></div>
                      {tx.status}
                    </span>
                  </td>
                  <td className={cn(
                    "py-6 px-4 text-base font-black text-right tracking-tighter",
                    tx.amount < 0 ? "text-zinc-900 dark:text-white" : "text-emerald-500"
                  )}>{tx.amount < 0 ? `-₹${Math.abs(tx.amount).toLocaleString()}` : `+₹${tx.amount.toLocaleString()}`}</td>
                  <td className="py-6 px-4 text-right">
                    <button 
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
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
                <h3 className="text-2xl font-black tracking-tight">Add Transaction</h3>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Transaction Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                      isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                    )}
                    placeholder="e.g. Salary, Rent, Grocery"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Amount (₹)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                      isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                    )}
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                      )}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 font-black tracking-tight focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-100 text-zinc-900"
                      )}
                    >
                      <option value="Food">🍔 Food</option>
                      <option value="Shopping">🛍️ Shopping</option>
                      <option value="Transport">🚗 Transport</option>
                      <option value="Subscription">📺 Subscription</option>
                      <option value="Groceries">🛒 Groceries</option>
                      <option value="Income">💰 Income</option>
                      <option value="Other">📦 Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    Save Manually
                  </button>
                  
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"></div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Or Pay Online</span>
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"></div>
                  </div>

                  <button 
                    type="button"
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Smartphone size={20} strokeWidth={3} />
                        <span>Pay via UPI (PhonePe/GPay)</span>
                      </>
                    )}
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
