const https = require('https');
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNTAzMjI1OC1jNjcyLTQ5YzMtOWRiYy01ZTZmM2NhNGYxMmQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMjQwYzJkOTQtYjI1ZS00OGMwLWE5NDAtYzNhZjAxZjU4MzlhIiwiaWF0IjoxNzc0MjA1NzQ0LCJleHAiOjE3NzkzNDMyMDB9.CxQtaw7L-Ba-06N9COy21mpEMqLnQfJDIXb5GGnxNPQ";

const ingram = {
  name: "Cotización Intrasiap — Ingram Search",
  nodes: [
    { id: "ing-001", name: "Trigger", type: "n8n-nodes-base.executeWorkflowTrigger", typeVersion: 1, position: [220,300], parameters: {} },
    { id: "ing-002", name: "Parsear Input", type: "n8n-nodes-base.code", typeVersion: 2, position: [440,300],
      parameters: { jsCode: "const raw=$input.first().json.data||'{}';const data=typeof raw==='string'?JSON.parse(raw):raw;return [{json:data}];" } },
    { id: "ing-003", name: "Obtener Token Ingram", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [660,300],
      parameters: {
        method: "POST", url: "https://api.ingrammicro.com/oauth/oauth30/token",
        sendBody: true, contentType: "form-urlencoded",
        bodyParameters: { parameters: [{ name: "grant_type", value: "client_credentials" }] },
        authentication: "predefinedCredentialType", nodeCredentialType: "httpBasicAuth", options: {}
      },
      credentials: { httpBasicAuth: { id: "2mMiCjWnNEbmiWVh", name: "Ingram Micro — Intrasiap" } }
    },
    { id: "ing-004", name: "Buscar en Ingram", type: "n8n-nodes-base.code", typeVersion: 2, position: [880,300],
      parameters: { jsCode: "const token=$('Obtener Token Ingram').first().json.access_token;\nconst productos=$('Parsear Input').first().json.productos||[];\nconst allResults=[];\nfor(const p of productos){\n  try{\n    const resp=await $helpers.httpRequest({method:'GET',url:'https://api.ingrammicro.com/reseller/v6/catalog',headers:{Authorization:'Bearer '+token,'IM-CustomerNumber':'50-661680','IM-CountryCode':'MX','IM-SenderID':'INTRASIAP','IM-CorrelationID':'intrasiap-'+Date.now(),'Accept':'application/json'},qs:{keyword:p.searchQuery,pageSize:5,pageNumber:1}});\n    const items=resp.catalog||resp.products||[];\n    for(const item of (Array.isArray(items)?items:[]).slice(0,3)){\n      allResults.push({mayorista:'Ingram Micro',sku:item.ingramPartNumber||'',skuFabricante:item.vendorPartNumber||'',descripcion:item.description||'',marca:item.vendorName||p.marca,precio:Number(item.customerPrice||item.retailPrice||0),moneda:'MXN',existencia:Number(item.quantityAvailable||0),disponible:(item.quantityAvailable||0)>0,imagenUrl:'',productoBuscado:p.searchQuery});\n    }\n  }catch(e){allResults.push({mayorista:'Ingram Micro',error:e.message,productoBuscado:p.searchQuery});}\n}\nreturn allResults.map(r=>({json:r}));" } },
    { id: "ing-005", name: "Normalizar Respuesta", type: "n8n-nodes-base.code", typeVersion: 2, position: [1100,300],
      parameters: { jsCode: "const items=$input.all();return [{json:{mayorista:'Ingram Micro',exitoso:true,resultados:items.map(i=>i.json).filter(r=>!r.error&&r.precio>0),timestamp:new Date().toISOString()}}];" } }
  ],
  connections: {
    "Trigger":              { main: [[{ node: "Parsear Input",         type: "main", index: 0 }]] },
    "Parsear Input":        { main: [[{ node: "Obtener Token Ingram",  type: "main", index: 0 }]] },
    "Obtener Token Ingram": { main: [[{ node: "Buscar en Ingram",      type: "main", index: 0 }]] },
    "Buscar en Ingram":     { main: [[{ node: "Normalizar Respuesta",  type: "main", index: 0 }]] }
  },
  settings: { executionOrder: "v1" }
};

