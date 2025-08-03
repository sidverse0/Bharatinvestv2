import Image from 'next/image';
import { cn } from "@/lib/utils";

export const BharatInvestLogo = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { width?: number, height?: number}) => (
    <div className={cn("relative", className)} style={{ width: props.width || 48, height: props.height || 48 }}>
        <Image
            src="https://files.catbox.moe/ruos95.png"
            alt="BharatInvest Logo"
            layout="fill"
            className="rounded-full object-cover"
        />
    </div>
);
