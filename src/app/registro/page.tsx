"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeartHandshake, Loader2, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const router = useRouter();
  const supabase = createClient();

  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre_completo: "",
    cedula: "",
    telefono: "",
    email: "",
    password: "",
    ciudad: "",
    disponibilidad: "fines_de_semana",
    habilidades: "",
    experiencia_previa: "no",
    vehiculo_propio: "no",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const { data: auth, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError || !auth.user) {
      setError(authError?.message ?? "No se pudo crear la cuenta.");
      setCargando(false);
      return;
    }

    const { error: dbError } = await supabase.from("voluntarios").insert({
      id: auth.user.id,
      nombre_completo: form.nombre_completo,
      cedula: form.cedula,
      telefono: form.telefono,
      email: form.email,
      ciudad: form.ciudad,
      disponibilidad: form.disponibilidad,
      habilidades: form.habilidades,
      experiencia_previa: form.experiencia_previa === "si",
      vehiculo_propio: form.vehiculo_propio === "si",
    });

    setCargando(false);

    if (dbError) {
      setError("Tu cuenta se creó, pero hubo un problema guardando tus datos.");
      return;
    }

    setEnviado(true);
    setTimeout(() => router.push("/voluntarios"), 2200);
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <Card className="p-8 md:p-10">
            {enviado ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-10 text-center"
              >
                <CheckCircle2 size={48} className="text-azul" />
                <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                  ¡Gracias por sumarte!
                </h2>
                <p className="mt-2 text-sm text-inkSoft">
                  Tu registro fue guardado. Te llevamos al directorio de
                  voluntarios.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rojo/10 text-rojo">
                    <HeartHandshake size={20} />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-semibold text-ink">
                      Registro de voluntario
                    </h1>
                    <p className="text-sm text-inkSoft">
                      Cuéntanos cómo puedes ayudar.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Nombre completo"
                    required
                    value={form.nombre_completo}
                    onChange={(e) => update("nombre_completo", e.target.value)}
                  />
                  <Input
                    label="Cédula"
                    required
                    value={form.cedula}
                    onChange={(e) => update("cedula", e.target.value)}
                  />
                  <Input
                    label="Teléfono"
                    required
                    value={form.telefono}
                    onChange={(e) => update("telefono", e.target.value)}
                  />
                  <Input
                    label="Ciudad"
                    required
                    value={form.ciudad}
                    onChange={(e) => update("ciudad", e.target.value)}
                  />
                  <Input
                    label="Correo electrónico"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                  <Input
                    label="Contraseña"
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                  />

                  <Select
                    label="Disponibilidad"
                    value={form.disponibilidad}
                    onChange={(e) => update("disponibilidad", e.target.value)}
                  >
                    <option value="fines_de_semana">Fines de semana</option>
                    <option value="entre_semana">Entre semana</option>
                    <option value="tiempo_completo">Tiempo completo</option>
                    <option value="por_llamado">Por llamado urgente</option>
                  </Select>

                  <Select
                    label="¿Experiencia previa en emergencias?"
                    value={form.experiencia_previa}
                    onChange={(e) => update("experiencia_previa", e.target.value)}
                  >
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </Select>

                  <Select
                    label="¿Cuenta con vehículo propio?"
                    value={form.vehiculo_propio}
                    onChange={(e) => update("vehiculo_propio", e.target.value)}
                  >
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </Select>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-ink">
                      Habilidades o especialidad
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={form.habilidades}
                      onChange={(e) => update("habilidades", e.target.value)}
                      placeholder="Enfermería, logística, manejo de alimentos, conducción..."
                      className="focus-ring mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-inkSoft/50 focus:border-azul"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-rojo md:col-span-2">{error}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={cargando}
                    className="md:col-span-2"
                  >
                    {cargando && <Loader2 size={18} className="animate-spin" />}
                    Completar registro
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
