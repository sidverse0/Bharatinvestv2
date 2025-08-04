
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserData, UserInvestment, Transaction } from '@/types';
import { SIGNUP_BONUS, PROMO_CODES } from '@/lib/constants';
import { isToday, parseISO, differenceInMinutes, differenceInCalendarDays, isBefore, addDays, differenceInHours } from 'date-fns';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';

type PromoCodeResult = 
  | { status: 'success'; amount: number }
  | { status: 'used_today' | 'used_before' | 'invalid'; amount?: never };

type ClaimAchievementResult = 
  | { success: true; amount: number }
  | { success: false; amount?: never };

export function useUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const processUserData = useCallback(async (userData: UserData, uid: string): Promise<UserData> => {
    let dataChanged = false;
    const now = new Date();
    
    // First login bonus
    if (userData.isFirstLogin) {
      userData.balance += SIGNUP_BONUS;
      userData.transactions.unshift({
        id: crypto.randomUUID(),
        type: 'bonus',
        amount: SIGNUP_BONUS,
        status: 'success',
        date: now.toISOString(),
        description: 'Sign-up Bonus',
      });
      userData.isFirstLogin = false;
      dataChanged = true;
    }

    // Update login streak
    const lastLogin = parseISO(userData.lastLoginDate);
    const daysDiff = differenceInCalendarDays(now, lastLogin);
    if (daysDiff === 1) {
      userData.loginStreak += 1;
    } else if (daysDiff > 1) {
      userData.loginStreak = 1; // Reset
    }
    if (daysDiff > 0) {
      userData.lastLoginDate = now.toISOString();
    }
     dataChanged = true;


    // Process transactions
    const newTransactions: Transaction[] = [];
    userData.transactions.forEach(tx => {
      if (tx.status !== 'pending') {
        newTransactions.push(tx);
        return;
      }
      const txDate = parseISO(tx.date);
      if (tx.type === 'deposit' && differenceInMinutes(now, txDate) >= 2) {
        userData.balance += tx.amount;
        userData.totalDeposits = (userData.totalDeposits || 0) + tx.amount;
        newTransactions.push({ ...tx, status: 'success' });
        dataChanged = true;
      } else if (tx.type === 'withdrawal' && differenceInHours(now, txDate) >= 48) {
        userData.balance += tx.amount;
        newTransactions.unshift({
          id: crypto.randomUUID(), type: 'return', amount: tx.amount, status: 'success',
          date: now.toISOString(), description: 'Withdrawal request failed & refunded',
        });
        newTransactions.push({ ...tx, status: 'failed' });
        dataChanged = true;
      } else {
        newTransactions.push(tx);
      }
    });
    userData.transactions = newTransactions;

    // Calculate daily returns
    let todaysReturn = 0;
    userData.investments.forEach((inv, index) => {
      if (!inv.lastPayoutDate) {
        inv.lastPayoutDate = inv.startDate;
        dataChanged = true;
      }
      const endDate = addDays(parseISO(inv.startDate), inv.duration);
      if (isBefore(now, endDate)) {
        const dailyReturnValue = (inv.expectedReturn - inv.amount) / inv.duration;
        if (!isToday(parseISO(inv.lastPayoutDate))) {
          userData.balance += dailyReturnValue;
          userData.transactions.unshift({
            id: crypto.randomUUID(), type: 'return', amount: dailyReturnValue,
            status: 'success', date: now.toISOString(), description: 'Investment Return',
          });
          userData.investments[index].lastPayoutDate = now.toISOString();
          dataChanged = true;
        }
        todaysReturn += dailyReturnValue;
      }
    });
    userData.todaysReturn = todaysReturn;
    
    // Check-in streak
    if (userData.lastCheckInDate) {
      const daysSinceLastCheckin = differenceInCalendarDays(now, parseISO(userData.lastCheckInDate));
      if (daysSinceLastCheckin > 1) {
        userData.checkInStreak = 0;
        dataChanged = true;
      }
    }

    if (dataChanged) {
      await updateDoc(doc(db, "users", uid), { ...userData });
    }
    
    return userData;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const rawData = userDoc.data() as UserData;
          const processedData = await processUserData(rawData, fbUser.uid);
          setUser(processedData);
        } else {
          setUser(null);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [processUserData]);

  const reloadUser = useCallback(async () => {
    if (firebaseUser) {
      setLoading(true);
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const rawData = userDoc.data() as UserData;
        const processedData = await processUserData(rawData, firebaseUser.uid);
        setUser(processedData);
      }
      setLoading(false);
    }
  }, [firebaseUser, processUserData]);


  const addInvestment = useCallback(async (investment: Omit<UserInvestment, 'id' | 'startDate' | 'lastPayoutDate'>) => {
    if (!user || !firebaseUser) return;
    const now = new Date().toISOString();
    const dailyReturn = (investment.expectedReturn - investment.amount) / investment.duration;

    const newInvestment: UserInvestment = { 
      ...investment, id: crypto.randomUUID(), startDate: now, lastPayoutDate: now,
    };
    
    const investmentTransaction: Transaction = {
      id: crypto.randomUUID(), type: 'investment', amount: investment.amount,
      status: 'success', date: now, description: investment.planName,
    };

    const instantReturnTransaction: Transaction = {
      id: crypto.randomUUID(), type: 'return', amount: dailyReturn,
      status: 'success', date: now, description: 'Investment Return',
    };

    const newBalance = user.balance - investment.amount + dailyReturn;

    const userDocRef = doc(db, "users", firebaseUser.uid);
    await updateDoc(userDocRef, {
      balance: newBalance,
      investments: arrayUnion(newInvestment),
      transactions: arrayUnion(investmentTransaction, instantReturnTransaction),
      firstInvestmentMade: true,
    });

    sessionStorage.setItem('last_investment_tx', investmentTransaction.id);
    router.push('/investment-success');
    reloadUser();
  }, [user, firebaseUser, router, reloadUser]);

  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'date'>): Promise<string | undefined> => {
    if (!user || !firebaseUser) return;
    const newTransaction: Transaction = { ...tx, id: crypto.randomUUID(), date: new Date().toISOString() };
    
    let newBalance = user.balance;
    if (newTransaction.type === 'withdrawal') {
        newBalance -= newTransaction.amount;
    }

    const userDocRef = doc(db, "users", firebaseUser.uid);
    await updateDoc(userDocRef, {
      balance: newBalance,
      transactions: arrayUnion(newTransaction),
    });

    reloadUser();
    return newTransaction.id;
  }, [user, firebaseUser, reloadUser]);

  const removeTransaction = useCallback(async (txId: string) => {
     if (!user || !firebaseUser) return;
      
      const txToRemove = user.transactions.find(tx => tx.id === txId);
      if (!txToRemove) return;
      
      const updatedTransactions = user.transactions.filter(tx => tx.id !== txId);
      let newBalance = user.balance;

      if (txToRemove.type === 'withdrawal' && txToRemove.status === 'pending') {
          newBalance += txToRemove.amount; // Refund
      }

      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, {
        transactions: updatedTransactions,
        balance: newBalance
      });
      reloadUser();
  }, [user, firebaseUser, reloadUser]);
  
  const applyPromoCode = useCallback(async (code: string): Promise<PromoCodeResult> => {
    if (!user || !firebaseUser) return { status: 'invalid' };
    
    const promoValue = PROMO_CODES[code.toUpperCase()];
    if (!promoValue) return { status: 'invalid' };

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    const currentUserData = userDoc.data() as UserData;

    if (currentUserData.usedPromoCodes[code.toUpperCase()]) {
      return { status: 'used_before' };
    }
    
    if (Object.values(currentUserData.usedPromoCodes).some(date => isToday(parseISO(date)))) {
      return { status: 'used_today' };
    }
    
    const newTransaction: Transaction = {
      id: crypto.randomUUID(), type: 'promo', amount: promoValue,
      status: 'success', date: new Date().toISOString(), description: 'Promo Code',
    };
    
    const newUsedPromoCodes = { ...currentUserData.usedPromoCodes, [code.toUpperCase()]: new Date().toISOString() };
    
    await updateDoc(userDocRef, {
      balance: currentUserData.balance + promoValue,
      transactions: arrayUnion(newTransaction),
      usedPromoCodes: newUsedPromoCodes
    });
    
    reloadUser();
    return { status: 'success', amount: promoValue };
  }, [firebaseUser, reloadUser]);

   const claimDailyCheckIn = useCallback(async (): Promise<{success: boolean, amount?: number}> => {
    if (!user || !firebaseUser) return { success: false };
    
    const canClaim = user.lastCheckInDate ? differenceInHours(new Date(), parseISO(user.lastCheckInDate)) >= 24 : true;
    if (!canClaim) return { success: false };

    const rewardAmount = Math.floor(Math.random() * 5) + 1;
    
    const newStreak = differenceInCalendarDays(new Date(), parseISO(user.lastCheckInDate)) === 1 ? user.checkInStreak + 1 : 1;
    
    const newTransaction: Transaction = {
      id: crypto.randomUUID(), type: 'check-in', amount: rewardAmount,
      status: 'success', date: new Date().toISOString(), description: 'Daily Check-in',
    };

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await updateDoc(userDocRef, {
        balance: user.balance + rewardAmount,
        transactions: arrayUnion(newTransaction),
        lastCheckInDate: new Date().toISOString(),
        checkInStreak: newStreak,
    });
    
    reloadUser();
    return {success: true, amount: rewardAmount};

  }, [user, firebaseUser, reloadUser]);

  const claimAchievementReward = useCallback(async (achievementLabel: string): Promise<ClaimAchievementResult> => {
    if (!user || !firebaseUser || user.claimedAchievements.includes(achievementLabel)) {
      return { success: false };
    }

    const rewardAmount = Math.floor(Math.random() * 10) + 1;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(), type: 'bonus', amount: rewardAmount,
      status: 'success', date: new Date().toISOString(), description: 'Achievement',
    };

    const userDocRef = doc(db, "users", firebaseUser.uid);
    await updateDoc(userDocRef, {
        balance: user.balance + rewardAmount,
        transactions: arrayUnion(newTransaction),
        claimedAchievements: arrayUnion(achievementLabel)
    });
    reloadUser();
    return { success: true, amount: rewardAmount };
  }, [user, firebaseUser, reloadUser]);


  return { user, loading, addInvestment, addTransaction, applyPromoCode, claimDailyCheckIn, reloadUser, removeTransaction, claimAchievementReward };
}
