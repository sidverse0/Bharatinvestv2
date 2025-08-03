
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { formatCurrency } from '@/lib/helpers';
import { ClientOnly } from '@/components/ClientOnly';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function WalletPage() {
  const { user, loading } = useUser();

  return (
    <ClientOnly>
      <div className="container mx-auto max-w-2xl p-4 flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)]">
        <header className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">My Wallet</h1>
          <p className="text-muted-foreground">Manage your funds with ease.</p>
        </header>

        <Card className="mb-6 text-center bg-gradient-to-br from-primary to-green-400 text-primary-foreground shadow-lg dark:from-primary/80 dark:to-green-500/80">
          <CardHeader>
            <CardDescription className="text-primary-foreground/80">Current Balance</CardDescription>
             {loading || !user ? (
                <Skeleton className="h-12 w-56 mx-auto rounded-md bg-white/20" />
              ) : (
                <CardTitle className="text-5xl font-extrabold tracking-tighter">
                  {formatCurrency(user.balance)}
                </CardTitle>
              )}
          </CardHeader>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/deposit" passHref>
            <Button size="lg" className="h-24 w-full text-lg flex-col gap-2 shadow-lg hover:scale-105 transition-transform group bg-primary hover:bg-primary/90 text-primary-foreground">
              <ArrowDownToLine className="h-8 w-8 group-hover:animate-bounce" />
              Deposit
            </Button>
          </Link>
          <Link href="/withdraw" passHref>
            <Button variant="secondary" size="lg" className="h-24 w-full text-lg flex-col gap-2 shadow-lg hover:scale-105 transition-transform group bg-accent hover:bg-accent/90 text-accent-foreground">
              <ArrowUpFromLine className="h-8 w-8 group-hover:animate-pulse" />
              <span>Withdraw</span>
            </Button>
          </Link>
        </div>

        <div className="flex-grow flex items-end justify-center">
            <Image
                src="https://files.catbox.moe/7z87l0.jpg"
                alt="Wallet illustration"
                width={300}
                height={200}
                className="object-contain"
                data-ai-hint="payment success"
            />
        </div>
      </div>
    </ClientOnly>
  );
}
