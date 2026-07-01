"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { LogOut, Bell, AlertTriangle, Users } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Notificacion {
  id: string;
  nombre: string;
  lote: string;
  cantidad: number;
  diasRestantes: number;
  fecha: string;
}

export default function DashboardHeader({
  rolEtiqueta,
}: {
  rolEtiqueta: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function salir() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  useEffect(() => {
    async function cargarAlertasVencimiento() {
      const { data } = await supabase
        .from("inventario")
        .select(`
          id,
          cantidad,
          lotes (
            codigo,
            fecha_vencimiento,
            productos (
              nombre
            )
          )
        `)
        .gt("cantidad", 0);

      const hoyMs = new Date().setHours(0,0,0,0);
      const limiteMs = hoyMs + 10 * 24 * 60 * 60 * 1000;

      const filtrados = (data ?? [])
        .filter((item: any) => {
          if (!item.lotes?.fecha_vencimiento) return false;
          const vDateMs = new Date(item.lotes.fecha_vencimiento + "T00:00:00").getTime();
          return vDateMs >= hoyMs && vDateMs <= limiteMs;
        })
        .map((item: any) => {
          const vDate = new Date(item.lotes.fecha_vencimiento + "T00:00:00");
          const diffDays = Math.ceil((vDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return {
            id: item.id,
            nombre: item.lotes.productos?.nombre ?? "Producto",
            lote: item.lotes.codigo ?? "Sin Lote",
            cantidad: item.cantidad,
            diasRestantes: diffDays < 0 ? 0 : diffDays,
            fecha: item.lotes.fecha_vencimiento,
          };
        });

      setNotificaciones(filtrados);
    }

    cargarAlertasVencimiento();

    const interval = setInterval(cargarAlertasVencimiento, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/8 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Logo size={100} />
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden text-sm font-medium text-inkSoft md:inline">
            Panel de {rolEtiqueta}
          </span>
          
          {/* Campana de Notificaciones de Vencimiento */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMostrarDropdown(!mostrarDropdown)}
              className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white/50 text-inkSoft transition-colors hover:bg-white hover:text-ink"
            >
              <Bell size={18} />
              {notificaciones.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rojo text-[9px] font-bold text-white ring-2 ring-cream">
                  {notificaciones.length}
                </span>
              )}
            </button>

            {/* Dropdown de Alertas */}
            {mostrarDropdown && (
              <div className="absolute right-0 mt-2.5 w-72 sm:w-80 rounded-xl2 border border-ink/10 bg-white/95 p-4 shadow-soft backdrop-blur-md">
                <div className="mb-3 border-b border-ink/8 pb-2">
                  <h3 className="font-display text-sm font-semibold text-ink">
                    Alertas de Vencimiento
                  </h3>
                  <p className="text-[10px] text-inkSoft">
                    Productos que vencen en los próximos 10 días
                  </p>
                </div>
                {notificaciones.length === 0 ? (
                  <p className="py-4 text-center text-xs text-inkSoft">
                    No hay productos próximos a vencer en los próximos 10 días.
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto flex flex-col gap-2.5">
                    {notificaciones.map((n) => (
                      <div key={n.id} className="flex gap-2.5 rounded-lg bg-rojo/5 p-2.5 border border-rojo/10">
                        <AlertTriangle className="shrink-0 text-rojo" size={16} />
                        <div className="text-xs">
                          <p className="font-semibold text-ink">{n.nombre}</p>
                          <p className="text-[10px] text-inkSoft">Lote: {n.lote} · Stock: {n.cantidad}</p>
                          <p className="mt-1 font-medium text-rojo">
                            {n.diasRestantes === 0 ? "Vence hoy" : `Vence en ${n.diasRestantes} ${n.diasRestantes === 1 ? "día" : "días"}`} ({n.fecha})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Link href="/voluntarios">
            <Button variant="ghost" size="sm" className="px-2.5 sm:px-3.5">
              <Users size={16} className="sm:mr-1.5" />
              <span className="hidden sm:inline">Voluntarios</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={salir} className="px-2.5 sm:px-3.5 text-rojo hover:bg-rojo/5 hover:text-rojo">
            <LogOut size={16} className="sm:mr-1.5" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
