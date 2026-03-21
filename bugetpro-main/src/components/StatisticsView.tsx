import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, AreaChart, CartesianGrid, XAxis, YAxis, Area } from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function StatisticsView({ isDarkMode }: { isDarkMode: boolean }) {
  const { transactions, chartData, totalIncome, totalExpense } = useFinance();

  // Derive category data from transactions
  const categoryMap: { [key: string]: number } = {};
  transactions.filter(t => t.amount < 0).forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + Math.abs(t.amount);
  });

  const categoryData = Object.keys(categoryMap).map(name => ({
    name,
    value: categoryMap[name],
    color: name === 'Food' ? '#10b981' : 
           name === 'Shopping' ? '#3b82f6' : 
           name === 'Transport' ? '#f59e0b' : 
           name === 'Subscription' ? '#8b5cf6' : 
           name === 'Groceries' ? '#ec4899' : '#a1a1aa'
  }));

  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Category Breakdown */}
      <section className={cn(
        "p-10 rounded-[2.5rem] border flex flex-col gap-8 transition-all duration-500 card-shadow hover:shadow-2xl",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      )}>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black tracking-tight">Spending by Category</h2>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Distribution of your expenses</p>
        </div>
        <div className="h-[350px] w-full flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `₹${value.toLocaleString()}`}
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                  borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                  borderRadius: '20px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: 'none',
                  padding: '12px 16px'
                }}
                itemStyle={{ fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={40}
                iconType="circle"
                formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Monthly Trend */}
      <section className={cn(
        "p-10 rounded-[2.5rem] border flex flex-col gap-8 transition-all duration-500 card-shadow hover:shadow-2xl",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      )}>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black tracking-tight">Income vs Expense Trend</h2>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Financial growth over time</p>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#27272a" : "#f4f4f5"} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: '900' }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: '900' }} 
                dx={-10}
                tickFormatter={(value) => `₹${value/1000}k`}
              />
              <Tooltip 
                formatter={(value: number) => `₹${value.toLocaleString()}`}
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                  borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                  borderRadius: '20px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: 'none',
                  padding: '12px 16px'
                }}
                itemStyle={{ fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <Legend 
                verticalAlign="top" 
                align="right"
                height={40} 
                iconType="circle"
                formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">{value}</span>}
              />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: isDarkMode ? '#18181b' : '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={4} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: isDarkMode ? '#18181b' : '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Income', value: 'Overall', amount: `₹${totalIncome.toLocaleString()}`, color: 'text-emerald-500', icon: 'bg-emerald-500/10' },
          { label: 'Total Expenses', value: 'Overall', amount: `₹${totalExpense.toLocaleString()}`, color: 'text-red-500', icon: 'bg-red-500/10' },
          { label: 'Savings Rate', value: 'Overall', amount: `${savingsRate}%`, color: 'text-blue-500', icon: 'bg-blue-500/10' },
        ].map((stat, i) => (
          <div key={i} className={cn(
            "p-8 rounded-[2rem] border flex flex-col gap-4 transition-all duration-500 card-shadow card-shadow-hover group",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
          )}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</span>
              <div className={cn("w-2 h-2 rounded-full animate-pulse", stat.color.replace('text-', 'bg-'))}></div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black tracking-tighter group-hover:text-blue-500 transition-colors">{stat.amount}</span>
              <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full", stat.icon, stat.color)}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
