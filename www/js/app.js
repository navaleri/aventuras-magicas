/* =====================================================================
   APP — Interfaz y flujo del juego
   ---------------------------------------------------------------------
   Pantallas: menú → juego → final → (mapa en cualquier momento)
   Usa Engine (lógica), Store (progreso), Speech (voz), StoryMap (mapa)
   y Billing (compras).
   ===================================================================== */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);

  let story = null;     // historia activa
  let run = null;       // partida actual: { node, vars, steps }
  let mapReturn = "screen-menu";
  let showTr = false;   // traducción visible en esta escena

  const worlds = () => Object.values(STORIES).sort((a, b) => a.order - b.order);
  const isLocked = (s) => s.premium && !Store.isUnlocked(s.id);

  /* ------------------------------------------------------------------
     Utilidades de interfaz
     ------------------------------------------------------------------ */
  function show(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    $(id).classList.add("active");
    window.scrollTo(0, 0);
  }

  function toast(msg, ms = 2400) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), ms);
  }

  function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function confetti(n = 16) {
    const pieces = ["🎉", "⭐", "✨", "🎈", "🌟", "💜"];
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "confetti";
      s.textContent = pieces[i % pieces.length];
      s.style.left = Math.random() * 100 + "vw";
      s.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
      s.style.animationDelay = Math.random() * 0.4 + "s";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 3600);
    }
  }

  function restartAnim(node) { node.style.animation = "none"; void node.offsetWidth; node.style.animation = ""; }

  Speech.onChange(on => document.querySelectorAll(".speak-btn").forEach(b => b.classList.toggle("speaking", on)));

  /* ------------------------------------------------------------------
     MENÚ: tarjetas de mundos con progreso
     ------------------------------------------------------------------ */
  function renderMenu() {
    const box = $("worlds");
    box.innerHTML = "";
    for (const s of worlds()) {
      const prog = Store.world(s.id);
      const total = Engine.endings(s).length;
      const found = prog.endings.length;
      const locked = isLocked(s);

      const card = document.createElement("div");
      card.className = "world-card " + (locked ? "locked" : "open") + " w-" + s.id;
      card.innerHTML = `
        <div class="w-head">
          <span class="w-emoji">${s.emoji}</span>
          <div class="w-text">
            <span class="w-title">${s.title}</span>
            <span class="w-tag">${locked ? "🔒 Bloqueado · " + (s.price || "") : s.premium ? "✅ Desbloqueado" : "¡Gratis!"}</span>
          </div>
        </div>
        ${locked ? "" : `
        <div class="w-progress" aria-label="Finales descubiertos">
          <div class="bar"><span style="width:${(found / total) * 100}%"></span></div>
          <span class="w-count">🏅 ${found}/${total} finales</span>
        </div>`}
        <div class="w-actions"></div>`;

      const actions = card.querySelector(".w-actions");
      const add = (label, cls, fn) => {
        const b = document.createElement("button");
        b.className = "btn " + cls;
        b.innerHTML = label;
        b.onclick = fn;
        actions.appendChild(b);
      };

      if (locked) {
        add("🔒 Desbloquear " + (s.price || ""), "btn-lock", () => askParent(`Desbloquear "${s.title}" (${s.price})`, () => buy(s)));
      } else {
        if (prog.run) add("⏯️ Continuar", "btn-green", () => continueRun(s.id));
        add(prog.run ? "🆕 Empezar de nuevo" : "▶️ ¡Jugar!", prog.run ? "btn-white" : "btn-green", () => newRun(s.id));
        add("🗺️ Mapa", "btn-white", () => openMap(s.id, "screen-menu"));
      }
      box.appendChild(card);
    }
  }

  /* ------------------------------------------------------------------
     PARTIDAS
     ------------------------------------------------------------------ */
  function newRun(worldId) {
    story = STORIES[worldId];
    run = { node: null, vars: Engine.initVars(story), steps: 0 };
    show("screen-game");
    goTo(story.start, null);
  }

  function continueRun(worldId) {
    story = STORIES[worldId];
    run = JSON.parse(JSON.stringify(Store.world(worldId).run));
    show("screen-game");
    renderNode();
  }

  /* Viaja a un nodo (resolviendo routers) y guarda el progreso */
  function goTo(target, fromId) {
    const id = Engine.resolve(story, target, run.vars);
    run.node = id;
    run.steps++;
    Store.visit(story.id, id, fromId);

    if (story.nodes[id].ending) {
      Store.clearRun(story.id);
      showEnding(id);
    } else {
      Store.saveRun(story.id, run);
      renderNode();
    }
  }

  /* ------------------------------------------------------------------
     ESCENA
     ------------------------------------------------------------------ */
  function renderNode() {
    const node = story.nodes[run.node];
    const ch = story.chapters[node.ch] || {};
    const settings = Store.settings();

    document.body.style.setProperty("--ch", ch.color || "#7c5cff");
    $("chapter").textContent = "📍 " + (ch.name || "");

    const emoji = $("scene-emoji");
    emoji.textContent = node.emoji;
    restartAnim(emoji);

    // frase principal + frases extra que dependen de decisiones anteriores
    const extras = Engine.extras(node, run.vars);
    $("scene-text").textContent = node.en;
    $("scene-extra").textContent = extras.map(e => e.en).join(" ");
    $("scene-es").textContent = [node.es].concat(extras.map(e => e.es)).join(" ");
    showTr = settings.translation;
    $("scene-es").hidden = !showTr;
    $("btn-translate").classList.toggle("on", showTr);

    renderInventory();
    $("feedback").textContent = "";
    $("choices").innerHTML = "";
    $("choices").classList.remove("show");

    if (settings.quizzes && node.quiz) renderQuiz(node);
    else { $("quiz").hidden = true; renderChoices(node); }

    $("scene-card").classList.remove("travel");
    restartAnim($("scene-card"));

    if (settings.autoAudio) setTimeout(() => speakScene(), 350);
  }

  function speakScene() {
    const node = story.nodes[run.node];
    const extras = Engine.extras(node, run.vars);
    Speech.speak([node.en].concat(extras.map(e => e.en)).join(" "));
  }

  function renderInventory() {
    const inv = $("inventory");
    inv.innerHTML = "";
    const v = run.vars;
    if (v.friend && story.friends && story.friends[v.friend]) {
      const f = story.friends[v.friend];
      inv.insertAdjacentHTML("beforeend", `<span class="inv friend" title="${f.es}">${f.emoji}</span>`);
    }
    for (const it of v.items) {
      const d = story.items[it];
      if (d) inv.insertAdjacentHTML("beforeend", `<span class="inv" title="${d.es}">${d.emoji}</span>`);
    }
    if (!inv.children.length) inv.innerHTML = `<span class="inv-empty">🎒</span>`;
  }

  /* Pregunta de comprensión: 3 opciones barajadas (la 1ª es la correcta) */
  function renderQuiz(node) {
    $("quiz").hidden = false;
    $("quiz-q").textContent = "❓ " + node.quiz.q;
    const box = $("quiz-options");
    box.innerHTML = "";
    const correct = node.quiz.options[0];
    shuffle(node.quiz.options).forEach(opt => {
      const b = document.createElement("button");
      b.className = "btn option";
      b.textContent = opt;
      b.onclick = () => answer(b, opt === correct, node);
      box.appendChild(b);
    });
  }

  function answer(btn, ok, node) {
    if (!ok) {
      btn.classList.remove("wrong");
      void btn.offsetWidth;
      btn.classList.add("wrong");
      buzz(80);
      setTimeout(() => btn.classList.remove("wrong"), 700);
      return;
    }
    document.querySelectorAll("#quiz-options .option").forEach(b => {
      b.disabled = true;
      if (b !== btn) b.classList.add("dim");
    });
    btn.classList.add("correct");
    const praise = ["¡Muy bien! 🎉", "¡Genial! ⭐", "¡Fantástico! 🥳", "¡Correcto! 🙌", "¡Eres un crack! 🏅"];
    $("feedback").textContent = praise[Math.floor(Math.random() * praise.length)] + " ¿Qué haces ahora?";
    confetti(10);
    renderChoices(node);
  }

  /* Opciones de camino (las bloqueadas aparecen con 🔒 y una pista) */
  function renderChoices(node) {
    const box = $("choices");
    box.innerHTML = "";
    for (const { choice, locked } of Engine.visibleChoices(node, run.vars)) {
      const b = document.createElement("button");
      b.className = "btn choice" + (locked ? " locked" : "");
      b.innerHTML = `
        <span class="c-emoji">${locked ? "🔒" : choice.emoji}</span>
        <span class="c-text"><span class="c-en" lang="en">${choice.en}</span>
        <span class="c-es">${locked ? choice.hint : choice.es}</span></span>`;
      b.onclick = () => locked ? lockedTap(b, choice) : choose(choice);
      box.appendChild(b);
    }
    box.classList.add("show");
    setTimeout(() => box.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
  }

  function lockedTap(btn, choice) {
    btn.classList.remove("wrong");
    void btn.offsetWidth;
    btn.classList.add("wrong");
    buzz(40);
    toast("🔒 " + choice.hint + " — ¡Prueba otro camino en la próxima aventura!");
  }

  /* El niño elige: se aplican consecuencias y se viaja al siguiente nodo */
  function choose(choice) {
    Speech.stop();
    const before = run.vars;
    run.vars = Engine.apply(choice.effects, run.vars);

    // muestra las consecuencias visibles (objetos y amigos nuevos)
    const gained = run.vars.items.filter(i => !before.items.includes(i));
    const msgs = gained.map(i => `${story.items[i].emoji} ¡Has conseguido: ${story.items[i].es}!`);
    if (run.vars.friend && run.vars.friend !== before.friend) {
      const f = story.friends[run.vars.friend];
      msgs.push(`${f.emoji} ¡${f.es} viene contigo!`);
    }
    if (msgs.length) toast(msgs.join("  "), 2800);

    const from = run.node;
    $("scene-card").classList.add("travel");
    setTimeout(() => goTo(choice.to, from), 260);
  }

  /* ------------------------------------------------------------------
     FINAL
     ------------------------------------------------------------------ */
  function showEnding(id) {
    const node = story.nodes[id];
    const isNew = Store.addEnding(story.id, id);
    const prog = Store.world(story.id);
    const total = Engine.endings(story).length;

    document.body.style.setProperty("--ch", "#ffc93c");
    $("ending-emoji").textContent = node.emoji;
    $("ending-title").textContent = node.ending.title;
    $("ending-text").textContent = node.en;
    $("ending-es").textContent = node.es;
    $("ending-new").hidden = !isNew;
    $("ending-count").textContent =
      prog.endings.length === total
        ? `🏆 ¡Has descubierto los ${total} finales! ¡Eres un maestro de las aventuras!`
        : `🏅 Finales descubiertos: ${prog.endings.length} de ${total}. ¡Elige otros caminos para encontrar más!`;

    show("screen-ending");
    restartAnim($("ending-emoji"));
    confetti(isNew ? 28 : 14);
    setTimeout(() => Speech.speak(node.en), 500);
  }

  /* ------------------------------------------------------------------
     MAPA DE CONSTELACIÓN
     ------------------------------------------------------------------ */
  const pathCount = {};
  function openMap(worldId, from) {
    Speech.stop();
    const s = STORIES[worldId];
    const prog = Store.world(worldId);
    mapReturn = from;

    if (!(worldId in pathCount)) pathCount[worldId] = Engine.explore(s).paths;
    const places = Engine.places(s);
    const seenPlaces = places.filter(p => prog.visited.includes(p)).length;
    const endings = Engine.endings(s);

    $("map-title").textContent = s.emoji + " " + s.title;
    $("map-stats").innerHTML = `
      <span>📍 ${seenPlaces}/${places.length} lugares</span>
      <span>🏅 ${prog.endings.length}/${endings.length} finales</span>
      <span>🧭 ${pathCount[worldId]} caminos posibles</span>`;

    const current = from === "screen-game" && run ? run.node : null;
    show("screen-map");
    StoryMap.render($("map-svg"), s, prog, current, (id) => {
      const n = s.nodes[id];
      toast(`${n.emoji} ${n.ending ? n.ending.title : (s.chapters[n.ch] || {}).name}`);
    });

    const grid = $("endings-grid");
    grid.innerHTML = "";
    for (const e of endings) {
      const n = s.nodes[e];
      const got = prog.endings.includes(e);
      grid.insertAdjacentHTML("beforeend", `
        <div class="end-card ${got ? "got" : ""}">
          <span class="e-emoji">${got ? n.emoji : "❔"}</span>
          <span class="e-title">${got ? n.ending.title : "???"}</span>
        </div>`);
    }
  }

  /* ------------------------------------------------------------------
     CONTROL PARENTAL (multiplicación aleatoria) Y COMPRA
     ------------------------------------------------------------------ */
  function askParent(reason, onSuccess) {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 6 + Math.floor(Math.random() * 4);
    const c = $("gate-content");
    c.innerHTML = `
      <h2>👨‍👩‍👧 Control Parental</h2>
      <p>Pregunta para papás. Resuelve la operación para continuar:</p>
      <div class="op">¿Cuánto es ${a} x ${b}?</div>
      <input id="gate-answer" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" autocomplete="off" placeholder="?">
      <p class="price-note">${reason}</p>
      <div class="modal-actions">
        <button class="btn btn-grey" id="gate-cancel">Cancelar</button>
        <button class="btn btn-green" id="gate-ok">Continuar ✔️</button>
      </div>`;
    $("gate-modal").classList.add("show");
    const check = () => {
      const ok = parseInt($("gate-answer").value, 10) === a * b;
      if (!ok) { closeGate(); toast("Respuesta incorrecta. Pide ayuda a un adulto 👨‍👩‍👧"); return; }
      onSuccess();
    };
    $("gate-cancel").onclick = closeGate;
    $("gate-ok").onclick = check;
    $("gate-answer").onkeydown = (e) => { if (e.key === "Enter") check(); };
    setTimeout(() => { const i = $("gate-answer"); if (i) i.focus(); }, 150);
  }
  function closeGate() { $("gate-modal").classList.remove("show"); }

  $("gate-modal").addEventListener("click", (e) => {
    if (e.target.id === "gate-modal" && !$("gate-content").querySelector(".spinner")) closeGate();
  });

  async function buy(s) {
    $("gate-content").innerHTML = `<div class="spinner">⏳</div><h2>Procesando pago...</h2><p class="price-note">${s.price}</p>`;
    try {
      const res = await Billing.purchase(s.id);
      if (!res.ok) throw new Error("cancelado");
      Store.unlock(s.id);
      $("gate-content").innerHTML = `
        <div style="font-size:4rem">✅🎉</div>
        <h2>¡Compra completada!</h2>
        <p>"${s.title}" está desbloqueado para siempre.</p>
        ${res.simulated ? '<p class="price-note">(Pago simulado — versión de prueba)</p>' : ""}
        <button class="btn btn-green btn-block" id="gate-done">¡A jugar!</button>`;
      $("gate-done").onclick = () => { closeGate(); renderMenu(); };
      renderMenu();
      confetti();
    } catch (e) {
      closeGate();
      toast("No se ha completado la compra.");
    }
  }

  /* ------------------------------------------------------------------
     AJUSTES PARA PADRES
     ------------------------------------------------------------------ */
  function openSettings() {
    closeGate();
    const s = Store.settings();
    $("set-audio").checked = s.autoAudio;
    $("set-translation").checked = s.translation;
    $("set-quizzes").checked = s.quizzes;
    $("settings-modal").classList.add("show");
  }
  $("set-audio").onchange = (e) => Store.setSetting("autoAudio", e.target.checked);
  $("set-translation").onchange = (e) => Store.setSetting("translation", e.target.checked);
  $("set-quizzes").onchange = (e) => Store.setSetting("quizzes", e.target.checked);
  $("btn-settings-close").onclick = () => $("settings-modal").classList.remove("show");
  $("btn-reset").onclick = () => {
    if (confirm("¿Seguro? Se borrarán los mapas, los finales y las partidas guardadas. Las compras se mantienen.")) {
      Store.resetProgress();
      $("settings-modal").classList.remove("show");
      renderMenu();
      toast("Progreso borrado 🧹");
    }
  };

  /* ------------------------------------------------------------------
     EVENTOS
     ------------------------------------------------------------------ */
  $("btn-settings").onclick = () => askParent("Acceso a los ajustes", openSettings);
  $("btn-home").onclick = () => { Speech.stop(); renderMenu(); show("screen-menu"); };
  $("btn-map").onclick = () => openMap(story.id, "screen-game");
  $("btn-speak").onclick = () => Speech.available() ? speakScene() : toast("Este dispositivo no tiene voz 🔇");
  $("btn-translate").onclick = () => {
    showTr = !showTr;
    $("scene-es").hidden = !showTr;
    $("btn-translate").classList.toggle("on", showTr);
  };

  $("btn-ending-speak").onclick = () => Speech.speak($("ending-text").textContent);
  $("btn-replay").onclick = () => newRun(story.id);
  $("btn-ending-map").onclick = () => openMap(story.id, "screen-ending");
  $("btn-ending-menu").onclick = () => { Speech.stop(); renderMenu(); show("screen-menu"); };
  $("btn-map-back").onclick = () => {
    if (mapReturn === "screen-game") document.body.style.setProperty("--ch", (story.chapters[story.nodes[run.node].ch] || {}).color);
    if (mapReturn === "screen-menu") renderMenu();
    show(mapReturn);
  };

  /* Botón "atrás" de Android (Capacitor): vuelve al menú en vez de salir */
  const C = window.Capacitor;
  if (C && C.Plugins && C.Plugins.App) {
    C.Plugins.App.addListener("backButton", () => {
      if ($("gate-modal").classList.contains("show")) return closeGate();
      if ($("settings-modal").classList.contains("show")) return $("settings-modal").classList.remove("show");
      if ($("screen-menu").classList.contains("active")) return C.Plugins.App.exitApp();
      if ($("screen-map").classList.contains("active")) return $("btn-map-back").click();
      Speech.stop(); renderMenu(); show("screen-menu");
    });
  }

  renderMenu();

  // Acceso para pruebas desde la consola
  window.App = { newRun, openMap, state: () => ({ story: story && story.id, run }) };
})();
