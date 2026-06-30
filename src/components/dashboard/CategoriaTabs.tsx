"use client";

import { Pill, Stethoscope, Soup } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoriaInventario } from "@/types";

const opciones: {
  value: CategoriaInventario;
  label: string;
  icono: typeof Pill;
}[] = [
  { value: "medicamentos", label: "Medicamentos", icono: Pill },
  { value: "insumos", label: "Insumos quirúrgicos", icono: Stethoscope },
  { value: "comida", label: "Comida", icono: Soup },
];

export default function CategoriaTabs({
  value,
  onChange,
}: {
  value: CategoriaInventario;
  onChange: (v: CategoriaInventario) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((o) => {
        const activo = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "focus-ring flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              activo
                ? "border-azul bg-azul text-white shadow-soft"
                : "border-ink/15 bg-white text-inkSoft hover:border-azul/40"
            )}
          >
            <o.icono size={15} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
