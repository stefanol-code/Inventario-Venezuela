"use client";

import { useState } from "react";
import { PackagePlus, PackageMinus, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CATEGORIA_LABEL, type CategoriaInventario } from "@/types";

interface Props {
  categoria: CategoriaInventario;
  modo: "ingreso" | "salida";
  cargando: boolean;
  onSubmit: (datos: {
    nombre: string;
    cantidad: number;
    unidad: string;
    ubicacionODestino: string;
    vencimiento?: string;
  }) => void;
}

export default function MovementForm({ categoria, modo, cargando, onSubmit }: Props) {
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("unidades");
  const [lugar, setLugar] = useState("");
  const [vencimiento, setVencimiento] = useState("");

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
    });
    setNombre("");
    setCantidad("");
    setLugar("");
    setVencimiento("");
  }

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center gap-2">
        {esIngreso ? (
          <PackagePlus size={18} className="text-azul" />
        ) : (
          <PackageMinus size={18} className="text-rojo" />
        )}
        <h2 className="font-display text-base font-semibold text-ink">
          {esIngreso ? "Ingresar producto" : "Despachar producto"} ·{" "}
          {CATEGORIA_LABEL[categoria]}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Nombre del producto"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Suero oral, gasas estériles, arroz..."
          />
        </div>
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
          placeholder="cajas, kg, unidades..."
        />
        <Input
          label={esIngreso ? "Ubicación en el centro" : "Destino"}
          required
          value={lugar}
          onChange={(e) => setLugar(e.target.value)}
          placeholder={
            esIngreso ? "Estante A-3" : "Hospital Central, Refugio La Plaza..."
          }
        />
        {esIngreso && (
          <Input
            label="Vencimiento (opcional)"
            type="date"
            value={vencimiento}
            onChange={(e) => setVencimiento(e.target.value)}
          />
        )}

        <Button
          type="submit"
          size="lg"
          variant={esIngreso ? "primary" : "danger"}
          disabled={cargando}
          className="sm:col-span-2"
        >
          {cargando && <Loader2 size={18} className="animate-spin" />}
          {esIngreso ? "Registrar ingreso" : "Registrar salida"}
        </Button>
      </form>
    </Card>
  );
}
