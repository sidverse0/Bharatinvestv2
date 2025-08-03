export interface InvestmentPlan {
  id: number;
  amount: number;
  returns: number;
  duration: number; // in days
  badge?: 'Popular' | 'Best Value';
}

export interface UserInvestment {
  id: string; // unique id for this instance of investment
  planId: number;
  planName: string;
  amount: number;
  expectedReturn: number;
  startDate: string; // ISO date string
  duration: number; // in days
}

export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'bonus' | 'promo';
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  date: string; // ISO date string
  description: string;
}

export interface UserData {
  name: string;
  email: string;
  balance: number;
  todaysReturn: number;
  referralCode: string;
  investments: UserInvestment[];
  transactions: Transaction[];
  usedPromoCodes: { [key: string]: string }; // code -> date used
  isFirstLogin: boolean;
  // Achievement tracking
  firstInvestmentMade: boolean;
  totalDeposits: number;
  loginStreak: number;
  lastLoginDate: string; // ISO date string
}
