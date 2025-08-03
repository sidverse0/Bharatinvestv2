'use client';

import { UserData } from "@/types";
import { SIGNUP_BONUS } from "./constants";

const USERS_DB_KEY = 'bharatinvest_users';
const SESSION_KEY = 'bharatinvest_session';
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
};

// Signup function
export const signup = (name: string, password: string): { success: boolean; message: string } => {
  const users = getUsers();
  if (users[name]) {
    return { success: false, message: 'Name already exists.' };
  }
  
  users[name] = password;
  saveUsers(users);

  // Create initial user data
  const newUser: UserData = {
    name,
    balance: 0,
    referralCode: `${name.substring(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
    investments: [],
    transactions: [],
    usedPromoCodes: {},
    isFirstLogin: true,
  };
  localStorage.setItem(`${USER_DATA_PREFIX}${name}`, JSON.stringify(newUser));

  setSession(name);
  return { success: true, message: 'Signup successful!' };
};

// Login function
export const login = (name: string, password: string): { success: boolean; message: string } => {
  const users = getUsers();
  if (!users[name] || users[name] !== password) {
    return { success: false, message: 'Invalid name or password.' };
  }
  setSession(name);
  return { success: true, message: 'Login successful!' };
};

// Logout function
export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};
