
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Landmark, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/wallet', icon: Landmark, label: 'Wallet' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: User, label: 'Profile' },
];

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