const syscom = {
  name: "Cotización Intrasiap — SYSCOM Search",
  nodes: [
    { id: "sys-001", name: "Trigger", type: "n8n-nodes-base.executeWorkflowTrigger", typeVersion: 1, position: [220,300], parameters: {} },
    { id: "sys-002", name: "Parsear Input", type: "n8n-nodes-base.code", typeVersion: 2, position: [440,300],
      parameters: { jsCode: "const raw=$input.first().json.data||'{}';const data=typeof raw==='string'?JSON.parse(raw):raw;return [{json:data}];" } },
    { id: "sys-003", name: "Obtener Token SYSCOM", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [660,300],
      parameters: {
        method: "POST", url: "https://developers.syscom.mx/oauth/token",
        sendBody: true, contentType: "form-urlencoded",
        bodyParameters: { parameters: [{ name: "grant_type", value: "client_credentials" }] },
        authentication: "predefinedCredentialType", nodeCredentialType: "httpBasicAuth", options: {}
      },
      credentials: { httpBasicAuth: { id: "hCWWPwtgXbNqN5IG", name: "SYSCOM — Intrasiap" } }
    },
    { id: "sys-004", name: "Buscar en SYSCOM", type: "n8n-nodes-base.code", typeVersion: 2, position: [880,300],
      parameters: { jsCode: "const token=$('Obtener Token SYSCOM').first().json.access_token;\nconst productos=$('Parsear Input').first().json.productos||[];\nconst allResults=[];\nfor(const p of productos){\n  try{\n    const resp=await $helpers.httpRequest({method:'GET',url:'https://developers.syscom.mx/api/v1/productos',headers:{Authorization:'Bearer '+token},qs:{keyword:p.searchQuery,limite:5}});\n    const items=resp.productos||resp.data||resp||[];\n    for(const item of (Array.isArray(items)?items:[]).slice(0,3)){\n      allResults.push({mayorista:'SYSCOM',sku:item.producto_id||item.codigo||'',skuFabricante:item.numero_parte||'',descripcion:item.titulo||item.descripcion||'',marca:item.marca||p.marca,precio:Number(item.precios?.precio_lista||item.precio||0),moneda:'MXN',existencia:Number(item.total_existencia||0),disponible:(item.total_existencia||0)>0,imagenUrl:item.img_portada||'',productoBuscado:p.searchQuery});\n    }\n  }catch(e){allResults.push({mayorista:'SYSCOM',error:e.message,productoBuscado:p.searchQuery});}\n}\nreturn allResults.map(r=>({json:r}));" } },
    { id: "sys-005", name: "Normalizar Respuesta", type: "n8n-nodes-base.code", typeVersion: 2, position: [1100,300],
      parameters: { jsCode: "const items=$input.all();return [{json:{mayorista:'SYSCOM',exitoso:true,resultados:items.map(i=>i.json).filter(r=>!r.error&&r.precio>0),timestamp:new Date().toISOString()}}];" } }
  ],
  connections: {
    "Trigger":              { main: [[{ node: "Parsear Input",         type: "main", index: 0 }]] },
    "Parsear Input":        { main: [[{ node: "Obtener Token SYSCOM",  type: "main", index: 0 }]] },
    "Obtener Token SYSCOM": { main: [[{ node: "Buscar en SYSCOM",      type: "main", index: 0 }]] },
    "Buscar en SYSCOM":     { main: [[{ node: "Normalizar Respuesta",  type: "main", index: 0 }]] }
  },
  settings: { executionOrder: "v1" }
};

