import { BharatInvestLogo } from "@/components/icons/BharatInvestLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold text-primary">Bharat</h1>
          <BharatInvestLogo className="h-10 w-10" />
          <h1 className="text-4xl font-bold text-yellow-500">Invest</h1>
        </div>
        {children}
      </div>
    </main>
  );
}
