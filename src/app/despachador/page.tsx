"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Truck, Users } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CategoriaTabs from "@/components/dashboard/CategoriaTabs";
import MovementForm from "@/components/dashboard/MovementForm";
import InventoryTable from "@/components/dashboard/InventoryTable";
import MovementLog from "@/components/dashboard/MovementLog";
import VoluntarioCard from "@/components/dashboard/VoluntarioCard";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type {
  CategoriaInventario,
  ProductoInventario,
  MovimientoInventario,
  Voluntario,
} from "@/types";

export default function DespachadorPage() {
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
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (vista === "inventario") cargarInventario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria, vista]);

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

  async function registrarSalida(datos: {
    nombre: string;
    cantidad: number;
    unidad: string;
    ubicacionODestino: string;
  }) {
    setError("");
    const existente = productos.find(
      (p) => p.nombre.toLowerCase() === datos.nombre.toLowerCase()
    );

    if (!existente || existente.cantidad < datos.cantidad) {
      setError(
        "No hay suficiente cantidad disponible de ese producto en esta categoría."
      );
      return;
    }

    setEnviando(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("inventario")
      .update({ cantidad: existente.cantidad - datos.cantidad })
      .eq("id", existente.id);

    await supabase.from("movimientos").insert({
      categoria,
      producto_nombre: datos.nombre,
      tipo: "salida",
      cantidad: datos.cantidad,
      destino: datos.ubicacionODestino,
      responsable: user?.email ?? "despachador",
    });

    await cargarInventario();
    setEnviando(false);
  }

  return (
    <div className="min-h-screen bg-cream">
      <DashboardHeader rolEtiqueta="despachador" />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex gap-2">
          <Button
            variant={vista === "inventario" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setVista("inventario")}
          >
            <Truck size={15} /> Despachar productos
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
                  modo="salida"
                  cargando={enviando}
                  onSubmit={registrarSalida}
                />
                {error && (
                  <p className="mt-3 text-sm text-rojo">{error}</p>
                )}
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
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
