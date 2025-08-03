import { cn } from "@/lib/utils";

export const BharatInvestLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 240 50"
    className={cn("text-primary", className)}
    {...props}
  >
    <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
        </linearGradient>
    </defs>
    <path d="M 10 25 C 10 15, 20 10, 30 10 S 50 15, 50 25 S 40 40, 30 40 S 10 35, 10 25 Z" fill="url(#logo-gradient)" />
    <path d="M 30 10 Q 40 25, 30 40" stroke="hsl(var(--background))" strokeWidth="3" fill="none" />
    <text x="60" y="35" fontFamily="Inter, sans-serif" fontSize="30" fontWeight="bold" fill="currentColor">
      BharatInvest
    </text>
  </svg>
);
