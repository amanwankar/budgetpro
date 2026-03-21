import React from 'react';
import { Search } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function HelpView({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="text-center flex flex-col gap-4 py-8">
        <h2 className="text-4xl font-bold tracking-tight">How can we help you?</h2>
        <p className="text-zinc-500">Search our knowledge base or browse frequently asked questions.</p>
        <div className={cn(
          "max-w-xl mx-auto w-full flex items-center gap-3 px-6 py-4 rounded-3xl border shadow-xl shadow-emerald-500/5 mt-4",
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
        )}>
          <Search size={24} className="text-zinc-400" />
          <input type="text" placeholder="Search for help..." className="bg-transparent border-none outline-none text-lg w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Getting Started', desc: 'Learn the basics of tracking your expenses and setting up goals.' },
          { title: 'Managing Transactions', desc: 'How to add, edit, and categorize your daily financial activities.' },
          { title: 'Security & Privacy', desc: 'Understand how we protect your data and manage your account security.' },
          { title: 'Billing & Premium', desc: 'Information about subscription plans and premium features.' },
        ].map((item, i) => (
          <button key={i} className={cn(
            "p-8 rounded-3xl border text-left hover:border-blue-500 transition-all group",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
          )}>
            <h3 className="text-lg font-bold mb-2 group-hover:text-blue-500 transition-colors">{item.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
          </button>
        ))}
      </div>

      <section className={cn(
        "p-8 rounded-3xl border flex flex-col gap-6 text-center",
        isDarkMode ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-100"
      )}>
        <h3 className="text-xl font-bold">Still need help?</h3>
        <p className="text-sm text-zinc-500">Our support team is available 24/7 to assist you with any questions.</p>
        <button className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all w-fit mx-auto shadow-lg shadow-emerald-500/20">
          Contact Support
        </button>
      </section>
    </div>
  );
}
