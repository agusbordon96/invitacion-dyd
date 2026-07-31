const LORE = `HACE TREINTA INVIERNOS, una antigua orden de aventureros encontró un misterioso Huevo Primigenio.

Temiendo el poder que albergaba en su interior, decidieron confiar su custodia a una única persona.

Desde entonces, una Druida de Criaturas Primordiales y Custodia del Huevo Primigenio lo protegió en secreto mientras esperaba una señal.

ESA SEÑAL FINALMENTE LLEGÓ.

El Huevo ha comenzado a resonar.
Pero aún permanece sellado.

Las antiguas inscripciones revelan que solo una expedición digna podrá reclamarlo. Para lograrlo, deberán superar cinco pruebas, reunir las Runas de Resonancia y descubrir el secreto oculto entre los vestigios de la expedición.

No bastará con ser fuertes.
No bastará con ser inteligentes.

SOLO QUIENES PRESTEN ATENCIÓN HASTA AL MÁS PEQUEÑO DETALLE COMPRENDERÁN EL VERDADERO LEGADO DE LAS CRIATURAS PRIMIGENIAS.`;
const state = { accompanied: false, group: "Solo", people: [], activeName: "", answers: [], reject: false };
const app = document.getElementById("app");
const escape = value => String(value).replace(/[&<>'"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[c]));
function render(html) { app.innerHTML = html; window.scrollTo({ top: 0, behavior: "smooth" }); }
function button(text, action, classes = "") { return `<button class="btn ${classes}" data-action="${action}">${text}</button>`; }
function showToast(message, isError = false) { const t = document.getElementById("toast"); t.textContent = message; t.style.borderColor = isError ? "#d75aa6" : "#d7b66a"; t.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => t.classList.remove("show"), 4200); }

function portal() { render(`<section class="screen portal-screen"><div class="panel"><p class="eyebrow">La Gran Expedición</p><h1 class="title">La Convocatoria<br>del Huevo Primigenio</h1><button class="portal" data-action="open" aria-label="Abrir la Convocatoria"></button><p class="lead">Una antigua convocatoria ha vuelto a despertar.</p>${button("✦ Abrir la Convocatoria", "open")}</div></section>`); }
function lore() { render(`<section class="screen"><article class="panel"><p class="eyebrow">La Convocatoria</p><div class="lore">${LORE.replace(/(HACE TREINTA INVIERNOS|ESA SEÑAL FINALMENTE LLEGÓ|SOLO QUIENES PRESTEN ATENCIÓN HASTA AL MÁS PEQUEÑO DETALLE COMPRENDERÁN EL VERDADERO LEGADO DE LAS CRIATURAS PRIMIGENIAS)/g,"<strong>$1</strong>")}</div><p class="lead" style="margin-top:30px">¿Aceptarás el llamado de la Custodia?</p><div class="button-row">${button("⚔️ Acepto la convocatoria", "attendance")}${button("🌙 No podré asistir", "decline", "secondary danger")}</div></article></section>`); }
function attendance() { render(`<section class="screen"><div class="panel"><p class="eyebrow">La ruta se abre</p><h2 class="title">¿Emprenderás el viaje acompañado?</h2><div class="button-row">${button("Viajaré solo", "solo")}${button("Viajaré acompañado", "pair", "secondary")}</div></div></section>`); }
function nameScreen(second = false) { const label = second ? "Nombre del segundo aventurero" : "Nombre o apodo"; render(`<section class="screen"><div class="panel"><p class="eyebrow">Las Runas escuchan</p><h2 class="title">${second ? "Todo gran viaje se fortalece con un compañero." : "Las Runas deben conocer tu nombre."}</h2>${second ? '<p class="lead">Las Runas aún deben conocer a quien viajará junto a vos.</p>' : ''}<div class="field"><label for="name">${label}</label><input id="name" maxlength="80" autocomplete="name" placeholder="${label}" autofocus></div>${button("Comenzar el Test", second ? "start-second" : "start-quiz")}</div></section>`); }
async function beginQuiz(second) { const input = document.getElementById("name"), name = input.value.trim(); if (!name) { showToast("Escribí tu nombre para continuar.", true); input.focus(); return; } if (state.people.some(p => p.name.toLowerCase() === name.toLowerCase())) { showToast("Cada aventurero debe tener un nombre diferente.", true); return; } const btn = document.querySelector('[data-action^="start"]'); btn.disabled = true; btn.textContent = "Consultando a la Custodia…"; try { if (await checkName(name)) { render(`<section class="screen"><div class="panel"><h2 class="title">Este aventurero ya respondió a la convocatoria.</h2><p class="lead">Si necesitás corregir tu registro, contactá a la Custodia.</p>${button("Volver", second ? "second-name" : "attendance")}</div></section>`); return; } state.activeName = name; state.answers = []; quiz(0); } catch (e) { showToast(e.message, true); btn.disabled = false; btn.textContent = "Comenzar el Test"; } }
function quiz(index) { const question = QUIZ[index], selected = state.answers[index]; const choices = question.options.map((option, i) => `<button class="choice ${selected === i ? "selected" : ""}" data-choice="${i}">${escape(option[0])}</button>`).join(""); render(`<section class="screen"><div class="panel"><p class="question-number">Pregunta ${index + 1} de 7</p><div class="progress" aria-label="Progreso del test"><i style="width:${(index / 7) * 100}%"></i></div><h2 class="question">${question.text}</h2><div class="choices">${choices}</div><div class="nav">${index ? button("← Volver", "back", "secondary") : '<span></span>'}${button(index === 6 ? "Revelar mi destino ✦" : "Continuar →", "next")}</div></div></section>`); app.dataset.question = index; }
function saveChoice(choice) { const i = Number(app.dataset.question); state.answers[i] = choice; document.querySelectorAll(".choice").forEach(e => e.classList.toggle("selected", Number(e.dataset.choice) === choice)); }
async function finishQuiz() { const index = Number(app.dataset.question); if (state.answers[index] === undefined) { showToast("Elegí una respuesta para continuar.", true); return; } if (index < 6) { quiz(index + 1); return; } const btn = document.querySelector('[data-action="next"]'); btn.disabled = true; btn.textContent = "Las Runas deliberan…"; const candidate = { name: state.activeName, status: "Asiste", group: state.group, accompanied: state.accompanied ? "Sí" : "No", scores: calculateScores(state.answers), desiredOrder: state.people[0]?.order, avoidClass: state.people[0]?.classKey }; try { const result = await submitRecords([candidate]); const person = result.records[0]; state.people.push(person); reveal(person); } catch (e) { showToast(e.message, true); btn.disabled = false; btn.textContent = "Revelar mi destino ✦"; } }
/* Emblemas vectoriales propios, definidos para conservar nitidez también en el PDF. */
function emblem(orderKey) {
  const order = ORDERS[orderKey];
  const creature = orderKey === "firstRoar"
    ? `<svg viewBox="0 0 180 120" aria-hidden="true" style="position:relative;z-index:1;width:82%;filter:drop-shadow(0 0 8px #d7b66a99)"><path fill="#d7b66a" d="M13 78c13-8 26-12 40-11l18-21 13 2 11-15 18 4 13 14 22 5 18-9-3 17-20 11-12 19-8-2 3-17-23-3-7 17-9-1 1-18-21-6-16 18-9-1 6-20-17 1-17 11z"/><path fill="#9c7330" d="M107 39l-4-13 13 9z"/><circle fill="#fff2c5" cx="126" cy="47" r="2"/></svg>`
    : `<svg viewBox="0 0 180 120" aria-hidden="true" style="position:relative;z-index:1;width:82%;filter:drop-shadow(0 0 8px #4ee6a199)"><path fill="#b8dcd2" d="M28 88c1-17 12-27 29-29l31 2 6-27c4-20 18-29 35-25 9 2 15 8 16 16l-13 5-9-7-8 4 9 10-7 35 18 13 20 2 10 12-21 3-20-12-29 5-5 16-10-1 2-17-31-2-9 18-10-2 7-18-13-5z"/><path fill="#4ee6a1" d="M113 18l10-9 1 13z"/><circle fill="#fff" cx="130" cy="21" r="2"/></svg>`;
  return `<div class="order-emblem ${order.type}" role="img" aria-label="Emblema de ${order.name}">${creature}</div>`;
}
function reveal(person) { const c = CLASSES[person.classKey], o = ORDERS[person.order]; const isFirstOfPair = state.accompanied && state.people.length === 1; render(`<section class="screen reveal"><div class="panel"><p class="eyebrow">Las Runas han escuchado tus respuestas…</p><p class="lead">El destino de tu expedición ha sido revelado.</p><div class="reveal-icon">${c.emoji}</div><h2 class="class-name">${c.name}</h2><p class="lead">${c.description}</p><p class="eyebrow" style="margin-top:33px">Has sido convocado a…</p>${emblem(person.order)}<h3 class="order-name">${o.name}</h3><p class="motto">“${o.motto}”</p>${isFirstOfPair ? button("Conocer al segundo aventurero", "second-name") : button("Ver mi convocatoria", "final")}</div></section>`); }
function finalScreen() { const cards = state.people.map(p => { const c = CLASSES[p.classKey], o = ORDERS[p.order]; return `<article class="adventurer"><h3>${escape(p.name)}</h3><p>${c.emoji} <strong>${c.name}</strong></p><p>${o.emoji} ${o.name}</p></article>`; }).join(""); const order = ORDERS[state.people[0].order]; render(`<section class="screen final"><div id="pdf-source" class="panel"><p class="eyebrow">La Custodia ha hablado</p><h1 class="title">${EVENT_DETAILS.title}</h1><p class="subtitle">${EVENT_DETAILS.subtitle}</p><p class="lead">Tu lugar en la expedición ha sido registrado.</p>${!isLiveApi() ? '<p class="notice">Modo demostración: los datos no fueron enviados a la Custodia.</p>' : ''}${emblem(state.people[0].order)}<h3 class="order-name" style="text-align:center">${order.name}</h3><p class="motto" style="text-align:center">“${order.motto}”</p><div class="adventure-grid">${cards}</div><div class="event-details">
  <div>📅 ${EVENT_DETAILS.date}</div>
  <div>🕘 ${EVENT_DETAILS.time}</div>
  <div>📍 ${EVENT_DETAILS.address}</div>
</div>

<div class="provisions">
  <span class="provisions-icon">🍻</span>
  <div>
    <h3>Provisiones de la Expedición</h3>
    <p>
      Toda gran expedición necesita provisiones.
      Recordá traer una bebida alcohólica para compartir durante la celebración.
    </p>
  </div>
</div></section>`); }
function declineScreen() { render(`<section class="screen"><div class="panel"><p class="eyebrow">Antes de partir</p><h2 class="title">Antes de partir, deja tu nombre para que la Custodia conozca tu respuesta.</h2><div class="field"><label for="name">Nombre o apodo</label><input id="name" maxlength="80" autocomplete="name" placeholder="Nombre o apodo" autofocus></div>${button("Confirmar mi respuesta", "confirm-decline")}</div></section>`); }
async function confirmDecline() { const name = document.getElementById("name").value.trim(); if (!name) return showToast("Escribí tu nombre para continuar.", true); const btn = document.querySelector('[data-action="confirm-decline"]'); btn.disabled = true; btn.textContent = "Confirmando…"; try { if (await checkName(name)) throw new Error("Este aventurero ya respondió a la convocatoria."); await submitRecords([{ name, status: "No asiste", group: "Solo", accompanied: "No", scores: emptyScores() }]); render(`<section class="screen"><div class="panel"><h2 class="title">La Custodia comprende.</h2><p class="lead">No todas las rutas conducen a la misma expedición, pero las puertas de este reino permanecerán abiertas.<br><br>Espero encontrarte en una próxima aventura.</p>${button("Cerrar la Convocatoria", "close")}</div></section>`); } catch (e) { showToast(e.message, true); btn.disabled = false; btn.textContent = "Confirmar mi respuesta"; } }

app.addEventListener("click", e => { const target = e.target.closest("[data-action], [data-choice]"); if (!target || target.disabled) return; if (target.dataset.choice !== undefined) return saveChoice(Number(target.dataset.choice)); const action = target.dataset.action; if (action === "open") { document.querySelector(".portal")?.classList.add("opening"); setTimeout(lore, 500); } else if (action === "attendance") attendance(); else if (action === "decline") declineScreen(); else if (action === "solo" || action === "pair") { state.accompanied = action === "pair"; state.group = state.accompanied ? `Pareja-${String(Date.now()).slice(-5)}` : "Solo"; nameScreen(); } else if (action === "start-quiz") beginQuiz(false); else if (action === "start-second") beginQuiz(true); else if (action === "next") finishQuiz(); else if (action === "back") quiz(Number(app.dataset.question) - 1); else if (action === "second-name") nameScreen(true); else if (action === "final") finalScreen(); else if (action === "map") window.open(EVENT_DETAILS.mapUrl, "_blank", "noopener"); else if (action === "pdf") downloadConvocation(state.people); else if (action === "confirm-decline") confirmDecline(); else if (action === "close") portal(); });
portal();
