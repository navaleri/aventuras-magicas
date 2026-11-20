/* =====================================================================
   STORY MAP — Mapa de constelación de la red de nodos
   ---------------------------------------------------------------------
   Dibuja el grafo de la historia como un cielo de estrellas:
     - Nodos visitados: círculo de color con su emoji.
     - Nodos por descubrir: puntito apagado (no revela su contenido).
     - Finales: estrellas en la última fila (doradas si se consiguieron).
     - Conexiones recorridas: líneas doradas brillantes.
   Los nodos router (invisibles) se "saltan": sus entradas se conectan
   directamente con los finales a los que llevan.
   ===================================================================== */
const StoryMap = (() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const W = 640;        // ancho lógico del dibujo
  const ROW = 96;       // separación vertical entre filas
  const TOP = 56;
  const cache = {};

  /* Grafo visible: nodos y aristas (expandiendo routers) */
  function graph(story) {
    const nodes = story.nodes;
    const isVisible = (id) => !nodes[id].route;
    const expand = (id) => isVisible(id) ? [id] : Engine.rawTargets(nodes[id]).flatMap(expand);
    const ids = Object.keys(nodes).filter(isVisible);
    const edges = [];
    const seen = new Set();
    for (const id of ids) {
      for (const t of Engine.rawTargets(nodes[id])) {
        for (const e of expand(t)) {
          const k = id + ">" + e;
          if (!seen.has(k)) { seen.add(k); edges.push({ from: id, to: e, via: t }); }
        }
      }
    }
    return { ids, edges };
  }

  /* Coloca los nodos en filas (camino más largo desde el inicio) */
  function layout(story) {
    if (cache[story.id]) return cache[story.id];
    const { ids, edges } = graph(story);
    const out = {};
    ids.forEach(id => (out[id] = []));
    edges.forEach(e => out[e.from].push(e.to));

    // orden topológico
    const order = [];
    const mark = {};
    const dfs = (id) => { if (mark[id]) return; mark[id] = 1; out[id].forEach(dfs); order.unshift(id); };
    dfs(story.start);

    const layer = {};
    order.forEach(id => (layer[id] = layer[id] || 0));
    order.forEach(id => out[id].forEach(t => (layer[t] = Math.max(layer[t] || 0, layer[id] + 1))));

    // todos los finales en la última fila
    const maxL = Math.max(...Object.values(layer));
    ids.forEach(id => { if (story.nodes[id].ending) layer[id] = maxL; });

    // agrupa por filas y ordena por la posición media de sus padres
    const rows = [];
    order.forEach(id => (rows[layer[id]] = rows[layer[id]] || []).push(id));
    const pos = {};
    const parents = {};
    edges.forEach(e => (parents[e.to] = parents[e.to] || []).push(e.from));
    rows.forEach((row, r) => {
      if (r > 0) {
        row.sort((a, b) => avgX(a) - avgX(b));
      }
      row.forEach((id, i) => {
        pos[id] = { x: ((i + 1) * W) / (row.length + 1), y: TOP + r * ROW };
      });
    });
    function avgX(id) {
      const ps = (parents[id] || []).filter(p => pos[p]);
      return ps.length ? ps.reduce((s, p) => s + pos[p].x, 0) / ps.length : W / 2;
    }

    const result = { pos, edges, ids, height: TOP * 2 + (rows.length - 1) * ROW };
    cache[story.id] = result;
    return result;
  }

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function starPoints(cx, cy, R, r) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rad = i % 2 ? r : R;
      pts.push((cx + rad * Math.cos(a)).toFixed(1) + "," + (cy + rad * Math.sin(a)).toFixed(1));
    }
    return pts.join(" ");
  }

  /* Dibuja el mapa en el <svg> indicado */
  function render(svg, story, progress, currentId, onTap) {
    const L = layout(story);
    svg.innerHTML = "";
    svg.setAttribute("viewBox", `0 0 ${W} ${L.height}`);

    const visited = new Set(progress.visited);
    const edgesDone = new Set(progress.edges);
    const endings = new Set(progress.endings);

    // estrellitas de fondo decorativas
    const bg = el("g", { class: "map-bg" }, svg);
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 60; i++) {
      el("circle", { cx: rnd() * W, cy: rnd() * L.height, r: rnd() * 1.6 + 0.4, class: "bg-star" }, bg);
    }

    // conexiones
    const gE = el("g", {}, svg);
    for (const e of L.edges) {
      const a = L.pos[e.from], b = L.pos[e.to];
      // una conexión cuenta como recorrida si pasamos por ella (directa o vía router)
      const done = edgesDone.has(e.from + ">" + e.to);
      const dy = b.y - a.y;
      el("path", {
        d: `M${a.x},${a.y} C${a.x},${a.y + dy / 2} ${b.x},${b.y - dy / 2} ${b.x},${b.y}`,
        class: "map-edge" + (done ? " done" : "")
      }, gE);
    }

    // nodos
    const gN = el("g", {}, svg);
    for (const id of L.ids) {
      const n = story.nodes[id];
      const p = L.pos[id];
      const isEnd = !!n.ending;
      const seen = isEnd ? endings.has(id) : visited.has(id);
      const color = (story.chapters[n.ch] || {}).color || "#999";
      const g = el("g", { class: "map-node" + (seen ? " seen" : "") + (id === currentId ? " current" : "") }, gN);

      if (id === currentId) el("circle", { cx: p.x, cy: p.y, r: 34, class: "map-pulse" }, g);

      if (isEnd) {
        el("polygon", { points: starPoints(p.x, p.y, seen ? 30 : 18, seen ? 14 : 8), class: seen ? "end-star found" : "end-star" }, g);
      } else {
        const attrs = { cx: p.x, cy: p.y, r: seen ? 26 : 9, class: seen ? "dot seen" : "dot" };
        if (seen) attrs.style = "fill:" + color; // style gana a la regla CSS .dot
        el("circle", attrs, g);
      }

      if (seen) {
        const t = el("text", { x: p.x, y: p.y + 1, class: "map-emoji" + (isEnd ? " end" : "") }, g);
        t.textContent = n.emoji;
      } else if (isEnd) {
        const t = el("text", { x: p.x, y: p.y + 1, class: "map-q" }, g);
        t.textContent = "?";
      }

      if (seen && onTap) {
        g.style.cursor = "pointer";
        g.addEventListener("click", () => onTap(id));
      }
    }

    // centra la vista en el nodo actual
    const box = svg.parentElement;
    if (currentId && L.pos[currentId] && box) {
      requestAnimationFrame(() => {
        const scale = svg.getBoundingClientRect().width / W;
        box.scrollTop = Math.max(0, L.pos[currentId].y * scale - box.clientHeight / 2);
      });
    }
  }

  return { render, layout };
})();
