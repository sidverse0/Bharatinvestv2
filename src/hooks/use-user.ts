
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserData, UserInvestment, Transaction, InvestmentPlan } from '@/types';
import { SIGNUP_BONUS, PROMO_CODES, INVESTMENT_PLANS } from '@/lib/constants';
import { isToday, parseISO, differenceInMinutes, differenceInCalendarDays, isBefore, addDays, startOfTomorrow, startOfToday, differenceInHours } from 'date-fns';

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
  const router = useRouter();

  const updateUser = (data: UserData) => {
    setUser(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${USER_DATA_PREFIX}${data.name}`, JSON.stringify(data));
    }
  };

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
      if (typeof parsedData.lastCheckInDate === 'undefined') {
        parsedData.lastCheckInDate = ''; // Set to empty string if not present
        dataChanged = true;
      }
      if (typeof parsedData.checkInStreak === 'undefined') {
        parsedData.checkInStreak = 0;
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
          dataChanged = true;
        }
      }
      
      const now = new Date();
      parsedData.transactions = parsedData.transactions.map(tx => {
        if (tx.status !== 'pending') return tx;

        const txDate = parseISO(tx.date);

        // Auto-approve deposits older than 2 minutes
        if (tx.type === 'deposit' && differenceInMinutes(now, txDate) >= 2) {
            dataChanged = true;
            parsedData.balance += tx.amount;
            parsedData.totalDeposits = (parsedData.totalDeposits || 0) + tx.amount;
            return { ...tx, status: 'success' };
        }
        
        // Auto-fail withdrawals older than 24 hours
        if (tx.type === 'withdrawal' && differenceInHours(now, txDate) >= 24) {
            dataChanged = true;
            // Refund the balance
            parsedData.balance += tx.amount;
            // Add a refund transaction for clarity
            parsedData.transactions.unshift({
                id: crypto.randomUUID(),
                type: 'return',
                amount: tx.amount,
                status: 'success',
                date: new Date().toISOString(),
                description: 'Withdrawal request failed & refunded',
            });
            return { ...tx, status: 'failed' };
        }

        return tx;
      });

      // Calculate and distribute daily returns
      let todaysReturn = 0;
      parsedData.investments.forEach((inv, index) => {
        if (!inv.lastPayoutDate) {
          inv.lastPayoutDate = inv.startDate;
          dataChanged = true;
        }
        
        const startDate = parseISO(inv.startDate);
        const endDate = addDays(startDate, inv.duration);
        const lastPayoutDate = parseISO(inv.lastPayoutDate);
        const today = new Date();
        
        // Is the investment still active?
        if (isBefore(today, endDate)) {
            const dailyReturnValue = (inv.expectedReturn - inv.amount) / inv.duration;
            
            // Payout if it's a new day since last payout
            if (!isToday(lastPayoutDate)) {
                parsedData.balance += dailyReturnValue;
                parsedData.transactions.unshift({
                    id: crypto.randomUUID(),
                    type: 'return',
                    amount: dailyReturnValue,
                    status: 'success',
                    date: today.toISOString(),
                    description: `Daily return from ${inv.planName}`,
                });
                parsedData.investments[index].lastPayoutDate = today.toISOString();
                dataChanged = true;
            }

            todaysReturn += dailyReturnValue;
        }
      });
      parsedData.todaysReturn = todaysReturn;
      
       // Check and reset check-in streak if a day was missed
      if (parsedData.lastCheckInDate) {
        const lastCheckin = parseISO(parsedData.lastCheckInDate);
        const daysSinceLastCheckin = differenceInCalendarDays(new Date(), lastCheckin);

        if (daysSinceLastCheckin > 1) {
          // If it's not the same day or the next day, reset the streak.
          parsedData.checkInStreak = 0;
          dataChanged = true;
        }
      }


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

  useEffect(() => {
    if (sessionName) {
      loadUser(sessionName);
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [sessionName, loadUser]);

  useEffect(() => {
    const handleStorageChange = () => {
      setSessionName(getSessionName());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
        if (sessionName) {
            loadUser(sessionName)
        }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [sessionName, loadUser]);


  const addInvestment = useCallback((investment: Omit<UserInvestment, 'id' | 'startDate' | 'lastPayoutDate'>) => {
    if (!user) return;
    const now = new Date().toISOString();
    const newInvestment: UserInvestment = { 
      ...investment, 
      id: crypto.randomUUID(),
      startDate: now,
      lastPayoutDate: now,
    };
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'investment',
      amount: investment.amount,
      status: 'success',
      date: new Date().toISOString(),
      description: investment.planName,
    };
    const updatedUser: UserData = {
      ...user,
      balance: user.balance - investment.amount,
      investments: [newInvestment, ...user.investments],
      transactions: [newTransaction, ...user.transactions],
      firstInvestmentMade: true,
    };
    updateUser(updatedUser);
    
    // Store transaction ID in session storage for the success page
    sessionStorage.setItem('last_investment_tx', newTransaction.id);
    router.push('/investment-success');

  }, [user, router]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'date'>) => {
    if (!user) return;
    const newTransaction: Transaction = { ...tx, id: crypto.randomUUID(), date: new Date().toISOString() };
    
    let newBalance = user.balance;
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

   const claimDailyCheckIn = useCallback((): {success: boolean, amount?: number} => {
    if (!user) return {success: false};
    
    const canClaim = user.lastCheckInDate ? !isToday(parseISO(user.lastCheckInDate)) : true;
    if (!canClaim) return {success: false};

    const rewardAmount = Math.floor(Math.random() * 5) + 1; // 1 to 5
    
    const newStreak = user.checkInStreak + 1;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: 'check-in',
      amount: rewardAmount,
      status: 'success',
      date: new Date().toISOString(),
      description: `Daily Check-in: Day ${newStreak}`,
    };

    const updatedUser: UserData = {
      ...user,
      balance: user.balance + rewardAmount,
      transactions: [newTransaction, ...user.transactions],
      lastCheckInDate: new Date().toISOString(),
      checkInStreak: newStreak,
    };
    updateUser(updatedUser);
    return {success: true, amount: rewardAmount};

  }, [user]);

  return { user, loading, addInvestment, addTransaction, applyPromoCode, claimDailyCheckIn, reloadUser: () => sessionName && loadUser(sessionName) };
}
