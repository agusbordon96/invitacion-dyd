/* Preguntas y afinidades editables. Cada respuesta suma a las clases indicadas. */
const CLASSES = {
  guardian: { name: "GUARDIÁN", emoji: "🛡️", description: "Los Guardianes protegen al grupo incluso en los momentos más difíciles." },
  explorer: { name: "EXPLORADOR", emoji: "🏹", description: "Los Exploradores nunca se rinden. Aprenden del primer intento y encuentran un nuevo camino." },
  rogue: { name: "PÍCARO", emoji: "🗡️", description: "Los Pícaros siempre encuentran una forma inesperada de inclinar la balanza." },
  druid: { name: "DRUIDA", emoji: "🌿", description: "Los Druidas mantienen un vínculo especial con la naturaleza y con las antiguas bestias." },
  bard: { name: "BARDO", emoji: "🎵", description: "Los Bardos no buscan el protagonismo: hacen que quienes los rodean brillen aún más." },
  scholar: { name: "ERUDITO", emoji: "📖", description: "Los Eruditos observan, analizan y encuentran respuestas donde otros solo ven preguntas." }
};

const ORDERS = {
  firstRoar: { name: "ORDEN DEL PRIMER RUGIDO", emoji: "🦖", motto: "Donde despierta la fuerza de los antiguos.", type: "roar" },
  lastTrail: { name: "ORDEN DE LA ÚLTIMA HUELLA", emoji: "🦕", motto: "Donde perdura la memoria de los antiguos.", type: "trail" }
};

const QUIZ = [
  { text: "Tenés que organizar una salida con varias personas. ¿Qué hacés primero?", options: [
    ["Me aseguro de que todos sepan qué hacer y que nadie quede afuera.", { guardian: 2, bard: 1 }],
    ["Pienso una idea original para que la salida sea memorable.", { bard: 2, rogue: 1 }],
    ["Veo qué falta y empiezo a resolver sobre la marcha.", { explorer: 2, rogue: 1 }]
  ]},
  { text: "Llegás a un lugar que nunca visitaste. ¿Qué despierta primero tu curiosidad?", options: [
    ["Su historia y todo lo que podría aprender sobre él.", { scholar: 2, druid: 1 }],
    ["Los rincones que todavía no conozco.", { explorer: 2, rogue: 1 }],
    ["Las personas y las historias que parecen esconder.", { bard: 2, rogue: 1 }]
  ]},
  { text: "Un amigo te cuenta que está pasando por un momento difícil. ¿Cómo solés ayudar?", options: [
    ["Me quedo a su lado y trato de acompañarlo.", { guardian: 2, druid: 1 }],
    ["Le hago preguntas para entender bien qué está ocurriendo.", { scholar: 2, guardian: 1 }],
    ["Intento cambiarle el ánimo o ayudarlo a mirar las cosas desde otro lugar.", { bard: 2, explorer: 1 }]
  ]},
  { text: "Encontrás un objeto extraño y nadie sabe de dónde salió. ¿Qué hacés?", options: [
    ["Lo observo con cuidado antes de tocarlo.", { guardian: 1, scholar: 2 }],
    ["Intento descubrir cómo funciona o para qué sirve.", { scholar: 2, explorer: 1 }],
    ["Me lo guardo… después averiguo qué era.", { rogue: 2, explorer: 1 }]
  ]},
  { text: "Tenés una tarde libre sin ningún plan. ¿Qué te tienta más?", options: [
    ["Salir, recorrer algún lugar o probar algo nuevo.", { explorer: 2, rogue: 1 }],
    ["Hacer algo creativo o compartir tiempo con otras personas.", { bard: 2, guardian: 1 }],
    ["Descansar, disfrutar del momento y dejar que el día siga su curso.", { druid: 2, guardian: 1 }]
  ]},
  { text: "En una conversación grupal aparecen opiniones muy distintas. ¿Qué suele pasar con vos?", options: [
    ["Intento que todos puedan expresarse y que nadie quede afuera.", { guardian: 2, bard: 1 }],
    ["Escucho los argumentos y trato de encontrar qué tiene más sentido.", { scholar: 2, explorer: 1 }],
    ["Observo un rato y hablo cuando encuentro el momento justo.", { rogue: 2, druid: 1 }]
  ]},
  { text: "¿Qué cualidad valorás más?", options: [
    ["La lealtad y la capacidad de cuidar a otros.", { guardian: 2, druid: 1 }],
    ["La curiosidad y las ganas de aprender.", { scholar: 2, explorer: 1 }],
    ["La creatividad y la capacidad de adaptarse.", { bard: 1, rogue: 2 }]
  ]}
];

function emptyScores() { return Object.fromEntries(Object.keys(CLASSES).map(key => [key, 0])); }
function calculateScores(answers) {
  const scores = emptyScores();
  answers.forEach((answer, index) => {
    const affinity = QUIZ[index].options[answer]?.[1] || {};
    Object.entries(affinity).forEach(([key, value]) => scores[key] += value);
  });
  return scores;
}
