/* =====================================================================
   SPEECH — Lectura en voz alta en inglés (en-US, rate 0.85, pitch 1.1)
   ---------------------------------------------------------------------
   IMPORTANTE para Android: el WebView de Capacitor NO incluye la Web
   Speech API (speechSynthesis). Por eso, dentro de la app nativa se usa
   el plugin @capacitor-community/text-to-speech, que llama al motor TTS
   del propio Android (funciona sin conexión si la voz está instalada).
   En el navegador se usa speechSynthesis directamente.
   ===================================================================== */
const Speech = (() => {
  "use strict";
  const LANG = "en-US";
  const RATE = 0.85;
  const PITCH = 1.1;

  const hasWeb = typeof window !== "undefined" && "speechSynthesis" in window;
  let voice = null;
  let listener = () => {};
  let token = 0; // evita que una lectura antigua apague el indicador de una nueva

  function nativeTTS() {
    const C = window.Capacitor;
    if (C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.TextToSpeech) {
      return C.Plugins.TextToSpeech;
    }
    return null;
  }

  /* Elige la mejor voz en inglés disponible (las voces cargan async) */
  function pickVoice() {
    if (!hasWeb) return;
    const vs = speechSynthesis.getVoices();
    voice =
      vs.find(v => v.lang === LANG && v.localService) ||
      vs.find(v => v.lang === LANG) ||
      vs.find(v => (v.lang || "").replace("_", "-").startsWith("en")) ||
      null;
  }
  if (hasWeb) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  function stop() {
    token++;
    const tts = nativeTTS();
    if (tts) tts.stop().catch(() => {});
    if (hasWeb) speechSynthesis.cancel();
    listener(false);
  }

  async function speak(text) {
    stop();
    const my = token;
    if (!text) return;
    listener(true);

    const tts = nativeTTS();
    if (tts) {
      try { await tts.speak({ text, lang: LANG, rate: RATE, pitch: PITCH, volume: 1.0, category: "ambient" }); }
      catch (e) { /* sin voz instalada */ }
      if (my === token) listener(false);
      return;
    }

    if (!hasWeb) { listener(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG;
    u.rate = RATE;
    u.pitch = PITCH;
    if (voice) u.voice = voice;
    u.onend = u.onerror = () => { if (my === token) listener(false); };
    // Pequeño retardo: Chrome a veces ignora speak() justo después de cancel()
    setTimeout(() => { if (my === token) speechSynthesis.speak(u); }, 60);
  }

  return {
    speak,
    stop,
    available: () => !!nativeTTS() || hasWeb,
    onChange(fn) { listener = fn; }
  };
})();
