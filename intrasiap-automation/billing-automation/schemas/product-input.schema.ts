// =============================================================================
// Schema: Entrada del Form Trigger
// Representa un producto con sus especificaciones ingresadas por el vendedor.
// =============================================================================

export interface ProductInput {
  marca: string;           // Ej: "Dell", "HP", "Lenovo"
  ram?: string;            // Ej: "16GB", "32GB"
  almacenamiento?: string; // Ej: "512GB SSD", "1TB HDD"
  color?: string;          // Ej: "Negro", "Plata"
  memoria?: string;        // Ej: "DDR5", "DDR4" (tipo de memoria RAM)
  garantia?: string;       // Ej: "1 año", "3 años"
  descripcionLibre?: string; // Campo de texto libre para specs adicionales
  cantidad: number;        // Cantidad a cotizar (default: 1)
}

export interface FormTriggerInput {
  // ─── Datos del cliente (van en filas 10-12 del template Excel) ───────────
  clienteNombre: string;   // Fila 10
  clientePuesto: string;   // Fila 11
  clienteCuenta: string;   // Fila 12 (empresa/cuenta del cliente)

  // ─── Datos del vendedor (van en filas 34+ del template Excel) ────────────
  vendedorNombre: string;
  vendedorEmail: string;   // A este correo se envía la cotización final
  vendedorTelefono?: string;
  vendedorPuesto?: string;

  // ─── Productos a cotizar (1 o más) ───────────────────────────────────────
  productos: ProductInput[];

  // ─── Mayoristas a incluir (opcional: si vacío, usa todos los activos) ────
  mayoristasSeleccionados?: string[]; // Ej: ["Ingram Micro", "SYSCOM"]

  // ─── Metadata ─────────────────────────────────────────────────────────────
  fechaSolicitud: string;  // ISO 8601 — generado automáticamente por n8n
}
