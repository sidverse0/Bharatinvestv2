'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserData, UserInvestment, Transaction } from '@/types';
import { SIGNUP_BONUS, PROMO_CODES } from '@/lib/constants';
import { isToday, parseISO } from 'date-fns';

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

  // Function to reload user data from localStorage
  const loadUser = useCallback((currentName: string) => {
    setLoading(true);
    const data = localStorage.getItem(`${USER_DATA_PREFIX}${currentName}`);
    if (data) {
      let parsedData: UserData = JSON.parse(data);
      
      // Apply sign-up bonus on first login
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

  const updateUser = (data: UserData) => {
    setUser(data);
    localStorage.setItem(`${USER_DATA_PREFIX}${data.name}`, JSON.stringify(data));
  };

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
    const updatedUser = {
      ...user,
      balance: user.balance - investment.amount,
      investments: [newInvestment, ...user.investments],
      transactions: [newTransaction, ...user.transactions],
    };
    updateUser(updatedUser);
  }, [user]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'date'>) => {
    if (!user) return;
    const newTransaction: Transaction = { ...tx, id: crypto.randomUUID(), date: new Date().toISOString() };
    const updatedUser = {
      ...user,
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
