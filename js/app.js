/* =========================================================
   LA GRAN EXPEDICIÓN
   app.js
   ========================================================= */


/* =========================================================
   1. LORE
   ========================================================= */

const LORE = `
Hace 30 inviernos, una antigua orden de aventureros encontró un misterioso Huevo Primigenio.
Temiendo el poder que albergaba en su interior, decidieron confiar su custodia a una única persona.
Desde entonces, la Druida de Criaturas Primordiales se convirtió en Custodia del Huevo Primigenio, protegiéndolo en secreto mientras esperaba una señal.
Esa señal finalmente llegó.
El Huevo ha comenzado a resonar.
Pero aún permanece sellado.
Las antiguas inscripciones revelan que solo una expedición digna podrá reclamarlo. Para lograrlo, deberán superar cinco pruebas, reunir las Runas de Resonancia y descubrir el secreto oculto entre los vestigios de la expedición.

No bastará con ser fuertes.
No bastará con ser inteligentes.

Solo quienes presten atención hasta a el más pequeño detalle comprenderán el verdero legado de las criaturas primigenias.
`;


/* =========================================================
   2. ESTADO DE LA CONVOCATORIA
   ========================================================= */

const state = {
  accompanied: false,
  group: "Solo",
  people: [],
  activeName: "",
  answers: [],
  reject: false
};

const app = document.getElementById("app");


/* =========================================================
   3. FUNCIONES GENERALES
   ========================================================= */

