/*
 * Backend de La Gran Expedición. Vinculá este proyecto a la hoja de cálculo
 * y configurá SPREADSHEET_ID antes de publicarlo como Web App.
 */
const SPREADSHEET_ID = "PEGAR_AQUI_EL_ID_DE_TU_GOOGLE_SHEET";
const SHEET_NAME = "Invitados";
const MAX_PEOPLE_PER_ORDER = 12;
const NUMBER_OF_CORE_CLASSES = 6;
const MAX_TOTAL_GUESTS = 24;
const CLASS_KEYS = ["guardian", "explorer", "rogue", "druid", "bard", "scholar"];
const ORDER_KEYS = ["firstRoar", "lastTrail"];
const HEADERS = ["ID", "Nombre", "Estado", "Grupo", "Acompañado", "Orden", "Clase", "Afinidad Guardián", "Afinidad Explorador", "Afinidad Pícaro", "Afinidad Druida", "Afinidad Bardo", "Afinidad Erudito", "Fecha de registro"];

function doGet(e) {
  try {
    if (e.parameter.action === "checkName") return json_({ ok: true, exists: nameExists_(e.parameter.name || "") });
    return json_({ ok: true, service: "La Gran Expedición" });
  } catch (error) { return json_({ ok: false, error: error.message }); }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const payload = JSON.parse(e.postData.contents || "{}");
    if (payload.action !== "register" || !Array.isArray(payload.records) || !payload.records.length) throw new Error("Registro inválido.");
    const result = register_(payload.records);
    return json_({ ok: true, records: result });
  } catch (error) {
    return json_({ ok: false, error: error.message || "No se pudo completar el registro." });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function register_(records) {
  const sheet = getSheet_();
  const existing = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues() : [];
  const registered = existing.filter(row => row[2] === "Asiste");
  if (registered.length + records.filter(r => r.status === "Asiste").length > MAX_TOTAL_GUESTS) throw new Error("La expedición ya alcanzó su capacidad máxima.");
  const names = existing.map(row => normalize_(row[1]));
  const pending = [];
  records.forEach(record => {
    if (!record.name || !String(record.name).trim()) throw new Error("Cada aventurero necesita un nombre.");
    const normalized = normalize_(record.name);
    if (names.indexOf(normalized) !== -1 || pending.indexOf(normalized) !== -1) throw new Error("Este aventurero ya respondió a la convocatoria.");
    pending.push(normalized);
  });

  const output = records.map(record => {
    const data = sanitize_(record);
    if (data.status === "Asiste") {
      data.order = selectOrder_(registered, data.desiredOrder);
      data.classKey = selectClass_(registered, data.order, data.scores, data.avoidClass);
      registered.push(toRow_(data)); // Incluye este registro al asignar el siguiente del mismo envío.
    }
    return data;
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, output.length, HEADERS.length).setValues(output.map(toRow_));
  return output;
}

function selectOrder_(rows, desiredOrder) {
  const counts = orderCounts_(rows);
  if (desiredOrder && ORDER_KEYS.indexOf(desiredOrder) !== -1) {
    if (counts[desiredOrder] >= MAX_PEOPLE_PER_ORDER) throw new Error("La orden de tu compañero ya completó sus plazas.");
    return desiredOrder;
  }
  const available = ORDER_KEYS.filter(key => counts[key] < MAX_PEOPLE_PER_ORDER);
  if (!available.length) throw new Error("Las dos órdenes completaron sus plazas.");
  return available.sort((a, b) => counts[a] - counts[b])[0];
}

function selectClass_(rows, order, scores, avoidClass) {
  const used = rows.filter(row => row[5] === order).map(row => row[6]);
  const uncovered = CLASS_KEYS.filter(key => used.indexOf(key) === -1);
  const candidates = uncovered.length ? uncovered : CLASS_KEYS.slice();
  return candidates.sort((a, b) => {
    const byAffinity = (scores[b] || 0) - (scores[a] || 0);
    if (byAffinity) return byAffinity;
    // Solo desempata contra la clase de su acompañante mientras haya otra opción.
    if (a === avoidClass && b !== avoidClass) return 1;
    if (b === avoidClass && a !== avoidClass) return -1;
    return CLASS_KEYS.indexOf(a) - CLASS_KEYS.indexOf(b);
  })[0];
}

function sanitize_(record) {
  const scores = record.scores || {};
  return {
    id: Utilities.getUuid(), name: String(record.name).trim(), status: record.status === "No asiste" ? "No asiste" : "Asiste",
    group: record.group || "Solo", accompanied: record.accompanied || "No", order: "", classKey: "", desiredOrder: record.desiredOrder || "", avoidClass: record.avoidClass || "",
    scores: CLASS_KEYS.reduce((out, key) => { out[key] = Number(scores[key]) || 0; return out; }, {}), registeredAt: new Date().toISOString()
  };
}

function toRow_(record) { return [record.id, record.name, record.status, record.group, record.accompanied, record.order, record.classKey, record.scores.guardian, record.scores.explorer, record.scores.rogue, record.scores.druid, record.scores.bard, record.scores.scholar, record.registeredAt]; }
function orderCounts_(rows) { const result = { firstRoar: 0, lastTrail: 0 }; rows.forEach(row => { if (result.hasOwnProperty(row[5])) result[row[5]]++; }); return result; }
function nameExists_(name) { const sheet = getSheet_(); if (sheet.getLastRow() < 2) return false; return sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues().some(row => normalize_(row[0]) === normalize_(name)); }
function normalize_(value) { return String(value || "").trim().toLocaleLowerCase(); }
function getSheet_() { if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf("PEGAR_AQUI") !== -1) throw new Error("Falta configurar SPREADSHEET_ID."); const ss = SpreadsheetApp.openById(SPREADSHEET_ID); let sheet = ss.getSheetByName(SHEET_NAME); if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]); sheet.setFrozenRows(1); } return sheet; }
function json_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
