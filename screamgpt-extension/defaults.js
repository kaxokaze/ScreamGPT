(function (root) {
  "use strict";
  root.SCREAMGPT_DEFAULTS = Object.freeze({
    enabled: true,
    soundId: "chime",
    volume: 0.8,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    keyboardNavigation: true
  });

  root.SCREAMGPT_SOUNDS = Object.freeze([
    { id: "chime", name: "Soft Chime", detail: "Clean and subtle" },
    { id: "ding", name: "Ding", detail: "Classic bell" },
    { id: "pop", name: "Pop", detail: "Short and playful" },
    { id: "digital", name: "Digital", detail: "A tiny tech ping" },
    { id: "marimba", name: "Marimba", detail: "Warm and rounded" },
    { id: "glass", name: "Glass", detail: "Bright and delicate" },
    { id: "glitch", name: "Glitch", detail: "A little chaotic" },
    { id: "bubble", name: "Bubble", detail: "Light and bouncy" }
  ]);
})(typeof globalThis !== "undefined" ? globalThis : this);
