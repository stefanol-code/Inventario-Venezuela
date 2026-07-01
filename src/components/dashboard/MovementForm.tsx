"use client";

import { useState } from "react";
import { PackagePlus, PackageMinus, Loader2, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { CATEGORIA_LABEL, type CategoriaInventario } from "@/types";

interface Props {
  categoria: CategoriaInventario;
  modo: "ingreso" | "salida";
  cargando: boolean;
  onClose: () => void;
  onSubmit: (datos: {
    nombre: string;
    cantidad: number;
    unidad: string;
    ubicacionODestino: string;
    vencimiento?: string;
    lote?: string;
    componente_activo?: string;
    concentracion?: string;
    presentacion?: string;
    es_pediatrico?: boolean;
    tipo_insumo?: string;
    descripcion?: string;
    medida?: string;
  }) => void;
}

export default function MovementForm({
  categoria,
  modo,
  cargando,
  onClose,
  onSubmit,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("unidades");
  const [lugar, setLugar] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [lote, setLote] = useState("");

  // Campos específicos
  const [componenteActivo, setComponenteActivo] = useState("");
  const [concentracion, setConcentracion] = useState("");
  const [presentacion, setPresentacion] = useState("pastilla");
  const [esPediatrico, setEsPediatrico] = useState("no");
  const [tipoInsumo, setTipoInsumo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [medida, setMedida] = useState("");

  const esIngreso = modo === "ingreso";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !cantidad) return;

    onSubmit({
      nombre,
      cantidad: Number(cantidad),
      unidad,
      ubicacionODestino: lugar,
      vencimiento: vencimiento || undefined,
      lote: lote || undefined,
      componente_activo: esIngreso && categoria === "medicamentos" ? componenteActivo || undefined : undefined,
      concentracion: esIngreso && categoria === "medicamentos" ? concentracion || undefined : undefined,
      presentacion: esIngreso && categoria === "medicamentos" ? presentacion : undefined,
      es_pediatrico: esIngreso && categoria === "medicamentos" ? esPediatrico === "si" : undefined,
      tipo_insumo: esIngreso && categoria === "insumos" ? tipoInsumo || undefined : undefined,
      descripcion: esIngreso && (categoria === "insumos" || categoria === "comida") ? descripcion || undefined : undefined,
      medida: esIngreso && categoria === "insumos" ? medida || undefined : undefined,
    });

    // Resetear
    setNombre("");
    setCantidad("");
    setLugar("");
    setVencimiento("");
    setLote("");
    setComponenteActivo("");
    setConcentracion("");
    setTipoInsumo("");
    setDescripcion("");
    setMedida("");
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm animate-fadeIn">
      <Card className="relative w-full max-w-xl p-6 shadow-soft border border-ink/10 bg-white">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-inkSoft hover:text-ink transition-colors"
        >
          <X size={18} />
        </button>

        {/* Cabecera */}
        <div className="mb-5 flex items-center gap-2 pr-8">
          {esIngreso ? (
            <PackagePlus size={20} className="text-azul" />
          ) : (
            <PackageMinus size={20} className="text-rojo" />
          )}
          <h2 className="font-display text-lg font-semibold text-ink">
            {esIngreso ? "Ingresar producto" : "Despachar producto"} ·{" "}
            {CATEGORIA_LABEL[categoria]}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 max-h-[75vh] overflow-y-auto pr-2 sm:grid-cols-2">
          {/* Nombre del producto */}
          <div className="sm:col-span-2">
            <Input
              label="Nombre del producto"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Acetaminofén, Gasas estériles, Arroz..."
            />
          </div>

          {/* Campos específicos de Medicamentos */}
          {esIngreso && categoria === "medicamentos" && (
            <>
              <Input
                label="Componente activo"
                value={componenteActivo}
                onChange={(e) => setComponenteActivo(e.target.value)}
                placeholder="Ej. Paracetamol"
              />
              <Input
                label="Concentración (Mg/Gr)"
                value={concentracion}
                onChange={(e) => setConcentracion(e.target.value)}
                placeholder="Ej. 500 mg, 1 g"
              />
              <Select
                label="Presentación"
                value={presentacion}
                onChange={(e) => setPresentacion(e.target.value)}
              >
                <option value="pastilla">Pastillas</option>
                <option value="capsula">Cápsulas</option>
                <option value="jarabe">Jarabe</option>
                <option value="suspension">Suspensión</option>
                <option value="ampolla">Ampolla</option>
              </Select>
              <Select
                label="¿Es pediátrico?"
                value={esPediatrico}
                onChange={(e) => setEsPediatrico(e.target.value)}
              >
                <option value="no">No</option>
                <option value="si">Sí</option>
              </Select>
            </>
          )}

          {/* Campos específicos de Insumos Quirúrgicos */}
          {esIngreso && categoria === "insumos" && (
            <>
              <Input
                label="Tipo de insumo"
                value={tipoInsumo}
                onChange={(e) => setTipoInsumo(e.target.value)}
                placeholder="Ej. Geringa, Guantes"
              />
              <Input
                label="Medida / Calibre"
                value={medida}
                onChange={(e) => setMedida(e.target.value)}
                placeholder="Ej. G21, 10x10 cm"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Descripción"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Guantes de látex estériles para cirugía"
                />
              </div>
            </>
          )}

          {/* Campos específicos de Comida */}
          {esIngreso && categoria === "comida" && (
            <div className="sm:col-span-2">
              <Input
                label="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej. Arroz blanco, Harina PAN"
              />
            </div>
          )}

          {/* Campos estándar */}
          <Input
            label="Cantidad"
            type="number"
            min={1}
            required
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
          <Input
            label="Unidad"
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            placeholder="Ej. unidades, cajas, kg..."
          />
          <div className="sm:col-span-2">
            <Input
              label={esIngreso ? "Ubicación en el centro" : "Destino"}
              required
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              placeholder={
                esIngreso ? "Ej. Estante A-3" : "Hospital Central, Refugio La Plaza..."
              }
            />
          </div>

          {/* Lote y vencimiento (solo ingresos o comida/medicamentos) */}
          {esIngreso && (
            <>
              <Input
                label="Lote (opcional)"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                placeholder="Ej. LOT-1234"
              />
              {(categoria === "medicamentos" || categoria === "comida") && (
                <Input
                  label="Vencimiento (opcional)"
                  type="date"
                  value={vencimiento}
                  onChange={(e) => setVencimiento(e.target.value)}
                />
              )}
            </>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 mt-3 sm:col-span-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={esIngreso ? "primary" : "danger"}
              disabled={cargando}
              className="flex-1"
            >
              {cargando && <Loader2 size={18} className="animate-spin" />}
              {esIngreso ? "Registrar ingreso" : "Registrar salida"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
