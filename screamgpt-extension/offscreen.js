"use strict";

let activeAudio = null;

function stopCurrent() {
  if (!activeAudio) return;
  const old = activeAudio;
  activeAudio = null;
  try { old.pause(); } catch (_) {}
  try { old.currentTime = 0; } catch (_) {}
  if (old.__screamGptObjectUrl) {
    try { URL.revokeObjectURL(old.__screamGptObjectUrl); } catch (_) {}
  }
}

async function playSound(soundId, volume) {
  stopCurrent();
  const numericVolume = Number.isFinite(Number(volume)) ? Number(volume) : 0.8;
  const normalizedVolume = Math.max(0, Math.min(1, numericVolume));

  let url;
  if (soundId === "custom") {
    const blob = await ScreamGPTStorage.get("customAudio");
    if (!blob) throw new Error("Choose a custom MP3 or WAV first.");
    url = URL.createObjectURL(blob);
  } else {
    const validIds = SCREAMGPT_SOUNDS.map(sound => sound.id);
    const selectedId = validIds.includes(soundId) ? soundId : "chime";
    url = chrome.runtime.getURL(`sounds/${selectedId}.wav`);
  }

  const audio = new Audio();
  audio.preload = "auto";
  audio.volume = normalizedVolume;
  audio.src = url;
  if (soundId === "custom") audio.__screamGptObjectUrl = url;
  activeAudio = audio;

  const cleanup = () => {
    if (audio.__screamGptObjectUrl) {
      try { URL.revokeObjectURL(audio.__screamGptObjectUrl); } catch (_) {}
      delete audio.__screamGptObjectUrl;
    }
    if (activeAudio === audio) activeAudio = null;
  };
  audio.addEventListener("ended", cleanup, { once: true });
  audio.addEventListener("error", () => {
    cleanup();
  }, { once: true });

  try {
    await audio.play();
  } catch (error) {
    cleanup();
    throw new Error(`Audio could not play: ${error.message || error}`);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.target !== "screamgpt-offscreen") return;
  if (message.type === "PING") {
    sendResponse({ ready: true });
    return;
  }
  if (message.type === "STOP_SOUND") {
    stopCurrent();
    sendResponse({ ok: true });
    return;
  }
  if (message.type === "PLAY_SOUND") {
    playSound(message.soundId, message.volume).then(() => {
      sendResponse({ ok: true });
    }).catch(error => {
      console.error("[ScreamGPT] Audio playback failed:", error);
      sendResponse({ ok: false, error: error.message || String(error) });
    });
    return true;
  }
});
