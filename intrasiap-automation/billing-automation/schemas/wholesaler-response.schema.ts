// =============================================================================
// Schema: Respuesta normalizada de cualquier mayorista
// Cada sub-workflow transforma la respuesta cruda de su API a este formato.
// =============================================================================

export interface WholesalerProductResult {
  mayorista: string;          // Ej: "Ingram Micro"
  sku: string;                // Número de parte del mayorista
  skuFabricante?: string;     // Número de parte del fabricante (ej: Dell part#)
  descripcion: string;        // Descripción completa del producto
  marca: string;
  precio: number;             // Precio en MXN (o USD si el mayorista opera en USD)
  moneda: "MXN" | "USD";
  existencia: number;         // Unidades en inventario
  disponible: boolean;        // true si hay al menos 1 unidad
  imagenUrl?: string;         // URL de imagen del producto
  especificaciones?: Record<string, string>; // Specs técnicas key-value
  timestamp: string;          // Cuándo se consultó (ISO 8601)
}

export interface WholesalerSearchResponse {
  mayorista: string;
  exitoso: boolean;           // false si la API falló o no devolvió resultados
  error?: string;             // Mensaje de error si exitoso=false
  resultados: WholesalerProductResult[];
  tiempoRespuestaMs: number;
}
