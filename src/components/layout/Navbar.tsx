"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/8 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="focus-ring rounded-lg">
          <Logo size={120} />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-inkSoft md:flex">
          <Link href="/voluntarios" className="hover:text-ink transition-colors">
            Ver voluntarios
          </Link>
          <Link href="/#como-funciona" className="hover:text-ink transition-colors">
            Cómo funciona
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/registro">
            <Button variant="primary" size="sm">
              Ser voluntario
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
