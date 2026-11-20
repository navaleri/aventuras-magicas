/* =====================================================================
   MUNDO 1 — EL VIAJE EN EL TIEMPO (gratis)
   ---------------------------------------------------------------------
   FORMATO DE UN NODO
   {
     ch:      capítulo (color y nombre del lugar, ver "chapters")
     emoji:   ilustración gigante
     en / es: frase en inglés y su traducción
     extras:  [{ if, en, es }]  frases que solo aparecen según las vars
     quiz:    { q, options:[correcta, incorrecta, incorrecta] }
     choices: [{ emoji, en, es, to, effects, if, hint }]
              - effects: { add:{kind:1}, set:{friend:"dino"}, give:"key" }
              - if:      condición para poder elegirla
              - hint:    si existe, la opción se muestra con 🔒 cuando no
                         se cumple la condición (invita a rejugar)
     route:   [{ if, to }]  nodo router invisible (elige destino solo)
     ending:  { title }     nodo final
   }

   MAPA DE LA RED (simplificado)

                         start
                 ┌─────────┴─────────┐
            PASADO 🦖             FUTURO 🚀
      p_arrive → p_help/volcano    f_arrive → f_fix/cars
      → tree/tracks/trex/river     → shop/lab/alarm/park
            p_nest (hub)              f_tower (hub)
                 └─────────┬─────────┘
                        portal  (cuello de botella)
            ┌──────────────┼───────────────┐
       DESIERTO 🏜️      LUNA 🌙      MAR 🌊 (secreto: necesita 💎)
            └──────────────┼───────────────┘
                        finale  (cuello de botella)
                   ┌───────┴────────┐
               fin_router      end_explorer
         (elige final según amigo, objetos y puntos)
   ===================================================================== */
