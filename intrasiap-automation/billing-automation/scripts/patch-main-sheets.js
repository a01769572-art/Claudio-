const https = require('https');
const fs = require('fs');

const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNTAzMjI1OC1jNjcyLTQ5YzMtOWRiYy01ZTZmM2NhNGYxMmQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMjQwYzJkOTQtYjI1ZS00OGMwLWE5NDAtYzNhZjAxZjU4MzlhIiwiaWF0IjoxNzc0MjA1NzQ0LCJleHAiOjE3NzkzNDMyMDB9.CxQtaw7L-Ba-06N9COy21mpEMqLnQfJDIXb5GGnxNPQ";
const wfId  = "bQhtVjripqrh2Dgg";
const SHEET_ID  = "1nKR9aZEypht72WH5IqVRHQaXGG48dLdr";
const SHEET_GID = "1605095800";
const SHEETS_CRED_ID   = "lxP9ldRc6LX4DrhD";
const GMAIL_CRED_ID    = "o2h4adkmnVDG1P5R";
const GEMINI_CRED_ID   = "BP2GelDlrjXM1Bi1";

const mainPath = "C:/Users/jesus/OneDrive - Instituto Tecnologico y de Estudios Superiores de Monterrey/Documents/AI DEVELOPS/CLAUDIO/intrasiap-automation/billing-automation/workflows/main-workflow.json";

// Read current workflow and strip read-only fields
const wf = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
delete wf.active; delete wf.tags; delete wf.id;
delete wf.createdAt; delete wf.updatedAt; delete wf.versionId;

// ── Remove old OneDrive and "Llenar Template" nodes ─────────────────────────
wf.nodes = wf.nodes.filter(n =>
  n.name !== "Descargar Template Excel" &&
  n.name !== "Llenar Template Excel"
);

// ── Fix Gemini model connection names ────────────────────────────────────────
// Update node names in connections map
const fixConnKey = (key) => {
  if (key === "Claude Sonnet (Benchmarking)") return "Gemini 2.0 Flash (Benchmarking)";
  if (key === "Claude Sonnet (Excel)")        return "Gemini 2.0 Flash (Excel)";
  if (key === "Agente Excel (Sonnet)")        return "Agente Excel (Gemini)";
  return key;
};
const newConns = {};
for (const [k, v] of Object.entries(wf.connections)) {
  newConns[fixConnKey(k)] = v;
}
wf.connections = newConns;

// Fix references inside connection values
for (const key of Object.keys(wf.connections)) {
  const conn = wf.connections[key];
  for (const type of Object.keys(conn)) {
    for (const group of conn[type]) {
      for (const link of group) {
        link.node = fixConnKey(link.node);
      }
    }
  }
}

// Fix node names in nodes array
for (const node of wf.nodes) {
  if (node.name === "Agente Excel (Sonnet)") node.name = "Agente Excel (Gemini)";
}

// ── Add new nodes ─────────────────────────────────────────────────────────────

// 1. Preparar Datos Sheets — Code node that builds batchUpdate payload
wf.nodes.push({
  id: "aa000001-0000-0000-0000-000000000001",
  name: "Preparar Datos Sheets",
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [2280, 400],
  parameters: {
    jsCode: `const d = $input.first().json;
const excelData = d.excelData || {};
const celdas = excelData.celdas || {};
const productos = excelData.productos || [];

const data = [];

// Celdas individuales
for (const [cell, value] of Object.entries(celdas)) {
  data.push({ range: 'Hoja1!' + cell, values: [[value]] });
}

// Filas de productos desde fila 15
productos.forEach((p, i) => {
  const row = 15 + i;
  const cols = ['B','C','D','E','F','H','I','J','K','L','M','N','O','P','Q'];
  const vals = [p.partida||i+1, p.cantidad||1, p.descripcion||'', p.precioVenta||0,
    p.totalVenta||0, p.existencia||0, p.sku||'', p.mayorista||'',
    p.costoUnitario||0, p.costoTotal||0, p.utilidadUnitaria||0,
    p.utilidadTotal||0, p.utilidadPct||0, p.iva||0, 0];
  cols.forEach((col, ci) => {
    data.push({ range: 'Hoja1!' + col + row, values: [[vals[ci]]] });
  });
});

return [{
  json: {
    batchUpdatePayload: { valueInputOption: 'USER_ENTERED', data },
    vendedorEmail: d.vendedorEmail || '',
    clienteNombre: d.clienteNombre || '',
    fechaSolicitud: d.fechaSolicitud || new Date().toISOString(),
    htmlReporte: d.htmlReporte || ''
  }
}];`
  }
});

