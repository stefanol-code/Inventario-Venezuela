export type RolUsuario = "usuario" | "organizador" | "despachador";

export type CategoriaInventario = "medicamentos" | "insumos" | "comida";

export interface Voluntario {
  id: string;
  nombre_completo: string;
  cedula: string;
  telefono: string;
  email: string;
  ciudad: string;
  disponibilidad: string;
  habilidades: string;
  experiencia_previa: boolean;
  vehiculo_propio: boolean;
  created_at: string;
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
