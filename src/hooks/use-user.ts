

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserData, UserInvestment, Transaction, BankAccount } from '@/types';
import { SIGNUP_BONUS, PROMO_CODES } from '@/lib/constants';
import { isToday, parseISO } from 'date-fns';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';

type PromoCodeResult = 
  | { status: 'success'; amount: number }
  | { status: 'used_today' | 'used_before' | 'invalid'; amount?: never };

const generateTransactionId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// This function is now only called ONCE on initial load.
const processInitialUserData = async (userData: UserData, uid: string): Promise<void> => {
    let dataToUpdate: Partial<UserData> = {};
    let newTransactions: Transaction[] = [...userData.transactions];
    let balance = userData.balance;

    const now = new Date();
    
    // First login bonus
    if (userData.isFirstLogin) {
      balance += SIGNUP_BONUS;
      newTransactions.unshift({
        id: generateTransactionId(),
        type: 'bonus',
        amount: SIGNUP_BONUS,
        status: 'success',
        date: now.toISOString(),
        description: 'Sign-up Bonus',
      });
      dataToUpdate.isFirstLogin = false;
    }

    // Process failed withdrawal refunds before anything else
    let refundOccurred = false;
    const processedTransactions = [...newTransactions]; // Use a mutable copy
    for (let i = 0; i < processedTransactions.length; i++) {
        const tx = processedTransactions[i];
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
            processedTransactions.push(refundTx);
            balance += tx.amount; // Refund the balance
            processedTransactions[i].isProcessed = true;
            refundOccurred = true;
        }
    }
    
    if (refundOccurred || dataToUpdate.isFirstLogin === false) {
        dataToUpdate.transactions = refundOccurred ? processedTransactions : newTransactions;
        dataToUpdate.balance = balance;
        await updateDoc(doc(db, "users", uid), { ...dataToUpdate });
    }
  };


export function useUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    let firestoreUnsubscribe: (() => void) | null = null;
    let initialLoadDone = false;

    const authUnsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }

      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDocRef = doc(db, "users", fbUser.uid);
        
        firestoreUnsubscribe = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data() as UserData;
            setUser(userData);
            if (!initialLoadDone) {
                processInitialUserData(userData, fbUser.uid);
                initialLoadDone = true;
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });

      } else {
        setFirebaseUser(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  }, []);


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

    const newInvestment: UserInvestment = { 
      ...investment, id: generateTransactionId(), startDate: now, lastPayoutDate: now,
    };
    
    const investmentTransaction: Transaction = {
      id: generateTransactionId(), type: 'investment', amount: investment.amount,
      status: 'success', date: now, description: investment.planName,
    };

    const userDocRef = doc(db, "users", firebaseUser.uid);
    const newBalance = user.balance - investment.amount;

    await updateDoc(userDocRef, {
      balance: newBalance,
      investments: arrayUnion(newInvestment),
      transactions: arrayUnion(investmentTransaction),
      firstInvestmentMade: true,
    });

    sessionStorage.setItem('last_investment_tx', investmentTransaction.id);
    router.push('/investment-success');
    
  }, [user, firebaseUser, router]);

  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'date'>): Promise<string | undefined> => {
    if (!user || !firebaseUser) return;
    const newTransaction: Transaction = { ...tx, id: generateTransactionId(), date: new Date().toISOString() };
    
    const userDocRef = doc(db, "users", firebaseUser.uid);
    let dataToUpdate: any = {
      transactions: arrayUnion(newTransaction),
    };

    if (newTransaction.type === 'withdrawal' && newTransaction.status === 'pending') {
        dataToUpdate.balance = user.balance - newTransaction.amount;
    }

    await updateDoc(userDocRef, dataToUpdate);

    return newTransaction.id;
  }, [user, firebaseUser]);
  
  const applyPromoCode = useCallback(async (code: string): Promise<PromoCodeResult> => {
    if (!user || !firebaseUser) return { status: 'invalid' };
    
    const promoValue = PROMO_CODES[code.toUpperCase()];
    if (!promoValue) return { status: 'invalid' };

    if (user.usedPromoCodes[code.toUpperCase()]) {
      return { status: 'used_before' };
    }
    
    if (Object.values(user.usedPromoCodes).some(date => isToday(parseISO(date)))) {
      return { status: 'used_today' };
    }
    
    const newTransaction: Transaction = {
      id: generateTransactionId(), type: 'promo', amount: promoValue,
      status: 'success', date: new Date().toISOString(), description: 'Promo Code',
    };
    
    const newUsedPromoCodes = { ...user.usedPromoCodes, [code.toUpperCase()]: new Date().toISOString() };
    const userDocRef = doc(db, 'users', firebaseUser.uid);

    await updateDoc(userDocRef, {
      balance: user.balance + promoValue,
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
    return true;
  }, [firebaseUser]);

  const setWithdrawalPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!firebaseUser) return false;
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await updateDoc(userDocRef, {
        withdrawalPin: pin
    });
    return true;
  }, [firebaseUser]);


  return { user, loading, addInvestment, addTransaction, applyPromoCode, openTreasureBox, reloadUser, bindBankAccount, setWithdrawalPin };
}
