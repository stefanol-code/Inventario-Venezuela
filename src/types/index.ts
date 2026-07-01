export type RolUsuario = "usuario" | "organizador" | "despachador";

export type CategoriaInventario = "medicamentos" | "insumos" | "comida";

export interface Voluntario {
  id: string;
  nombre_completo: string;
  cedula: string;
  telefono: string;
  email: string;
  ciudad: string;
  disponibilidad?: string; // compatible con código viejo
  habilidades?: string; // compatible con código viejo
  experiencia_previa: boolean;
  vehiculo_propio: boolean;
  created_at: string;
  voluntario_habilidades?: { habilidades: { nombre: string } }[];
  voluntario_disponibilidades?: { disponibilidades: { nombre: string } }[];
}

export interface ProductoInventario {
  id: string;
  categoria: CategoriaInventario;
  nombre: string;
  cantidad: number;
  unidad: string;
  lote?: string | null;
  vencimiento?: string | null;
  ubicacion: string;
  updated_at: string;
  // Campos específicos de la reestructuración
  componente_activo?: string | null;
  concentracion?: string | null;
  presentacion?: string | null;
  es_pediatrico?: boolean;
  tipo_insumo?: string | null;
  descripcion?: string | null;
  medida?: string | null;
}

export interface MovimientoInventario {
  id: string;
  producto_nombre: string;
  categoria: CategoriaInventario;
  tipo: "ingreso" | "salida";
  cantidad: number;
  destino?: string | null;
  responsable: string;
  created_at: string;
}

export const CATEGORIA_LABEL: Record<CategoriaInventario, string> = {
  medicamentos: "Medicamentos",
  insumos: "Insumos quirúrgicos",
  comida: "Comida",
};
