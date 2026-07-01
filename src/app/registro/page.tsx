"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const router = useRouter();
  const supabase = createClient();

  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const { data: auth, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: nombreCompleto,
        },
      },
    });

    if (authError || !auth.user) {
      setError(authError?.message ?? "No se pudo crear la cuenta.");
      setCargando(false);
      return;
    }

    setCargando(false);
    setEnviado(true);
    
    // Redirigir al segundo paso: Completar perfil de voluntario
    setTimeout(() => {
      router.push("/registro-voluntario");
    }, 2000);
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            {enviado ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-10 text-center"
              >
                <CheckCircle2 size={48} className="text-azul animate-bounce" />
                <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                  ¡Cuenta creada con éxito!
                </h2>
                <p className="mt-2 text-sm text-inkSoft">
                  Te estamos redirigiendo para completar tus datos de voluntario...
                </p>
              </motion.div>
            ) : (
              <>
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-azul/10 text-azul">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-semibold text-ink">
                      Crear Cuenta
                    </h1>
                    <p className="text-sm text-inkSoft">
                      Crea tu cuenta de voluntario en segundos.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Input
                    label="Nombre completo"
                    required
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                  />
                  <Input
                    label="Correo electrónico"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                  <Input
                    label="Contraseña"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />

                  {error && (
                    <p className="text-sm text-rojo">{error}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={cargando}
                    className="mt-2"
                  >
                    {cargando ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      "Crear cuenta"
                    )}
                  </Button>
                </form>
              </>
            )}
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
