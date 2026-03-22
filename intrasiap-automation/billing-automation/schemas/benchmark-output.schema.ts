// =============================================================================
// Schema: Salida del Agente de Benchmarking
// Resultado consolidado para un producto: tabla de precios + ganador.
// =============================================================================

import type { WholesalerProductResult } from "./wholesaler-response.schema";

export interface ProductBenchmark {
  productoSolicitado: string;       // Descripción original del usuario
  ganador: WholesalerProductResult; // El producto más barato disponible
  tabla: WholesalerProductResult[]; // Todos los resultados ordenados por precio
  mayoristasConsultados: number;
  mayoristasConRespuesta: number;
  mayoristasConError: string[];     // Nombres de mayoristas que fallaron
  ahorroPotencial: number;          // Diferencia entre el más caro y el ganador (MXN)
  ahorroPortentaje: number;         // Ahorro en % vs el más caro
}

export interface BenchmarkOutput {
  productos: ProductBenchmark[];    // Un objeto por cada producto del formulario
  fechaConsulta: string;            // ISO 8601
  // ─── Datos de cliente/vendedor (pass-through del FormTriggerInput) ─────────
  clienteNombre: string;
  clientePuesto: string;
  clienteCuenta: string;
  vendedorNombre: string;
  vendedorEmail: string;
  vendedorTelefono?: string;
  // ─── Vigencia de la cotización ────────────────────────────────────────────
  fechaVigencia: string;            // fechaSolicitud + 5 días calendario (ISO 8601)
}
