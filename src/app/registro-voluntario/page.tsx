"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeartHandshake, Loader2, CheckCircle2, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function RegistroVoluntarioPage() {
  const router = useRouter();
  const supabase = createClient();

  const [usuario, setUsuario] = useState<any>(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    cedula: "",
    telefono: "",
    ciudad: "",
    disponibilidad: "fines_de_semana",
    habilidades: "",
    experiencia_previa: "no",
    vehiculo_propio: "no",
  });

  useEffect(() => {
    async function obtenerUsuario() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Si no está logueado, redirigir al login
        router.push("/login");
      } else {
        setUsuario(user);
      }
      setCargandoUsuario(false);
    }
    obtenerUsuario();
  }, [supabase, router]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    setError("");
    setCargando(true);

    const nombreCompleto = usuario.user_metadata?.nombre_completo || "Voluntario Registrado";

    // 1. Guardar voluntario
    const { error: dbError } = await supabase.from("voluntarios").insert({
      id: usuario.id,
      nombre_completo: nombreCompleto,
      cedula: form.cedula,
      telefono: form.telefono,
      email: usuario.email,
      ciudad: form.ciudad,
      experiencia_previa: form.experiencia_previa === "si",
      vehiculo_propio: form.vehiculo_propio === "si",
    });

    if (dbError) {
      setError(dbError.message ?? "Hubo un problema guardando tus datos.");
      setCargando(false);
      return;
    }

    // 2. Guardar disponibilidad en tabla puente
    const dispMapping: Record<string, string> = {
      fines_de_semana: "Fines de semana",
      entre_semana: "Entre semana",
      tiempo_completo: "Tiempo completo",
      por_llamado: "Por llamado urgente",
    };
    const dispNombre = dispMapping[form.disponibilidad] || "Fines de semana";
    const { data: dispData } = await supabase
      .from("disponibilidades")
      .select("id")
      .eq("nombre", dispNombre)
      .single();

    if (dispData) {
      await supabase.from("voluntario_disponibilidades").insert({
        voluntario_id: usuario.id,
        disponibilidad_id: dispData.id,
      });
    }

    // 3. Procesar y guardar habilidades en tabla puente
    const listaHabilidades = form.habilidades
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const nombreHabilidad of listaHabilidades) {
      let habilidadId: number | null = null;
      
      const { data: habilidadExistente } = await supabase
        .from("habilidades")
        .select("id")
        .ilike("nombre", nombreHabilidad)
        .maybeSingle();

      if (habilidadExistente) {
        habilidadId = habilidadExistente.id;
      } else {
        const { data: nuevaHabilidad } = await supabase
          .from("habilidades")
          .insert({ nombre: nombreHabilidad })
          .select("id")
          .single();
        if (nuevaHabilidad) {
          habilidadId = nuevaHabilidad.id;
        }
      }

      if (habilidadId) {
        await supabase.from("voluntario_habilidades").insert({
          voluntario_id: usuario.id,
          habilidad_id: habilidadId,
        });
      }
    }

    setCargando(false);
    setEnviado(true);
    setTimeout(() => router.push("/voluntarios"), 2200);
  }

  if (cargandoUsuario) {
    return (
      <div className="flex min-h-screen flex-col bg-cream">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-azul" size={32} />
        </main>
        <Footer />
      </div>
    );
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
                  ¡Registro de voluntario completado!
                </h2>
                <p className="mt-2 text-sm text-inkSoft">
                  Tus datos han sido enlazados. Te llevamos al directorio.
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
                      Perfil de Voluntario
                    </h1>
                    <p className="text-sm text-inkSoft">
                      Paso 2: Completa tus datos para el centro de acopio.
                    </p>
                  </div>
                </div>

                <div className="mb-6 rounded-lg bg-paper/60 p-4 border border-ink/5 flex items-center gap-3">
                  <div className="bg-azul/10 text-azul p-2 rounded-full">
                    <User size={18} />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-ink">
                      {usuario?.user_metadata?.nombre_completo}
                    </p>
                    <p className="text-xs text-inkSoft">{usuario?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Cédula"
                    required
                    value={form.cedula}
                    onChange={(e) => update("cedula", e.target.value)}
                    placeholder="Ej. V-12345678"
                  />
                  <Input
                    label="Teléfono"
                    required
                    value={form.telefono}
                    onChange={(e) => update("telefono", e.target.value)}
                    placeholder="Ej. +58 412 1234567"
                  />
                  <Input
                    label="Ciudad"
                    required
                    value={form.ciudad}
                    onChange={(e) => update("ciudad", e.target.value)}
                    placeholder="Ej. Maracaibo"
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
                      placeholder="Enfermería, logística, primeros auxilios, conducción, etc. (separa por comas)"
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
                    Completar Registro
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
