import { cn } from "@/lib/utils";

const tones = {
  gold: "bg-gold/15 text-gold-dark",
  azul: "bg-azul/10 text-azul",
  rojo: "bg-rojo/10 text-rojo",
  neutral: "bg-ink/6 text-inkSoft",
};

export default function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
