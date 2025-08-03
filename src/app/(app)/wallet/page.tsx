'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { formatCurrency } from '@/lib/helpers';
import { ClientOnly } from '@/components/ClientOnly';
import { Skeleton } from '@/components/ui/skeleton';

export default function WalletPage() {
  const { user, loading } = useUser();

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-2xl p-4">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tighter">Wallet</h1>
          <p className="text-muted-foreground">Manage your funds with ease.</p>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardDescription>Current Balance</CardDescription>
             {loading || !user ? (
                <Skeleton className="h-10 w-48 rounded-md" />
              ) : (
                <CardTitle className="text-4xl font-bold tracking-tighter text-primary">
                  {formatCurrency(user.balance)}
                </CardTitle>
              )}
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/deposit" passHref>
            <Button variant="outline" size="lg" className="h-24 w-full text-lg">
              <ArrowDownLeft className="mr-2 h-6 w-6" />
              Deposit
            </Button>
          </Link>
          <Link href="/withdraw" passHref>
            <Button variant="outline" size="lg" className="h-24 w-full text-lg">
              <ArrowUpRight className="mr-2 h-6 w-6" />
              Withdraw
            </Button>
          </Link>
        </div>
      </div>
    </ClientOnly>
  );
}
