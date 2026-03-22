# Intrasiap — Billing Automation

Automatización de cotizaciones con benchmarking de mayoristas para los vendedores de Intrasiap.

## Problema que resuelve
Los vendedores cotizaban sin comparar precios entre mayoristas, arriesgando márgenes o elevando el precio de venta innecesariamente. Esta solución automatiza el benchmarking completo y genera la cotización lista para entregar al cliente.

## Flujo completo

```
Vendedor llena el formulario (n8n Form Trigger)
    ↓
Búsqueda simultánea en 7 mayoristas (sub-workflows paralelos)
    ↓
Agente IA consolida precios y elige el más barato por producto
    ↓
PDF de benchmarking generado automáticamente
    ↓
Agente IA (Claude Sonnet) llena el template de cotización Excel
    ↓
Correo al vendedor con PDF + Excel adjuntos
```

## Mayoristas incluidos

| Mayorista | API | Estado |
|-----------|-----|--------|
| Ingram Micro | OAuth2 REST (Sandbox) | ✅ Activo |
| SYSCOM | OAuth2 REST | ✅ Activo |
| CT Internacional | JWT REST | ✅ Activo |
| CVA | SOAP | ✅ Activo |
| INTCOMEX | API Key REST | ✅ Activo |
| PCH Connect | Personal ID REST | ✅ Activo |
| Exel del Norte | REST | ⏳ Pendiente docs |

## Estructura del proyecto

```
billing-automation/
├── .env                    ← Credenciales reales (gitignored — NO subir)
├── .env.example            ← Plantilla de variables (sí versionar)
├── .gitignore
├── wholesalers.tsx         ← Config de APIs (lee de .env)
├── billing-template.xlsx  ← Template de cotización Excel
├── workflows/              ← Workflows n8n exportados (JSON)
├── prompts/                ← System prompts de los agentes IA
├── schemas/                ← Tipos TypeScript de los datos
└── templates/              ← Template HTML del PDF de benchmarking
```

## Setup inicial

1. Copia `.env.example` → `.env`
2. Llena las credenciales de cada mayorista en `.env`
3. Coloca el template Excel en `billing-template.xlsx`
4. Importa `workflows/main-workflow.json` en tu instancia de n8n
5. Importa los sub-workflows en `workflows/sub-workflows/`
6. Activa el workflow principal

## Pendientes

- [ ] Obtener documentación de API de Exel del Norte
- [ ] Llenar credenciales en `.env`
- [ ] Subir `billing-template.xlsx`
- [ ] Importar workflows a n8n
- [ ] Prueba end-to-end en Sandbox de Ingram
