import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl2 border border-ink/8 bg-white/80 backdrop-blur-sm shadow-card",
        className
      )}
      {...props}
    />
  );
}