// 2. Escribir en Google Sheets — HTTP Request with batchUpdate
wf.nodes.push({
  id: "aa000001-0000-0000-0000-000000000002",
  name: "Escribir en Google Sheets",
  type: "n8n-nodes-base.httpRequest",
  typeVersion: 4.2,
  position: [2500, 400],
  parameters: {
    method: "POST",
    url: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchUpdate`,
    authentication: "predefinedCredentialType",
    nodeCredentialType: "googleSheetsOAuth2Api",
    sendBody: true,
    contentType: "json",
    specifyBody: "json",
    jsonBody: "={{ JSON.stringify($json.batchUpdatePayload) }}",
    options: {}
  },
  credentials: {
    googleSheetsOAuth2Api: { id: SHEETS_CRED_ID, name: "Google Sheets — Intrasiap" }
  }
});

// 3. Exportar Cotización PDF — HTTP Request to Sheets export
wf.nodes.push({
  id: "aa000001-0000-0000-0000-000000000003",
  name: "Exportar Cotización PDF",
  type: "n8n-nodes-base.httpRequest",
  typeVersion: 4.2,
  position: [2720, 400],
  parameters: {
    method: "GET",
    url: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=pdf&gid=${SHEET_GID}&portrait=true&fitw=true&gridlines=false`,
    authentication: "predefinedCredentialType",
    nodeCredentialType: "googleSheetsOAuth2Api",
    options: { response: { response: { responseFormat: "file", outputPropertyName: "cotizacionPdf" } } }
  },
  credentials: {
    googleSheetsOAuth2Api: { id: SHEETS_CRED_ID, name: "Google Sheets — Intrasiap" }
  }
});

// 4. Preparar Email — Code node (was "Llenar Template Excel")
wf.nodes.push({
  id: "f1a2b3c4-d5e6-7890-abcd-004400440044",
  name: "Preparar Email",
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [2940, 400],
  parameters: {
    jsCode: `const meta = $('Preparar Datos Sheets').first().json;
const fecha = new Date().toLocaleDateString('es-MX');
return [{
  json: {
    vendedorEmail:  meta.vendedorEmail || '',
    asunto:         'Cotización ' + (meta.clienteNombre||'') + ' — ' + fecha,
    cuerpoEmail:    'Estimado/a vendedor/a,\\n\\nAdjunto encontrarás:\\n\\n1. Reporte de benchmarking de precios (todos los mayoristas consultados)\\n2. Cotización lista para entregar al cliente\\n\\nIntrasiap Automation System'
  },
  binary: {
    benchmarkPdf:   $('Generar PDF Benchmarking').first().binary?.benchmarkPdf,
    cotizacionPdf:  $('Exportar Cotización PDF').first().binary?.cotizacionPdf
  }
}];`
  }
});

// 5. Update Gmail node to send both PDFs
const gmailNode = wf.nodes.find(n => n.name === "Enviar Cotización por Email");
if (gmailNode) {
  gmailNode.position = [3160, 400];
  gmailNode.parameters.attachmentsUi = {
    attachmentsBinary: [
      { property: "benchmarkPdf" },
      { property: "cotizacionPdf" }
    ]
  };
  gmailNode.parameters.options = {
    attachmentsUi: {
      attachmentsBinary: [
        { property: "benchmarkPdf" },
        { property: "cotizacionPdf" }
      ]
    }
  };
  gmailNode.credentials = {
    gmailOAuth2: { id: GMAIL_CRED_ID, name: "Gmail — Intrasiap" }
  };
}

// ── Update connections ────────────────────────────────────────────────────────
// Remove old OneDrive/Llenar connections, add new ones
delete wf.connections["Descargar Template Excel"];
delete wf.connections["Llenar Template Excel"];

// Parsear y Generar Excel → only Preparar Datos Sheets (no more fork to OneDrive)
wf.connections["Parsear y Generar Excel"] = {
  main: [[{ node: "Preparar Datos Sheets", type: "main", index: 0 }]]
};

// New chain
wf.connections["Preparar Datos Sheets"]     = { main: [[{ node: "Generar PDF Benchmarking", type: "main", index: 0 }, { node: "Escribir en Google Sheets", type: "main", index: 0 }]] };
wf.connections["Generar PDF Benchmarking"]  = { main: [[{ node: "Preparar Email", type: "main", index: 0 }]] };
wf.connections["Escribir en Google Sheets"] = { main: [[{ node: "Exportar Cotización PDF", type: "main", index: 0 }]] };
wf.connections["Exportar Cotización PDF"]   = { main: [[{ node: "Preparar Email", type: "main", index: 0 }]] };
wf.connections["Preparar Email"]            = { main: [[{ node: "Enviar Cotización por Email", type: "main", index: 0 }]] };

// Save updated local file
fs.writeFileSync(mainPath, JSON.stringify(wf, null, 2));
console.log("Local file updated.");

// Push to n8n
const body = JSON.stringify(wf);
const req = https.request({
  hostname: "jesus181920.app.n8n.cloud",
  path: "/api/v1/workflows/" + wfId,
  method: "PUT",
  headers: { "X-N8N-API-KEY": apiKey, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
}, (res) => {
  let data = "";
  res.on("data", c => data += c);
  res.on("end", () => {
    const d = JSON.parse(data);
    if (d.id) console.log("✓ n8n actualizado => " + d.name);
    else console.log("✗ ERROR: " + (d.message||JSON.stringify(d)).slice(0,200));
  });
});
req.on("error", e => console.log("ERROR:", e.message));
req.write(body);
req.end();
