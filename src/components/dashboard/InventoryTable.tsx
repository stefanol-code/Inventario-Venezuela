import { motion } from "framer-motion";
import { Package } from "lucide-react";
import Card from "@/components/ui/Card";
import type { ProductoInventario } from "@/types";

export default function InventoryTable({
  productos,
  cargando,
}: {
  productos: ProductoInventario[];
  cargando: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-ink/8 px-5 py-4">
        <Package size={16} className="text-azul" />
        <h2 className="font-display text-base font-semibold text-ink">
          Existencias actuales
        </h2>
      </div>

      {cargando ? (
        <p className="px-5 py-8 text-sm text-inkSoft">Cargando inventario…</p>
      ) : productos.length === 0 ? (
        <p className="px-5 py-8 text-sm text-inkSoft">
          No hay productos registrados en esta categoría todavía.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/8 text-left text-xs uppercase tracking-wide text-inkSoft">
              <th className="px-5 py-2.5 font-medium">Producto</th>
              <th className="px-5 py-2.5 font-medium">Cantidad</th>
              <th className="px-5 py-2.5 font-medium">Ubicación</th>
              <th className="px-5 py-2.5 font-medium">Vence</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-ink/6 last:border-0 hover:bg-paper/60"
              >
                <td className="px-5 py-3 font-medium text-ink">{p.nombre}</td>
                <td className="px-5 py-3 text-inkSoft">
                  {p.cantidad} {p.unidad}
                </td>
                <td className="px-5 py-3 text-inkSoft">{p.ubicacion}</td>
                <td className="px-5 py-3 text-inkSoft">
                  {p.vencimiento ?? "—"}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
