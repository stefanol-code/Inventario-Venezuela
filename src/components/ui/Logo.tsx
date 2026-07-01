import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Logo({
  size = 44,
  withText = true,
  className,
}: {
  size?: number;
  withText?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <Image
        src="/logo.png"
        alt="La Chinita"
        width={size}
        height={size}
        priority
        className={cn(
          "shrink-0 object-contain h-auto transition-all duration-300",
          size > 140 ? "w-20 sm:w-40" : 
          size > 100 ? "w-14 sm:w-30" : 
          size > 80 ? "w-12 sm:w-24" : 
          size > 60 ? "w-10 sm:w-16" : 
          size > 44 ? "w-8 sm:w-11" : "w-6 sm:w-9"
        )}
      />
      {withText && (
        <div className="leading-tight">
          <p
            className={cn(
              "font-display font-semibold text-ink transition-all duration-300",
              size > 140 ? "text-2xl sm:text-5xl" : 
              size > 100 ? "text-lg sm:text-4xl" : 
              size > 80 ? "text-base sm:text-3xl" : 
              size > 60 ? "text-sm sm:text-2xl" : 
              size > 44 ? "text-xs sm:text-lg" : "text-[11px] sm:text-base"
            )}
          >
            La Chinita
          </p>
          <p
            className={cn(
              "uppercase tracking-[0.18em] text-inkSoft transition-all duration-300",
              size > 140 ? "text-[9px] sm:text-sm mt-0.5 sm:mt-2 tracking-[0.22em]" : 
              size > 100 ? "text-[8px] sm:text-[11px] mt-0.5 sm:mt-1.5 tracking-[0.2em]" : 
              size > 80 ? "text-[8px] sm:text-[11px] mt-0.5 sm:mt-1" : 
              size > 60 ? "text-[8px] sm:text-[10px]" : 
              size > 44 ? "text-[8px] sm:text-[9px]" : "text-[8px] sm:text-[9px] -mt-0.5"
            )}
          >
            Iglesia Chiquinquirá
          </p>
        </div>
      )}
    </div>
  );
}
