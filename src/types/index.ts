

export interface InvestmentPlan {
  id: number;
  title: string;
  description: string;
  amount: number;
  returns: number;
  duration: number; // in days
  badge?: 'Popular' | 'Best Value' | 'Hot' | 'Limited Offer' | 'Expired';
  image: string;
}

export interface UserInvestment {
  id: string; // unique id for this instance of investment
  planId: number;
  planName: string;
  amount: number;
  expectedReturn: number;
  startDate: string; // ISO date string
  lastPayoutDate: string; // ISO date string
  duration: number; // in days
  image: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'bonus' | 'promo' | 'return' | 'check-in';
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  date: string; // ISO date string
  description: string;
  receiptImageUrl?: string; // Optional URL for withdrawal receipt image
  isProcessed?: boolean; // For deposits, to check if balance has been updated
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
  claimedAchievements: string[]; // List of claimed achievement labels
  // Daily Check-in
  lastCheckInDate: string;
  checkInStreak: number;
}
