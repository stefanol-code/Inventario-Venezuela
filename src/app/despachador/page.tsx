"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Users,
  Calendar,
  Plus,
  ChevronLeft,
  ArrowRight,
  HeartHandshake,
  FileSpreadsheet
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CategoriaTabs from "@/components/dashboard/CategoriaTabs";
import MovementForm from "@/components/dashboard/MovementForm";
import InventoryTable from "@/components/dashboard/InventoryTable";
import MovementLog from "@/components/dashboard/MovementLog";
import VoluntarioCard from "@/components/dashboard/VoluntarioCard";
import RegistroDiario from "@/components/dashboard/RegistroDiario";
import SolicitudesAyuda from "@/components/dashboard/SolicitudesAyuda";
import StatsGrid from "@/components/dashboard/StatsGrid";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { exportarAExcel } from "@/lib/excel";
import {
  CATEGORIA_LABEL,
  type CategoriaInventario,
  type ProductoInventario,
  type MovimientoInventario,
  type Voluntario,
} from "@/types";

export default function DespachadorPage() {
  const supabase = createClient();
  const [vista, setVista] = useState<"inicio" | "inventario" | "voluntarios" | "registro-diario" | "solicitudes">("inicio");
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

  // Exportar Almacén a Excel
  function exportarInventario() {
    const columnas = {
      nombre: "Rubro",
      categoria: "Categoría",
      cantidad: "Stock",
      unidad: "Unidad",
      lote: "Lote",
      vencimiento: "Vencimiento",
      ubicacion: "Ubicación",
      componente_activo: "Componente Activo",
      concentracion: "Concentración",
      presentacion: "Presentación",
      es_pediatrico: "Pediátrico",
      tipo_insumo: "Tipo Insumo",
      descripcion: "Descripción",
      medida: "Medida"
    };

    const mapeados = productos.map((p) => ({
      ...p,
      categoria: CATEGORIA_LABEL[p.categoria] || p.categoria,
      es_pediatrico: p.es_pediatrico ? "Sí" : "No"
    }));

    exportarAExcel(mapeados, columnas, "Inventario_Stock_Almacen", "Inventario");
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

        {/* 1. Vista Inicial de Bienvenida (4 Tarjetas Grandes) */}
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

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-4">
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
                    Deduce salidas del inventario hacia centros asistenciales o refugios directamente.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-rojo uppercase tracking-wider">
                    Registrar despachos <ArrowRight size={14} />
                  </div>
                </Card>
              </motion.div>

              {/* Tarjeta 2: Solicitudes */}
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => setVista("solicitudes")}
                className="cursor-pointer"
              >
                <Card className="flex h-full flex-col p-6 hover:shadow-soft border-l-4 border-l-gold bg-white/80">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold-dark">
                    <HeartHandshake size={22} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    Solicitudes de Ayuda
                  </h3>
                  <p className="mt-2 flex-grow text-sm text-inkSoft leading-relaxed">
                    Revisa solicitudes pendientes de comunidades y procésalas para entrega inmediata.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gold-dark uppercase tracking-wider">
                    Ver solicitudes <ArrowRight size={14} />
                  </div>
                </Card>
              </motion.div>

              {/* Tarjeta 3: Bitácora */}
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => setVista("registro-diario")}
                className="cursor-pointer"
              >
                <Card className="flex h-full flex-col p-6 hover:shadow-soft border-l-4 border-l-azul bg-white/80">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-azul/10 text-azul">
                    <Calendar size={22} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    Bitácora Diaria
                  </h3>
                  <p className="mt-2 flex-grow text-sm text-inkSoft leading-relaxed">
                    Historial consolidado diario de todos los movimientos de entradas y salidas.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-azul uppercase tracking-wider">
                    Ver historial <ArrowRight size={14} />
                  </div>
                </Card>
              </motion.div>

              {/* Tarjeta 4: Voluntarios */}
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => setVista("voluntarios")}
                className="cursor-pointer"
              >
                <Card className="flex h-full flex-col p-6 hover:shadow-soft border-l-4 border-l-ink bg-white/80">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ink/5 text-inkSoft">
                    <Users size={22} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    Registro de Voluntarios
                  </h3>
                  <p className="mt-2 flex-grow text-sm text-inkSoft leading-relaxed">
                    Directorio completo de voluntarios, habilidades y disponibilidades de apoyo.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-inkSoft uppercase tracking-wider">
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
            {/* Cabecera con Categorías, Excel y Botón de Despacho */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CategoriaTabs value={categoria} onChange={setCategoria} />
              
              <div className="flex gap-2 self-start sm:self-center">
                <Button
                  variant="ghost"
                  onClick={exportarInventario}
                  className="flex items-center gap-1.5 border border-ink/10 bg-white"
                >
                  <FileSpreadsheet size={16} className="text-azul" /> Exportar Stock
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setMostrarModal(true)}
                  className="flex items-center gap-1.5"
                >
                  <Plus size={16} /> Despachar Producto
                </Button>
              </div>
            </div>

            {/* Cuadrícula de Estadísticas Glassmorphism */}
            <StatsGrid productos={productos} />

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

        {/* 3. Sección de Solicitudes de Ayuda */}
        {vista === "solicitudes" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <SolicitudesAyuda />
          </motion.div>
        )}

        {/* 4. Sección de Directorio de Voluntarios */}
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

        {/* 5. Sección de Bitácora Consolidada Diaria */}
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
