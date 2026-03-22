// =============================================================================
// INTRASIAP BILLING AUTOMATION — Configuración de Mayoristas
// =============================================================================
// Este archivo es SEGURO para versionar en git.
// Las credenciales reales viven en .env (gitignored).
// =============================================================================

export type AuthType = "oauth2" | "jwt" | "soap" | "apikey" | "personal_id" | "rest";

export interface WholesalerConfig {
  name: string;
  active: boolean;
  authType: AuthType;
  sandboxMode?: boolean;
  apiBaseUrl: string;
  searchEndpoint: string;
  priceEndpoint: string;
  credentials: Record<string, string | boolean | undefined>;
  notes?: string;
}

export const wholesalers: WholesalerConfig[] = [

  // ─── INGRAM MICRO ───────────────────────────────────────────────────────────
  {
    name: "Ingram Micro",
    active: true,
    authType: "oauth2",
    sandboxMode: process.env.INGRAM_SANDBOX === "true",
    apiBaseUrl: process.env.INGRAM_SANDBOX === "true"
      ? "https://api.ingrammicro.com:443/sandbox"
      : "https://api.ingrammicro.com:443",
    searchEndpoint: "/resellers/v6/catalog",
    priceEndpoint: "/resellers/v6/catalog/priceandavailability",
    credentials: {
      clientId:       process.env.INGRAM_CLIENT_ID,
      clientSecret:   process.env.INGRAM_CLIENT_SECRET,
      customerNumber: process.env.INGRAM_CUSTOMER_NUMBER,
      countryCode:    process.env.INGRAM_COUNTRY_CODE ?? "MX",
      senderId:       process.env.INGRAM_SENDER_ID,
    },
    notes: "OAuth2 token endpoint: https://api.ingrammicro.com:443/oauth/oauth20/token | Token válido 24h",
  },

  // ─── SYSCOM ─────────────────────────────────────────────────────────────────
  {
    name: "SYSCOM",
    active: true,
    authType: "oauth2",
    apiBaseUrl: "https://developers.syscom.mx/api/v1",
    searchEndpoint: "/productos",
    priceEndpoint: "/productos/{id}/precio",
    credentials: {
      clientId:     process.env.SYSCOM_CLIENT_ID,
      clientSecret: process.env.SYSCOM_CLIENT_SECRET,
    },
    notes: "OAuth2 token endpoint: https://developers.syscom.mx/oauth/token | Token válido 365 días | Rate limit: 60 req/min",
  },

  // ─── CT INTERNACIONAL ───────────────────────────────────────────────────────
  {
    name: "CT Internacional",
    active: true,
    authType: "jwt",
    apiBaseUrl: "https://api.ctonline.mx",
    searchEndpoint: "/catalogo",
    priceEndpoint: "/precios",
    credentials: {
      token:      process.env.CT_TOKEN,
      attribute1: process.env.CT_ATTRIBUTE_1,
      attribute2: process.env.CT_ATTRIBUTE_2,
      attribute3: process.env.CT_ATTRIBUTE_3,
    },
    notes: "JWT proporcionado por representante comercial CT. Documentación: api.ctonline.mx/documentacion.html",
  },

  // ─── CVA — GRUPO CVA ────────────────────────────────────────────────────────
  {
    name: "CVA",
    active: true,
    authType: "soap",
    apiBaseUrl: "https://www.grupocva.com/pedidos_web",
    searchEndpoint: "/pedidos_ws_cva.php",
    priceEndpoint: "/pedidos_ws_cva.php",
    credentials: {
      usuario:  process.env.CVA_USUARIO,
      password: process.env.CVA_PASSWORD,
    },
    notes: "SOAP/WSDL: https://www.grupocva.com/pedidos_web/pedidos_ws_cva.php?wsdl | Autenticación por Usuario+PWD en cada request",
  },

  // ─── INTCOMEX ───────────────────────────────────────────────────────────────
  {
    name: "INTCOMEX",
    active: true,
    authType: "apikey",
    apiBaseUrl: "https://iws.intcomex.com",
    searchEndpoint: "/api/catalog/search",
    priceEndpoint: "/api/catalog/prices",
    credentials: {
      apiKey: process.env.INTCOMEX_API_KEY,
    },
    notes: "API Key en header Authorization. Portal: iws.intcomex.com. Docs: iws.intcomex.com/reference/api.html",
  },

  // ─── PCH CONNECT ────────────────────────────────────────────────────────────
  {
    name: "PCH Connect",
    active: true,
    authType: "personal_id",
    apiBaseUrl: "https://shop.pchconnect.com",
    searchEndpoint: "/api/products/search",
    priceEndpoint: "/api/products/pricing",
    credentials: {
      personalId: process.env.PCH_PERSONAL_ID,
      header1:    process.env.PCH_HEADER_1,
      header2:    process.env.PCH_HEADER_2,
      header3:    process.env.PCH_HEADER_3,
    },
    notes: "3 headers requeridos en cada request. Contacto integración: technical@pchconnect.com",
  },

  // ─── EXEL DEL NORTE ─────────────────────────────────────────────────────────
  {
    name: "Exel del Norte",
    active: false, // ← Cambiar a true cuando se obtenga documentación oficial de Exel
    authType: "rest",
    apiBaseUrl: process.env.EXEL_API_URL ?? "https://api01.exeldelnorte.com.mx/",
    searchEndpoint: "/productos/buscar",    // PENDIENTE confirmar con Exel
    priceEndpoint: "/productos/precios",    // PENDIENTE confirmar con Exel
    credentials: {
      apiKey: process.env.EXEL_API_KEY,
    },
    notes: "PENDIENTE: Solicitar documentación completa de la API a Exel del Norte. active=false hasta confirmar endpoints.",
  },

];

// ─── Helper: obtener mayoristas activos ─────────────────────────────────────
export const activeWholesalers = wholesalers.filter((w) => w.active);

// ─── Helper: obtener mayorista por nombre ────────────────────────────────────
export const getWholesaler = (name: string): WholesalerConfig | undefined =>
  wholesalers.find((w) => w.name === name);
