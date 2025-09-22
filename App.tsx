
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, TransactionType } from './types';

// --- Helper Icon Component ---
const TrashIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

// --- Helper UI Components (defined outside App to prevent re-creation on re-renders) ---

interface SummaryCardProps {
  title: string;
  total: number;
  icon: React.ReactNode;
}
const SummaryCard: React.FC<SummaryCardProps> = ({ title, total, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex items-center space-x-4 space-x-reverse">
    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">
        {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(total)}
      </p>
    </div>
  </div>
);

interface TransactionListProps {
  title: string;
  transactions: Transaction[];
  onDelete: (id: string) => void;
}
const TransactionList: React.FC<TransactionListProps> = ({ title, transactions, onDelete }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{title}</h3>
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {transactions.length > 0 ? (
        transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-colors">
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-200">{tx.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(tx.date).toLocaleDateString('he-IL')}</p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className={`font-bold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(tx.amount)}
              </span>
              <button
                onClick={() => onDelete(tx.id)}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full"
                aria-label="מחק עסקה"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">אין עדיין עסקאות להציג.</p>
      )}
    </div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const savedTransactions = localStorage.getItem('savingsTrackerTransactions');
      return savedTransactions ? JSON.parse(savedTransactions) : [];
    } catch (error) {
      console.error("Failed to parse transactions from localStorage", error);
      return [];
    }
  });
  
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<TransactionType>(TransactionType.MyMoney);

  useEffect(() => {
    localStorage.setItem('savingsTrackerTransactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newAmount);
    if (!newDescription.trim() || isNaN(amount)) {
      alert("אנא מלא את כל השדות עם ערכים חוקיים.");
      return;
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount,
      description: newDescription,
      date: new Date().toISOString(),
      type: newType,
    };
    
    setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setNewAmount('');
    setNewDescription('');
  }, [newAmount, newDescription, newType]);

  const handleDeleteTransaction = useCallback((id: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק עסקה זו?")) {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    }
  }, []);

  const { myMoneyTransactions, dadsDebtTransactions } = useMemo(() => {
    return {
        myMoneyTransactions: transactions.filter(tx => tx.type === TransactionType.MyMoney),
        dadsDebtTransactions: transactions.filter(tx => tx.type === TransactionType.DadsDebt)
    }
  }, [transactions]);
  
  const myMoneyTotal = useMemo(() => myMoneyTransactions.reduce((sum, tx) => sum + tx.amount, 0), [myMoneyTransactions]);
  const dadsDebtTotal = useMemo(() => dadsDebtTransactions.reduce((sum, tx) => sum + tx.amount, 0), [dadsDebtTransactions]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white">מעקב חיסכון 💰</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2">נהל את החסכונות והחובות שלך במקום אחד.</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SummaryCard 
            title="הכסף שלי" 
            total={myMoneyTotal} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          />
          <SummaryCard 
            title="חוב של אבא" 
            total={dadsDebtTotal}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          />
        </div>

        {/* Add Transaction Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">הוספת עסקה חדשה</h2>
          <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">תיאור</label>
              <input type="text" id="description" value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="לדוגמה: מתנה ליום הולדת" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"/>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">סכום (בש"ח)</label>
              <input type="number" id="amount" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="200" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700"/>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">סוג העסקה</label>
              <select id="type" value={newType} onChange={e => setNewType(e.target.value as TransactionType)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700">
                <option value={TransactionType.MyMoney}>הכסף שלי</option>
                <option value={TransactionType.DadsDebt}>חוב של אבא</option>
              </select>
            </div>
            <button type="submit" className="md:col-start-4 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors">הוסף</button>
          </form>
        </div>

        {/* Transaction Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionList title="פירוט - הכסף שלי" transactions={myMoneyTransactions} onDelete={handleDeleteTransaction} />
          <TransactionList title="פירוט - חוב של אבא" transactions={dadsDebtTransactions} onDelete={handleDeleteTransaction} />
        </div>
      </div>
    </div>
  );
};

export default App;
