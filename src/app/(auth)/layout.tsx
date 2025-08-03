import { FundFlowLogo } from "@/components/icons/FundFlowLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <FundFlowLogo className="h-12 w-auto text-primary" />
        {children}
      </div>
    </main>
  );
}
