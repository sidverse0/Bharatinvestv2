
'use client';

import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { UserData } from "@/types";

// Signup function
export const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if name exists
    const nameQuery = query(collection(db, "users"), where("name", "==", name));
    const nameQuerySnapshot = await getDocs(nameQuery);
    if (!nameQuerySnapshot.empty) {
      return { success: false, message: 'Name already exists. Please choose a different name.' };
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create initial user data in Firestore
    const newUser: UserData = {
      name,
      email,
      balance: 0,
      todaysReturn: 0,
      referralCode: `${name.substring(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
      investments: [],
      transactions: [],
      usedPromoCodes: {},
      isFirstLogin: true,
      firstInvestmentMade: false,
      totalDeposits: 0,
      loginStreak: 1,
      lastLoginDate: new Date().toISOString(),
      lastCheckInDate: '',
      checkInStreak: 0,
      claimedAchievements: [],
      isBanned: false,
    };
    
    await setDoc(doc(db, "users", user.uid), newUser);

    return { success: true, message: 'Signup successful!' };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, message: 'Email already exists.' };
    }
    return { success: false, message: error.message };
  }
};

// Login function
export const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true, message: 'Login successful!' };
  } catch (error: any) {
    return { success: false, message: 'Invalid email or password.' };
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  await signOut(auth);
};
