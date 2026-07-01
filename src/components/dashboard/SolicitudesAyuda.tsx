"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  AlertTriangle,
  HeartHandshake,
  User,
  MapPin,
  Phone,
  Plus,
  X,
  CheckCircle2,
  FileSpreadsheet,
  Check
} from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { exportarAExcel } from "@/lib/excel";

interface SolicitudInsumo {
  id?: string;
  producto_id: string;
  cantidad: number;
  descripcion?: string;
  producto_nombre?: string;
  unidad?: string;
}

interface Solicitud {
  id: string;
  beneficiario: string;
  contacto_nombre: string;
  contacto_telefono: string;
  direccion: string;
  motivo: string;
  urgencia: "Alta" | "Media" | "Baja";
  estado: "Pendiente" | "Entregado";
  entregado_por?: string | null;
  fecha_despacho?: string | null;
  created_at: string;
  insumos: SolicitudInsumo[];
}

export default function SolicitudesAyuda() {
  const supabase = createClient();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [errorEntrega, setErrorEntrega] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  // Formulario de Nueva Solicitud
  const [beneficiario, setBeneficiario] = useState("");
  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoTelefono, setContactoTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [motivo, setMotivo] = useState("");
  const [urgencia, setUrgencia] = useState<"Alta" | "Media" | "Baja">("Media");
  
  // Agregar ítems a la solicitud temporal
  const [itemsTemporal, setItemsTemporal] = useState<SolicitudInsumo[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidadTemporal, setCantidadTemporal] = useState("");
  const [observacionTemporal, setObservacionTemporal] = useState("");

  async function cargarDatos() {
    setCargando(true);
    setErrorEntrega(null);

    // 1. Cargar productos para el selector de la solicitud
    const { data: prods } = await supabase
      .from("productos")
      .select("id, nombre, unidad")
      .order("nombre", { ascending: true });
    setProductosDisponibles(prods ?? []);

    // 2. Cargar solicitudes con sus insumos
    const { data: sols } = await supabase
      .from("solicitudes")
      .select(`
        *,
        solicitud_insumos (
          id,
          producto_id,
          cantidad,
          descripcion,
          productos (
            nombre,
            unidad
          )
        )
      `)
      .order("created_at", { ascending: false });

    const formateadas: Solicitud[] = (sols ?? []).map((s: any) => ({
      id: s.id,
      beneficiario: s.beneficiario,
      contacto_nombre: s.contacto_nombre,
      contacto_telefono: s.contacto_telefono,
      direccion: s.direccion,
      motivo: s.motivo,
      urgencia: s.urgencia,
      estado: s.estado,
      entregado_por: s.entregado_por,
      fecha_despacho: s.fecha_despacho,
      created_at: s.created_at,
      insumos: (s.solicitud_insumos ?? []).map((si: any) => ({
        id: si.id,
        producto_id: si.producto_id,
        cantidad: si.cantidad,
        descripcion: si.descripcion,
        producto_nombre: si.productos?.nombre ?? "Producto",
        unidad: si.productos?.unidad ?? "unidades",
      })),
    }));

    setSolicitudes(formateadas);
    setCargando(false);
  }

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  // Agregar insumo al listado local temporal
  function agregarItemTemporal() {
    if (!productoSeleccionado || !cantidadTemporal || Number(cantidadTemporal) <= 0) {
      alert("Por favor, seleccione un producto y asigne una cantidad válida.");
      return;
    }

    const prod = productosDisponibles.find((p) => p.id === productoSeleccionado);
    if (!prod) return;

    // Verificar si ya está añadido
    if (itemsTemporal.some((item) => item.producto_id === productoSeleccionado)) {
      alert("Este producto ya está en el listado de requerimientos.");
      return;
    }

    setItemsTemporal([
      ...itemsTemporal,
      {
        producto_id: productoSeleccionado,
        cantidad: Number(cantidadTemporal),
        descripcion: observacionTemporal,
        producto_nombre: prod.nombre,
        unidad: prod.unidad,
      },
    ]);

    // Limpiar selector temporal
    setProductoSeleccionado("");
    setCantidadTemporal("");
    setObservacionTemporal("");
  }

  // Eliminar ítem temporal
  function eliminarItemTemporal(idx: number) {
    setItemsTemporal(itemsTemporal.filter((_, i) => i !== idx));
  }

  // Enviar solicitud de ayuda
  async function guardarSolicitud(e: React.FormEvent) {
    e.preventDefault();
    if (itemsTemporal.length === 0) {
      setErrorModal("Debe añadir al menos un artículo requerido.");
      return;
    }

    setEnviando(true);
    setErrorModal("");

    // 1. Guardar en tabla solicitudes
    const { data: solData, error: solErr } = await supabase
      .from("solicitudes")
      .insert({
        beneficiario,
        contacto_nombre: contactoNombre,
        contacto_telefono: contactoTelefono,
        direccion,
        motivo,
        urgencia,
        estado: "Pendiente",
      })
      .select("id")
      .single();

    if (solErr || !solData) {
      setErrorModal(solErr?.message ?? "Error al guardar la solicitud.");
      setEnviando(false);
      return;
    }

    // 2. Guardar en solicitud_insumos
    const insumosAGuardar = itemsTemporal.map((item) => ({
      solicitud_id: solData.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      descripcion: item.descripcion || null,
    }));

    const { error: insErr } = await supabase
      .from("solicitud_insumos")
      .insert(insumosAGuardar);

    if (insErr) {
      setErrorModal(insErr.message ?? "Error al guardar los ítems de la solicitud.");
      setEnviando(false);
      return;
    }

    // Resetear formulario
    setBeneficiario("");
    setContactoNombre("");
    setContactoTelefono("");
    setDireccion("");
    setMotivo("");
    setUrgencia("Media");
    setItemsTemporal([]);
    setMostrarModal(false);
    await cargarDatos();
    setEnviando(false);
  }

  // Despachar (Entregar) solicitud utilizando FIFO
  async function entregarSolicitud(sol: Solicitud) {
    setErrorEntrega(null);

    // 1. Comprobar stock disponible global de cada producto solicitado
    let stockInsuficiente = false;
    let mensajeError = "Stock insuficiente para procesar la entrega:";

    for (const item of sol.insumos) {
      // Consultar suma de inventarios
      const { data: stockItems } = await supabase
        .from("inventario")
        .select(`
          cantidad,
          lotes!inner (
            producto_id
          )
        `)
        .eq("lotes.producto_id", item.producto_id)
        .gt("cantidad", 0);

      const totalDisp = (stockItems ?? []).reduce((acc, curr) => acc + curr.cantidad, 0);

      if (totalDisp < item.cantidad) {
        stockInsuficiente = true;
        mensajeError += `\n- "${item.producto_nombre}": Solicitado ${item.cantidad} ${item.unidad}, Disponible ${totalDisp} ${item.unidad}.`;
      }
    }

    if (stockInsuficiente) {
      setErrorEntrega(mensajeError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 2. Si hay stock suficiente, proceder a la deducción FIFO
    const confirmar = confirm(`¿Deseas registrar la entrega de esta solicitud? Se descontarán los artículos del inventario.`);
    if (!confirmar) return;

    setCargando(true);
    const { data: { user } } = await supabase.auth.getUser();

    for (const item of sol.insumos) {
      // Obtener filas de inventario ordenadas por modificación/fecha (FIFO)
      const { data: inventarios } = await supabase
        .from("inventario")
        .select(`
          id,
          cantidad,
          lotes!inner (
            producto_id
          )
        `)
        .eq("lotes.producto_id", item.producto_id)
        .gt("cantidad", 0)
        .order("updated_at", { ascending: true });

      let cantRestante = item.cantidad;

      for (const inv of (inventarios ?? [])) {
        if (cantRestante <= 0) break;

        const aDeducir = Math.min(inv.cantidad, cantRestante);
        const nuevaCantidad = inv.cantidad - aDeducir;

        // Actualizar stock
        await supabase
          .from("inventario")
          .update({ cantidad: nuevaCantidad })
          .eq("id", inv.id);

        // Insertar movimiento de salida enlazado
        await supabase.from("movimientos").insert({
          inventario_id: inv.id,
          tipo: "salida",
          cantidad: aDeducir,
          destino: `Entregado a: ${sol.beneficiario}`,
          responsable_id: user?.id,
          solicitud_id: sol.id,
        });

        cantRestante -= aDeducir;
      }
    }

    // 3. Cambiar estado de la solicitud
    await supabase
      .from("solicitudes")
      .update({
        estado: "Entregado",
        fecha_despacho: new Date().toISOString(),
        entregado_por: user?.id,
      })
      .eq("id", sol.id);

    await cargarDatos();
  }

  // Filtrar solicitudes localmente
  const solicitudesFiltradas = solicitudes.filter((s) => {
    const matchBusqueda =
      s.beneficiario.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.motivo.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.contacto_nombre.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado = filtroEstado === "Todos" || s.estado === filtroEstado;

    return matchBusqueda && matchEstado;
  });

  // Métricas
  const totalSols = solicitudes.length;
  const pendientesSols = solicitudes.filter((s) => s.estado === "Pendiente").length;
  const entregadasSols = solicitudes.filter((s) => s.estado === "Entregado").length;

  // Exportar solicitudes a Excel
  function handleExportarExcel() {
    const columnas = {
      fecha: "Fecha Creación",
      beneficiario: "Beneficiario / Comunidad",
      motivo: "Motivo",
      contacto: "Contacto",
      telefono: "Teléfono",
      direccion: "Dirección",
      articulos: "Artículos Solicitados",
      urgencia: "Urgencia",
      estado: "Estado",
      entregado: "Fecha y Hora Entrega"
    };

    const datosReporte = solicitudesFiltradas.map((s) => ({
      fecha: new Date(s.created_at).toLocaleDateString("es-VE"),
      beneficiario: s.beneficiario,
      motivo: s.motivo,
      contacto: s.contacto_nombre,
      telefono: s.contacto_telefono,
      direccion: s.direccion,
      articulos: s.insumos.map((i) => `${i.producto_nombre} (${i.cantidad} ${i.unidad})`).join(" | "),
      urgencia: s.urgencia,
      estado: s.estado,
      entregado: s.fecha_despacho ? new Date(s.fecha_despacho).toLocaleString("es-VE") : "Pendiente"
    }));

    exportarAExcel(datosReporte, columnas, "Reporte_Solicitudes", "Solicitudes");
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Mensajes de Alerta de entrega */}
      {errorEntrega && (
        <Card className="bg-rojo/5 border border-rojo/10 p-4 text-sm text-rojo font-medium whitespace-pre-line animate-fadeIn">
          <div className="flex gap-2.5 items-start">
            <AlertTriangle className="text-rojo shrink-0" size={16} />
            <div>{errorEntrega}</div>
          </div>
        </Card>
      )}

      {/* Grid de Estadísticas */}
      <div className="grid gap-4 grid-cols-3 w-full">
        <Card className="p-4 sm:p-5 text-center bg-white/40 border border-ink/8 backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-inkSoft">Solicitudes</p>
          <p className="mt-1 font-display text-lg sm:text-2xl font-bold text-ink">{totalSols}</p>
        </Card>
        <Card className="p-4 sm:p-5 text-center bg-white/40 border border-ink/8 backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-inkSoft">Pendientes</p>
          <p className="mt-1 font-display text-lg sm:text-2xl font-bold text-rojo">{pendientesSols}</p>
        </Card>
        <Card className="p-4 sm:p-5 text-center bg-white/40 border border-ink/8 backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-inkSoft">Entregadas</p>
          <p className="mt-1 font-display text-lg sm:text-2xl font-bold text-azul">{entregadasSols}</p>
        </Card>
      </div>

      {/* Filtros e Interacciones */}
      <div className="flex flex-col gap-4 border-b border-ink/8 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto">
          <Input
            placeholder="Buscar por beneficiario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full sm:w-64 bg-white"
          />
          <Select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full sm:w-48 bg-white"
          >
            <option value="Todos">Todos los Estados</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Entregado">Entregados</option>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleExportarExcel}
            className="flex items-center gap-1.5 border border-ink/10 bg-white"
          >
            <FileSpreadsheet size={16} className="text-azul" /> Exportar
          </Button>
          <Button
            variant="primary"
            onClick={() => setMostrarModal(true)}
            className="flex items-center gap-1.5"
          >
            <Plus size={16} /> Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Tabla/Listado de Solicitudes */}
      {cargando ? (
        <p className="py-14 text-center text-sm text-inkSoft">Cargando solicitudes...</p>
      ) : solicitudesFiltradas.length === 0 ? (
        <p className="py-14 text-center text-sm text-inkSoft">No hay solicitudes registradas que coincidan.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {solicitudesFiltradas.map((s) => (
            <Card
              key={s.id}
              className={`flex flex-col gap-4 p-5 sm:p-6 border transition-all duration-300 ${
                s.estado === "Entregado"
                  ? "bg-white/50 border-ink/5 opacity-80"
                  : "bg-white border-l-4 border-l-rojo hover:shadow-soft"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge tone={s.urgencia === "Alta" ? "rojo" : s.urgencia === "Media" ? "gold" : "azul"}>
                    Urgencia {s.urgencia}
                  </Badge>
                  <h3 className="mt-2 font-display text-lg font-bold text-ink">
                    {s.beneficiario}
                  </h3>
                </div>
                <Badge tone={s.estado === "Entregado" ? "azul" : "rojo"}>
                  {s.estado}
                </Badge>
              </div>

              <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-inkSoft border-b border-ink/5 pb-3">
                <span className="flex items-center gap-2">
                  <User size={14} /> Ref: {s.contacto_nombre} ({s.contacto_telefono})
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={14} /> {s.direccion}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={14} /> {new Date(s.created_at).toLocaleDateString("es-VE")}
                </span>
              </div>

              {/* Insumos Solicitados */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-2">Artículos requeridos:</p>
                <ul className="flex flex-col gap-1.5">
                  {s.insumos.map((i, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-ink font-medium">
                      • {i.producto_nombre}{" "}
                      <span className="text-inkSoft font-normal">
                        ({i.cantidad} {i.unidad})
                      </span>
                      {i.descripcion && (
                        <span className="block text-[11px] text-inkSoft/70 italic pl-3">
                          Nota: {i.descripcion}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón de Entrega */}
              {s.estado === "Pendiente" && (
                <div className="mt-auto pt-3 border-t border-ink/5">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => entregarSolicitud(s)}
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <Check size={16} /> Entregar e ir al despacho
                  </Button>
                </div>
              )}

              {s.estado === "Entregado" && s.fecha_despacho && (
                <div className="mt-auto pt-3 border-t border-ink/5 text-xs text-azul font-medium">
                  ✓ Entregado el {new Date(s.fecha_despacho).toLocaleString("es-VE")}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Creación de Solicitud */}
      <AnimatePresence>
        {mostrarModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
            <Card className="relative w-full max-w-xl p-6 shadow-soft bg-white border border-ink/10">
              <button
                onClick={() => setMostrarModal(false)}
                className="absolute right-4 top-4 text-inkSoft hover:text-ink"
              >
                <X size={18} />
              </button>

              <div className="mb-5 flex items-center gap-2">
                <HeartHandshake size={20} className="text-azul" />
                <h2 className="font-display text-lg font-semibold text-ink">Nueva Solicitud de Ayuda</h2>
              </div>

              <form onSubmit={guardarSolicitud} className="grid gap-4 max-h-[75vh] overflow-y-auto pr-2 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Beneficiario / Comunidad"
                    required
                    value={beneficiario}
                    onChange={(e) => setBeneficiario(e.target.value)}
                    placeholder="Ej. Familias damnificadas del Sector 1, Refugio La Plaza..."
                  />
                </div>
                <Input
                  label="Nombre de Contacto"
                  required
                  value={contactoNombre}
                  onChange={(e) => setContactoNombre(e.target.value)}
                  placeholder="Ej. María González"
                />
                <Input
                  label="Teléfono de Contacto"
                  required
                  value={contactoTelefono}
                  onChange={(e) => setContactoTelefono(e.target.value)}
                  placeholder="Ej. +58 414 1234567"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Motivo o Justificación"
                    required
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Ej. Inundación de vivienda, necesidad crítica de víveres..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-ink">Dirección completa</label>
                  <textarea
                    required
                    rows={2}
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej. Calle 72, Sector Los Laureles, detrás de la panadería..."
                    className="focus-ring mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2 text-sm text-ink focus:border-azul"
                  />
                </div>

                <Select
                  label="Urgencia"
                  value={urgencia}
                  onChange={(e) => setUrgencia(e.target.value as any)}
                >
                  <option value="Media">Media ⚠️</option>
                  <option value="Alta">Alta 🚨</option>
                  <option value="Baja">Baja ✅</option>
                </Select>

                {/* Listado temporal de ítems requeridos */}
                <div className="sm:col-span-2 border-t border-ink/5 pt-4">
                  <label className="text-sm font-semibold text-ink">Artículos requeridos</label>
                  <div className="mt-2 min-h-16 rounded-lg border border-dashed border-ink/15 bg-paper/20 p-3 flex flex-col gap-2">
                    {itemsTemporal.length === 0 ? (
                      <p className="text-xs text-inkSoft italic text-center py-4">Añada ítems usando la sección inferior.</p>
                    ) : (
                      itemsTemporal.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white border border-ink/5 p-2 rounded-lg text-xs sm:text-sm">
                          <div>
                            <strong>{item.producto_nombre}</strong> - {item.cantidad} {item.unidad}
                            {item.descripcion && <span className="block text-[10px] text-inkSoft italic">Nota: {item.descripcion}</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarItemTemporal(idx)}
                            className="text-rojo hover:bg-rojo/5 p-1 rounded"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Panel de adición de artículos */}
                <div className="sm:col-span-2 bg-paper/60 p-3.5 border border-ink/5 rounded-xl flex flex-col gap-3">
                  <div className="grid gap-2 grid-cols-3">
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-inkSoft">Seleccionar Rubro</label>
                      <Select
                        value={productoSeleccionado}
                        onChange={(e) => setProductoSeleccionado(e.target.value)}
                        className="mt-1 bg-white text-xs"
                      >
                        <option value="">-- Elegir producto --</option>
                        {productosDisponibles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} ({p.unidad})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-inkSoft">Cant.</label>
                      <Input
                        type="number"
                        min={1}
                        value={cantidadTemporal}
                        onChange={(e) => setCantidadTemporal(e.target.value)}
                        placeholder="1"
                        className="mt-1 bg-white text-xs h-[38px]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Observación del ítem (ej: Talla M, vencimiento lejano)"
                      value={observacionTemporal}
                      onChange={(e) => setObservacionTemporal(e.target.value)}
                      className="bg-white text-xs flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={agregarItemTemporal}
                      className="shrink-0 flex items-center justify-center bg-white border border-ink/10 h-[38px] px-3.5"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                {errorModal && (
                  <p className="text-xs text-rojo sm:col-span-2">{errorModal}</p>
                )}

                <div className="flex gap-3 mt-4 sm:col-span-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setMostrarModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={enviando}
                    className="flex-1"
                  >
                    {enviando && <X className="animate-spin" />} Guardar Solicitud
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
