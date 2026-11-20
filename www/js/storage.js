/* =====================================================================
   STORE — Progreso guardado en el dispositivo (localStorage)
   ---------------------------------------------------------------------
   Guarda por mundo: nodos visitados, conexiones recorridas (para el
   mapa de constelación), finales conseguidos y la partida en curso.
   Si localStorage no está disponible, funciona en memoria.
   ===================================================================== */
const Store = (() => {
  "use strict";
  const KEY = "aventuras_magicas_v2";
  let data = null;

  function load() {
    if (data) return data;
    try { data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { data = {}; }
    data.worlds = data.worlds || {};
    data.unlocked = data.unlocked || {};
    data.settings = Object.assign({ autoAudio: true, translation: false, quizzes: true }, data.settings);
    return data;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* solo memoria */ }
  }

  function world(id) {
    const d = load();
    if (!d.worlds[id]) d.worlds[id] = { visited: [], edges: [], endings: [], run: null, plays: 0 };
    return d.worlds[id];
  }

  return {
    world,
    settings: () => load().settings,
    setSetting(k, v) { load().settings[k] = v; save(); },

    isUnlocked: (id) => !!load().unlocked[id],
    unlock(id) { load().unlocked[id] = true; save(); },

    /* Marca un nodo visitado y la conexión desde el anterior */
    visit(worldId, nodeId, fromId) {
      const w = world(worldId);
      if (!w.visited.includes(nodeId)) w.visited.push(nodeId);
      if (fromId) {
        const e = fromId + ">" + nodeId;
        if (!w.edges.includes(e)) w.edges.push(e);
      }
      save();
    },

    /* Devuelve true si el final es nuevo */
    addEnding(worldId, endingId) {
      const w = world(worldId);
      const isNew = !w.endings.includes(endingId);
      if (isNew) w.endings.push(endingId);
      w.plays++;
      save();
      return isNew;
    },

    saveRun(worldId, run) { world(worldId).run = run; save(); },
    clearRun(worldId) { world(worldId).run = null; save(); },

    resetProgress() {
      const d = load();
      d.worlds = {};
      save();
    }
  };
})();
