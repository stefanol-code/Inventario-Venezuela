"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Truck, Users, Calendar, Plus, ChevronLeft, ArrowRight } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CategoriaTabs from "@/components/dashboard/CategoriaTabs";
import MovementForm from "@/components/dashboard/MovementForm";
import InventoryTable from "@/components/dashboard/InventoryTable";
import MovementLog from "@/components/dashboard/MovementLog";
import VoluntarioCard from "@/components/dashboard/VoluntarioCard";
import RegistroDiario from "@/components/dashboard/RegistroDiario";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORIA_LABEL,
  type CategoriaInventario,
  type ProductoInventario,
  type MovimientoInventario,
  type Voluntario,
} from "@/types";

export default function DespachadorPage() {
  const supabase = createClient();
  const [vista, setVista] = useState<"inicio" | "inventario" | "voluntarios" | "registro-diario">("inicio");
  const [categoria, setCategoria] = useState<CategoriaInventario>("medicamentos");
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [cargandoTabla, setCargandoTabla] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  async function cargarInventario() {
    setCargandoTabla(true);
    const catNombre = CATEGORIA_LABEL[categoria];
    
    const { data: rawInv } = await supabase
      .from("inventario")
      .select(`
        id,
        cantidad,
        ubicacion,
        updated_at,
        lotes (
          codigo,
          fecha_vencimiento,
          productos (
            nombre,
            unidad,
            componente_activo,
            concentracion,
            presentacion,
            es_pediatrico,
            tipo_insumo,
            descripcion,
            medida,
            categorias (nombre)
          )
        )
      `)
      .order("updated_at", { ascending: false });

    const prodsFiltrados = (rawInv ?? [])
      .filter((item: any) => item.lotes?.productos?.categorias?.nombre === catNombre)
      .map((item: any) => ({
        id: item.id,
        nombre: item.lotes?.productos?.nombre ?? "",
        categoria: categoria,
        cantidad: item.cantidad,
        unidad: item.lotes?.productos?.unidad ?? "unidades",
        lote: item.lotes?.codigo,
        vencimiento: item.lotes?.fecha_vencimiento,
        ubicacion: item.ubicacion,
        updated_at: item.updated_at,
        componente_activo: item.lotes?.productos?.componente_activo,
        concentracion: item.lotes?.productos?.concentracion,
        presentacion: item.lotes?.productos?.presentacion,
        es_pediatrico: item.lotes?.productos?.es_pediatrico,
        tipo_insumo: item.lotes?.productos?.tipo_insumo,
        descripcion: item.lotes?.productos?.descripcion,
        medida: item.lotes?.productos?.medida,
      }));

    const { data: rawMovs } = await supabase
      .from("movimientos")
      .select(`
        id,
        tipo,
        cantidad,
        destino,
        created_at,
        responsable_id,
        inventario (
          lotes (
            productos (
              nombre,
              categorias (nombre)
            )
          )
        )
      `)
      .order("created_at", { ascending: false });

    const movsFiltrados = (rawMovs ?? [])
      .filter((m: any) => m.inventario?.lotes?.productos?.categorias?.nombre === catNombre)
      .map((m: any) => ({
        id: m.id,
        producto_nombre: m.inventario?.lotes?.productos?.nombre ?? "",
        categoria: categoria,
        tipo: m.tipo,
        cantidad: m.cantidad,
        destino: m.destino,
        responsable: m.responsable_id || "despachador",
        created_at: m.created_at,
      }));

    setProductos(prodsFiltrados);
    setMovimientos(movsFiltrados);
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
        .select(`
          *,
          voluntario_habilidades (
            habilidades (nombre)
          ),
          voluntario_disponibilidades (
            disponibilidades (nombre)
          )
        `)
        .order("created_at", { ascending: false });
      setVoluntarios((data as any) ?? []);
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
    
    // 1. Obtener ID de la categoría
    const catNombre = CATEGORIA_LABEL[categoria];
    const { data: catData } = await supabase
      .from("categorias")
      .select("id")
      .eq("nombre", catNombre)
      .single();

    if (!catData) {
      setError("Categoría no encontrada.");
      return;
    }

    // 2. Obtener el producto
    const { data: prodData } = await supabase
      .from("productos")
      .select("id")
      .ilike("nombre", datos.nombre)
      .eq("categoria_id", catData.id)
      .maybeSingle();

    if (!prodData) {
      setError("El producto no existe en esta categoría.");
      return;
    }

    // 3. Obtener todos los inventarios (lotes) de ese producto con cantidad > 0
    const { data: stockItems } = await supabase
      .from("inventario")
      .select(`
        id,
        cantidad,
        lotes!inner (
          producto_id
        )
      `)
      .eq("lotes.producto_id", prodData.id)
      .gt("cantidad", 0)
      .order("updated_at", { ascending: true });

    const totalDisponible = (stockItems ?? []).reduce((acc, item) => acc + item.cantidad, 0);

    if (totalDisponible < datos.cantidad) {
      setError(`No hay suficiente cantidad disponible de ese producto (Disponible: ${totalDisponible} ${datos.unidad}).`);
      return;
    }

    setEnviando(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let cantidadRestante = datos.cantidad;

    for (const item of (stockItems ?? [])) {
      if (cantidadRestante <= 0) break;

      const aDeducir = Math.min(item.cantidad, cantidadRestante);
      const nuevaCantidad = item.cantidad - aDeducir;

      await supabase
        .from("inventario")
        .update({ cantidad: nuevaCantidad })
        .eq("id", item.id);

      // Registrar el movimiento de salida
      await supabase.from("movimientos").insert({
        inventario_id: item.id,
        tipo: "salida",
        cantidad: aDeducir,
        destino: datos.ubicacionODestino,
        responsable_id: user?.id,
      });

      cantidadRestante -= aDeducir;
    }

    await cargarInventario();
    setEnviando(false);
  }

  return (
    <div className="min-h-screen bg-cream">
      <DashboardHeader rolEtiqueta="despachador" />

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* Botón de retroceso al panel inicial */}
        {vista !== "inicio" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVista("inicio")}
            className="mb-6 hover:translate-x-[-4px] transition-transform duration-200"
          >
            <ChevronLeft size={16} /> Volver al menú
          </Button>
        )}

        {/* 1. Vista Inicial de Bienvenida (Tarjetas Grandes) */}
        {vista === "inicio" && (
          <div className="flex flex-col gap-8">
            <div className="text-center sm:text-left">
              <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                ¡Bienvenido de vuelta, Despachador!
              </h1>
              <p className="mt-2 text-inkSoft text-base">
                ¿Qué deseas gestionar el día de hoy? Selecciona una de las siguientes opciones.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 mt-4">
              {/* Tarjeta 1: Despacho */}
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => setVista("inventario")}
                className="cursor-pointer"
              >
                <Card className="flex h-full flex-col p-6 hover:shadow-soft border-l-4 border-l-rojo bg-white/80">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rojo/10 text-rojo">
                    <Truck size={22} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    Despachar Productos
                  </h3>
                  <p className="mt-2 flex-grow text-sm text-inkSoft leading-relaxed">
                    Registra salidas de medicamentos, comida o insumos quirúrgicos hacia centros asistenciales, familias o refugios.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-rojo uppercase tracking-wider">
                    Registrar despachos <ArrowRight size={14} />
                  </div>
                </Card>
              </motion.div>

              {/* Tarjeta 2: Bitácora */}
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => setVista("registro-diario")}
                className="cursor-pointer"
              >
                <Card className="flex h-full flex-col p-6 hover:shadow-soft border-l-4 border-l-gold bg-white/80">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold-dark">
                    <Calendar size={22} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    Ver Bitácora de Movimientos
                  </h3>
                  <p className="mt-2 flex-grow text-sm text-inkSoft leading-relaxed">
                    Visualiza el historial consolidado diario de todos los productos y cantidades ingresados o despachados.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gold-dark uppercase tracking-wider">
                    Ver historial <ArrowRight size={14} />
                  </div>
                </Card>
              </motion.div>

              {/* Tarjeta 3: Voluntarios */}
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => setVista("voluntarios")}
                className="cursor-pointer"
              >
                <Card className="flex h-full flex-col p-6 hover:shadow-soft border-l-4 border-l-azul bg-white/80">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-azul/10 text-azul">
                    <Users size={22} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    Registro de Voluntarios
                  </h3>
                  <p className="mt-2 flex-grow text-sm text-inkSoft leading-relaxed">
                    Consulta la lista completa de voluntarios, su disponibilidad, experiencia y habilidades de apoyo.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-azul uppercase tracking-wider">
                    Ver voluntarios <ArrowRight size={14} />
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        )}

        {/* 2. Sección de Gestión de Inventario (Despacho) */}
        {vista === "inventario" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
          >
            {/* Cabecera con Categorías y Botón de Despacho */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CategoriaTabs value={categoria} onChange={setCategoria} />
              
              <Button
                variant="danger"
                onClick={() => setMostrarModal(true)}
                className="shrink-0 flex items-center gap-1.5 self-start sm:self-center"
              >
                <Plus size={16} /> Despachar Producto
              </Button>
            </div>

            {/* Formulario en Modal */}
            {mostrarModal && (
              <MovementForm
                categoria={categoria}
                modo="salida"
                cargando={enviando}
                onClose={() => setMostrarModal(false)}
                onSubmit={async (datos) => {
                  await registrarSalida(datos);
                  setMostrarModal(false);
                }}
              />
            )}

            {/* Mensajes de error del despachador */}
            {error && (
              <Card className="bg-rojo/5 border border-rojo/10 p-4 text-sm text-rojo font-medium animate-fadeIn">
                {error}
              </Card>
            )}

            {/* Tabla de existencias y Log Diario (Ocupa ancho completo) */}
            <div className="flex flex-col gap-8">
              <InventoryTable
                productos={productos}
                cargando={cargandoTabla}
                categoria={categoria}
              />
              <MovementLog movimientos={movimientos} />
            </div>
          </motion.div>
        )}

        {/* 3. Sección de Directorio de Voluntarios */}
        {vista === "voluntarios" && (
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

        {/* 4. Sección de Bitácora Consolidada Diaria */}
        {vista === "registro-diario" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <RegistroDiario />
          </motion.div>
        )}

      </main>
    </div>
  );
}
