import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  setDoc,
  getDoc,
  getDocs,
  getDocFromServer,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  name: string;
  method: string;
  category: string;
  status: string;
  uid: string;
  createdAt: any;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  progress: number;
  deadline: string;
  uid: string;
  createdAt: any;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string;
  thresholds?: number[];
  uid: string;
  createdAt: any;
}

export interface Investment {
  id: string;
  type: 'FD' | 'EMI' | 'SIP' | 'RD';
  name: string;
  amount: number;
  dueDate: string;
  imageUrl?: string;
  interestRate?: number;
  uid: string;
  createdAt: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'error';
  date: string;
  read: boolean;
}

export interface ChartData {
  name: string;
  income: number;
  expense: number;
}

export interface GullakPot {
  id: string;
  name: string;
  emoji: string;
  target: number;
  current: number;
  lockDate: string;
  color: string;
  contributors: { name: string; avatar: string; share: number; uid: string }[];
  uid: string;
  createdAt: any;
}

export interface GullakDeposit {
  id: string;
  potId: string;
  amount: number;
  date: string;
  method: 'manual' | 'auto';
  note?: string;
  uid: string;
  createdAt: any;
}

export interface RoundUpHistory {
  id: string;
  date: string;
  originalAmount: number;
  roundedAmount: number;
  savedAmount: number;
  potId: string;
  potName: string;
  uid: string;
  createdAt: any;
}

