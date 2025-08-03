
import { cn } from "@/lib/utils";
import React from "react";

export const TelegramIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-6 w-6", className)}
        {...props}
    >
        <path 
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.84c-.15.48-1.07 4.47-1.27 5.43-.2 1-.48 1.3-.77 1.32-.28.02-.65-.22-.99-.44-.4-.26-.85-.54-1.3-.82-.5-.32-.27-.5.18-.84l3.25-3.1c.14-.13.04-.3-.12-.22l-4.08 2.56c-.83.52-1.52.76-2.05.74-.53-.02-1.42-.3-2.05-.56-.72-.3-1.2-.44-1.18-.9.02-.5.56-.78 1.52-1.15l8.6-3.3c.3-.12.58-.06.7.07z"
        />
    </svg>
);
