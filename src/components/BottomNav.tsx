
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Landmark, History, User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { useEffect, useState } from 'react';
import { calculateTimeLeft } from '@/lib/helpers';
import { addDays, differenceInSeconds } from 'date-fns';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/my-investments', icon: Briefcase, label: 'Invests' },
  { href: '/wallet', icon: Landmark, label: 'Wallet' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: User, label: 'Profile' },
];

const Countdown = () => {
    const { user } = useUser();
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !user.investments) {
            setTimeLeft(null);
            return;
        }

        const activeInvestments = user.investments.filter(inv => !calculateTimeLeft(inv).isComplete);
        if (activeInvestments.length === 0) {
            setTimeLeft(null);
            return;
        }

        const soonestEndingInvestment = activeInvestments.reduce((soonest, current) => {
            const soonestEndDate = addDays(new Date(soonest.startDate), soonest.duration);
            const currentEndDate = addDays(new Date(current.startDate), current.duration);
            return currentEndDate < soonestEndDate ? current : soonest;
        });

        const interval = setInterval(() => {
            const endDate = addDays(new Date(soonestEndingInvestment.startDate), soonestEndingInvestment.duration);
            const now = new Date();
            const diff = differenceInSeconds(endDate, now);

            if (diff <= 0) {
                setTimeLeft("0s");
                clearInterval(interval);
                return;
            }

            const days = Math.floor(diff / (3600 * 24));
            const hours = Math.floor((diff % (3600 * 24)) / 3600);
            const minutes = Math.floor((diff % 3600) / 60);

            if(days > 0) {
                 setTimeLeft(`${days}d`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h`);
            } else {
                setTimeLeft(`${minutes}m`);
            }
        }, 1000);

        return () => clearInterval(interval);

    }, [user]);

    if (!timeLeft) return null;

    return (
        <span className="absolute -top-1 -right-1 text-white bg-red-500 text-[9px] font-bold px-1 rounded-full">
            {timeLeft}
        </span>
    )

}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t z-40">
      <div className="container mx-auto h-full max-w-2xl">
        <div className="flex h-full items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href) && (item.href !== '/home' || pathname === '/home');
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors w-16 text-center">
                {item.href === '/my-investments' && <Countdown />}
                <Icon className={cn('h-6 w-6 transition-all', isActive && 'text-primary scale-110')} />
                <span className={cn('text-xs transition-all', isActive && 'text-primary font-medium')}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
