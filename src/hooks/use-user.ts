

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserData, UserInvestment, Transaction, BankAccount } from '@/types';
import { SIGNUP_BONUS, PROMO_CODES } from '@/lib/constants';
import { isToday, parseISO, differenceInMinutes, differenceInCalendarDays, isBefore, addDays, differenceInHours } from 'date-fns';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp, onSnapshot } from 'firebase/firestore';

type PromoCodeResult = 
  | { status: 'success'; amount: number }
  | { status: 'used_today' | 'used_before' | 'invalid'; amount?: never };

type ClaimAchievementResult = 
  | { success: true; amount: number }
  | { success: false; amount?: never };

const generateTransactionId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};


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
        id: generateTransactionId(),
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
    if (userData.lastLoginDate) {
        const lastLogin = parseISO(userData.lastLoginDate);
        const daysDiff = differenceInCalendarDays(now, lastLogin);
        if (daysDiff === 1) {
            userData.loginStreak += 1;
            dataChanged = true;
        } else if (daysDiff > 1) {
            userData.loginStreak = 1; // Reset
            dataChanged = true;
        }
    } else {
        userData.loginStreak = 1;
        dataChanged = true;
    }
    
    if (!userData.lastLoginDate || !isToday(parseISO(userData.lastLoginDate))) {
        userData.lastLoginDate = now.toISOString();
        dataChanged = true;
    }

    let calculatedBalance = 0;
    let totalDeposits = 0;
    
    // Process transactions & calculate balance from scratch based on successful transactions
    const newTransactions: Transaction[] = [];
    const processedReturnTx = new Set<string>();

    for (let tx of userData.transactions) {
      if (tx.type === 'deposit' && tx.status === 'success' && !tx.isProcessed) {
        tx.isProcessed = true; 
        dataChanged = true;
      }
      if (tx.type === 'withdrawal' && tx.status === 'success' && !tx.isProcessed) {
        tx.isProcessed = true;
        dataChanged = true;
      }
       // Handle failed withdrawal refunds
      if (tx.type === 'withdrawal' && tx.status === 'failed' && !tx.isProcessed) {
        const refundTx: Transaction = {
          id: generateTransactionId(),
          type: 'withdrawal_refund',
          amount: tx.amount,
          status: 'success',
          date: new Date().toISOString(),
          description: 'Withdrawal Refund',
          remark: tx.remark,
        };
        userData.transactions.push(refundTx);
        tx.isProcessed = true; // Mark as processed to prevent duplicate refunds
        dataChanged = true;
      }

      newTransactions.push(tx);
    }
    userData.transactions = newTransactions;


    // Calculate daily returns
    let todaysReturn = 0;
    const updatedInvestments = userData.investments.map(inv => {
      let investmentChanged = false;
      if (!inv.lastPayoutDate) {
        inv.lastPayoutDate = inv.startDate;
        investmentChanged = true;
      }
      
      const endDate = addDays(parseISO(inv.startDate), inv.duration);
      const dailyReturnValue = (inv.expectedReturn - inv.amount) / inv.duration;

      if (isBefore(now, endDate)) {
        const lastPayoutDate = parseISO(inv.lastPayoutDate);
        const daysSinceLastPayout = differenceInCalendarDays(now, lastPayoutDate);
        
        if (daysSinceLastPayout > 0) {
            for(let i=0; i<daysSinceLastPayout; i++) {
                const payoutDate = addDays(lastPayoutDate, i + 1);
                const payoutDateKey = `${inv.planName}-${payoutDate.toISOString().split('T')[0]}`;
                
                // Ensure we don't add a duplicate return transaction
                if (!processedReturnTx.has(payoutDateKey)) {
                  userData.transactions.unshift({
                      id: generateTransactionId(), type: 'return', amount: dailyReturnValue,
                      status: 'success', date: payoutDate.toISOString(), description: inv.planName,
                  });
                }
            }

            inv.lastPayoutDate = now.toISOString();
            investmentChanged = true;
            dataChanged = true;
        }
        todaysReturn += dailyReturnValue;
      }
      
      if(investmentChanged) dataChanged = true;
      return inv;
    });

    userData.investments = updatedInvestments;
    userData.todaysReturn = todaysReturn;
    
    // Recalculate balance from all successful transactions
    calculatedBalance = userData.transactions.reduce((acc, tx) => {
        if (tx.type === 'deposit' && tx.status === 'success') {
            totalDeposits += tx.amount;
        }

        if (tx.status === 'success' || (tx.type === 'withdrawal' && tx.status === 'pending')) {
             if (['deposit', 'return', 'bonus', 'promo', 'treasure_win', 'withdrawal_refund'].includes(tx.type)) {
                return acc + tx.amount;
            } else if (['withdrawal', 'investment', 'treasure_cost'].includes(tx.type)) {
                return acc - tx.amount;
            }
        }
        return acc;
    }, 0);


    // Check for manual balance increase by admin
    if (userData.balance > calculatedBalance) {
        const difference = userData.balance - calculatedBalance;
        if (difference > 0.01) { // Avoid floating point inaccuracies
            userData.transactions.unshift({
                id: generateTransactionId(),
                type: 'bonus',
                amount: difference,
                status: 'success',
                date: now.toISOString(),
                description: 'Bonus',
            });
            calculatedBalance = userData.balance;
            dataChanged = true;
        }
    } else if (Math.abs(userData.balance - calculatedBalance) > 0.01) {
        // If balances don't match for other reasons, sync them
        userData.balance = calculatedBalance;
        dataChanged = true;
    }
    
    userData.totalDeposits = totalDeposits;

    // Check-in streak reset
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

  const fetchAndProcessUser = useCallback(async (fbUser: User) => {
    const unsub = onSnapshot(doc(db, "users", fbUser.uid), async (doc) => {
        if (doc.exists()) {
            const rawData = doc.data() as UserData;
            // First set the user data to show UI faster
            setUser(rawData);
            // Then process the data in the background
            const processedData = await processUserData(rawData, fbUser.uid);
            setUser(processedData);
        } else {
            setUser(null);
        }
        setLoading(false);
    });
    return unsub;
}, [processUserData]);

  useEffect(() => {
    setLoading(true);
    let unsubscribeFirestore: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        if (unsubscribeFirestore) unsubscribeFirestore();
        unsubscribeFirestore = await fetchAndProcessUser(fbUser);
      } else {
        setFirebaseUser(null);
        setUser(null);
        setLoading(false);
        if (unsubscribeFirestore) unsubscribeFirestore();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [fetchAndProcessUser]);


  const reloadUser = useCallback(async () => {
    if (firebaseUser) {
        setLoading(true);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const rawData = userDoc.data() as UserData;
          setUser(rawData);
        }
        setLoading(false);
    }
  }, [firebaseUser]);


  const addInvestment = useCallback(async (investment: Omit<UserInvestment, 'id' | 'startDate' | 'lastPayoutDate'>) => {
    if (!user || !firebaseUser) return;
    const now = new Date().toISOString();
    const dailyReturn = (investment.expectedReturn - investment.amount) / investment.duration;

    const newInvestment: UserInvestment = { 
      ...investment, id: generateTransactionId(), startDate: now, lastPayoutDate: now,
    };
    
    const investmentTransaction: Transaction = {
      id: generateTransactionId(), type: 'investment', amount: investment.amount,
      status: 'success', date: now, description: investment.planName,
    };

    const instantReturnTransaction: Transaction = {
      id: generateTransactionId(), type: 'return', amount: dailyReturn,
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
    
  }, [user, firebaseUser, router]);

  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'date'>): Promise<string | undefined> => {
    if (!user || !firebaseUser) return;
    const newTransaction: Transaction = { ...tx, id: generateTransactionId(), date: new Date().toISOString() };
    
    const userDocRef = doc(db, "users", firebaseUser.uid);
    let newBalance = user.balance;

    // Immediately deduct balance for withdrawal requests
    if (newTransaction.type === 'withdrawal' && newTransaction.status === 'pending') {
        newBalance -= newTransaction.amount;
    }

    await updateDoc(userDocRef, {
      balance: newBalance,
      transactions: arrayUnion(newTransaction),
    });

    
    return newTransaction.id;
  }, [user, firebaseUser]);

  const removeTransaction = useCallback(async (txId: string) => {
     if (!user || !firebaseUser) return;
      
      const txToRemove = user.transactions.find(tx => tx.id === txId);
      if (!txToRemove) return;
      
      const updatedTransactions = user.transactions.filter(tx => tx.id !== txId);
      let newBalance = user.balance;

      if (txToRemove.type === 'withdrawal' && txToRemove.status === 'pending') {
          // If a pending withdrawal is cancelled, refund the balance.
          newBalance += txToRemove.amount; 
      }

      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, {
        transactions: updatedTransactions,
        balance: newBalance
      });
      
  }, [user, firebaseUser]);
  
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
      id: generateTransactionId(), type: 'promo', amount: promoValue,
      status: 'success', date: new Date().toISOString(), description: 'Promo Code',
    };
    
    const newUsedPromoCodes = { ...currentUserData.usedPromoCodes, [code.toUpperCase()]: new Date().toISOString() };
    
    await updateDoc(userDocRef, {
      balance: currentUserData.balance + promoValue,
      transactions: arrayUnion(newTransaction),
      usedPromoCodes: newUsedPromoCodes
    });
    
    
    return { status: 'success', amount: promoValue };
  }, [firebaseUser, user]);

  const openTreasureBox = useCallback(async (): Promise<{success: boolean, amount?: number}> => {
    if (!user || !firebaseUser) return { success: false };
    
    const openCost = 10;
    if (user.balance < openCost) return { success: false };

    const rewardAmount = Math.floor(Math.random() * 5) + 1;
    
    const costTransaction: Transaction = {
      id: generateTransactionId(), type: 'treasure_cost', amount: openCost,
      status: 'success', date: new Date().toISOString(), description: 'Treasure Box Cost',
    };
    const winTransaction: Transaction = {
      id: generateTransactionId(), type: 'treasure_win', amount: rewardAmount,
      status: 'success', date: new Date().toISOString(), description: 'Treasure Box Reward',
    };

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await updateDoc(userDocRef, {
        balance: user.balance - openCost + rewardAmount,
        transactions: arrayUnion(costTransaction, winTransaction),
    });
    
    
    return {success: true, amount: rewardAmount};

  }, [user, firebaseUser]);

  const bindBankAccount = useCallback(async (account: BankAccount): Promise<boolean> => {
    if (!firebaseUser) return false;
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await updateDoc(userDocRef, {
        linkedBankAccount: account,
        kycStatus: 'Verified'
    });
    reloadUser();
    return true;
  }, [firebaseUser, reloadUser]);

  const setWithdrawalPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!firebaseUser) return false;
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await updateDoc(userDocRef, {
        withdrawalPin: pin
    });
    reloadUser();
    return true;
  }, [firebaseUser, reloadUser]);


  return { user, loading, addInvestment, addTransaction, applyPromoCode, openTreasureBox, reloadUser, removeTransaction, bindBankAccount, setWithdrawalPin };
}

    