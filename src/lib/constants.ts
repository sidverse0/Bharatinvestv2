
import { InvestmentPlan } from "@/types";

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  { 
    id: 1, 
    title: "Starter Plan",
    description: "A great starting point for new investors. Low risk, steady returns.",
    amount: 100, 
    returns: 410, 
    duration: 30, 
    badge: 'Popular',
    image: 'https://files.catbox.moe/5ydg1r.png',
  },
  { 
    id: 2, 
    title: "Solar Energy",
    description: "Invest in renewable energy and power up your portfolio with green tech.",
    amount: 200, 
    returns: 680, 
    duration: 40, 
    badge: 'Hot',
    image: 'https://files.catbox.moe/qokkuq.jpg',
  },
  {
    id: 6,
    title: "Quick Growth",
    description: "Fast-paced plan for quick returns on your investment.",
    amount: 351,
    returns: 651,
    duration: 15,
    badge: 'Hot',
    image: 'https://files.catbox.moe/x6t7ak.jpg',
  },
  { 
    id: 3, 
    title: "Gold Investment",
    description: "A classic and secure investment in precious metals for stable growth.",
    amount: 400, 
    returns: 890, 
    duration: 45, 
    badge: 'Best Value',
    image: 'https://files.catbox.moe/m5fabe.jpg',
  },
  {
    id: 7,
    title: "Mid-Cap Fund",
    description: "A balanced fund with strong potential for significant returns.",
    amount: 551,
    returns: 1051,
    duration: 20,
    badge: 'Best Value',
    image: 'https://files.catbox.moe/h148yz.jpg',
  },
  { 
    id: 4, 
    title: "Real Estate",
    description: "Get a piece of the property market with our diversified real estate plan.",
    amount: 600, 
    returns: 1080, 
    duration: 50,
    badge: 'Popular',
    image: 'https://files.catbox.moe/h148yz.jpg',
  },
  { 
    id: 5, 
    title: "Tech Startup Fund",
    description: "High-risk, high-reward investment in the next generation of tech innovators.",
    amount: 1000, 
    returns: 1550, 
    duration: 60,
    badge: 'Hot',
    image: 'https://files.catbox.moe/x6t7ak.jpg',
  },
  {
    id: 8,
    title: "Blue Chip Stock",
    description: "Invest in established market leaders for reliable long-term gains.",
    amount: 1551,
    returns: 3051,
    duration: 25,
    badge: 'Popular',
    image: 'https://files.catbox.moe/m5fabe.jpg',
  }
];

export const DEPOSIT_AMOUNTS = [100, 200, 400, 600, 1000];

export const MIN_WITHDRAWAL = 410;

export const PROMO_CODES: { [key: string]: number } = {
  GDVT: 5,
  GFRT: 3,
  VFUT: 7,
  QWRT: 8,
  GKCT: 10,
  PBHY: 100,
  QSTU: 200,
  HFTV: 300,
  JKTY: 400,
  VCML: 500,
};

export const REFERRAL_BONUS = 100;
export const SIGNUP_BONUS = 50;

export const APP_LINK = "https://bharatinvest.app/download";

