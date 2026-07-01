"use client";

import { useEffect, useState } from "react";
import { Calendar, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";

interface RegistroFila {
  fecha: string;
  categoria: string;
  producto: string;
  tipo_movimiento: "ingreso" | "salida";
  cantidad_total: number;
  unidad: string;
}

export default function RegistroDiario() {
  const supabase = createClient();
  const [registros, setRegistros] = useState<RegistroFila[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarRegistro() {
      setCargando(true);
      const { data } = await supabase
        .from("registro_diario_movimientos")
        .select("*")
        .order("fecha", { ascending: false });
      setRegistros((data as RegistroFila[]) ?? []);
      setCargando(false);
    }
    cargarRegistro();
  }, [supabase]);

  // Agrupar registros por fecha
  const agrupados = registros.reduce<Record<string, RegistroFila[]>>((acc, curr) => {
    if (!acc[curr.fecha]) {
      acc[curr.fecha] = [];
    }
    acc[curr.fecha].push(curr);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Calendar className="text-azul" size={20} />
        <h2 className="font-display text-xl font-semibold text-ink">
          Registro Consolidado por Día
        </h2>
      </div>

      {cargando ? (
        <p className="text-sm text-inkSoft">Cargando registros diarios…</p>
      ) : Object.keys(agrupados).length === 0 ? (
        <Card className="p-8 text-center border-dashed border-ink/15 bg-white/60">
          <p className="text-sm text-inkSoft">
            Aún no se han registrado movimientos de inventario en el sistema.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(agrupados).map(([fecha, filas]) => (
            <Card key={fecha} className="overflow-hidden p-0">
              {/* Header de la Fecha */}
              <div className="bg-paper/50 border-b border-ink/8 px-6 py-4 flex items-center justify-between">
                <span className="font-display text-base font-semibold text-ink">
                  {new Date(fecha + "T00:00:00").toLocaleDateString("es-VE", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-inkSoft bg-ink/5 px-2.5 py-1 rounded-full">
                  {filas.length} {filas.length === 1 ? "movimiento" : "movimientos"}
                </span>
              </div>

              {/* Lista de movimientos del día */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-ink">
                  <thead>
                    <tr className="border-b border-ink/8 text-xs font-medium uppercase tracking-wider text-inkSoft">
                      <th className="px-6 py-3">Categoría</th>
                      <th className="px-6 py-3">Producto</th>
                      <th className="px-6 py-3">Movimiento</th>
                      <th className="px-6 py-3 text-right">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {filas.map((f, i) => (
                      <tr key={i} className="hover:bg-ink/[0.01]">
                        <td className="px-6 py-3.5 font-medium">
                          <span className="text-ink">{f.categoria}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="font-semibold text-inkSoft">{f.producto}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          {f.tipo_movimiento === "ingreso" ? (
                            <span className="inline-flex items-center gap-1.5 font-medium text-azul">
                              <ArrowDownCircle size={15} />
                              Ingreso
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 font-medium text-rojo">
                              <ArrowUpCircle size={15} />
                              Egreso (Salida)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-right font-display font-medium text-ink">
                          {f.tipo_movimiento === "ingreso" ? "+" : "-"}
                          {f.cantidad_total} <span className="text-xs text-inkSoft">{f.unidad}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
