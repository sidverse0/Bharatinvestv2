
import { InvestmentPlan } from "@/types";

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 1,
    title: "Starter Plan",
    description: "This plan is no longer available for investment.",
    amount: 100,
    returns: 410,
    duration: 30,
    badge: 'Expired',
    image: 'https://files.catbox.moe/qokkuq.jpg',
  },
  { 
    id: 2, 
    title: "Solar Energy",
    description: "Invest in renewable energy and power up your portfolio with green tech.",
    amount: 251, 
    returns: 753, 
    duration: 30, 
    badge: 'Hot',
    image: 'https://files.catbox.moe/qokkuq.jpg',
  },
  {
    id: 6,
    title: "Quick Growth",
    description: "Fast-paced plan for quick returns on your investment.",
    amount: 351,
    returns: 1053,
    duration: 30,
    badge: 'Limited Offer',
    image: 'https://files.catbox.moe/x6t7ak.jpg',
  },
  { 
    id: 3, 
    title: "Gold Investment",
    description: "A classic and secure investment in precious metals for stable growth.",
    amount: 451, 
    returns: 1353, 
    duration: 30, 
    badge: 'Best Value',
    image: 'https://files.catbox.moe/m5fabe.jpg',
  },
  {
    id: 7,
    title: "Mid-Cap Fund",
    description: "A balanced fund with strong potential for significant returns.",
    amount: 551,
    returns: 1653,
    duration: 30,
    badge: 'Limited Offer',
    image: 'https://files.catbox.moe/h148yz.jpg',
  },
  { 
    id: 4, 
    title: "Real Estate",
    description: "Get a piece of the property market with our diversified real estate plan.",
    amount: 651, 
    returns: 1953, 
    duration: 30,
    badge: 'Popular',
    image: 'https://files.catbox.moe/h148yz.jpg',
  },
  { 
    id: 5, 
    title: "Tech Startup Fund",
    description: "High-risk, high-reward investment in the next generation of tech innovators.",
    amount: 1051, 
    returns: 3153, 
    duration: 30,
    badge: 'Hot',
    image: 'https://files.catbox.moe/x6t7ak.jpg',
  },
  {
    id: 8,
    title: "Blue Chip Stock",
    description: "Invest in established market leaders for reliable long-term gains.",
    amount: 1551,
    returns: 4653,
    duration: 30,
    badge: 'Limited Offer',
    image: 'https://files.catbox.moe/m5fabe.jpg',
  }
];

export const DEPOSIT_AMOUNTS = [200, 400, 600, 1000];

export const MIN_WITHDRAWAL = 510;

export const PROMO_CODES: { [key: string]: number } = {
  GDVT: 5,
  GFRT: 3,
  VFUT: 7,
  QWRT: 8,
  GKCT: 10,
  VHOP: 25,
  KCVT: 50,
  PBHY: 100,
  QSTU: 200,
  HFTV: 300,
  JKTY: 400,
  VCML: 500,
};

export const REFERRAL_BONUS = 100;
export const SIGNUP_BONUS = 25;

export const APP_LINK = "https://tinyurl.com/BharatinvestGovt";



