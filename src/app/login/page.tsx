"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError("Correo o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", data.user.id)
      .single();

    setCargando(false);

    if (perfil?.rol === "organizador") router.push("/organizador");
    else if (perfil?.rol === "despachador") router.push("/despachador");
    else router.push("/voluntarios");
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            <h1 className="font-display text-2xl font-semibold text-ink">
              Iniciar sesión
            </h1>
            <p className="mt-1.5 text-sm text-inkSoft">
              Accede según tu rol: voluntario, organizador o despachador.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
              <Input
                id="email"
                label="Correo electrónico"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
              />
              <Input
                id="password"
                label="Contraseña"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              {error && <p className="text-sm text-rojo">{error}</p>}

              <Button type="submit" size="lg" disabled={cargando} className="mt-2">
                {cargando ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                Entrar
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-inkSoft">
              ¿Aún no eres voluntario?{" "}
              <Link href="/registro" className="font-medium text-azul hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
