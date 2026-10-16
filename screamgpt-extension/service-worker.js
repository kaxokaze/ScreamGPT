"use strict";

const DEFAULTS = {
  enabled: true,
  soundId: "chime",
  volume: 0.8
};

let creatingOffscreen = null;

function isChatGPTUrl(url) {
  return typeof url === "string" && /^https:\/\/chatgpt\.com(?:\/|$)/i.test(url);
}

async function activeTab() {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tabs[0] || null;
}

async function showReloadBanner(tabId) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["reload-banner.js"] });
    return true;
  } catch (error) {
    console.warn("[ScreamGPT] Could not place the reload prompt on the page:", error);
    return false;
  }
}

async function checkActiveTab() {
  const tab = await activeTab();
  if (!tab || !isChatGPTUrl(tab.url)) return { isChatGPT: false, contentReady: false };
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { type: "SCREAMGPT_PING" });
    const contentReady = Boolean(result && result.ready && result.version === chrome.runtime.getManifest().version);
    if (!contentReady) await showReloadBanner(tab.id);
    return { isChatGPT: true, contentReady, tabId: tab.id };
  } catch (_) {
    await showReloadBanner(tab.id);
    return { isChatGPT: true, contentReady: false, tabId: tab.id };
  }
}

async function reloadChatGPTTab(tabId) {
  let tab = null;
  if (Number.isInteger(tabId)) {
    try { tab = await chrome.tabs.get(tabId); } catch (_) {}
  }
  if (!tab) tab = await activeTab();
  if (!tab || !Number.isInteger(tab.id) || !isChatGPTUrl(tab.url)) {
    throw new Error("Open ChatGPT in a browser tab, then try again.");
  }
  await chrome.tabs.reload(tab.id);
  return { ok: true };
}

async function offscreenDocumentExists() {
  if (typeof chrome.runtime.getContexts === "function") {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [chrome.runtime.getURL("offscreen.html")]
    });
    return contexts.length > 0;
  }
  if (chrome.offscreen && typeof chrome.offscreen.hasDocument === "function") {
    return chrome.offscreen.hasDocument();
  }
  return false;
}

async function ensureOffscreenDocument() {
  if (await offscreenDocumentExists()) return;
  if (!creatingOffscreen) {
    creatingOffscreen = chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Play ScreamGPT's selected completion sound while the popup is closed."
    }).finally(() => { creatingOffscreen = null; });
  }
  await creatingOffscreen;
}

async function sendToOffscreen(payload) {
  await ensureOffscreenDocument();
  let ready = false;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await chrome.runtime.sendMessage({ target: "screamgpt-offscreen", type: "PING" });
      if (response && response.ready) { ready = true; break; }
    } catch (_) {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error("The audio service did not start. Reload ScreamGPT from the extensions page.");
  const response = await chrome.runtime.sendMessage({ target: "screamgpt-offscreen", ...payload });
  if (!response || response.ok === false) throw new Error(response?.error || "The audio service did not confirm playback.");
  return response;
}

async function currentSettings() {
  return { ...DEFAULTS, ...(await chrome.storage.local.get(DEFAULTS)) };
}

async function playCompletion() {
  const settings = await currentSettings();
  if (!settings.enabled) return { ok: true, skipped: true };
  try {
    await sendToOffscreen({ type: "PLAY_SOUND", soundId: settings.soundId, volume: settings.volume });
    return { ok: true, audioOk: true };
  } catch (error) {
    console.error("[ScreamGPT] Completion playback failed:", error);
    return { ok: false, audioOk: false, error: error.message || String(error) };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== "string") return;

  if (message.type === "CHECK_ACTIVE_TAB") {
    checkActiveTab().then(sendResponse).catch(error => {
      console.warn("[ScreamGPT] Could not check the active tab:", error);
      sendResponse({ isChatGPT: false, contentReady: false, error: error.message || String(error) });
    });
    return true;
  }

  if (message.type === "RELOAD_CHATGPT_PAGE") {
    reloadChatGPTTab(sender?.tab?.id).then(sendResponse).catch(error => {
      sendResponse({ ok: false, error: error.message || String(error) });
    });
    return true;
  }

  if (message.type === "CHATGPT_RESPONSE_COMPLETE") {
    playCompletion().then(sendResponse).catch(error => {
      console.error("[ScreamGPT] Completion action failed:", error);
      sendResponse({ ok: false, error: error.message || String(error) });
    });
    return true;
  }

  if (message.type === "TEST_SOUND") {
    (async () => {
      const settings = await currentSettings();
      const soundId = typeof message.soundId === "string" ? message.soundId : settings.soundId;
      const volume = Number.isFinite(Number(message.volume)) ? Number(message.volume) : settings.volume;
      await sendToOffscreen({ type: "PLAY_SOUND", soundId, volume });
      return { ok: true };
    })().then(sendResponse).catch(error => {
      console.error("[ScreamGPT] Test playback failed:", error);
      sendResponse({ ok: false, error: error.message || String(error) });
    });
    return true;
  }

  if (message.type === "STOP_SOUND") {
    sendToOffscreen({ type: "STOP_SOUND" }).then(sendResponse).catch(error => {
      sendResponse({ ok: false, error: error.message || String(error) });
    });
    return true;
  }
});
