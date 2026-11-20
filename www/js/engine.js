/* =====================================================================
   ENGINE — Motor de la red de nodos (lógica pura, sin interfaz)
   ---------------------------------------------------------------------
   La historia es un GRAFO DIRIGIDO ACÍCLICO (DAG): cada nodo apunta a
   otros nodos y nunca se vuelve atrás. Eso garantiza que el número de
   caminos posibles es FINITO y que toda partida termina en un final.

   La "ilusión de libertad" se consigue con:
     1. Ramas y cuellos de botella: muchos caminos confluyen en nodos hub.
     2. Variables de estado (vars): amabilidad, valentía, curiosidad,
        objetos (items) y amigo. Las decisiones las modifican.
     3. Texto condicional (extras): el mismo nodo cuenta cosas distintas
        según lo que hizo el niño antes.
     4. Opciones condicionales: algunas solo aparecen (o aparecen con 🔒)
        si tienes cierto objeto.
     5. Nodos "router" invisibles que eligen el final según las vars.

   Este archivo funciona en el navegador (window.Engine) y en Node
   (module.exports) para poder validar las historias desde consola.
   ===================================================================== */
(function (root) {
  "use strict";

  const MAX_DEPTH = 200; // protección ante historias mal formadas

  const Engine = {
    /* Variables iniciales de una partida */
    initVars(story) {
      return Object.assign({ items: [] }, JSON.parse(JSON.stringify(story.vars || {})));
    },

    /* ---------- Condiciones ----------
       { has: "key" }                 -> tiene el objeto
       { var: "friend", eq: "dino" }  -> variable igual a valor
       { var: "kind", gte: 3 }        -> variable numérica >= valor
       { var: "helped" }              -> variable verdadera
       { all: [...] } { any: [...] } { not: {...} }                    */
    test(cond, vars) {
      if (!cond) return true;
      if (cond.all) return cond.all.every(c => Engine.test(c, vars));
      if (cond.any) return cond.any.some(c => Engine.test(c, vars));
      if (cond.not) return !Engine.test(cond.not, vars);
      if (cond.has) return vars.items.includes(cond.has);
      if (cond.var) {
        const v = vars[cond.var];
        if ("eq" in cond) return v === cond.eq;
        if ("gte" in cond) return (v || 0) >= cond.gte;
        return !!v;
      }
      return true;
    },

    /* ---------- Efectos ----------
       { add: { kind: 1 }, set: { friend: "dino" }, give: "key" | ["a","b"] }
       Devuelve un objeto vars NUEVO (no muta el original).            */
    apply(effects, vars) {
      const v = Object.assign({}, vars, { items: vars.items.slice() });
      if (!effects) return v;
      if (effects.add) for (const k in effects.add) v[k] = (v[k] || 0) + effects.add[k];
      if (effects.set) Object.assign(v, effects.set);
      if (effects.give) {
        [].concat(effects.give).forEach(it => { if (!v.items.includes(it)) v.items.push(it); });
      }
      return v;
    },

    /* Sigue los nodos router (invisibles) hasta un nodo real */
    resolve(story, id, vars) {
      let guard = 0;
      let node = story.nodes[id];
      while (node && node.route) {
        const r = node.route.find(x => Engine.test(x.if, vars));
        id = r.to;
        node = story.nodes[id];
        if (++guard > 50) throw new Error("Bucle de routers en " + id);
      }
      return id;
    },

    /* Opciones visibles de un nodo: {choice, locked} */
    visibleChoices(node, vars) {
      return (node.choices || [])
        .map(c => ({ choice: c, locked: !Engine.test(c.if, vars) }))
        .filter(x => !x.locked || x.choice.hint); // las bloqueadas solo se ven si tienen pista
    },

    /* Opciones que de verdad se pueden elegir */
    choices(node, vars) {
      return (node.choices || []).filter(c => Engine.test(c.if, vars));
    },

    /* Textos extra condicionales del nodo */
    extras(node, vars) {
      return (node.extras || []).filter(e => Engine.test(e.if, vars));
    },

    /* Lista de nodos final */
    endings(story) {
      return Object.keys(story.nodes).filter(id => story.nodes[id].ending);
    },

    /* Lugares "reales" (ni routers ni finales) */
    places(story) {
      return Object.keys(story.nodes).filter(id => !story.nodes[id].ending && !story.nodes[id].route);
    },

    /* Todos los destinos posibles de un nodo, ignorando condiciones */
    rawTargets(node) {
      if (node.route) return node.route.map(r => r.to);
      return (node.choices || []).map(c => c.to);
    },

    /* ---------- Exploración exhaustiva ----------
       Recorre TODAS las partidas posibles (teniendo en cuenta las vars)
       y devuelve el número de caminos, los finales alcanzables, los nodos
       alcanzados y los callejones sin salida.                         */
    explore(story) {
      const memo = new Map();
      const reached = new Set();
      const endingCounts = {};
      const deadEnds = new Set();

      const walk = (id, vars, depth) => {
        if (depth > MAX_DEPTH) throw new Error("Profundidad excesiva: ¿hay un ciclo cerca de " + id + "?");
        // marca también los routers por los que pasamos
        let cur = id, node = story.nodes[cur];
        while (node && node.route) { reached.add(cur); cur = node.route.find(x => Engine.test(x.if, vars)).to; node = story.nodes[cur]; }
        const key = cur + "|" + JSON.stringify(vars);
        if (memo.has(key)) return memo.get(key);
        reached.add(cur);

        let total = 0;
        const result = { paths: 0, endings: {} };
        if (node.ending) {
          result.paths = 1;
          result.endings[cur] = 1;
        } else {
          const cs = Engine.choices(node, vars);
          if (!cs.length) deadEnds.add(cur);
          for (const c of cs) {
            const sub = walk(c.to, Engine.apply(c.effects, vars), depth + 1);
            result.paths += sub.paths;
            for (const e in sub.endings) result.endings[e] = (result.endings[e] || 0) + sub.endings[e];
          }
        }
        memo.set(key, result);
        return result;
      };

      const res = walk(story.start, Engine.initVars(story), 0);
      return { paths: res.paths, endingCounts: res.endings, reached, deadEnds: [...deadEnds] };
    },

    /* ---------- Validación completa de una historia ---------- */
    validate(story) {
      const errors = [];
      const warnings = [];
      const ids = Object.keys(story.nodes);

      if (!story.nodes[story.start]) errors.push(`El nodo inicial "${story.start}" no existe`);

      // 1) destinos existentes y datos mínimos
      for (const id of ids) {
        const n = story.nodes[id];
        for (const t of Engine.rawTargets(n)) if (!story.nodes[t]) errors.push(`${id} -> "${t}" no existe`);
        if (n.route) {
          if (n.route[n.route.length - 1].if) errors.push(`Router ${id}: la última ruta debe ir sin condición`);
          continue;
        }
        if (!n.en) errors.push(`${id}: falta el texto en inglés`);
        if (!n.ending && !(n.choices || []).length) errors.push(`${id}: no tiene opciones ni es un final`);
        if (!n.ending && !(n.choices || []).some(c => !c.if)) warnings.push(`${id}: todas sus opciones son condicionales`);
        if (n.quiz && n.quiz.options.length !== 3) errors.push(`${id}: el test debe tener 3 opciones`);
        if (!n.ending && !n.quiz) warnings.push(`${id}: no tiene pregunta de comprensión`);
      }

      // 2) sin ciclos (DAG) => número finito de caminos
      const state = {};
      const visit = (id, stack) => {
        if (state[id] === 1) { errors.push("Ciclo detectado: " + stack.concat(id).join(" -> ")); return; }
        if (state[id] === 2 || !story.nodes[id]) return;
        state[id] = 1;
        for (const t of Engine.rawTargets(story.nodes[id])) visit(t, stack.concat(id));
        state[id] = 2;
      };
      visit(story.start, []);
      if (errors.length) return { ok: false, errors, warnings };

      // 3) exploración con estado
      const ex = Engine.explore(story);
      for (const id of ids) if (!ex.reached.has(id)) errors.push(`${id}: nunca se puede alcanzar`);
      for (const d of ex.deadEnds) errors.push(`${d}: callejón sin salida con ciertas decisiones`);
      for (const e of Engine.endings(story)) if (!ex.endingCounts[e]) errors.push(`Final ${e}: nunca se puede conseguir`);

      return {
        ok: errors.length === 0,
        errors,
        warnings,
        stats: {
          nodes: ids.length,
          places: Engine.places(story).length,
          endings: Engine.endings(story).length,
          paths: ex.paths,
          endingCounts: ex.endingCounts
        }
      };
    }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = Engine;
  else root.Engine = Engine;
})(typeof globalThis !== "undefined" ? globalThis : this);
