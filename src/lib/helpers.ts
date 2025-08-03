
import { UserInvestment } from "@/types";
import { differenceInDays, addDays, formatDistanceToNowStrict } from 'date-fns';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCurrencySimple = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const calculateTimeLeft = (investment: UserInvestment): { daysLeft: number; progress: number; isComplete: boolean; timeLeftString: string } => {
  const startDate = new Date(investment.startDate);
  const endDate = addDays(startDate, investment.duration);
  const now = new Date();

  if (now >= endDate) {
    return { daysLeft: 0, progress: 100, isComplete: true, timeLeftString: 'Completed' };
  }

  const daysPassed = differenceInDays(now, startDate);
  const daysLeft = investment.duration - daysPassed;
  const progress = Math.min(100, Math.max(0, (daysPassed / investment.duration) * 100));
  
  const timeLeftString = formatDistanceToNowStrict(endDate, { unit: 'day', roundingMethod: 'ceil' });

  return { daysLeft, progress, isComplete: false, timeLeftString };
};

