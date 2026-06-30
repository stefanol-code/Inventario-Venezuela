import { motion } from "framer-motion";
import { ArrowDownCircle, ArrowUpCircle, History } from "lucide-react";
import Card from "@/components/ui/Card";
import type { MovimientoInventario } from "@/types";

export default function MovementLog({
  movimientos,
}: {
  movimientos: MovimientoInventario[];
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-ink/8 px-5 py-4">
        <History size={16} className="text-rojo" />
        <h2 className="font-display text-base font-semibold text-ink">
          Registro del día
        </h2>
      </div>

      {movimientos.length === 0 ? (
        <p className="px-5 py-8 text-sm text-inkSoft">
          Hoy no se han registrado movimientos en esta categoría.
        </p>
      ) : (
        <ul className="max-h-80 divide-y divide-ink/6 overflow-y-auto">
          {movimientos.map((m, i) => (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 px-5 py-3 text-sm"
            >
              {m.tipo === "ingreso" ? (
                <ArrowDownCircle size={17} className="shrink-0 text-azul" />
              ) : (
                <ArrowUpCircle size={17} className="shrink-0 text-rojo" />
              )}
              <div className="flex-1">
                <p className="font-medium text-ink">
                  {m.producto_nombre}{" "}
                  <span className="font-normal text-inkSoft">
                    · {m.cantidad}
                  </span>
                </p>
                <p className="text-xs text-inkSoft">
                  {m.tipo === "ingreso"
                    ? `Ingresado por ${m.responsable}`
                    : `Despachado por ${m.responsable}${
                        m.destino ? ` → ${m.destino}` : ""
                      }`}
                </p>
              </div>
              <span className="text-xs text-inkSoft/70">
                {new Date(m.created_at).toLocaleTimeString("es-VE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
}
