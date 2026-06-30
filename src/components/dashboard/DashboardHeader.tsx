"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardHeader({
  rolEtiqueta,
}: {
  rolEtiqueta: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  async function salir() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink/8 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Logo size={100} />
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-medium text-inkSoft sm:inline">
            Panel de {rolEtiqueta}
          </span>
          <Link href="/voluntarios">
            <Button variant="ghost" size="sm">
              Voluntarios
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={salir}>
            <LogOut size={15} /> Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