function escape(value) {
  return String(value).replace(
    /[&<>'"]/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]
  );
}


function render(html) {
  app.innerHTML = html;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function button(text, action, classes = "") {
  return `
    <button
      class="btn ${classes}"
      data-action="${action}"
    >
      ${text}
    </button>
  `;
}


function showToast(message, isError = false) {
  const toast = document.getElementById("toast");

  toast.textContent = message;

  toast.style.borderColor = isError
    ? "#d75aa6"
    : "#d7b66a";

  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 4200);
}


/* =========================================================
   4. PANTALLA DEL PORTAL
   ========================================================= */

function portal() {
  render(`
    <section class="screen portal-screen">

      <div class="panel">

        <p class="eyebrow">
          La Gran Expedición
        </p>

        <h1 class="title">
          La Convocatoria<br>
          del Huevo Primigenio
        </h1>

        <button
          class="portal"
          data-action="open"
          aria-label="Abrir la Convocatoria"
        ></button>

        <p class="lead">
          Una antigua convocatoria ha vuelto a despertar.
        </p>

        ${button(
          "✦ Abrir la Convocatoria",
          "open"
        )}

      </div>

    </section>
  `);
}


/* =========================================================
   5. LORE Y RESPUESTA
   ========================================================= */

function lore() {
  const highlightedLore = LORE.replace(
    /(HACE TREINTA INVIERNOS|ESA SEÑAL FINALMENTE LLEGÓ|SOLO QUIENES PRESTEN ATENCIÓN HASTA AL MÁS PEQUEÑO DETALLE COMPRENDERÁN EL VERDADERO LEGADO DE LAS CRIATURAS PRIMIGENIAS)/g,
    "<strong>$1</strong>"
  );

  render(`
    <section class="screen">

      <article class="panel">

        <p class="eyebrow">
          La Convocatoria
        </p>

        <div class="lore">
          ${highlightedLore}
        </div>

        <p
          class="lead"
          style="margin-top:30px"
        >
          ¿Aceptarás el llamado de la Custodia?
        </p>

        <div class="button-row">

          ${button(
            "⚔️ Acepto la convocatoria",
            "attendance"
          )}

          ${button(
            "🌙 No podré asistir",
            "decline",
            "secondary danger"
          )}

        </div>

      </article>

    </section>
  `);
}


function attendance() {
  render(`
    <section class="screen">
      <div class="panel">

        <p class="eyebrow">
          La Gran Expedición
        </p>

        <p class="event-date">
          ✦ Viernes 7 de Agosto ✦
        </p>

        <h2 class="title">
          ¿Te unirás a la aventura?
        </h2>

        <p class="lead">
          La Custodia espera conocer quiénes responderán al llamado.
        </p>

        <div class="button-row">
          ${button(
            "Viajaré solo",
            "solo"
          )}

          ${button(
            "Viajaré acompañado",
            "pair",
            "secondary"
          )}
        </div>

      </div>
    </section>
  `);
}


/* =========================================================
   6. NOMBRE DEL AVENTURERO
   ========================================================= */

function nameScreen(second = false) {
  const label = second
    ? "Nombre del segundo aventurero"
    : "Nombre o apodo";

  render(`
    <section class="screen">

      <div class="panel">

        <p class="eyebrow">
          Las Runas escuchan
        </p>

        <h2 class="title">

          ${
            second
              ? "Todo gran viaje se fortalece con un compañero."
              : "Las Runas deben conocer tu nombre."
          }

        </h2>

        ${
          second
            ? `
              <p class="lead">
                Las Runas aún deben conocer a quien viajará junto a vos.
              </p>
            `
            : ""
        }

        <div class="field">

          <label for="name">
            ${label}
          </label>

          <input
            id="name"
            maxlength="80"
            autocomplete="name"
            placeholder="${label}"
            autofocus
          >

        </div>

        ${button(
          "Comenzar el Test",
          second
            ? "start-second"
            : "start-quiz"
        )}

      </div>

    </section>
  `);
}


/* =========================================================
   7. INICIO DEL TEST
   ========================================================= */

async function beginQuiz(second) {
  const input = document.getElementById("name");

  const name = input.value.trim();

  if (!name) {
    showToast(
      "Escribí tu nombre para continuar.",
      true
    );

    input.focus();

    return;
  }

  if (
    state.people.some(
      person =>
        person.name.toLowerCase() ===
        name.toLowerCase()
    )
  ) {
    showToast(
      "Cada aventurero debe tener un nombre diferente.",
      true
    );

    return;
  }

  const buttonElement =
    document.querySelector(
      '[data-action^="start"]'
    );

  buttonElement.disabled = true;

  buttonElement.textContent =
    "Consultando a la Custodia…";

  try {

    if (await checkName(name)) {

      render(`
        <section class="screen">

          <div class="panel">

            <h2 class="title">
              Este aventurero ya respondió
              a la convocatoria.
            </h2>

            <p class="lead">
              Si necesitás corregir tu registro,
              contactá a la Custodia.
            </p>

            ${button(
              "Volver",
              second
                ? "second-name"
                : "attendance"
            )}

          </div>

        </section>
      `);

      return;
    }

    state.activeName = name;

    state.answers = [];

    quiz(0);

  } catch (error) {

    showToast(
      error.message,
      true
    );

    buttonElement.disabled = false;

    buttonElement.textContent =
      "Comenzar el Test";
  }
}


/* =========================================================
   8. PREGUNTAS DEL TEST
   ========================================================= */

function quiz(index) {
  const question = QUIZ[index];

  const selected =
    state.answers[index];

  const choices =
    question.options
      .map(
        (option, optionIndex) => `
          <button
            class="choice ${
              selected === optionIndex
                ? "selected"
                : ""
            }"
            data-choice="${optionIndex}"
          >
            ${escape(option[0])}
          </button>
        `
      )
      .join("");

  render(`
    <section class="screen">

      <div class="panel">

        <p class="question-number">
          Pregunta ${index + 1} de 7
        </p>

        <div
          class="progress"
          aria-label="Progreso del test"
        >
          <i
            style="
              width:
              ${(index / 7) * 100}%
            "
          ></i>
        </div>

        <h2 class="question">
          ${question.text}
        </h2>

        <div class="choices">
          ${choices}
        </div>

        <div class="nav">

          ${
            index
              ? button(
                  "← Volver",
                  "back",
                  "secondary"
                )
              : "<span></span>"
          }

          ${button(
            index === 6
              ? "Revelar mi destino ✦"
              : "Continuar →",
            "next"
          )}

        </div>

      </div>

    </section>
  `);

  app.dataset.question = index;
}


function saveChoice(choice) {
  const questionIndex =
    Number(
      app.dataset.question
    );

  state.answers[
    questionIndex
  ] = choice;

  document
    .querySelectorAll(".choice")
    .forEach(element => {

      element.classList.toggle(
        "selected",
        Number(
          element.dataset.choice
        ) === choice
      );

    });
}


/* =========================================================
   9. FINALIZAR EL TEST
   ========================================================= */

async function finishQuiz() {
  const index =
    Number(
      app.dataset.question
    );

  if (
    state.answers[index] ===
    undefined
  ) {
    showToast(
      "Elegí una respuesta para continuar.",
      true
    );

    return;
  }

  if (index < 6) {
    quiz(index + 1);

    return;
  }

  const buttonElement =
    document.querySelector(
      '[data-action="next"]'
    );

  buttonElement.disabled = true;

  buttonElement.textContent =
    "Las Runas deliberan…";

  const candidate = {

    name:
      state.activeName,

    status:
      "Asiste",

    group:
      state.group,

    accompanied:
      state.accompanied
        ? "Sí"
        : "No",

    scores:
      calculateScores(
        state.answers
      ),

    desiredOrder:
      state.people[0]?.order,

    avoidClass:
      state.people[0]?.classKey

  };

  try {

    const result =
      await submitRecords([
        candidate
      ]);

    const person =
      result.records[0];

    state.people.push(
      person
    );

    reveal(person);

  } catch (error) {

    showToast(
      error.message,
      true
    );

    buttonElement.disabled = false;

    buttonElement.textContent =
      "Revelar mi destino ✦";
  }
}


/* =========================================================
   10. EMBLEMAS DE LAS ÓRDENES
   ========================================================= */

function emblem(orderKey) {
  const order = ORDERS[orderKey];

  const creature =
  orderKey === "firstRoar"
    ? `
        <img
          class="dinosaur-emblem"
          src="assets/orders/primer-rugido.png"
          alt="Orden del Primer Rugido"
        />
      `
    : `
        <img
          class="dinosaur-emblem"
          src="assets/orders/ultima-huella.png"
          alt="Orden de la Última Huella"
        />
      `;

  return `
    <div
      class="
        order-emblem
        ${order.type}
      "
      role="img"
      aria-label="Emblema de ${order.name}"
    >

      ${creature}

    </div>
  `;
}

/* =========================================================
   11. REVELACIÓN DE CLASE Y ORDEN
   ========================================================= */

function reveal(person) {

  const classData =
    CLASSES[
      person.classKey
    ];

  const order =
    ORDERS[
      person.order
    ];

  const isFirstOfPair =
    state.accompanied &&
    state.people.length === 1;

  render(`
    <section class="screen reveal">

      <div class="panel">

        <p class="eyebrow">
          Las Runas han escuchado
          tus respuestas…
        </p>

        <p class="lead">
          El destino de tu expedición
          ha sido revelado.
        </p>

        <div class="reveal-icon">
          ${classData.emoji}
        </div>

        <h2 class="class-name">
          ${classData.name}
        </h2>

        <p class="lead">
          ${classData.description}
        </p>

        <p
          class="eyebrow"
          style="margin-top:33px"
        >
          Has sido convocado a…
        </p>

        ${emblem(
          person.order
        )}

        <h3 class="order-name">
          ${order.name}
        </h3>

        <p class="motto">
          “${order.motto}”
        </p>

        ${
          isFirstOfPair

            ? button(
                "Conocer al segundo aventurero",
                "second-name"
              )

            : button(
                "Ver mi convocatoria",
                "final"
              )
        }

      </div>

    </section>
  `);
}


/* =========================================================
   12. CONVOCATORIA FINAL
   ========================================================= */

function finalScreen() {

  const cards =
    state.people
      .map(person => {

        const classData =
          CLASSES[
            person.classKey
          ];

        const order =
          ORDERS[
            person.order
          ];

        return `
          <article class="adventurer">

            <h3>
              ${escape(
                person.name
              )}
            </h3>

            <p>
              ${classData.emoji}
              <strong>
                ${classData.name}
              </strong>
            </p>

            <p>
              ${order.emoji}
              ${order.name}
            </p>

          </article>
        `;

      })
      .join("");

  const order =
    ORDERS[
      state.people[0].order
    ];

  render(`
    <section class="screen final">

      <div
        id="pdf-source"
        class="panel"
      >

        <p class="eyebrow">
          La Custodia ha hablado
        </p>

        <h1 class="title">
          ${EVENT_DETAILS.title}
        </h1>

        <p class="subtitle">
          ${EVENT_DETAILS.subtitle}
        </p>

        <p class="lead">
          Tu lugar en la expedición
          ha sido registrado.
        </p>

        ${
          !isLiveApi()

            ? `
              <p class="notice">
                Modo demostración:
                los datos no fueron enviados
                a la Custodia.
              </p>
            `

            : ""
        }

        ${emblem(
          state.people[0].order
        )}

        <h3
          class="order-name"
          style="text-align:center"
        >
          ${order.name}
        </h3>

        <p
          class="motto"
          style="text-align:center"
        >
          “${order.motto}”
        </p>

        <div class="adventure-grid">
          ${cards}
        </div>

        <div class="event-details">

          <div>
            📅 ${EVENT_DETAILS.date}
          </div>

          <div>
            🕘 ${EVENT_DETAILS.time}
          </div>

          <div>
            📍 ${EVENT_DETAILS.address}
          </div>

        </div>


        <div class="provisions">

          <span class="provisions-icon">
            🍻
          </span>

          <div>

            <h3>
              Provisiones de la Expedición
            </h3>

            <p>
              Toda gran expedición
              necesita provisiones.

              Recordá traer una bebida
              alcohólica para compartir
              durante la celebración.
            </p>

          </div>

        </div>


        <div class="footer-buttons">

          ${button(
            "📍 Consultar la ruta de la expedición",
            "map",
            "secondary"
          )}

          ${button(
            "📜 Descargar mi convocatoria",
            "pdf"
          )}

        </div>

      </div>

    </section>
  `);
}


/* =========================================================
   13. NO PODRÉ ASISTIR
   ========================================================= */

function declineScreen() {

  render(`
    <section class="screen">

      <div class="panel">

        <p class="eyebrow">
          Antes de partir
        </p>

        <h2 class="title">
          Antes de partir,
          deja tu nombre para que
          la Custodia conozca
          tu respuesta.
        </h2>

        <div class="field">

          <label for="name">
            Nombre o apodo
          </label>

          <input
            id="name"
            maxlength="80"
            autocomplete="name"
            placeholder="Nombre o apodo"
            autofocus
          >

        </div>

        ${button(
          "Confirmar mi respuesta",
          "confirm-decline"
        )}

      </div>

    </section>
  `);
}


async function confirmDecline() {

  const name =
    document
      .getElementById("name")
      .value
      .trim();

  if (!name) {

    showToast(
      "Escribí tu nombre para continuar.",
      true
    );

    return;
  }

  const buttonElement =
    document.querySelector(
      '[data-action="confirm-decline"]'
    );

  buttonElement.disabled = true;

  buttonElement.textContent =
    "Confirmando…";

  try {

    if (
      await checkName(name)
    ) {
      throw new Error(
        "Este aventurero ya respondió a la convocatoria."
      );
    }

    await submitRecords([
      {
        name,
        status:
          "No asiste",
        group:
          "Solo",
        accompanied:
          "No",
        scores:
          emptyScores()
      }
    ]);

    render(`
      <section class="screen">

        <div class="panel">

          <h2 class="title">
            La Custodia comprende.
          </h2>

          <p class="lead">

            No todas las rutas
            conducen a la misma expedición,
            pero las puertas de este reino
            permanecerán abiertas.

            <br><br>

            Espero encontrarte
            en una próxima aventura.

          </p>

          ${button(
            "Cerrar la Convocatoria",
            "close"
          )}

        </div>

      </section>
    `);

  } catch (error) {

    showToast(
      error.message,
      true
    );

    buttonElement.disabled = false;

    buttonElement.textContent =
      "Confirmar mi respuesta";
  }
}


/* =========================================================
   14. EVENTOS Y NAVEGACIÓN
   ========================================================= */

app.addEventListener(
  "click",
  event => {

    const target =
      event.target.closest(
        "[data-action], [data-choice]"
      );

    if (
      !target ||
      target.disabled
    ) {
      return;
    }


    /* Respuestas del test */

    if (
      target.dataset.choice !==
      undefined
    ) {

      saveChoice(
        Number(
          target.dataset.choice
        )
      );

      return;
    }


    const action =
      target.dataset.action;


    /* Abrir portal */

    if (
      action === "open"
    ) {

      document
        .querySelector(".portal")
        ?.classList.add("opening");

      setTimeout(
        lore,
        500
      );

    }


    /* Asistencia */

    else if (
      action === "attendance"
    ) {

      attendance();

    }


    else if (
      action === "decline"
    ) {

      declineScreen();

    }


    /* Solo o acompañado */

    else if (
      action === "solo" ||
      action === "pair"
    ) {

      state.accompanied =
        action === "pair";

      state.group =
        state.accompanied

          ? `Pareja-${
              String(
                Date.now()
              ).slice(-5)
            }`

          : "Solo";

      nameScreen();

    }


    /* Inicio del test */

    else if (
      action === "start-quiz"
    ) {

      beginQuiz(false);

    }


    else if (
      action === "start-second"
    ) {

      beginQuiz(true);

    }


    /* Navegación del test */

    else if (
      action === "next"
    ) {

      finishQuiz();

    }


    else if (
      action === "back"
    ) {

      quiz(
        Number(
          app.dataset.question
        ) - 1
      );

    }


    /* Segundo invitado */

    else if (
      action === "second-name"
    ) {

      nameScreen(true);

    }


    /* Convocatoria final */

    else if (
      action === "final"
    ) {

      finalScreen();

    }


    /* Abrir Google Maps */

    else if (
      action === "map"
    ) {

      window.open(
        EVENT_DETAILS.mapUrl,
        "_blank",
        "noopener"
      );

    }


    /* Descargar PDF */

    else if (
      action === "pdf"
    ) {

      downloadConvocation(
        state.people
      );

    }


    /* Confirmar ausencia */

    else if (
      action ===
      "confirm-decline"
    ) {

      confirmDecline();

    }


    /* Cerrar convocatoria */

    else if (
      action === "close"
    ) {

      portal();

    }

  }
);


/* =========================================================
   15. INICIO
   ========================================================= */

portal();