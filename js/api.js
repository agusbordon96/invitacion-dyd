/* Capa de datos: usa Apps Script cuando está configurado y localStorage en demo. */
const DEMO_KEY = "gran-expedicion-registros";
function isLiveApi() { return APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes("PEGAR_AQUI"); }
function demoRecords() { try { return JSON.parse(localStorage.getItem(DEMO_KEY) || "[]"); } catch { return []; } }
function saveDemo(records) { localStorage.setItem(DEMO_KEY, JSON.stringify(records)); }

async function checkName(name) {
  if (!isLiveApi()) return demoRecords().some(r => r.name.toLowerCase() === name.toLowerCase());
  const response = await fetch(`${APPS_SCRIPT_URL}?action=checkName&name=${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error("No fue posible consultar a la Custodia.");
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || "No fue posible validar el nombre.");
  return data.exists;
}

async function submitRecords(records) {
  if (!isLiveApi()) {
    const saved = demoRecords();
    const assigned = records.map(record => {
      const status = record.status || "Asiste";
      if (status === "No asiste") return { ...record, id: crypto.randomUUID?.() || String(Date.now()), order: "", classKey: "", status, registeredAt: new Date().toISOString() };
      const order = record.desiredOrder || chooseDemoOrder(saved);
      const taken = saved.filter(r => r.order === order && r.status === "Asiste").map(r => r.classKey);
      const classKey = bestDemoClass(record.scores, taken, record.avoidClass);
      return { ...record, id: crypto.randomUUID?.() || String(Date.now()), order, classKey, status, registeredAt: new Date().toISOString() };
    });
    saveDemo([...saved, ...assigned]); return { demo: true, records: assigned };
  }
  const response = await fetch(APPS_SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "register", records }) });
  if (!response.ok) throw new Error("No fue posible enviar el registro.");
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || "La Custodia no pudo confirmar el registro.");
  return data;
}

function chooseDemoOrder(records) {
  const roar = records.filter(r => r.order === "firstRoar" && r.status === "Asiste").length;
  const trail = records.filter(r => r.order === "lastTrail" && r.status === "Asiste").length;
  return roar <= trail ? "firstRoar" : "lastTrail";
}
function bestDemoClass(scores, taken, avoid) {
  const candidates = Object.keys(CLASSES).filter(key => !taken.includes(key));
  const pool = candidates.length ? candidates : Object.keys(CLASSES);
  return pool.sort((a, b) => (scores[b] - scores[a]) || (a === avoid ? 1 : b === avoid ? -1 : 0))[0];
}
