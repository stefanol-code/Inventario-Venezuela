"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Input from "@/components/ui/Input";
import VoluntarioCard from "@/components/dashboard/VoluntarioCard";
import { createClient } from "@/lib/supabase/client";
import type { Voluntario } from "@/types";

export default function VoluntariosPage() {
  const supabase = createClient();
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from("voluntarios")
        .select("*")
        .order("created_at", { ascending: false });
      setVoluntarios(data ?? []);
      setCargando(false);
    }
    cargar();
  }, [supabase]);

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return voluntarios.filter(
      (v) =>
        v.nombre_completo.toLowerCase().includes(q) ||
        v.ciudad.toLowerCase().includes(q) ||
        v.habilidades.toLowerCase().includes(q)
    );
  }, [voluntarios, busqueda]);

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-azul">
                <Users size={15} /> Directorio
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
                Voluntarios disponibles
              </h1>
            </div>
            <div className="w-full md:w-72">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inkSoft"
                />
                <Input
                  placeholder="Buscar por nombre, ciudad o habilidad"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {cargando ? (
            <p className="text-sm text-inkSoft">Cargando voluntarios…</p>
          ) : filtrados.length === 0 ? (
            <div className="rounded-xl2 border border-dashed border-ink/15 bg-white/60 p-12 text-center">
              <p className="text-sm text-inkSoft">
                Todavía no hay voluntarios que coincidan con tu búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map((v, i) => (
                <VoluntarioCard voluntario={v} index={i} key={v.id} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
