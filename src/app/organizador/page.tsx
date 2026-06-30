"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Users } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CategoriaTabs from "@/components/dashboard/CategoriaTabs";
import MovementForm from "@/components/dashboard/MovementForm";
import InventoryTable from "@/components/dashboard/InventoryTable";
import MovementLog from "@/components/dashboard/MovementLog";
import VoluntarioCard from "@/components/dashboard/VoluntarioCard";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type {
  CategoriaInventario,
  ProductoInventario,
  MovimientoInventario,
  Voluntario,
} from "@/types";

export default function OrganizadorPage() {
  const supabase = createClient();
  const [vista, setVista] = useState<"inventario" | "voluntarios">(
    "inventario"
  );
  const [categoria, setCategoria] = useState<CategoriaInventario>(
    "medicamentos"
  );
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [cargandoTabla, setCargandoTabla] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function cargarInventario() {
      setCargandoTabla(true);
      const { data: prods } = await supabase
        .from("inventario")
        .select("*")
        .eq("categoria", categoria)
        .order("nombre");
      const hoy = new Date().toISOString().slice(0, 10);
      const { data: movs } = await supabase
        .from("movimientos")
        .select("*")
        .eq("categoria", categoria)
        .gte("created_at", hoy)
        .order("created_at", { ascending: false });
      setProductos(prods ?? []);
      setMovimientos(movs ?? []);
      setCargandoTabla(false);
    }
    if (vista === "inventario") cargarInventario();
  }, [categoria, vista, supabase]);

  useEffect(() => {
    async function cargarVoluntarios() {
      const { data } = await supabase
        .from("voluntarios")
        .select("*")
        .order("created_at", { ascending: false });
      setVoluntarios(data ?? []);
    }
    if (vista === "voluntarios") cargarVoluntarios();
  }, [vista, supabase]);

  async function registrarIngreso(datos: {
    nombre: string;
    cantidad: number;
    unidad: string;
    ubicacionODestino: string;
    vencimiento?: string;
  }) {
    setEnviando(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("inventario").insert({
      categoria,
      nombre: datos.nombre,
      cantidad: datos.cantidad,
      unidad: datos.unidad,
      ubicacion: datos.ubicacionODestino,
      vencimiento: datos.vencimiento ?? null,
    });

    await supabase.from("movimientos").insert({
      categoria,
      producto_nombre: datos.nombre,
      tipo: "ingreso",
      cantidad: datos.cantidad,
      responsable: user?.email ?? "organizador",
    });

    const { data: prods } = await supabase
      .from("inventario")
      .select("*")
      .eq("categoria", categoria)
      .order("nombre");
    const { data: movs } = await supabase
      .from("movimientos")
      .select("*")
      .eq("categoria", categoria)
      .order("created_at", { ascending: false });

    setProductos(prods ?? []);
    setMovimientos(movs ?? []);
    setEnviando(false);
  }

  return (
    <div className="min-h-screen bg-cream">
      <DashboardHeader rolEtiqueta="organizador" />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex gap-2">
          <Button
            variant={vista === "inventario" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setVista("inventario")}
          >
            <ClipboardList size={15} /> Ingresar productos
          </Button>
          <Button
            variant={vista === "voluntarios" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setVista("voluntarios")}
          >
            <Users size={15} /> Ver voluntarios
          </Button>
        </div>

        {vista === "inventario" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
          >
            <CategoriaTabs value={categoria} onChange={setCategoria} />

            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <MovementForm
                  categoria={categoria}
                  modo="ingreso"
                  cargando={enviando}
                  onSubmit={registrarIngreso}
                />
              </div>
              <div className="flex flex-col gap-6 lg:col-span-3">
                <InventoryTable productos={productos} cargando={cargandoTabla} />
                <MovementLog movimientos={movimientos} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3")}
          >
            {voluntarios.map((v, i) => (
              <VoluntarioCard voluntario={v} index={i} key={v.id} />
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
