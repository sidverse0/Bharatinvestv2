'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserData, UserInvestment, Transaction, TransactionType } from '@/types';
import { SIGNUP_BONUS, PROMO_CODES } from '@/lib/constants';
import { isToday, parseISO } from 'date-fns';

const USERS_DB_KEY = 'bharatinvest_users'; // Stores { name: password }
const SESSION_KEY = 'bharatinvest_session'; // Stores current logged-in name
const USER_DATA_PREFIX = 'bharatinvest_data_'; // Prefix for user-specific data

const getInitialUser = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
};

export function useUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState<string | null>(getInitialUser());

  const loadUser = useCallback((currentName: string) => {
    const data = localStorage.getItem(`${USER_DATA_PREFIX}${currentName}`);
    if (data) {
      const parsedData: UserData = JSON.parse(data);
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
        localStorage.setItem(`${USER_DATA_PREFIX}${currentName}`, JSON.stringify(parsedData));
      }
      setUser(parsedData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (name) {
      loadUser(name);
    } else {
      setLoading(false);
    }
  }, [name, loadUser]);

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
      // This logic allows using a code again on a different day.
      // The prompt says "valid only once per user & once per day" - this is ambiguous.
      // I'm interpreting as "a given code can be used once per day".
      // A stricter interpretation would be to never allow re-use.
      // To enforce stricter "once per user ever", change this to: return 'used_before';
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

  return { user, loading, addInvestment, addTransaction, applyPromoCode, reloadUser: () => name && loadUser(name) };
}
