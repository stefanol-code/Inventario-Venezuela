"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import type { ProductoInventario, CategoriaInventario } from "@/types";

interface SortConfig {
  key: keyof ProductoInventario | "";
  direction: "asc" | "desc";
}

export default function InventoryTable({
  productos,
  cargando,
  categoria,
}: {
  productos: ProductoInventario[];
  cargando: boolean;
  categoria: CategoriaInventario;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" });

  // Manejar el ordenamiento al presionar cabeceras
  function requestSort(key: keyof ProductoInventario) {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  }

  // Filtrar y ordenar productos localmente
  const productosProcesados = useMemo(() => {
    let items = [...productos];

    // 1. Búsqueda local
    if (busqueda.trim() !== "") {
      const q = busqueda.toLowerCase();
      items = items.filter((p) => {
        return (
          p.nombre?.toLowerCase().includes(q) ||
          p.componente_activo?.toLowerCase().includes(q) ||
          p.tipo_insumo?.toLowerCase().includes(q) ||
          p.descripcion?.toLowerCase().includes(q) ||
          p.ubicacion?.toLowerCase().includes(q)
        );
      });
    }

    // 2. Ordenamiento local
    if (sortConfig.key !== "") {
      const key = sortConfig.key;
      items.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === "number" && typeof valB === "number") {
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (strA > strB) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return items;
  }, [productos, busqueda, sortConfig]);

  // Renderiza icono indicador de ordenamiento en la cabecera
  function renderSortIcon(key: keyof ProductoInventario) {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown size={12} className="text-inkSoft/30" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={12} className="text-azul font-bold" />
    ) : (
      <ChevronDown size={12} className="text-azul font-bold" />
    );
  }

  return (
    <Card className="overflow-hidden w-full shadow-soft border border-ink/8">
      {/* Barra de Filtro de Categoría y Búsqueda */}
      <div className="flex flex-col gap-4 border-b border-ink/8 px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-paper/30">
        <div className="flex items-center gap-2">
          <Package size={18} className="text-azul" />
          <h2 className="font-display text-base font-semibold text-ink">
            Existencias actuales
          </h2>
        </div>
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inkSoft"
          />
          <Input
            placeholder="Buscar por nombre, componente, etc..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      {cargando ? (
        <div className="px-6 py-14 text-center text-sm text-inkSoft">
          <span className="flex items-center justify-center gap-2">
            Cargando inventario...
          </span>
        </div>
      ) : productosProcesados.length === 0 ? (
        <div className="px-6 py-14 text-center text-sm text-inkSoft">
          No hay productos registrados en esta categoría que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-ink">
            <thead>
              <tr className="border-b border-ink/8 bg-paper/10 text-xs font-semibold uppercase tracking-wider text-inkSoft select-none">
                <th
                  onClick={() => requestSort("nombre")}
                  className="cursor-pointer px-6 py-3 hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    Producto {renderSortIcon("nombre")}
                  </span>
                </th>

                {/* Columnas específicas según Categoría */}
                {categoria === "medicamentos" && (
                  <>
                    <th
                      onClick={() => requestSort("componente_activo")}
                      className="cursor-pointer px-6 py-3 hover:bg-ink/5 hover:text-ink transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        Componente Activo {renderSortIcon("componente_activo")}
                      </span>
                    </th>
                    <th
                      onClick={() => requestSort("concentracion")}
                      className="cursor-pointer px-6 py-3 hover:bg-ink/5 hover:text-ink transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        Concentración {renderSortIcon("concentracion")}
                      </span>
                    </th>
                    <th
                      onClick={() => requestSort("presentacion")}
                      className="cursor-pointer px-6 py-3 hover:bg-ink/5 hover:text-ink transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        Presentación {renderSortIcon("presentacion")}
                      </span>
                    </th>
                    <th
                      onClick={() => requestSort("es_pediatrico")}
                      className="cursor-pointer px-6 py-3 hover:bg-ink/5 hover:text-ink transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        Pediátrico {renderSortIcon("es_pediatrico")}
                      </span>
                    </th>
                  </>
                )}

                {categoria === "insumos" && (
                  <>
                    <th
                      onClick={() => requestSort("tipo_insumo")}
                      className="cursor-pointer px-6 py-3 hover:bg-ink/5 hover:text-ink transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        Tipo Insumo {renderSortIcon("tipo_insumo")}
                      </span>
                    </th>
                    <th
                      onClick={() => requestSort("descripcion")}
                      className="cursor-pointer px-6 py-3 hover:bg-ink/5 hover:text-ink transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        Descripción {renderSortIcon("descripcion")}
                      </span>
                    </th>
                    <th
                      onClick={() => requestSort("medida")}
                      className="cursor-pointer px-6 py-3 hover:bg-ink/5 hover:text-ink transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        Medida {renderSortIcon("medida")}
                      </span>
                    </th>
                  </>
                )}

                {categoria === "comida" && (
                  <th
                    onClick={() => requestSort("descripcion")}
                    className="cursor-pointer px-6 py-3 hover:bg-ink/5 hover:text-ink transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      Descripción {renderSortIcon("descripcion")}
                    </span>
                  </th>
                )}

                <th
                  onClick={() => requestSort("cantidad")}
                  className="cursor-pointer px-6 py-3 hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    Cantidad {renderSortIcon("cantidad")}
                  </span>
                </th>
                <th
                  onClick={() => requestSort("ubicacion")}
                  className="cursor-pointer px-6 py-3 hover:bg-ink/5 hover:text-ink transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    Ubicación {renderSortIcon("ubicacion")}
                  </span>
                </th>
                
                {/* Medicamentos y comida muestran vencimiento */}
                {(categoria === "medicamentos" || categoria === "comida") && (
                  <th
                    onClick={() => requestSort("vencimiento")}
                    className="cursor-pointer px-6 py-3 hover:bg-ink/5 hover:text-ink transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      Vencimiento {renderSortIcon("vencimiento")}
                    </span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              <AnimatePresence mode="popLayout">
                {productosProcesados.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.2) }}
                    className="hover:bg-paper/40 last:border-0 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-semibold text-ink">{p.nombre}</td>

                    {/* Renderizado de columnas específicas según Categoría */}
                    {categoria === "medicamentos" && (
                      <>
                        <td className="px-6 py-3.5 text-inkSoft">
                          {p.componente_activo || "—"}
                        </td>
                        <td className="px-6 py-3.5 text-inkSoft">
                          {p.concentracion || "—"}
                        </td>
                        <td className="px-6 py-3.5 text-inkSoft">
                          <span className="capitalize">{p.presentacion || "—"}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          {p.es_pediatrico ? (
                            <Badge tone="azul">Sí</Badge>
                          ) : (
                            <span className="text-inkSoft">No</span>
                          )}
                        </td>
                      </>
                    )}

                    {categoria === "insumos" && (
                      <>
                        <td className="px-6 py-3.5 text-inkSoft">
                          {p.tipo_insumo || "—"}
                        </td>
                        <td className="px-6 py-3.5 text-inkSoft">
                          {p.descripcion || "—"}
                        </td>
                        <td className="px-6 py-3.5 text-inkSoft">
                          {p.medida || "—"}
                        </td>
                      </>
                    )}

                    {categoria === "comida" && (
                      <td className="px-6 py-3.5 text-inkSoft">
                        {p.descripcion || "—"}
                      </td>
                    )}

                    <td className="px-6 py-3.5 font-display font-medium text-ink">
                      {p.cantidad} <span className="text-xs text-inkSoft">{p.unidad}</span>
                    </td>
                    <td className="px-6 py-3.5 text-inkSoft">{p.ubicacion}</td>

                    {(categoria === "medicamentos" || categoria === "comida") && (
                      <td className="px-6 py-3.5">
                        {p.vencimiento ? (
                          <span className="font-display text-inkSoft">{p.vencimiento}</span>
                        ) : (
                          <span className="text-inkSoft/40">—</span>
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
