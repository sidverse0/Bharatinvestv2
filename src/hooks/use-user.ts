
'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserData, UserInvestment, Transaction } from '@/types';
import { SIGNUP_BONUS, PROMO_CODES } from '@/lib/constants';
import { isToday, parseISO, differenceInMinutes, differenceInCalendarDays, isBefore, addDays } from 'date-fns';

const SESSION_KEY = 'bharatinvest_session'; // Stores current logged-in name
const USER_DATA_PREFIX = 'bharatinvest_data_'; // Prefix for user-specific data

const getSessionName = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
};

export function useUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionName, setSessionName] = useState<string | null>(getSessionName());

  const updateUser = (data: UserData) => {
    setUser(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${USER_DATA_PREFIX}${data.name}`, JSON.stringify(data));
    }
  };

  // Function to reload user data from localStorage
  const loadUser = useCallback((currentName: string) => {
    setLoading(true);
    const data = localStorage.getItem(`${USER_DATA_PREFIX}${currentName}`);
    if (data) {
      let parsedData: UserData = JSON.parse(data);
      let dataChanged = false;

      // Ensure all fields from UserData are present
      if (typeof parsedData.lastLoginDate === 'undefined' || !parsedData.lastLoginDate) {
        parsedData.lastLoginDate = new Date().toISOString();
        dataChanged = true;
      }
      if (typeof parsedData.loginStreak === 'undefined') {
        parsedData.loginStreak = 1;
        dataChanged = true;
      }
      if (typeof parsedData.totalDeposits === 'undefined') {
        parsedData.totalDeposits = 0;
        dataChanged = true;
      }
       if (typeof parsedData.firstInvestmentMade === 'undefined') {
        parsedData.firstInvestmentMade = false;
        dataChanged = true;
      }
      if (typeof parsedData.todaysReturn === 'undefined') {
        parsedData.todaysReturn = 0;
        dataChanged = true;
      }

      // Apply sign-up bonus on first login & set streak
      if(parsedData.isFirstLogin) {
        parsedData.balance += SIGNUP_BONUS;
        parsedData.transactions.unshift({
          id: crypto.randomUUID(),
          type: 'bonus',
          amount: SIGNUP_BONUS,
          status: 'success',
          date: new Date().toISOString(),
          description: 'Sign-up Bonus',
        });
        parsedData.isFirstLogin = false;
        parsedData.lastLoginDate = new Date().toISOString();
        parsedData.loginStreak = 1;
        dataChanged = true;
      } else {
         // Update login streak
        const today = new Date();
        const lastLogin = parseISO(parsedData.lastLoginDate);
        const daysDiff = differenceInCalendarDays(today, lastLogin);

        if (daysDiff === 1) {
            parsedData.loginStreak += 1;
            dataChanged = true;
        } else if (daysDiff > 1) {
            parsedData.loginStreak = 1; // Reset streak
            dataChanged = true;
        }
        // If daysDiff is 0, they already logged in today, do nothing.
        if (daysDiff > 0) {
          parsedData.lastLoginDate = today.toISOString();
        }
      }
      
      // Auto-approve transactions older than 2 minutes
      const now = new Date();
      parsedData.transactions = parsedData.transactions.map(tx => {
        if (tx.status === 'pending' && differenceInMinutes(now, parseISO(tx.date)) >= 2) {
          dataChanged = true;
          if (tx.type === 'deposit') {
            parsedData.balance += tx.amount;
            parsedData.totalDeposits = (parsedData.totalDeposits || 0) + tx.amount;
          } else if (tx.type === 'withdrawal') {
            // Balance is already deducted on request for withdrawals in this app's logic
          }
          return { ...tx, status: 'success' };
        }
        return tx;
      });

      // Calculate today's return
      let todaysReturn = 0;
      parsedData.investments.forEach(inv => {
          const startDate = parseISO(inv.startDate);
          const endDate = addDays(startDate, inv.duration);
          if (isBefore(new Date(), endDate)) { // Only count active investments
              todaysReturn += (inv.expectedReturn - inv.amount) / inv.duration;
          }
      });
      parsedData.todaysReturn = todaysReturn;


      if(dataChanged) {
        // Save the updated data back to localStorage immediately
        localStorage.setItem(`${USER_DATA_PREFIX}${currentName}`, JSON.stringify(parsedData));
      }
      setUser(parsedData);

    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Effect to load user data when session changes
  useEffect(() => {
    if (sessionName) {
      loadUser(sessionName);
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [sessionName, loadUser]);

  // Effect to listen for storage changes (e.g., login/logout in other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      setSessionName(getSessionName());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Periodic check for transaction status
  useEffect(() => {
    const interval = setInterval(() => {
        if (sessionName) {
            loadUser(sessionName)
        }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [sessionName, loadUser]);


  const addInvestment = useCallback((investment: Omit<UserInvestment, 'id'>) => {
    if (!user) return;
    const newInvestment: UserInvestment = { ...investment, id: crypto.randomUUID() };
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'investment',
      amount: investment.amount,
      status: 'success',
      date: new Date().toISOString(),
      description: `Invested in ${investment.planName}`,
    };
    const updatedUser: UserData = {
      ...user,
      balance: user.balance - investment.amount,
      investments: [newInvestment, ...user.investments],
      transactions: [newTransaction, ...user.transactions],
      firstInvestmentMade: true,
    };
    updateUser(updatedUser);
  }, [user]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'date'>) => {
    if (!user) return;
    const newTransaction: Transaction = { ...tx, id: crypto.randomUUID(), date: new Date().toISOString() };
    
    let newBalance = user.balance;
    // For withdrawals, deduct from balance immediately upon request
    if (newTransaction.type === 'withdrawal') {
        newBalance -= newTransaction.amount;
    }

    const updatedUser = {
      ...user,
      balance: newBalance,
      transactions: [newTransaction, ...user.transactions],
    };
    updateUser(updatedUser);
  }, [user]);

  const applyPromoCode = useCallback((code: string): 'success' | 'used_today' | 'used_before' | 'invalid' => {
    if (!user) return 'invalid';
    
    const promoValue = PROMO_CODES[code.toUpperCase()];
    if (!promoValue) return 'invalid';

    const usedDate = user.usedPromoCodes[code.toUpperCase()];
    if (usedDate) {
        // This logic allows using a code again if it wasn't used today.
        // To make it one-time only, just `return 'used_before';`
        if (isToday(parseISO(usedDate))) {
            return 'used_today';
        }
    }
    
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'promo',
      amount: promoValue,
      status: 'success',
      date: new Date().toISOString(),
      description: `Promo Code: ${code.toUpperCase()}`,
    };

    const updatedUser = {
      ...user,
      balance: user.balance + promoValue,
      transactions: [newTransaction, ...user.transactions],
      usedPromoCodes: {
        ...user.usedPromoCodes,
        [code.toUpperCase()]: new Date().toISOString(),
      },
    };
    updateUser(updatedUser);
    return 'success';
  }, [user]);

  return { user, loading, addInvestment, addTransaction, applyPromoCode, reloadUser: () => sessionName && loadUser(sessionName) };
}