interface FinanceContextType {
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  investments: Investment[];
  notifications: Notification[];
  chartData: ChartData[];
  gullakPots: GullakPot[];
  gullakDeposits: GullakDeposit[];
  roundUpHistory: RoundUpHistory[];
  roundUpSetting: number;
  savingStreak: number;
  notificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  setNotificationsEnabled: (val: boolean) => void;
  setTwoFactorEnabled: (val: boolean) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'uid' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'uid' | 'createdAt'>) => Promise<void>;
  updateGoalFunds: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'uid' | 'createdAt'>) => Promise<void>;
  updateBudget: (id: string, limit: number, thresholds?: number[]) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addInvestment: (investment: Omit<Investment, 'id' | 'uid' | 'createdAt'>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  seedSampleData: () => Promise<void>;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  updateBalance: (val: number) => Promise<void>;
  updateIncome: (val: number) => Promise<void>;
  updateExpense: (val: number) => Promise<void>;
  updateSavings: (val: number) => Promise<void>;
  faceIdEnabled: boolean;
  setFaceIdEnabled: (val: boolean) => void;
  isAuthReady: boolean;
  user: any;
  addGullakPot: (pot: Omit<GullakPot, 'id' | 'current' | 'uid' | 'createdAt'>) => Promise<void>;
  depositToGullak: (potId: string, amount: number, method: 'manual' | 'auto', note?: string) => Promise<void>;
  updateGullakPot: (id: string, updates: Partial<GullakPot>) => Promise<void>;
  deleteGullakPot: (id: string) => Promise<void>;
  updateRoundUpSetting: (val: number) => Promise<void>;
  getPotDeposits: (potId: string) => Promise<GullakDeposit[]>;
  roundUpPopup: { amount: number, potName: string } | null;
  setRoundUpPopup: (popup: { amount: number, potName: string } | null) => void;
  loginAsGuest: () => void;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.warn('Firestore Error (Mock Mode Active): ', JSON.stringify(errInfo));
  // Suppress thrown error so the app doesn't crash when running without Firebase Auth
  // throw new Error(JSON.stringify(errInfo));
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [gullakPots, setGullakPots] = useState<GullakPot[]>([]);
  const [gullakDeposits, setGullakDeposits] = useState<GullakDeposit[]>([]);
  const [roundUpHistory, setRoundUpHistory] = useState<RoundUpHistory[]>([]);
  const [roundUpSetting, setRoundUpSetting] = useState(10);
  const [savingStreak, setSavingStreak] = useState(0);
  const [roundUpPopup, setRoundUpPopup] = useState<{ amount: number, potName: string } | null>(null);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(() => {
    const saved = localStorage.getItem('budgetpro_notifications_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [twoFactorEnabled, setTwoFactorEnabledState] = useState(() => {
    const saved = localStorage.getItem('budgetpro_twofactor_enabled');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [faceIdEnabled, setFaceIdEnabledState] = useState(() => {
    const saved = localStorage.getItem('budgetpro_faceid_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const setFaceIdEnabled = (val: boolean) => {
    setFaceIdEnabledState(val);
    localStorage.setItem('budgetpro_faceid_enabled', JSON.stringify(val));
  };

  const setNotificationsEnabled = (val: boolean) => {
    setNotificationsEnabledState(val);
    localStorage.setItem('budgetpro_notifications_enabled', JSON.stringify(val));
  };

  const setTwoFactorEnabled = (val: boolean) => {
    setTwoFactorEnabledState(val);
    localStorage.setItem('budgetpro_twofactor_enabled', JSON.stringify(val));
  };

  const [manualStats, setManualStats] = useState<{
    balance: number | null;
    income: number | null;
    expense: number | null;
    savings: number | null;
  }>({ balance: null, income: null, expense: null, savings: null });

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();

    // Check if we have a locally saved guest user
    const guestUserStr = localStorage.getItem('budgetpro_guest_user');
    if (guestUserStr) {
      setUser(JSON.parse(guestUserStr));
      setIsAuthReady(true);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribeAuth();
  }, []);

  const loginAsGuest = () => {
    const mockUser = {
      uid: 'guest-' + Math.random().toString(36).substring(7),
      displayName: 'Guest Explorer',
      email: 'guest@budgetpro.app',
      photoURL: "https://ui-avatars.com/api/?name=Guest+Explorer&background=4fffb0&color=080d18"
    };
    localStorage.setItem('budgetpro_guest_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthReady(true);
    
    // Instantly load data into state for better understanding!
    const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
    const monthName = currentMonth.split(' ')[0];

    setBudgets([
      { id: 'b1', category: 'Food', limit: 5000, month: currentMonth, thresholds: [50, 80], uid: mockUser.uid, createdAt: new Date() },
      { id: 'b2', category: 'Shopping', limit: 8000, month: currentMonth, thresholds: [80, 100], uid: mockUser.uid, createdAt: new Date() }
    ]);

    setInvestments([
      { id: 'i1', type: 'FD', name: 'HDFC Fixed Deposit', amount: 100000, dueDate: '2026-12-21', interestRate: 7.5, uid: mockUser.uid, createdAt: new Date() },
      { id: 'i2', type: 'SIP', name: 'Nifty 50 Index Fund', amount: 5000, dueDate: '2026-04-01', uid: mockUser.uid, createdAt: new Date() },
      { id: 'i3', type: 'EMI', name: 'iPhone 15 Pro Max', amount: 8400, dueDate: '2026-04-05', uid: mockUser.uid, createdAt: new Date() },
      { id: 'i4', type: 'RD', name: 'SBI Recurring', amount: 2000, dueDate: '2027-01-01', interestRate: 6.8, uid: mockUser.uid, createdAt: new Date() }
    ]);

    setTransactions([
      { id: 't1', name: 'Salary Credit', amount: 75000, category: 'Income', method: 'Bank Transfer', status: 'Completed', date: `10 ${monthName} 2026`, uid: mockUser.uid, createdAt: new Date() },
      { id: 't2', name: 'Amazon Shopping', amount: -6500, category: 'Shopping', method: 'Credit Card', status: 'Completed', date: `12 ${monthName} 2026`, uid: mockUser.uid, createdAt: new Date() },
      { id: 't3', name: 'Zomato Order', amount: -850, category: 'Food', method: 'UPI', status: 'Completed', date: `13 ${monthName} 2026`, uid: mockUser.uid, createdAt: new Date() }
    ]);

    setGoals([
      { id: 'g1', name: 'New MacBook Pro', target: 180000, current: 45000, progress: 25, deadline: '2026-08-15', uid: mockUser.uid, createdAt: new Date() },
      { id: 'g2', name: 'Emergency Fund', target: 500000, current: 250000, progress: 50, deadline: '2028-01-01', uid: mockUser.uid, createdAt: new Date() },
      { id: 'g3', name: 'Europe Trip', target: 350000, current: 120000, progress: 34, deadline: '2027-05-20', uid: mockUser.uid, createdAt: new Date() }
    ]);

    const mockPots = [
      { id: 'p1', name: 'iPhone 16 Pro', emoji: '📱', target: 120000, current: 1550, lockDate: '2026-09-20', color: 'from-blue-500 to-indigo-600', contributors: [], uid: mockUser.uid, createdAt: new Date() },
      { id: 'p2', name: 'Dream Home', emoji: '🏠', target: 5000000, current: 250000, lockDate: '2030-01-01', color: 'from-emerald-500 to-teal-600', contributors: [], uid: mockUser.uid, createdAt: new Date() },
      { id: 'p3', name: 'Vacation Fund', emoji: '🏖️', target: 50000, current: 15000, lockDate: '2026-06-15', color: 'from-amber-500 to-orange-600', contributors: [], uid: mockUser.uid, createdAt: new Date() }
    ];
    setGullakPots(mockPots);

    setManualStats({ balance: 67650, income: 75000, expense: 7350, savings: 296550 });
  };

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setGoals([]);
      setManualStats({ balance: null, income: null, expense: null, savings: null });
      return;
    }

    // Preserve mock data and avoid remote overwrites perfectly for Guest Users
    if (user.uid.startsWith('guest-')) {
      return;
    }

    // Listen to Transactions
    const qTransactions = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txs);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'transactions'));

    // Listen to Goals
    const qGoals = query(
      collection(db, 'goals'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeGoals = onSnapshot(qGoals, (snapshot) => {
      const gs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        progress: Math.round(((doc.data().current || 0) / (doc.data().target || 1)) * 100)
      } as Goal));
      setGoals(gs);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'goals'));

    // Listen to Budgets
    const qBudgets = query(
      collection(db, 'budgets'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeBudgets = onSnapshot(qBudgets, (snapshot) => {
      const bs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
      setBudgets(bs);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'budgets'));

    // Listen to Investments
    const qInvestments = query(
      collection(db, 'investments'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeInvestments = onSnapshot(qInvestments, (snapshot) => {
      const is = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment));
      setInvestments(is);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'investments'));

    // Listen to UserStats
    const unsubscribeStats = onSnapshot(doc(db, 'userStats', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setManualStats({
          balance: data.manualBalance ?? null,
          income: data.manualIncome ?? null,
          expense: data.manualExpense ?? null,
          savings: data.manualSavings ?? null,
        });
        setRoundUpSetting(data.roundUpSetting || 10);
        setSavingStreak(data.savingStreak || 0);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `userStats/${user.uid}`));

    // Listen to Gullak Pots
    const qPots = query(
      collection(db, 'gullakPots'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribePots = onSnapshot(qPots, (snapshot) => {
      const pots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GullakPot));
      setGullakPots(pots);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'gullakPots'));

    // Listen to Round Up History
    const qRoundUp = query(
      collection(db, 'roundUpHistory'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeRoundUp = onSnapshot(qRoundUp, (snapshot) => {
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoundUpHistory));
      setRoundUpHistory(history);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'roundUpHistory'));

    // Listen to Gullak Deposits
    const qDeps = query(
      collection(db, 'gullakDeposits'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeDeps = onSnapshot(qDeps, (snapshot) => {
      const deps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GullakDeposit));
      setGullakDeposits(deps);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'gullakDeposits'));

    return () => {
      unsubscribeTransactions();
      unsubscribeGoals();
      unsubscribeBudgets();
      unsubscribeInvestments();
      unsubscribeStats();
      unsubscribePots();
      unsubscribeRoundUp();
      unsubscribeDeps();
    };
  }, [user]);

  // Derived stats
  const calculatedIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
  
  const calculatedExpense = Math.abs(transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + t.amount, 0));

  const calculatedSavings = goals.reduce((acc, g) => acc + g.current, 0);
  
  const calculatedBalance = calculatedIncome - calculatedExpense;

  const totalIncome = manualStats.income !== null ? manualStats.income : calculatedIncome;
  const totalExpense = manualStats.expense !== null ? manualStats.expense : calculatedExpense;
  const totalSavings = manualStats.savings !== null ? manualStats.savings : calculatedSavings;
  const totalBalance = manualStats.balance !== null ? manualStats.balance : calculatedBalance;

  // Update chart data based on transactions
  useEffect(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const newChartData = months.map(month => {
      const monthTxs = transactions.filter(t => {
        // Simple check: assuming date format like "12 Apr 1:00"
        return t.date.includes(month);
      });
      const income = monthTxs.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
      const expense = Math.abs(monthTxs.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0));
      return { name: month, income, expense };
    });
    setChartData(newChartData);
  }, [transactions]);

  const addTransaction = async (newTx: Omit<Transaction, 'id' | 'uid' | 'createdAt'>) => {
    if (!user) return;
    const cleanTx = Object.fromEntries(Object.entries(newTx).filter(([_, v]) => v !== undefined));
    const mockTx = { ...cleanTx, id: Math.random().toString(36).substr(2, 9), uid: user.uid, createdAt: new Date().toISOString() } as Transaction;
    setTransactions(prev => [mockTx, ...prev]);

    try {
      const txRef = await addDoc(collection(db, 'transactions'), {
        ...cleanTx,
        uid: user.uid,
        createdAt: serverTimestamp()
      });

      // Round-Up Engine
      if (newTx.amount < 0 && roundUpSetting > 0) {
        const absAmount = Math.abs(newTx.amount);
        const rounded = Math.ceil(absAmount / roundUpSetting) * roundUpSetting;
        const saved = rounded - absAmount;

        if (saved > 0) {
          // Find a pot to save into (default to the first one if available)
          const targetPot = gullakPots[0];
          if (targetPot) {
            await depositToGullak(targetPot.id, saved, 'auto', `Round-up from ${newTx.name}`);
            
            // Log to round-up history
            await addDoc(collection(db, 'roundUpHistory'), {
              date: newTx.date,
              originalAmount: absAmount,
              roundedAmount: rounded,
              savedAmount: saved,
              potId: targetPot.id,
              potName: targetPot.name,
              uid: user.uid,
              createdAt: serverTimestamp()
            });
            
            setRoundUpPopup({ amount: saved, potName: targetPot.name });
            setTimeout(() => setRoundUpPopup(null), 5000);
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
  };

  const addGoal = async (newGoal: Omit<Goal, 'id' | 'progress' | 'uid' | 'createdAt'>) => {
    if (!user) return;
    const cleanGoal = Object.fromEntries(Object.entries(newGoal).filter(([_, v]) => v !== undefined));
    const mockObj = { ...cleanGoal, id: Math.random().toString(36).substr(2, 9), progress: Math.round(((newGoal.current || 0) / (newGoal.target || 1)) * 100), uid: user.uid, createdAt: new Date().toISOString() } as Goal;
    setGoals(prev => [mockObj, ...prev]);

    try {
      await addDoc(collection(db, 'goals'), {
        ...cleanGoal,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'goals');
    }
  };

  const updateGoalFunds = async (id: string, amount: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, current: g.current + amount, progress: Math.round(((g.current + amount) / g.target) * 100) } : g));
    try {
      const goalRef = doc(db, 'goals', id);
      const goalSnap = await getDoc(goalRef);
      if (goalSnap.exists()) {
        const newCurrent = (goalSnap.data().current || 0) + amount;
        await updateDoc(goalRef, { current: newCurrent });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `goals/${id}`);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `goals/${id}`);
    }
  };

  const addBudget = async (budget: Omit<Budget, 'id' | 'uid' | 'createdAt'>) => {
    if (!user) return;
    const cleanBudget = Object.fromEntries(Object.entries(budget).filter(([_, v]) => v !== undefined));
    const mockObj = { ...cleanBudget, id: Math.random().toString(36).substr(2, 9), uid: user.uid, createdAt: new Date().toISOString() } as Budget;
    setBudgets(prev => [mockObj, ...prev]);

    try {
      await addDoc(collection(db, 'budgets'), {
        ...cleanBudget,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'budgets');
    }
  };

  const updateBudget = async (id: string, limit: number, thresholds?: number[]) => {
    try {
      await updateDoc(doc(db, 'budgets', id), { 
        limit,
        ...(thresholds && { thresholds })
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `budgets/${id}`);
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'budgets', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `budgets/${id}`);
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id' | 'uid' | 'createdAt'>) => {
    if (!user) return;
    const cleanInvestment = Object.fromEntries(Object.entries(investment).filter(([_, v]) => v !== undefined));
    const mockObj = { ...cleanInvestment, id: Math.random().toString(36).substr(2, 9), uid: user.uid, createdAt: new Date().toISOString() } as Investment;
    setInvestments(prev => [mockObj, ...prev]);

    try {
      await addDoc(collection(db, 'investments'), {
        ...cleanInvestment,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'investments');
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'investments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `investments/${id}`);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const seedSampleData = async () => {
    if (!user) return;
    const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
    const monthName = currentMonth.split(' ')[0];
    
    // 1. Add sample budgets
    const sampleBudgets = [
      { category: 'Food', limit: 5000, month: currentMonth, thresholds: [50, 80, 100] },
      { category: 'Transport', limit: 2000, month: currentMonth, thresholds: [75, 100] },
      { category: 'Entertainment', limit: 3000, month: currentMonth, thresholds: [90, 100] },
      { category: 'Shopping', limit: 10000, month: currentMonth, thresholds: [50, 75, 90, 100] },
    ];

    for (const b of sampleBudgets) {
      await addBudget(b);
    }

    // 2. Add sample investments
    const sampleInvestments = [
      { type: 'FD' as const, name: 'HDFC Fixed Deposit', amount: 100000, dueDate: '2026-12-21', interestRate: 7.5 },
      { type: 'EMI' as const, name: 'Car Loan EMI', amount: 15000, dueDate: '2026-04-05' },
      { type: 'EMI' as const, name: 'iPhone EMI', amount: 8500, dueDate: '2026-03-25' },
      { type: 'SIP' as const, name: 'Nifty 50 Index Fund', amount: 5000, dueDate: '2026-04-01' },
      { type: 'RD' as const, name: 'Post Office RD', amount: 2000, dueDate: '2026-04-10', interestRate: 6.8 },
    ];

    for (const i of sampleInvestments) {
      await addInvestment(i);
    }

    // 3. Add sample transactions for multiple months
    const sampleTransactions = [
      // Jan
      { name: 'Jan Salary', amount: 65000, category: 'Income', method: 'Bank Transfer', status: 'Completed', date: `10 Jan 2026` },
      { name: 'Jan Rent', amount: -15000, category: 'Bills', method: 'Net Banking', status: 'Completed', date: `05 Jan 2026` },
      { name: 'Jan Groceries', amount: -4500, category: 'Food', method: 'Credit Card', status: 'Completed', date: `12 Jan 2026` },
      // Feb
      { name: 'Feb Salary', amount: 65000, category: 'Income', method: 'Bank Transfer', status: 'Completed', date: `10 Feb 2026` },
      { name: 'Feb Rent', amount: -15000, category: 'Bills', method: 'Net Banking', status: 'Completed', date: `05 Feb 2026` },
      { name: 'Feb Shopping', amount: -8000, category: 'Shopping', method: 'Credit Card', status: 'Completed', date: `18 Feb 2026` },
      // Mar
      { name: 'Mar Salary', amount: 65000, category: 'Income', method: 'Bank Transfer', status: 'Completed', date: `10 Mar 2026` },
      { name: 'Mar Rent', amount: -15000, category: 'Bills', method: 'Net Banking', status: 'Completed', date: `05 Mar 2026` },
      { name: 'Mar Dinner', amount: -2500, category: 'Food', method: 'UPI', status: 'Completed', date: `15 Mar 2026` },
      // Current Month
      { name: 'Salary Credit', amount: 75000, category: 'Income', method: 'Bank Transfer', status: 'Completed', date: `10 ${monthName} 2026` },
      { name: 'Freelance Project', amount: 15000, category: 'Income', method: 'PayPal', status: 'Completed', date: `15 ${monthName} 2026` },
      { name: 'Grocery Store', amount: -3500, category: 'Food', method: 'Credit Card', status: 'Completed', date: `12 ${monthName} 2026` },
      { name: 'Uber Ride', amount: -450, category: 'Transport', method: 'UPI', status: 'Completed', date: `14 ${monthName} 2026` },
      { name: 'Netflix Subscription', amount: -650, category: 'Entertainment', method: 'Auto-Debit', status: 'Completed', date: `05 ${monthName} 2026` },
      { name: 'Amazon Shopping', amount: -8500, category: 'Shopping', method: 'Credit Card', status: 'Completed', date: `18 ${monthName} 2026` },
      { name: 'Electricity Bill', amount: -2200, category: 'Bills', method: 'Net Banking', status: 'Completed', date: `10 ${monthName} 2026` },
    ];

    for (const t of sampleTransactions) {
      await addTransaction(t);
    }

    // 4. Add sample goals
    const sampleGoals = [
      { name: 'New MacBook Pro', target: 180000, current: 45000, deadline: '2026-08-15' },
      { name: 'Europe Trip', target: 350000, current: 120000, deadline: '2027-05-20' },
      { name: 'Emergency Fund', target: 500000, current: 250000, deadline: '2028-01-01' },
    ];

    for (const g of sampleGoals) {
      await addGoal(g);
    }

    // 5. Add sample Gullak Pots
    const samplePots = [
      { name: 'iPhone 16 Pro', emoji: '📱', target: 120000, lockDate: '2026-09-20', color: 'from-blue-500 to-indigo-600', contributors: [] },
      { name: 'Dream Home', emoji: '🏠', target: 5000000, lockDate: '2030-01-01', color: 'from-emerald-500 to-teal-600', contributors: [] },
      { name: 'Vacation Fund', emoji: '🏖️', target: 50000, lockDate: '2026-06-15', color: 'from-amber-500 to-orange-600', contributors: [] },
    ];

    for (const p of samplePots) {
      await addGullakPot(p);
    }

    // 6. Add some sample deposits
    // We need to wait for pots to be added or find them
    // Since addDoc is async, we'll just add some deposits manually if we can find a pot
    // For simplicity in seeding, we'll just update the current amount of the first pot
    const potsQuery = query(collection(db, 'gullakPots'), where('uid', '==', user.uid));
    const potsSnap = await getDocs(potsQuery);
    if (!potsSnap.empty) {
      const firstPotId = potsSnap.docs[0].id;
      await depositToGullak(firstPotId, 5000, 'manual', 'Initial Seed Savings');
      await depositToGullak(firstPotId, 50, 'auto', 'Round-up from Lunch');
    }

    // 7. Update User Stats
    await updateBalance(90000);
    await updateIncome(90000);
    await updateExpense(23950);
    await updateSavings(66050);
    await updateStat('savingStreak', 5);
  };

  // Notification Logic
  useEffect(() => {
    if (!user) return;
    const newNotifications: Notification[] = [];
    const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

    // Budget Notifications
    budgets.forEach(budget => {
      const spending = Math.abs(transactions
        .filter(t => t.category === budget.category && t.amount < 0 && t.date.includes(currentMonth.split(' ')[0]))
        .reduce((acc, t) => acc + t.amount, 0));
      
      const percentage = (spending / budget.limit) * 100;
      const thresholds = budget.thresholds || [80, 100];
      
      // Sort thresholds descending to find the highest one reached
      const sortedThresholds = [...thresholds].sort((a, b) => b - a);
      const reachedThreshold = sortedThresholds.find(t => percentage >= t);

      if (reachedThreshold !== undefined) {
        if (reachedThreshold >= 100) {
          newNotifications.push({
            id: `budget-over-${budget.id}`,
            title: 'Budget Exceeded',
            message: `You have exceeded your budget for ${budget.category} by ₹${(spending - budget.limit).toFixed(2)}.`,
            type: 'error',
            date: new Date().toISOString(),
            read: false
          });
        } else {
          newNotifications.push({
            id: `budget-near-${budget.id}-${reachedThreshold}`,
            title: 'Budget Alert',
            message: `You have used ${reachedThreshold}% of your budget for ${budget.category}.`,
            type: 'warning',
            date: new Date().toISOString(),
            read: false
          });
        }
      }
    });

    // Investment Notifications
    const today = new Date();
    investments.forEach(inv => {
      const dueDate = new Date(inv.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7 && diffDays > 0) {
        newNotifications.push({
          id: `inv-due-${inv.id}`,
          title: `${inv.type} Due Soon`,
          message: `Your ${inv.name} ${inv.type} is due in ${diffDays} days.`,
          type: 'warning',
          date: new Date().toISOString(),
          read: false
        });
      } else if (diffDays <= 0) {
        newNotifications.push({
          id: `inv-matured-${inv.id}`,
          title: `${inv.type} Matured/Due`,
          message: `Your ${inv.name} ${inv.type} is due today or has matured.`,
          type: 'info',
          date: new Date().toISOString(),
          read: false
        });
      }
    });

    setNotifications(newNotifications);
  }, [budgets, transactions, investments, user]);

  const updateStat = async (field: string, val: number) => {
    if (!user) return;

    // Optimistic Update
    if (field.startsWith('manual')) {
      const stateKey = field.replace('manual', '').toLowerCase();
      setManualStats(prev => ({ ...prev, [stateKey]: val }));
    } else if (field === 'savingStreak') {
      setSavingStreak(val);
    } else if (field === 'roundUpSetting') {
      setRoundUpSetting(val);
    }

    try {
      await setDoc(doc(db, 'userStats', user.uid), {
        [field]: val,
        uid: user.uid
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `userStats/${user.uid}`);
    }
  };

  const updateBalance = (val: number) => updateStat('manualBalance', val);
  const updateIncome = (val: number) => updateStat('manualIncome', val);
  const updateExpense = (val: number) => updateStat('manualExpense', val);
  const updateSavings = (val: number) => updateStat('manualSavings', val);

  const checkStreak = async () => {
    if (!user) return;
    try {
      const userStatsRef = doc(db, 'userStats', user.uid);
      const userStatsSnap = await getDoc(userStatsRef);
      if (userStatsSnap.exists()) {
        const data = userStatsSnap.data();
        const lastDepositDate = data.lastDepositDate?.toDate();
        if (lastDepositDate) {
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - lastDepositDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays > 1) {
            // Streak broken if more than 1 day gap
            await updateDoc(userStatsRef, { savingStreak: 0 });
            setSavingStreak(0);
          }
        }
      }
    } catch (error) {
      console.error("Error checking streak:", error);
    }
  };

  useEffect(() => {
    if (user) {
      checkStreak();
    }
  }, [user]);

  const addGullakPot = async (pot: Omit<GullakPot, 'id' | 'current' | 'uid' | 'createdAt'>) => {
    if (!user) return;
    const cleanPot = Object.fromEntries(Object.entries(pot).filter(([_, v]) => v !== undefined));
    const mockObj = { ...cleanPot, current: 0, id: Math.random().toString(36).substr(2, 9), uid: user.uid, createdAt: new Date().toISOString() } as GullakPot;
    setGullakPots(prev => [mockObj, ...prev]);

    try {
      await addDoc(collection(db, 'gullakPots'), {
        ...cleanPot,
        current: 0,
        uid: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gullakPots');
    }
  };

  const depositToGullak = async (potId: string, amount: number, method: 'manual' | 'auto', note?: string) => {
    if (!user) return;
    setGullakPots(prev => prev.map(p => p.id === potId ? { ...p, current: p.current + amount } : p));
    setGullakDeposits(prev => [{ potId, amount, method, note: note || '', date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), uid: user.uid, id: Math.random().toString(36).substring(7), createdAt: new Date() }, ...prev]);
    
    try {
      const potRef = doc(db, 'gullakPots', potId);
      const potSnap = await getDoc(potRef);
      if (potSnap.exists()) {
        const newCurrent = (potSnap.data().current || 0) + amount;
        await updateDoc(potRef, { current: newCurrent });

        // Log deposit
        await addDoc(collection(db, 'gullakDeposits'), {
          potId,
          amount,
          method,
          note: note || (method === 'manual' ? 'Manual Deposit' : 'Auto Round-up'),
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          uid: user.uid,
          createdAt: serverTimestamp()
        });

        // Update Streak
        const userStatsRef = doc(db, 'userStats', user.uid);
        const userStatsSnap = await getDoc(userStatsRef);
        const now = new Date();
        
        if (userStatsSnap.exists()) {
          const data = userStatsSnap.data();
          const lastDepositDate = data.lastDepositDate?.toDate();
          let newStreak = data.savingStreak || 0;

          if (!lastDepositDate) {
            newStreak = 1;
          } else {
            const diffDays = Math.floor((now.getTime() - lastDepositDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              newStreak += 1;
            } else if (diffDays > 1) {
              newStreak = 1;
            }
          }

          await updateDoc(userStatsRef, { 
            savingStreak: newStreak,
            lastDepositDate: serverTimestamp()
          });
          setSavingStreak(newStreak);
        } else {
          await setDoc(userStatsRef, { 
            savingStreak: 1,
            lastDepositDate: serverTimestamp(),
            uid: user.uid
          }, { merge: true });
          setSavingStreak(1);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `gullakPots/${potId}`);
    }
  };

  const updateGullakPot = async (id: string, updates: Partial<GullakPot>) => {
    try {
      // Filter out undefined values to prevent Firestore errors
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );
      await updateDoc(doc(db, 'gullakPots', id), cleanUpdates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `gullakPots/${id}`);
    }
  };

  const deleteGullakPot = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gullakPots', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gullakPots/${id}`);
    }
  };

  const updateRoundUpSetting = async (val: number) => {
    setRoundUpSetting(val);
    await updateStat('roundUpSetting', val);
  };

  const getPotDeposits = async (potId: string) => {
    if (!user) return [];
    try {
      const q = query(
        collection(db, 'gullakDeposits'),
        where('potId', '==', potId),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      // In this environment, we'll use the onSnapshot state instead of a direct fetch
      // for better reliability with the current setup.
      return gullakDeposits.filter(d => d.potId === potId);
    } catch (error) {
      console.error("Error fetching deposits:", error);
      return [];
    }
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      goals,
      budgets,
      investments,
      notifications,
      chartData,
      gullakPots,
      gullakDeposits,
      roundUpHistory,
      roundUpSetting,
      savingStreak,
      addTransaction,
      deleteTransaction,
      addGoal,
      updateGoalFunds,
      deleteGoal,
      addBudget,
      updateBudget,
      deleteBudget,
      addInvestment,
      deleteInvestment,
      markNotificationRead,
      seedSampleData,
      totalBalance,
      totalIncome,
      totalExpense,
      totalSavings,
      updateBalance,
      updateIncome,
      updateExpense,
      updateSavings,
      faceIdEnabled,
      setFaceIdEnabled,
      notificationsEnabled,
      twoFactorEnabled,
      setNotificationsEnabled,
      setTwoFactorEnabled,
      isAuthReady,
      user,
      addGullakPot,
      depositToGullak,
      updateGullakPot,
      deleteGullakPot,
      updateRoundUpSetting,
      getPotDeposits,
      roundUpPopup,
      setRoundUpPopup,
      loginAsGuest
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
