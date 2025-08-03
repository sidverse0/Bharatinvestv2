'use client';

import { UserData } from "@/types";

const USERS_DB_KEY = 'bharatinvest_users'; // Stores { email: { pass: string, name: string }}
const SESSION_KEY = 'bharatinvest_session'; // Stores current logged-in user name
const USER_DATA_PREFIX = 'bharatinvest_data_';

// Helper to get users from localStorage
const getUsers = () => {
  if (typeof window === 'undefined') return {};
  const users = localStorage.getItem(USERS_DB_KEY);
  return users ? JSON.parse(users) : {};
};

// Helper to save users to localStorage
const saveUsers = (users: any) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

// Helper to set session
const setSession = (name: string) => {
  localStorage.setItem(SESSION_KEY, name);
  // Dispatch a storage event to notify other tabs/hooks
  window.dispatchEvent(new Event("storage"));
};

// Signup function
export const signup = (name: string, email: string, password: string): { success: boolean; message: string } => {
  const users = getUsers();
  if (users[email]) {
    return { success: false, message: 'Email already exists.' };
  }
  
  // Check if name exists
  const nameExists = Object.values(users).some((user: any) => user.name.toLowerCase() === name.toLowerCase());
  if (nameExists) {
    return { success: false, message: 'Name already exists. Please choose a different name.' };
  }

  users[email] = { password, name };
  saveUsers(users);

  // Create initial user data
  const newUser: UserData = {
    name,
    email,
    balance: 0,
    referralCode: `${name.substring(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
    investments: [],
    transactions: [],
    usedPromoCodes: {},
    isFirstLogin: true, // This flag will trigger the bonus in useUser hook
  };
  localStorage.setItem(`${USER_DATA_PREFIX}${name}`, JSON.stringify(newUser));

  setSession(name);
  return { success: true, message: 'Signup successful!' };
};

// Login function
export const login = (email: string, password: string): { success: boolean; message: string } => {
  const users = getUsers();
  if (!users[email] || users[email].password !== password) {
    return { success: false, message: 'Invalid email or password.' };
  }
  setSession(users[email].name);
  return { success: true, message: 'Login successful!' };
};

// Logout function
export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
   // Dispatch a storage event to notify other tabs/hooks
  window.dispatchEvent(new Event("storage"));
};
