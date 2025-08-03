'use client';

import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { INVESTMENT_PLANS } from '@/lib/constants';
import InvestmentCard from '@/components/InvestmentCard';
import { formatCurrency } from '@/lib/helpers';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientOnly } from '@/components/ClientOnly';
import { Wallet, TrendingUp, User as UserIcon } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useUser();

  const StatCard = ({ icon, title, value, isLoading, className }: { icon: React.ReactNode, title: string, value: string, isLoading: boolean, className?: string }) => (
    <div className={`bg-background/70 backdrop-blur-sm p-4 rounded-xl flex items-center gap-4 ${className}`}>
      <div className="p-3 bg-primary/10 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        {isLoading ? <Skeleton className="h-6 w-24 mt-1" /> : <p className="text-xl font-bold">{value}</p>}
      </div>
    </div>
  );

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-4xl p-4">
        <header className="mb-8">
            <div className="bg-card p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 bg-muted rounded-full">
                        <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                    {loading || !user ? (
                        <Skeleton className="h-7 w-32" />
                    ) : (
                        <h1 className="text-xl font-bold">Welcome, {user.name}!</h1>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard 
                        icon={<Wallet className="h-6 w-6 text-primary" />}
                        title="Balance"
                        value={loading || !user ? '...' : formatCurrency(user.balance)}
                        isLoading={loading}
                    />
                     <StatCard 
                        icon={<TrendingUp className="h-6 w-6 text-primary" />}
                        title="Today's Return"
                        value={loading || !user ? '...' : formatCurrency(user.todaysReturn)}
                        isLoading={loading}
                    />
                </div>
            </div>
        </header>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Investment Plans</h2>
            <p className="text-sm text-primary font-semibold">Choose a plan</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INVESTMENT_PLANS.map((plan) => (
              <InvestmentCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>
      </div>
    </ClientOnly>
  );
}
