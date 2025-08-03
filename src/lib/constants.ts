
import { InvestmentPlan } from "@/types";

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  { 
    id: 1, 
    title: "Starter Plan",
    description: "A great starting point for new investors. Low risk, steady returns.",
    amount: 100, 
    returns: 410, 
    duration: 30, 
    badge: 'Popular' 
  },
  { 
    id: 2, 
    title: "Solar Energy",
    description: "Invest in renewable energy and power up your portfolio with green tech.",
    amount: 200, 
    returns: 680, 
    duration: 40, 
    badge: 'Hot' 
  },
  { 
    id: 3, 
    title: "Gold Investment",
    description: "A classic and secure investment in precious metals for stable growth.",
    amount: 400, 
    returns: 890, 
    duration: 45, 
    badge: 'Best Value' 
  },
  { 
    id: 4, 
    title: "Real Estate",
    description: "Get a piece of the property market with our diversified real estate plan.",
    amount: 600, 
    returns: 1080, 
    duration: 50 
  },
  { 
    id: 5, 
    title: "Tech Startup Fund",
    description: "High-risk, high-reward investment in the next generation of tech innovators.",
    amount: 1000, 
    returns: 1550, 
    duration: 60 
  },
];

export const DEPOSIT_AMOUNTS = [100, 200, 400, 600, 1000];

export const MIN_WITHDRAWAL = 410;

export const PROMO_CODES: { [key: string]: number } = {
  GDVT: 5,
  GFRT: 3,
  VFUT: 7,
  QWRT: 8,
  GKCT: 10,
};

export const REFERRAL_BONUS = 100;
export const SIGNUP_BONUS = 50;

export const TELEGRAM_ADMIN_USERNAME = "your_telegram_admin_username"; // IMPORTANT: Replace with actual username
export const APP_LINK = "https://bharatinvest.app/download";
