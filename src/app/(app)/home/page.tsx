'use client';

import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { INVESTMENT_PLANS } from '@/lib/constants';
import InvestmentCard from '@/components/InvestmentCard';
import { formatCurrency } from '@/lib/helpers';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientOnly } from '@/components/ClientOnly';

export default function HomePage() {
  const { user, loading } = useUser();

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-4xl p-4">
        <header className="mb-6">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 shadow-lg">
            <CardHeader>
              <CardDescription>Current Balance</CardDescription>
              {loading || !user ? (
                <Skeleton className="h-10 w-48 rounded-md" />
              ) : (
                <CardTitle className="text-5xl font-extrabold tracking-tighter text-primary">
                  {formatCurrency(user.balance)}
                </CardTitle>
              )}
            </CardHeader>
          </Card>
        </header>

        <section>
          <h2 className="text-2xl font-bold mb-4">Investment Plans</h2>
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
