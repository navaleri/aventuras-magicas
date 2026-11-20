/* =====================================================================
   MUNDO 2 — EL REINO DE LA FANTASÍA (premium, 2,99€)
   Mismo formato de nodos que world1.js.

                          k_start
                    ┌────────┴────────┐
                 k_king            k_garden
                    │      ┌──────────┤
                 k_wizard ←┘       k_fairy
                    ├──────┐          │
                 k_bridge  └→ k_forest ←┘
                    │          │
                    │      k_unicorn
                    └───┬──────┘
                    k_mountain (cuello de botella)
                        │
                     k_cave
              ┌─────────┼──────────┐
          k_router   end_magic   end_sky
       (amigo dragón / unicornio / fiesta)
   ===================================================================== */
(globalThis.STORIES = globalThis.STORIES || {}).world2 = {
  id: "world2",
  order: 2,
  title: "El Reino de la Fantasía",
  emoji: "🧙‍♂️🐉",
  premium: true,
  price: "2,99€",
  start: "k_start",

  vars: { kind: 0, brave: 0, curious: 0, friend: null },

  items: {
    dust: { emoji: "✨", es: "Polvo mágico" },
    wand: { emoji: "🪄", es: "Varita mágica" }
  },
  friends: {
    unicorn: { emoji: "🦄", es: "Unicornio" }
  },

  chapters: {
    castle:   { name: "El castillo mágico",    color: "#9b59ff" },
    garden:   { name: "El jardín encantado",   color: "#2ecc71" },
    forest:   { name: "El bosque oscuro",      color: "#2e7d5b" },
    mountain: { name: "La montaña del dragón", color: "#e65100" },
    ending:   { name: "Final",                 color: "#ffc93c" }
  },

  nodes: {
    k_start: {
      ch: "castle", emoji: "🏰",
      en: "Welcome to the magic castle! The king looks sad.",
      es: "¡Bienvenido al castillo mágico! El rey parece triste.",
      quiz: { q: "¿Cómo está el rey?", options: ["Triste", "Contento", "Dormido"] },
      choices: [
        { emoji: "👑", en: "Talk to the king", es: "Hablar con el rey", to: "k_king", effects: { add: { kind: 1 } } },
        { emoji: "🌷", en: "Explore the garden", es: "Explorar el jardín", to: "k_garden", effects: { add: { curious: 1 } } }
      ]
    },
    k_king: {
      ch: "castle", emoji: "👑",
      en: "A dragon took the king's crown!",
      es: "¡Un dragón se llevó la corona del rey!",
      quiz: { q: "¿Qué se llevó el dragón?", options: ["La corona del rey", "Un pastel", "Un caballo"] },
      choices: [
        { emoji: "🧙‍♂️", en: "Find the wizard", es: "Buscar al mago", to: "k_wizard" },
        { emoji: "🌲", en: "Go to the forest", es: "Ir al bosque", to: "k_forest", effects: { add: { brave: 1 } } }
      ]
    },
    k_garden: {
      ch: "garden", emoji: "🌷",
      en: "The flowers can talk! They say: find the wizard.",
      es: "¡Las flores hablan! Dicen: busca al mago.",
      quiz: { q: "¿Qué pueden hacer las flores?", options: ["Hablar", "Volar", "Nadar"] },
      choices: [
        { emoji: "🧙‍♂️", en: "Find the wizard", es: "Buscar al mago", to: "k_wizard" },
        { emoji: "🧚", en: "Follow the fairy", es: "Seguir al hada", to: "k_fairy" }
      ]
    },
    k_fairy: {
      ch: "garden", emoji: "🧚",
      en: "A tiny fairy gives me magic dust.",
      es: "Un hada diminuta me da polvo mágico.",
      quiz: { q: "¿Qué me da el hada?", options: ["Polvo mágico", "Un libro", "Una manzana"] },
      choices: [
        { emoji: "🙏", en: "Say thank you", es: "Dar las gracias", to: "k_forest", effects: { give: "dust", add: { kind: 1 } } },
        { emoji: "🦋", en: "Fly to the forest", es: "Volar al bosque", to: "k_forest", effects: { give: "dust" } }
      ]
    },
    k_wizard: {
      ch: "castle", emoji: "🧙‍♂️",
      en: "The wizard has a long blue hat. He gives me a magic wand.",
      es: "El mago tiene un sombrero largo y azul. Me da una varita mágica.",
      quiz: { q: "¿Cómo es el sombrero del mago?", options: ["Largo y azul", "Corto y rojo", "Redondo y verde"] },
      choices: [
        { emoji: "🌲", en: "Go to the forest", es: "Ir al bosque", to: "k_forest", effects: { give: "wand" } },
        { emoji: "🌉", en: "Go to the bridge", es: "Ir al puente", to: "k_bridge", effects: { give: "wand" } }
      ]
    },
    k_forest: {
      ch: "forest", emoji: "🌲",
      en: "The forest is dark. I hear a soft sound.",
      es: "El bosque está oscuro. Oigo un sonido suave.",
      extras: [
        { if: { has: "dust" }, en: "Your magic dust glows like a lamp.", es: "Tu polvo mágico brilla como una lámpara." }
      ],
      quiz: { q: "¿Cómo está el bosque?", options: ["Oscuro", "Soleado", "Nevado"] },
      choices: [
        { emoji: "👂", en: "Follow the sound", es: "Seguir el sonido", to: "k_unicorn", effects: { add: { curious: 1 } } },
        { emoji: "🌉", en: "Go to the bridge", es: "Ir al puente", to: "k_bridge" }
      ]
    },
    k_unicorn: {
      ch: "forest", emoji: "🦄",
      en: "A white unicorn is stuck in the bushes.",
      es: "Un unicornio blanco está atrapado en los arbustos.",
      quiz: { q: "¿Dónde está el unicornio?", options: ["Atrapado en los arbustos", "En el río", "En el castillo"] },
      choices: [
        { emoji: "🤝", en: "Help the unicorn", es: "Ayudar al unicornio", to: "k_mountain", effects: { add: { kind: 1 }, set: { friend: "unicorn" } } },
        { emoji: "🏃", en: "Run to the bridge", es: "Correr al puente", to: "k_bridge" }
      ]
    },
    k_bridge: {
      ch: "forest", emoji: "🌉",
      en: "A troll sits on the bridge. He wants a cookie.",
      es: "Un trol está sentado en el puente. Quiere una galleta.",
      quiz: { q: "¿Qué quiere el trol?", options: ["Una galleta", "Una espada", "Un sombrero"] },
      choices: [
        { emoji: "🍪", en: "Share your cookie", es: "Compartir tu galleta", to: "k_mountain", effects: { add: { kind: 1 } } },
        { emoji: "😂", en: "Tell him a joke", es: "Contarle un chiste", to: "k_mountain", effects: { add: { brave: 1 } } }
      ]
    },
    k_mountain: {
      ch: "mountain", emoji: "⛰️",
      en: "The dragon's cave is at the top of the mountain.",
      es: "La cueva del dragón está en lo alto de la montaña.",
      extras: [
        { if: { var: "friend", eq: "unicorn" }, en: "Your unicorn flies you to the top!", es: "¡Tu unicornio te lleva volando a la cima!" }
      ],
      quiz: { q: "¿Dónde está la cueva del dragón?", options: ["En lo alto de la montaña", "Bajo el mar", "En el jardín"] },
      choices: [
        { emoji: "🧗", en: "Climb up fast", es: "Subir rápido", to: "k_cave", effects: { add: { brave: 1 } } },
        { emoji: "🚶", en: "Walk slowly", es: "Caminar despacio", to: "k_cave" }
      ]
    },
    k_cave: {
      ch: "mountain", emoji: "🐉",
      en: "The dragon has the crown. He looks very lonely.",
      es: "El dragón tiene la corona. Parece muy solo.",
      quiz: { q: "¿Cómo se siente el dragón?", options: ["Solo", "Enfadado", "Muy feliz"] },
      choices: [
        { emoji: "💬", en: "Talk to the dragon", es: "Hablar con el dragón", to: "k_router" },
        { emoji: "🪄", en: "Wave the magic wand", es: "Agitar la varita", to: "end_magic",
          if: { has: "wand" }, hint: "Necesitas la varita del mago 🪄" },
        { emoji: "✨", en: "Throw the magic dust", es: "Lanzar el polvo mágico", to: "end_sky",
          if: { has: "dust" }, hint: "Necesitas el polvo del hada ✨" }
      ]
    },
    k_router: {
      route: [
        { if: { var: "kind", gte: 2 }, to: "end_dragonfriend" },
        { if: { var: "friend", eq: "unicorn" }, to: "end_unicorn" },
        { to: "end_crown" }
      ]
    },

    end_dragonfriend: {
      ch: "ending", emoji: "🐲", ending: { title: "Amigo del Dragón" },
      en: "The dragon gives back the crown. Now he is your friend!",
      es: "El dragón devuelve la corona. ¡Ahora es tu amigo!"
    },
    end_unicorn: {
      ch: "ending", emoji: "🦄", ending: { title: "Jinete del Unicornio" },
      en: "You ride your unicorn back to the castle with the crown!",
      es: "¡Vuelves al castillo montado en tu unicornio con la corona!"
    },
    end_crown: {
      ch: "ending", emoji: "👑", ending: { title: "La Gran Fiesta" },
      en: "The king gets his crown back. He makes a big party for you!",
      es: "El rey recupera su corona. ¡Hace una gran fiesta para ti!"
    },
    end_magic: {
      ch: "ending", emoji: "🪄", ending: { title: "Aprendiz de Mago" },
      en: "Your wand makes the crown fly back to the king!",
      es: "¡Tu varita hace volar la corona de vuelta al rey!"
    },
    end_sky: {
      ch: "ending", emoji: "🌈", ending: { title: "Vuelo Mágico" },
      en: "The magic dust makes everyone fly. The dragon too!",
      es: "El polvo mágico hace volar a todos. ¡También al dragón!"
    }
  }
};