(globalThis.STORIES = globalThis.STORIES || {}).world1 = {
  id: "world1",
  order: 1,
  title: "El Viaje en el Tiempo",
  emoji: "🦖🚀",
  premium: false,
  start: "start",

  /* Variables de la partida: puntos de personalidad y amigo */
  vars: { kind: 0, brave: 0, curious: 0, friend: null },

  /* Objetos que se pueden conseguir */
  items: {
    crystal: { emoji: "💎", es: "Cristal brillante" },
    bone:    { emoji: "🦴", es: "Hueso de dinosaurio" },
    battery: { emoji: "🔋", es: "Pila" },
    key:     { emoji: "🗝️", es: "Llave dorada" },
    star:    { emoji: "⭐", es: "Estrella" },
    pearl:   { emoji: "🦪", es: "Perla mágica" }
  },
  friends: {
    dino:  { emoji: "🦕", es: "Dino" },
    robot: { emoji: "🤖", es: "Bip" }
  },

  chapters: {
    start:  { name: "El taller del abuelo",       color: "#ff9f43" },
    past:   { name: "Jungla de los dinosaurios",  color: "#2ecc71" },
    future: { name: "Ciudad del futuro",          color: "#3fa9ff" },
    portal: { name: "El portal mágico",           color: "#9b59ff" },
    desert: { name: "Desierto antiguo",           color: "#f4a62a" },
    space:  { name: "La Luna y las estrellas",    color: "#5c6bc0" },
    ocean:  { name: "El fondo del mar (secreto)", color: "#00bcd4" },
    finale: { name: "De vuelta al taller",        color: "#ff6f91" },
    ending: { name: "Final",                      color: "#ffc93c" }
  },

  nodes: {
    /* ============================ INICIO ============================ */
    start: {
      ch: "start", emoji: "🕰️",
      en: "Grandpa has a magic time machine. Where do we go?",
      es: "El abuelo tiene una máquina del tiempo mágica. ¿A dónde vamos?",
      quiz: { q: "¿Qué tiene el abuelo?", options: ["Una máquina del tiempo", "Un barco pirata", "Un perro"] },
      choices: [
        { emoji: "🦖", en: "To the past", es: "Al pasado", to: "p_arrive" },
        { emoji: "🚀", en: "To the future", es: "Al futuro", to: "f_arrive" }
      ]
    },

    /* ======================= PASADO: DINOSAURIOS ======================= */
    p_arrive: {
      ch: "past", emoji: "🦕",
      en: "We land in a jungle. A baby dinosaur is crying.",
      es: "Aterrizamos en una jungla. Un bebé dinosaurio está llorando.",
      quiz: { q: "¿Qué hace el bebé dinosaurio?", options: ["Llora", "Se ríe", "Duerme"] },
      choices: [
        { emoji: "🤝", en: "Help the baby", es: "Ayudar al bebé", to: "p_help", effects: { add: { kind: 1 }, set: { helped_baby: true } } },
        { emoji: "🌋", en: "Go to the volcano", es: "Ir al volcán", to: "p_volcano", effects: { add: { brave: 1 } } }
      ]
    },
    p_help: {
      ch: "past", emoji: "🥚",
      en: "The baby lost its mom. Let's find her!",
      es: "El bebé ha perdido a su mamá. ¡Vamos a buscarla!",
      quiz: { q: "¿A quién ha perdido el bebé?", options: ["A su mamá", "A su pelota", "A su amigo el pez"] },
      choices: [
        { emoji: "👣", en: "Follow the footprints", es: "Seguir las huellas", to: "p_tracks" },
        { emoji: "🌴", en: "Climb a tree", es: "Subir a un árbol", to: "p_tree", effects: { add: { curious: 1 } } }
      ]
    },
    p_volcano: {
      ch: "past", emoji: "🌋",
      en: "The volcano is very hot. A shiny crystal is on a rock.",
      es: "El volcán está muy caliente. Hay un cristal brillante en una roca.",
      quiz: { q: "¿Qué brilla en la roca?", options: ["Un cristal", "Una moneda", "Una estrella"] },
      choices: [
        { emoji: "💎", en: "Take the crystal", es: "Coger el cristal", to: "p_tree", effects: { give: "crystal", add: { brave: 1 } } },
        { emoji: "🏃", en: "Run away", es: "Salir corriendo", to: "p_tracks" }
      ]
    },
    p_tree: {
      ch: "past", emoji: "🌴",
      en: "From the tree, I can see a nest and a big T-Rex!",
      es: "Desde el árbol veo un nido y un T-Rex enorme.",
      quiz: { q: "¿Qué ves desde el árbol?", options: ["Un nido y un T-Rex", "Un barco y un faro", "Una casa y un coche"] },
      choices: [
        { emoji: "🦖", en: "Talk to the T-Rex", es: "Hablar con el T-Rex", to: "p_trex", effects: { add: { brave: 1 } } },
        { emoji: "🪺", en: "Go to the nest", es: "Ir al nido", to: "p_nest" }
      ]
    },
    p_tracks: {
      ch: "past", emoji: "👣",
      en: "The big footprints go to a blue river.",
      es: "Las huellas grandes llevan a un río azul.",
      quiz: { q: "¿A dónde llevan las huellas?", options: ["A un río azul", "A una cueva", "A una montaña"] },
      choices: [
        { emoji: "🐢", en: "Ride a turtle", es: "Subir a una tortuga", to: "p_river", effects: { add: { curious: 1 } } },
        { emoji: "🦖", en: "Follow the roar", es: "Seguir el rugido", to: "p_trex", effects: { add: { brave: 1 } } }
      ]
    },
    p_trex: {
      ch: "past", emoji: "🦖",
      en: "The T-Rex roars. He is not angry. He is hungry!",
      es: "El T-Rex ruge. No está enfadado. ¡Tiene hambre!",
      quiz: { q: "¿Cómo está el T-Rex?", options: ["Tiene hambre", "Está enfadado", "Tiene sueño"] },
      choices: [
        { emoji: "🥪", en: "Give him your sandwich", es: "Darle tu bocadillo", to: "p_nest", effects: { add: { kind: 1 } } },
        { emoji: "🪨", en: "Hide behind a rock", es: "Esconderte tras una roca", to: "p_river" }
      ]
    },
    p_river: {
      ch: "past", emoji: "🐢",
      en: "A big turtle takes us across the river.",
      es: "Una tortuga grande nos cruza el río.",
      quiz: { q: "¿Quién nos ayuda a cruzar el río?", options: ["Una tortuga grande", "Un pez", "Un pájaro"] },
      choices: [
        { emoji: "🪺", en: "Go to the nest", es: "Ir al nido", to: "p_nest" },
        { emoji: "🦴", en: "Dig in the sand", es: "Excavar en la arena", to: "p_nest", effects: { give: "bone", add: { curious: 1 } } }
      ]
    },
    /* HUB del pasado: el texto cambia si ayudaste al bebé */
    p_nest: {
      ch: "past", emoji: "🪺",
      en: "We find the nest. Mom dinosaur is here!",
      es: "Encontramos el nido. ¡Mamá dinosaurio está aquí!",
      extras: [
        { if: { var: "helped_baby" }, en: "The baby is so happy! It wants to be your friend.", es: "¡El bebé está feliz! Quiere ser tu amigo." },
        { if: { has: "bone" }, en: "Mom dinosaur likes your big bone.", es: "A mamá dinosaurio le gusta tu hueso grande." }
      ],
      quiz: { q: "¿Quién está en el nido?", options: ["Mamá dinosaurio", "Un robot", "Un gato"] },
      choices: [
        { emoji: "💚", en: "Take the baby with you", es: "Llevarte al bebé", to: "portal",
          if: { var: "helped_baby" }, hint: "Ayuda al bebé al principio 🤝", effects: { set: { friend: "dino" } } },
        { emoji: "👋", en: "Say goodbye", es: "Decir adiós", to: "portal" }
      ]
    },

    /* ========================= FUTURO: ROBOTS ========================= */
    f_arrive: {
      ch: "future", emoji: "🏙️",
      en: "Zoom! A city in the sky. A little robot cannot fly.",
      es: "¡Zum! Una ciudad en el cielo. Un robot pequeño no puede volar.",
      quiz: { q: "¿Qué no puede hacer el robot?", options: ["Volar", "Hablar", "Comer"] },
      choices: [
        { emoji: "🔧", en: "Help the robot", es: "Ayudar al robot", to: "f_fix", effects: { add: { kind: 1 }, set: { helped_robot: true } } },
        { emoji: "🛸", en: "See the flying cars", es: "Ver los coches voladores", to: "f_cars", effects: { add: { curious: 1 } } }
      ]
    },
    f_fix: {
      ch: "future", emoji: "🔧",
      en: "His name is Bip. He needs a new battery.",
      es: "Se llama Bip. Necesita una pila nueva.",
      quiz: { q: "¿Cómo se llama el robot?", options: ["Bip", "Bop", "Max"] },
      choices: [
        { emoji: "🛒", en: "Go to the shop", es: "Ir a la tienda", to: "f_shop" },
        { emoji: "🔬", en: "Go to the lab", es: "Ir al laboratorio", to: "f_lab", effects: { add: { curious: 1 } } }
      ]
    },
    f_cars: {
      ch: "future", emoji: "🛸",
      en: "A flying car stops. The driver is a cat!",
      es: "Un coche volador se para. ¡El conductor es un gato!",
      quiz: { q: "¿Quién conduce el coche volador?", options: ["Un gato", "Un perro", "Un robot"] },
      choices: [
        { emoji: "🛒", en: "Ride to the shop", es: "Ir a la tienda", to: "f_shop" },
        { emoji: "🎡", en: "Ride to the park", es: "Ir al parque", to: "f_park" }
      ]
    },
    f_shop: {
      ch: "future", emoji: "🛒",
      en: "The shop has batteries and ice cream.",
      es: "La tienda tiene pilas y helados.",
      quiz: { q: "¿Qué hay en la tienda?", options: ["Pilas y helados", "Zapatos y gorros", "Libros y lápices"] },
      choices: [
        { emoji: "🔋", en: "Buy a battery", es: "Comprar una pila", to: "f_tower", effects: { give: "battery" } },
        { emoji: "🍦", en: "Buy an ice cream", es: "Comprar un helado", to: "f_park" }
      ]
    },
    f_lab: {
      ch: "future", emoji: "🔬",
      en: "The lab has a green button and a red button.",
      es: "El laboratorio tiene un botón verde y un botón rojo.",
      quiz: { q: "¿Qué botones hay en el laboratorio?", options: ["Uno verde y uno rojo", "Dos azules", "Uno amarillo"] },
      choices: [
        { emoji: "🟢", en: "Press the green button", es: "Pulsar el botón verde", to: "f_tower", effects: { give: "battery" } },
        { emoji: "🔴", en: "Press the red button", es: "Pulsar el botón rojo", to: "f_alarm", effects: { add: { brave: 1 } } }
      ]
    },
    f_alarm: {
      ch: "future", emoji: "🚨",
      en: "Alarm! Ten robots come... but they just want to dance!",
      es: "¡Alarma! Vienen diez robots... ¡pero solo quieren bailar!",
      quiz: { q: "¿Qué quieren hacer los robots?", options: ["Bailar", "Pelear", "Dormir"] },
      choices: [
        { emoji: "💃", en: "Dance with them", es: "Bailar con ellos", to: "f_park", effects: { add: { brave: 1 } } },
        { emoji: "🔋", en: "Ask for a battery", es: "Pedir una pila", to: "f_tower", effects: { give: "battery" } }
      ]
    },
    f_park: {
      ch: "future", emoji: "🎡",
      en: "The park has a giant wheel. We can see the whole city.",
      es: "El parque tiene una noria gigante. Vemos toda la ciudad.",
      quiz: { q: "¿Qué hay en el parque?", options: ["Una noria gigante", "Un río", "Un volcán"] },
      choices: [
        { emoji: "🗼", en: "Go to the tower", es: "Ir a la torre", to: "f_tower" },
        { emoji: "🤗", en: "Hug a sad robot", es: "Abrazar a un robot triste", to: "f_tower", effects: { add: { kind: 1 } } }
      ]
    },
    /* HUB del futuro: Bip solo viene contigo si le ayudaste y tienes pila */
    f_tower: {
      ch: "future", emoji: "🗼",
      en: "The time tower is very tall. Our machine is waiting.",
      es: "La torre del tiempo es muy alta. Nuestra máquina nos espera.",
      extras: [
        { if: { all: [{ var: "helped_robot" }, { has: "battery" }] }, en: "Bip gets the battery. He can fly now!", es: "Bip recibe la pila. ¡Ya puede volar!" },
        { if: { all: [{ var: "helped_robot" }, { not: { has: "battery" } }] }, en: "Bip is still sad. He has no battery.", es: "Bip sigue triste. No tiene pila." }
      ],
      quiz: { q: "¿Cómo es la torre del tiempo?", options: ["Muy alta", "Muy pequeña", "De chocolate"] },
      choices: [
        { emoji: "🤖", en: "Fly with Bip", es: "Volar con Bip", to: "portal",
          if: { all: [{ var: "helped_robot" }, { has: "battery" }] }, hint: "Ayuda a Bip y consigue una 🔋", effects: { set: { friend: "robot" } } },
        { emoji: "👋", en: "Say goodbye", es: "Decir adiós", to: "portal" }
      ]
    },

    /* ================= CUELLO DE BOTELLA: EL PORTAL ================= */
    portal: {
      ch: "portal", emoji: "🌀",
      en: "Oh no! The machine breaks. A purple portal opens!",
      es: "¡Oh, no! La máquina se rompe. ¡Se abre un portal morado!",
      extras: [
        { if: { var: "friend", eq: "dino" }, en: "Your dino friend jumps in with you.", es: "Tu amigo dino salta contigo." },
        { if: { var: "friend", eq: "robot" }, en: "Bip holds your hand.", es: "Bip te da la mano." },
        { if: { has: "crystal" }, en: "Your crystal starts to shine!", es: "¡Tu cristal empieza a brillar!" }
      ],
      quiz: { q: "¿De qué color es el portal?", options: ["Morado", "Verde", "Naranja"] },
      choices: [
        { emoji: "🏜️", en: "Jump to the desert", es: "Saltar al desierto", to: "d_arrive" },
        { emoji: "🌙", en: "Jump to the Moon", es: "Saltar a la Luna", to: "s_arrive" },
        { emoji: "💎", en: "Use the crystal", es: "Usar el cristal", to: "o_ocean",
          if: { has: "crystal" }, hint: "Necesitas el cristal 💎 del volcán" }
      ]
    },

    /* ========================= DESIERTO ANTIGUO ========================= */
    d_arrive: {
      ch: "desert", emoji: "🏜️",
      en: "Hot sand everywhere! I see a pyramid and a camel.",
      es: "¡Arena caliente por todas partes! Veo una pirámide y un camello.",
      quiz: { q: "¿Qué ves en el desierto?", options: ["Una pirámide y un camello", "Un barco y un pez", "Nieve y un pingüino"] },
      choices: [
        { emoji: "🐫", en: "Go to the camel", es: "Ir al camello", to: "d_camel" },
        { emoji: "🔺", en: "Run to the pyramid", es: "Correr a la pirámide", to: "d_pyramid", effects: { add: { brave: 1 } } }
      ]
    },
    d_camel: {
      ch: "desert", emoji: "🐫",
      en: "The camel is very thirsty.",
      es: "El camello tiene mucha sed.",
      quiz: { q: "¿Qué le pasa al camello?", options: ["Tiene sed", "Tiene frío", "Tiene sueño"] },
      choices: [
        { emoji: "💧", en: "Find water for him", es: "Buscarle agua", to: "d_oasis", effects: { add: { kind: 1 } } },
        { emoji: "🐪", en: "Ride the camel", es: "Montar en el camello", to: "d_pyramid" }
      ]
    },
    d_oasis: {
      ch: "desert", emoji: "🏝️",
      en: "We find an oasis. A golden key is in the water!",
      es: "Encontramos un oasis. ¡Hay una llave dorada en el agua!",
      quiz: { q: "¿Qué hay en el agua?", options: ["Una llave dorada", "Un pez rojo", "Una piedra"] },
      choices: [
        { emoji: "🗝️", en: "Take the key", es: "Coger la llave", to: "d_pyramid", effects: { give: "key" } },
        { emoji: "🏊", en: "Swim and take the key", es: "Nadar y coger la llave", to: "d_pyramid", effects: { give: "key", add: { curious: 1 } } }
      ]
    },
    d_pyramid: {
      ch: "desert", emoji: "🔺",
      en: "The pyramid door is closed.",
      es: "La puerta de la pirámide está cerrada.",
      extras: [
        { if: { has: "key" }, en: "Your golden key fits!", es: "¡Tu llave dorada encaja!" },
        { if: { var: "friend", eq: "dino" }, en: "Your dino wants to push the door.", es: "Tu dino quiere empujar la puerta." }
      ],
      quiz: { q: "¿Cómo está la puerta de la pirámide?", options: ["Cerrada", "Abierta", "Rota"] },
      choices: [
        { emoji: "🗝️", en: "Open it with the key", es: "Abrir con la llave", to: "d_treasure",
          if: { has: "key" }, hint: "Necesitas la llave dorada 🗝️" },
        { emoji: "✊", en: "Knock on the door", es: "Llamar a la puerta", to: "d_cat" }
      ]
    },
    d_cat: {
      ch: "desert", emoji: "🐈‍⬛",
      en: "A black cat opens a secret door. Meow!",
      es: "Un gato negro abre una puerta secreta. ¡Miau!",
      quiz: { q: "¿Qué abre el gato negro?", options: ["Una puerta secreta", "Una ventana", "Una caja"] },
      choices: [
        { emoji: "🫳", en: "Pet the cat", es: "Acariciar al gato", to: "d_treasure", effects: { add: { kind: 1 } } },
        { emoji: "🏃", en: "Run inside", es: "Entrar corriendo", to: "d_treasure", effects: { add: { brave: 1 } } }
      ]
    },
    d_treasure: {
      ch: "desert", emoji: "🏺",
      en: "Gold everywhere! And a piece of our time machine!",
      es: "¡Oro por todas partes! ¡Y una pieza de nuestra máquina del tiempo!",
      quiz: { q: "¿Qué encontramos además del oro?", options: ["Una pieza de la máquina", "Un helado", "Un zapato"] },
      choices: [
        { emoji: "⚙️", en: "Take the piece", es: "Coger la pieza", to: "finale" },
        { emoji: "🪙", en: "Leave the gold, take the piece", es: "Dejar el oro y coger la pieza", to: "finale", effects: { add: { kind: 1 } } }
      ]
    },

    /* ========================= LA LUNA ========================= */
    s_arrive: {
      ch: "space", emoji: "🌙",
      en: "We are on the Moon! We can jump very high.",
      es: "¡Estamos en la Luna! Podemos saltar muy alto.",
      quiz: { q: "¿Dónde estamos?", options: ["En la Luna", "En el mar", "En el colegio"] },
      choices: [
        { emoji: "👩‍🚀", en: "Talk to the astronaut", es: "Hablar con la astronauta", to: "s_astro" },
        { emoji: "🕳️", en: "Look in the crater", es: "Mirar en el cráter", to: "s_crater", effects: { add: { brave: 1 } } }
      ]
    },
    s_astro: {
      ch: "space", emoji: "👩‍🚀",
      en: "An astronaut needs help. Her antenna is broken.",
      es: "Una astronauta necesita ayuda. Su antena está rota.",
      quiz: { q: "¿Qué está roto?", options: ["La antena", "El cohete", "El casco"] },
      choices: [
        { emoji: "🔧", en: "Fix the antenna", es: "Arreglar la antena", to: "s_station", effects: { add: { kind: 1 } } },
        { emoji: "🔭", en: "Watch the stars", es: "Mirar las estrellas", to: "s_stars", effects: { add: { curious: 1 } } }
      ]
    },
    s_crater: {
      ch: "space", emoji: "🕳️",
      en: "Something glows in the deep crater.",
      es: "Algo brilla dentro del cráter profundo.",
      quiz: { q: "¿Qué pasa en el cráter?", options: ["Algo brilla", "Está lloviendo", "Hay un río"] },
      choices: [
        { emoji: "🧗", en: "Climb down", es: "Bajar al cráter", to: "s_alien", effects: { add: { brave: 1 } } },
        { emoji: "🔭", en: "Watch the stars", es: "Mirar las estrellas", to: "s_stars" }
      ]
    },
    s_alien: {
      ch: "space", emoji: "👽",
      en: "A friendly alien says hello. He gives me a star!",
      es: "Un extraterrestre simpático me saluda. ¡Me regala una estrella!",
      quiz: { q: "¿Qué me regala el extraterrestre?", options: ["Una estrella", "Una flor", "Una pizza"] },
      choices: [
        { emoji: "🙏", en: "Say thank you", es: "Dar las gracias", to: "s_station", effects: { give: "star", add: { kind: 1 } } },
        { emoji: "🛸", en: "Ride his spaceship", es: "Subir a su nave", to: "s_station", effects: { give: "star", add: { brave: 1 } } }
      ]
    },
    s_stars: {
      ch: "space", emoji: "✨",
      en: "I count the stars: one, two, three, four!",
      es: "Cuento las estrellas: ¡una, dos, tres, cuatro!",
      quiz: { q: "¿Cuántas estrellas cuento?", options: ["Cuatro", "Tres", "Diez"] },
      choices: [
        { emoji: "🛰️", en: "Fly to the station", es: "Volar a la estación", to: "s_station" },
        { emoji: "🪐", en: "Visit Saturn", es: "Visitar Saturno", to: "s_saturn", effects: { add: { curious: 1 } } }
      ]
    },
    s_saturn: {
      ch: "space", emoji: "🪐",
      en: "Saturn has big rings. They are made of ice!",
      es: "Saturno tiene anillos grandes. ¡Son de hielo!",
      quiz: { q: "¿De qué son los anillos de Saturno?", options: ["De hielo", "De fuego", "De chocolate"] },
      choices: [
        { emoji: "⛸️", en: "Skate on the rings", es: "Patinar en los anillos", to: "s_station", effects: { add: { brave: 1 } } },
        { emoji: "🛰️", en: "Fly to the station", es: "Volar a la estación", to: "s_station" }
      ]
    },
    s_station: {
      ch: "space", emoji: "🛰️",
      en: "The space station has a piece of our time machine!",
      es: "¡La estación espacial tiene una pieza de nuestra máquina!",
      extras: [
        { if: { has: "star" }, en: "Your star lights the way.", es: "Tu estrella ilumina el camino." }
      ],
      quiz: { q: "¿Qué hay en la estación espacial?", options: ["Una pieza de la máquina", "Un perro", "Una piscina"] },
      choices: [
        { emoji: "⚙️", en: "Take the piece", es: "Coger la pieza", to: "finale" },
        { emoji: "👋", en: "Wave to the Earth", es: "Saludar a la Tierra", to: "finale", effects: { add: { curious: 1 } } }
      ]
    },

    /* ================ RUTA SECRETA: FONDO DEL MAR (💎) ================ */
    o_ocean: {
      ch: "ocean", emoji: "🌊",
      en: "The crystal shines. Now we are under the sea!",
      es: "El cristal brilla. ¡Ahora estamos bajo el mar!",
      quiz: { q: "¿Dónde estamos ahora?", options: ["Bajo el mar", "En la Luna", "En el desierto"] },
      choices: [
        { emoji: "🐙", en: "Follow the octopus", es: "Seguir al pulpo", to: "o_octopus", effects: { add: { curious: 1 } } },
        { emoji: "🐋", en: "Swim to the whale", es: "Nadar hacia la ballena", to: "o_whale", effects: { add: { brave: 1 } } }
      ]
    },
    o_octopus: {
      ch: "ocean", emoji: "🐙",
      en: "The octopus has eight arms. It gives me a pearl.",
      es: "El pulpo tiene ocho brazos. Me regala una perla.",
      quiz: { q: "¿Cuántos brazos tiene el pulpo?", options: ["Ocho", "Cuatro", "Dos"] },
      choices: [
        { emoji: "🙏", en: "Say thank you", es: "Dar las gracias", to: "o_whale", effects: { give: "pearl", add: { kind: 1 } } },
        { emoji: "🏊", en: "Swim fast to the whale", es: "Nadar rápido a la ballena", to: "o_whale", effects: { give: "pearl" } }
      ]
    },
    o_whale: {
      ch: "ocean", emoji: "🐋",
      en: "The whale sings a song. Under her fin is a piece of our machine!",
      es: "La ballena canta una canción. ¡Bajo su aleta hay una pieza de la máquina!",
      quiz: { q: "¿Qué hace la ballena?", options: ["Canta", "Baila", "Duerme"] },
      choices: [
        { emoji: "⚙️", en: "Take the piece", es: "Coger la pieza", to: "finale" },
        { emoji: "🎵", en: "Sing with the whale", es: "Cantar con la ballena", to: "finale", effects: { add: { kind: 1 } } }
      ]
    },

    /* ============== CUELLO DE BOTELLA FINAL: EL TALLER ============== */
    finale: {
      ch: "finale", emoji: "🛠️",
      en: "We fix the time machine! What do we do now?",
      es: "¡Arreglamos la máquina del tiempo! ¿Y ahora qué hacemos?",
      extras: [
        { if: { var: "friend", eq: "dino" }, en: "Dino helps with his big tail.", es: "Dino ayuda con su gran cola." },
        { if: { var: "friend", eq: "robot" }, en: "Bip helps with his tiny hands.", es: "Bip ayuda con sus manitas." },
        { if: { has: "bone" }, en: "Your bone goes to the museum.", es: "Tu hueso va al museo." },
        { if: { has: "pearl" }, en: "The pearl and the crystal shine together!", es: "¡La perla y el cristal brillan juntos!" }
      ],
      quiz: { q: "¿Qué arreglamos?", options: ["La máquina del tiempo", "Una bicicleta", "Un reloj de pared"] },
      choices: [
        { emoji: "🏠", en: "Go home", es: "Volver a casa", to: "fin_router" },
        { emoji: "✨", en: "Keep travelling", es: "Seguir viajando", to: "end_explorer" }
      ]
    },

    /* ROUTER invisible: decide el final según lo que hizo el niño.
       El orden importa: se elige la primera condición que se cumpla. */
    fin_router: {
      route: [
        { if: { all: [{ has: "crystal" }, { has: "pearl" }] }, to: "end_legend" },
        { if: { var: "friend", eq: "dino" }, to: "end_dino" },
        { if: { var: "friend", eq: "robot" }, to: "end_robot" },
        { if: { var: "kind", gte: 3 }, to: "end_hero" },
        { if: { var: "brave", gte: 3 }, to: "end_brave" },
        { to: "end_home" }
      ]
    },

    /* ============================ FINALES ============================ */
    end_legend: {
      ch: "ending", emoji: "🌟", ending: { title: "Leyenda del Tiempo" },
      en: "You found the crystal and the pearl. You are a Time Legend!",
      es: "Encontraste el cristal y la perla. ¡Eres una Leyenda del Tiempo!"
    },
    end_dino: {
      ch: "ending", emoji: "🦕", ending: { title: "Mi amigo Dino" },
      en: "Dino lives in your garden now. Best friends forever!",
      es: "Dino vive ahora en tu jardín. ¡Mejores amigos para siempre!"
    },
    end_robot: {
      ch: "ending", emoji: "🤖", ending: { title: "Mi amigo Bip" },
      en: "Bip lives with you. He helps you clean your room!",
      es: "Bip vive contigo. ¡Te ayuda a ordenar tu habitación!"
    },
    end_hero: {
      ch: "ending", emoji: "🦸", ending: { title: "Héroe Amable" },
      en: "You helped everyone. You are a kind hero!",
      es: "Ayudaste a todos. ¡Eres un héroe amable!"
    },
    end_brave: {
      ch: "ending", emoji: "🦁", ending: { title: "Corazón Valiente" },
      en: "You were so brave. Grandpa gives you a medal!",
      es: "Fuiste muy valiente. ¡El abuelo te da una medalla!"
    },
    end_explorer: {
      ch: "ending", emoji: "🧭", ending: { title: "Viajero sin Fin" },
      en: "The adventure never ends. Let's go again!",
      es: "La aventura nunca termina. ¡Vamos otra vez!"
    },
    end_home: {
      ch: "ending", emoji: "🏠", ending: { title: "De Vuelta a Casa" },
      en: "We are home again. What a great adventure!",
      es: "Ya estamos en casa. ¡Qué gran aventura!"
    }
  }
};
