import { BharatInvestLogo } from "@/components/icons/BharatInvestLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <BharatInvestLogo className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold text-gray-800">BharatInvest</h1>
        {children}
      </div>
    </main>
  );
}
