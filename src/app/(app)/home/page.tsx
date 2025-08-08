
'use client';

import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { INVESTMENT_PLANS } from '@/lib/constants';
import InvestmentCard from '@/components/InvestmentCard';
import { formatCurrency, formatCurrencySimple } from '@/lib/helpers';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientOnly } from '@/components/ClientOnly';
import { Wallet, TrendingUp, User as UserIcon, Flame, Headset } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { IconButton } from '@/components/ui/icon-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";


const bannerImages = [
    "https://files.catbox.moe/m3mwdy.jpg",
    "https://files.catbox.moe/4tee46.jpg",
    "https://files.catbox.moe/vy0pu4.jpg",
    "https://files.catbox.moe/um9fve.jpg",
    "https://files.catbox.moe/4g1iqm.jpg",
    "https://files.catbox.moe/ugygu2.jpg",
];

export default function HomePage() {
  const { user, loading } = useUser();
  const [investedUsers, setInvestedUsers] = useState(1250);

  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setInvestedUsers(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 5000); // increase count every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ icon, title, value, isLoading, className, iconBgClass, iconColorClass }: { icon: React.ReactNode, title: string, value: string, isLoading: boolean, className?: string, iconBgClass?: string, iconColorClass?: string }) => (
    <div className={`bg-muted/40 p-4 rounded-xl flex items-center gap-4 ${className}`}>
      <div className={cn("p-3 rounded-full", iconBgClass)}>
        {icon}
      </div>
      <div className='flex-1'>
        <p className="text-sm text-muted-foreground">{title}</p>
        {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> : <p className="text-xl font-bold">{value}</p>}
      </div>
    </div>
  );

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-2xl p-4">
        <header className="mb-6">
            <div className="bg-card p-4 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {loading || !user ? (
                          <Skeleton className="h-10 w-10 rounded-full" />
                      ) : (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="https://files.catbox.moe/5uph06.png" alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      {loading || !user ? (
                          <Skeleton className="h-7 w-32" />
                      ) : (
                          <h1 className="text-xl font-bold">Welcome, {user.name}!</h1>
                      )}
                    </div>
                    <Link href="https://wa.me/93720016849" target="_blank" rel="noopener noreferrer">
                      <IconButton variant="ghost" aria-label="Contact Support">
                        <Headset className="h-6 w-6 text-primary" />
                      </IconButton>
                    </Link>
                </div>
                <div className="grid grid-cols-1 gap-4">
                     <StatCard
                        icon={<Wallet className="h-6 w-6 text-accent-foreground" />}
                        title="Balance"
                        value={loading || !user ? '...' : formatCurrency(user.balance)}
                        isLoading={loading}
                        iconBgClass="bg-accent"
                    />
                </div>
            </div>
        </header>

         <section className="mb-8">
            <Carousel
                plugins={[plugin.current]}
                className="w-full"
                opts={{
                    loop: true,
                }}
            >
                <CarouselContent>
                    {bannerImages.map((src, index) => (
                        <CarouselItem key={index}>
                            <Card className="overflow-hidden">
                                <Image
                                    src={src}
                                    alt={`Promotional Banner ${index + 1}`}
                                    width={600}
                                    height={200}
                                    className="aspect-[3/1] w-full object-cover"
                                    data-ai-hint="promotional banner"
                                />
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>

        <section>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">Investment Plans</h2>
            <p className="text-sm text-primary font-semibold">Choose a plan</p>
          </div>
          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
            <Flame className="h-4 w-4 text-red-500" />
            <span className="font-semibold">{investedUsers.toLocaleString()}+ users</span> have invested!
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {INVESTMENT_PLANS.map((plan, index) => (
              <InvestmentCard key={plan.id} plan={plan} animationDelay={index * 100} />
            ))}
          </div>
        </section>

        <div className="mt-8 flex items-center justify-center">
             <Card className="overflow-hidden p-2">
                <Image
                    src="https://files.catbox.moe/62esq8.jpg"
                    alt="Promotional Banner"
                    width={400}
                    height={150}
                    className="object-contain rounded-md"
                    data-ai-hint="promotional banner"
                />
            </Card>
        </div>
      </div>
    </ClientOnly>
  );
}
