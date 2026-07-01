import * as XLSX from "xlsx";

/**
 * Exporta un arreglo de objetos a un archivo Excel (.xlsx) con nombres de columnas amigables.
 * 
 * @param datos Arreglo de objetos con los datos de las filas
 * @param columnasMapeo Diccionario de mapeo de llaves de objeto a títulos de columna (ej: { nombre: "Nombre Producto" })
 * @param nombreArchivo Nombre base del archivo resultante (se le agregará la fecha actual y la extensión)
 * @param nombreHoja Nombre de la pestaña de la hoja de cálculo
 */
export function exportarAExcel(
  datos: any[],
  columnasMapeo: Record<string, string>,
  nombreArchivo: string,
  nombreHoja: string = "Datos"
) {
  // Si no hay datos, lanzar una alerta
  if (datos.length === 0) {
    alert("No hay registros para exportar en este momento.");
    return;
  }

  // Mapear los datos para usar las etiquetas legibles como llaves del objeto
  const datosMapeados = datos.map((fila) => {
    const nuevaFila: Record<string, any> = {};
    for (const [claveOrig, nuevoEncabezado] of Object.entries(columnasMapeo)) {
      const valor = fila[claveOrig];
      nuevaFila[nuevoEncabezado] = valor !== undefined && valor !== null ? valor : "";
    }
    return nuevaFila;
  });

  // Generar hoja de cálculo y libro de trabajo
  const ws = XLSX.utils.json_to_sheet(datosMapeados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nombreHoja);

  // Escribir y descargar el archivo
  XLSX.writeFile(wb, `${nombreArchivo}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
