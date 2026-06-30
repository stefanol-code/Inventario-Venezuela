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
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo.png"
        alt="La Chinita"
        width={size}
        height={size}
        priority
        className="shrink-0"
      />
      {withText && (
        <div className="leading-tight">
          <p
            className={cn(
              "font-display font-semibold text-ink",
              size > 140 ? "text-5xl" : size > 100 ? "text-4xl" : size > 80 ? "text-3xl" : size > 60 ? "text-2xl" : size > 44 ? "text-lg" : "text-base"
            )}
          >
            La Chinita
          </p>
          <p
            className={cn(
              "uppercase tracking-[0.18em] text-inkSoft",
              size > 140 ? "text-base mt-2 tracking-[0.22em]" : size > 100 ? "text-sm mt-1.5 tracking-[0.2em]" : size > 80 ? "text-sm mt-1" : size > 60 ? "text-[13px] mt-0.5" : size > 44 ? "text-[12px]" : "text-[11px] -mt-0.5"
            )}
          >
            Iglesia Chiquinquirá
          </p>
        </div>
      )}
    </div>
  );
}
