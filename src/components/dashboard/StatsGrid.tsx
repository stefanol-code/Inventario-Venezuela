"use client";

import { useMemo } from "react";
import { Package, AlertCircle, Calendar, Layers } from "lucide-react";
import Card from "@/components/ui/Card";
import type { ProductoInventario } from "@/types";

interface Props {
  productos: ProductoInventario[];
}

export default function StatsGrid({ productos }: Props) {
  const stats = useMemo(() => {
    // 1. Rubros Activos (nombres únicos)
    const rubrosUnicos = new Set(productos.map((p) => p.nombre.toLowerCase()));
    const rubrosActivos = rubrosUnicos.size;

    // 2. Stock Total (suma de cantidades)
    const stockTotal = productos.reduce((acc, curr) => acc + curr.cantidad, 0);

    // 3. Alertas de Stock Bajo (cantidad < 10)
    const stockBajo = productos.filter((p) => p.cantidad < 10).length;

    // 4. Alertas de Vencimiento (vence en los próximos 10 días)
    const hoyMs = new Date().setHours(0,0,0,0);
    const limiteMs = hoyMs + 10 * 24 * 60 * 60 * 1000;
    
    const vencimientoCercano = productos.filter((p) => {
      if (!p.vencimiento) return false;
      const vDateMs = new Date(p.vencimiento + "T00:00:00").getTime();
      return vDateMs >= hoyMs && vDateMs <= limiteMs && p.cantidad > 0;
    }).length;

    return {
      rubrosActivos,
      stockTotal,
      stockBajo,
      vencimientoCercano,
    };
  }, [productos]);

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 w-full">
      {/* Tarjeta 1: Rubros */}
      <Card className="flex items-center gap-3.5 p-4 sm:p-5 bg-white/40 border border-ink/8 backdrop-blur-md hover:shadow-soft transition-all duration-300">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-azul/10 text-azul">
          <Layers size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-inkSoft">
            Rubros Activos
          </p>
          <p className="mt-0.5 font-display text-lg sm:text-2xl font-bold text-ink truncate">
            {stats.rubrosActivos}
          </p>
        </div>
      </Card>

      {/* Tarjeta 2: Stock Total */}
      <Card className="flex items-center gap-3.5 p-4 sm:p-5 bg-white/40 border border-ink/8 backdrop-blur-md hover:shadow-soft transition-all duration-300">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-azul/10 text-azul">
          <Package size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-inkSoft">
            Existencias Totales
          </p>
          <p className="mt-0.5 font-display text-lg sm:text-2xl font-bold text-ink truncate">
            {stats.stockTotal}
          </p>
        </div>
      </Card>

      {/* Tarjeta 3: Stock Bajo */}
      <Card className="flex items-center gap-3.5 p-4 sm:p-5 bg-white/40 border border-ink/8 backdrop-blur-md hover:shadow-soft transition-all duration-300">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          stats.stockBajo > 0 ? "bg-rojo/10 text-rojo animate-pulse" : "bg-ink/5 text-inkSoft"
        }`}>
          <AlertCircle size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-inkSoft">
            Stock Bajo (&lt;10)
          </p>
          <p className={`mt-0.5 font-display text-lg sm:text-2xl font-bold truncate ${
            stats.stockBajo > 0 ? "text-rojo" : "text-ink"
          }`}>
            {stats.stockBajo}
          </p>
        </div>
      </Card>

      {/* Tarjeta 4: Próximos a Vencer */}
      <Card className="flex items-center gap-3.5 p-4 sm:p-5 bg-white/40 border border-ink/8 backdrop-blur-md hover:shadow-soft transition-all duration-300">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          stats.vencimientoCercano > 0 ? "bg-gold/10 text-gold-dark animate-pulse" : "bg-ink/5 text-inkSoft"
        }`}>
          <Calendar size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-inkSoft">
            Vence en 10 días
          </p>
          <p className={`mt-0.5 font-display text-lg sm:text-2xl font-bold truncate ${
            stats.vencimientoCercano > 0 ? "text-gold-dark" : "text-ink"
          }`}>
            {stats.vencimientoCercano}
          </p>
        </div>
      </Card>
    </div>
  );
}
