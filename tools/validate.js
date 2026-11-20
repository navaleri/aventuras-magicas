/* =====================================================================
   Validador de historias:  npm run validate
   Comprueba cada mundo: sin ciclos, sin callejones sin salida, todos
   los nodos y finales alcanzables, y cuenta los caminos posibles.
   ===================================================================== */
const path = require("path");
const fs = require("fs");
const Engine = require("../www/js/engine.js");

const dir = path.join(__dirname, "..", "www", "stories");
fs.readdirSync(dir).filter(f => f.endsWith(".js")).sort().forEach(f => require(path.join(dir, f)));

let failed = false;
for (const story of Object.values(globalThis.STORIES).sort((a, b) => a.order - b.order)) {
  const r = Engine.validate(story);
  console.log(`\n${r.ok ? "✅" : "❌"} ${story.id} — ${story.title}`);
  if (r.stats) {
    console.log(`   Nodos: ${r.stats.nodes} · Lugares: ${r.stats.places} · Finales: ${r.stats.endings} · Caminos posibles: ${r.stats.paths}`);
    for (const [e, n] of Object.entries(r.stats.endingCounts)) console.log(`     ${story.nodes[e].emoji} ${story.nodes[e].ending.title}: ${n} caminos`);
  }
  r.errors.forEach(e => console.log("   ERROR: " + e));
  r.warnings.forEach(w => console.log("   aviso: " + w));
  if (!r.ok) failed = true;
}
process.exit(failed ? 1 : 0);