const cva = {
  name: "Cotización Intrasiap — CVA Search",
  nodes: [
    { id: "cva-001", name: "Trigger", type: "n8n-nodes-base.executeWorkflowTrigger", typeVersion: 1, position: [220,300], parameters: {} },
    { id: "cva-002", name: "Parsear Input", type: "n8n-nodes-base.code", typeVersion: 2, position: [440,300],
      parameters: { jsCode: "const raw=$input.first().json.data||'{}';const data=typeof raw==='string'?JSON.parse(raw):raw;return [{json:data}];" } },
    { id: "cva-003", name: "Buscar en CVA", type: "n8n-nodes-base.code", typeVersion: 2, position: [660,300],
      parameters: { jsCode: "const productos=$('Parsear Input').first().json.productos||[];\nconst allResults=[];\nfor(const p of productos){\n  try{\n    const resp=await $helpers.httpRequest({method:'GET',url:'https://www.grupocva.com/api/v1/productos/buscar',headers:{'Content-Type':'application/json'},qs:{usuario:'admin31514',password:'pfHtST5JHpo8',q:p.searchQuery,limite:5}});\n    const items=resp.productos||resp.data||[];\n    for(const item of (Array.isArray(items)?items:[]).slice(0,3)){\n      allResults.push({mayorista:'CVA',sku:item.clave||item.codigo||'',skuFabricante:item.numero_parte||'',descripcion:item.descripcion||item.nombre||'',marca:item.marca||p.marca,precio:Number(item.precio||0),moneda:'MXN',existencia:Number(item.existencia||0),disponible:(item.existencia||0)>0,imagenUrl:item.imagen||'',productoBuscado:p.searchQuery});\n    }\n  }catch(e){allResults.push({mayorista:'CVA',error:e.message,productoBuscado:p.searchQuery});}\n}\nreturn allResults.map(r=>({json:r}));" } },
    { id: "cva-004", name: "Normalizar Respuesta", type: "n8n-nodes-base.code", typeVersion: 2, position: [880,300],
      parameters: { jsCode: "const items=$input.all();return [{json:{mayorista:'CVA',exitoso:true,resultados:items.map(i=>i.json).filter(r=>!r.error&&r.precio>0),timestamp:new Date().toISOString()}}];" } }
  ],
  connections: {
    "Trigger":       { main: [[{ node: "Parsear Input",        type: "main", index: 0 }]] },
    "Parsear Input": { main: [[{ node: "Buscar en CVA",        type: "main", index: 0 }]] },
    "Buscar en CVA": { main: [[{ node: "Normalizar Respuesta", type: "main", index: 0 }]] }
  },
  settings: { executionOrder: "v1" }
};

const updates = [
  { wf: ingram, id: "V2TFfmk9gByqZfkG" },
  { wf: syscom, id: "Xc34eTbT9ygqNb9O" },
  { wf: cva,    id: "Gi7xLFok8QAkZfYR" }
];

function putWorkflow(id, wf) {
  return new Promise((resolve) => {
    const body = JSON.stringify(wf);
    const req = https.request({
      hostname: "jesus181920.app.n8n.cloud",
      path: "/api/v1/workflows/" + id,
      method: "PUT",
      headers: { "X-N8N-API-KEY": apiKey, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        const d = JSON.parse(data);
        if (d.id) resolve({ name: wf.name, status: "OK" });
        else resolve({ name: wf.name, status: "ERR: " + (d.message||"").slice(0,120) });
      });
    });
    req.on("error", e => resolve({ name: wf.name, status: "ERR: " + e.message }));
    req.write(body);
    req.end();
  });
}

(async () => {
  for (const u of updates) {
    const r = await putWorkflow(u.id, u.wf);
    console.log((r.status === "OK" ? "✓" : "✗") + " " + r.name + (r.status !== "OK" ? " => " + r.status : ""));
  }
})();
