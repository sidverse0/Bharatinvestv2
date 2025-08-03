'use client';

import { UserData } from "@/types";
import { SIGNUP_BONUS } from "./constants";

const USERS_DB_KEY = 'fundflow_users';
const SESSION_KEY = 'fundflow_session';
const USER_DATA_PREFIX = 'fundflow_data_';

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
const setSession = (username: string) => {
  localStorage.setItem(SESSION_KEY, username);
};

// Signup function
export const signup = (username: string, password: string): { success: boolean; message: string } => {
  const users = getUsers();
  if (users[username]) {
    return { success: false, message: 'Username already exists.' };
  }
  
  users[username] = password;
  saveUsers(users);

  // Create initial user data
  const newUser: UserData = {
    username,
    balance: 0,
    referralCode: `${username.substring(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
    investments: [],
    transactions: [],
    usedPromoCodes: {},
    isFirstLogin: true,
  };
  localStorage.setItem(`${USER_DATA_PREFIX}${username}`, JSON.stringify(newUser));

  setSession(username);
  return { success: true, message: 'Signup successful!' };
};

// Login function
export const login = (username: string, password: string): { success: boolean; message: string } => {
  const users = getUsers();
  if (!users[username] || users[username] !== password) {
    return { success: false, message: 'Invalid username or password.' };
  }
  setSession(username);
  return { success: true, message: 'Login successful!' };
};

// Logout function
export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};