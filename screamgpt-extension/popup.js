"use strict";

const defaults = SCREAMGPT_DEFAULTS;
const sounds = SCREAMGPT_SOUNDS;
const $ = id => document.getElementById(id);
const ui = {
  enabled: $("enabledToggle"),
  picker: $("soundPickerButton"),
  pickerIcon: $("pickerSoundIcon"),
  menu: $("soundMenu"),
  selectedName: $("selectedSoundName"),
  customFile: $("customAudio"),
  fileStatus: $("fileStatus"),
  removeCustom: $("removeCustomButton"),
  volume: $("volumeSlider"),
  volumeValue: $("volumeValue"),
  test: $("testButton"),
  quickPreview: $("quickPreviewButton"),
  status: $("statusMessage"),
  highContrast: $("contrastToggle"),
  largeText: $("largeTextToggle"),
  reducedMotion: $("motionToggle"),
  keyboardNavigation: $("keyboardToggle"),
  accessibilityDetails: $("accessibilityDetails")
};

let settings = { ...defaults };
let customFileName = "";
let statusTimer = null;
let menuItems = [];

function setStatus(message, isError = false) {
  ui.status.textContent = message;
  ui.status.classList.toggle("error", isError);
  if (statusTimer) clearTimeout(statusTimer);
  if (message) statusTimer = setTimeout(() => { ui.status.textContent = ""; }, 3500);
}

function setBodyAccessibility() {
  document.body.classList.toggle("disabled", !settings.enabled);
  document.body.classList.toggle("high-contrast", settings.highContrast);
  document.body.classList.toggle("large-text", settings.largeText);
  document.body.classList.toggle("reduce-motion", settings.reducedMotion);
}

function soundById(id) {
  if (id === "custom") return { id: "custom", name: customFileName || "Custom sound", detail: "Your own audio file" };
  return sounds.find(sound => sound.id === id) || sounds[0];
}

function iconMarkup(id) {
  const paths = {
    chime: '<path d="M4 10v4m4-8v12m4-15v18m4-13v8m4-11v14"/>',
    ding: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    pop: '<path d="M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8m0-12.8-2.8 2.8m-7.2 7.2-2.8 2.8"/>',
    digital: '<path d="M3 10v4m4-8v12m5-15v18m5-13v8m4-11v14"/>',
    marimba: '<path d="M4 8v8m4-12v16m4-10v4m4-8v12m4-10v8"/>',
    glass: '<path d="M12 3 20 8v8l-8 5-8-5V8zM12 7v10"/>',
    glitch: '<path d="M4 7h6m4 0h6M4 12h3m4 0h9M4 17h8m4 0h4"/>',
    bubble: '<circle cx="12" cy="10" r="7"/><path d="m8 16-2 4 6-3"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[id] || paths.chime}</svg>`;
}

function buildSoundMenu() {
  ui.menu.replaceChildren();
  const list = [...sounds];
  if (customFileName) list.push({ id: "custom", name: customFileName, detail: "Your custom audio" });
  menuItems = [];

  for (const sound of list) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "sound-option";
    option.setAttribute("role", "option");
    option.dataset.soundId = sound.id;
    option.setAttribute("aria-selected", String(settings.soundId === sound.id));
    option.tabIndex = 0;

    const icon = document.createElement("span");
    icon.className = "sound-option-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = sound.id === "custom"
      ? '<svg viewBox="0 0 24 24"><path d="M12 15V4m0 0L8 8m4-4 4 4M5 14v5h14v-5"/></svg>'
      : iconMarkup(sound.id);

    const copy = document.createElement("span");
    copy.className = "sound-option-copy";
    const title = document.createElement("strong");
    title.textContent = sound.name;
    copy.appendChild(title);

    const check = document.createElement("span");
    check.className = "option-check";
    check.setAttribute("aria-hidden", "true");
    check.textContent = settings.soundId === sound.id ? "✓" : "";
    option.append(icon, copy, check);
    option.addEventListener("click", () => selectSound(sound.id));
    option.addEventListener("keydown", onOptionKeydown);
    ui.menu.appendChild(option);
    menuItems.push(option);
  }
}

function updateControls() {
  ui.enabled.checked = settings.enabled;
  ui.volume.value = String(Math.round(settings.volume * 100));
  ui.volumeValue.value = `${Math.round(settings.volume * 100)}%`;
  ui.volumeValue.textContent = `${Math.round(settings.volume * 100)}%`;
  ui.volume.setAttribute("aria-valuetext", `${Math.round(settings.volume * 100)} percent`);
  ui.highContrast.checked = settings.highContrast;
  ui.largeText.checked = settings.largeText;
  ui.reducedMotion.checked = settings.reducedMotion;
  ui.keyboardNavigation.checked = settings.keyboardNavigation;
  ui.fileStatus.textContent = customFileName || "MP3 or WAV · up to 20 MB";
  ui.removeCustom.hidden = !customFileName;
  ui.volume.style.setProperty("--volume", `${Math.round(settings.volume * 100)}%`);

  const selected = soundById(settings.soundId);
  ui.selectedName.textContent = selected.name;
  ui.pickerIcon.innerHTML = settings.soundId === "custom"
    ? '<svg viewBox="0 0 24 24"><path d="M12 15V4m0 0L8 8m4-4 4 4M5 14.5V19h14v-4.5"/></svg>'
    : iconMarkup(selected.id);
  ui.picker.setAttribute("aria-label", `Selected sound: ${selected.name}. Open sound picker.`);
  setBodyAccessibility();
  if (!ui.menu.hidden) buildSoundMenu();
}

async function save(patch, status) {
  settings = { ...settings, ...patch };
  await chrome.storage.local.set(settings);
  updateControls();
  if (status) setStatus(status);
}

async function previewSound(soundId = settings.soundId) {
  const response = await chrome.runtime.sendMessage({
    type: "TEST_SOUND",
    soundId,
    volume: settings.volume
  });
  if (!response || !response.ok) throw new Error(response?.error || "Couldn’t play this sound.");
}

async function selectSound(id) {
  if (id === "custom" && !customFileName) {
    setStatus("Choose a custom audio file first.", true);
    return;
  }
  settings.soundId = id;
  await chrome.storage.local.set({ soundId: id });
  updateControls();
  closeMenu(true);
  setStatus(`${soundById(id).name} selected.`);
}

function openMenu() {
  buildSoundMenu();
  ui.menu.hidden = false;
  ui.picker.setAttribute("aria-expanded", "true");
  const selected = menuItems.find(item => item.dataset.soundId === settings.soundId) || menuItems[0];
  if (selected) selected.focus();
}

function closeMenu(restoreFocus = false) {
  ui.menu.hidden = true;
  ui.picker.setAttribute("aria-expanded", "false");
  if (restoreFocus) ui.picker.focus();
}

function onOptionKeydown(event) {
  const index = menuItems.indexOf(event.currentTarget);
  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu(true);
    return;
  }
  if (event.key === "Tab") {
    closeMenu(false);
    return;
  }
  if (!settings.keyboardNavigation) return;

  let next = null;
  if (event.key === "ArrowDown") next = (index + 1) % menuItems.length;
  else if (event.key === "ArrowUp") next = (index - 1 + menuItems.length) % menuItems.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = menuItems.length - 1;
  if (next !== null) {
    event.preventDefault();
    menuItems[next]?.focus();
  }
}

async function runQuickPreview() {
  try {
    ui.quickPreview.disabled = true;
    await previewSound(settings.soundId);
    setStatus(`Previewing ${soundById(settings.soundId).name}.`);
  } catch (error) {
    console.error("[ScreamGPT] Sound preview failed:", error);
    setStatus(error.message || "Could not play the selected sound.", true);
  } finally {
    setTimeout(() => { ui.quickPreview.disabled = false; }, 300);
  }
}

ui.quickPreview.addEventListener("click", runQuickPreview);
ui.picker.addEventListener("click", () => ui.menu.hidden ? openMenu() : closeMenu());
ui.picker.addEventListener("keydown", event => {
  if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (ui.menu.hidden) openMenu();
    else menuItems[0]?.focus();
  }
  if (event.key === "Escape") closeMenu(true);
});
document.addEventListener("pointerdown", event => {
  if (!ui.menu.hidden && !event.target.closest(".picker-anchor")) closeMenu(false);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !ui.menu.hidden) closeMenu(true);
});

async function checkActiveTab() {
  try {
    await chrome.runtime.sendMessage({ type: "CHECK_ACTIVE_TAB" });
  } catch (error) {
    console.debug("[ScreamGPT] Could not check the active ChatGPT tab:", error);
  }
}

async function load() {
  settings = { ...defaults, ...(await chrome.storage.local.get(defaults)) };
  const custom = await ScreamGPTStorage.get("customAudio");
  const savedName = (await chrome.storage.local.get({ customAudioName: "" })).customAudioName;
  customFileName = custom ? (savedName || "Custom audio saved") : "";
  if (settings.soundId === "custom" && !custom) settings.soundId = "chime";
  await chrome.storage.local.set({ soundId: settings.soundId });
  buildSoundMenu();
  updateControls();
  await checkActiveTab();
}

ui.enabled.addEventListener("change", () => save({ enabled: ui.enabled.checked }, ui.enabled.checked ? "Completion sounds are on." : "Completion sounds are off."));

ui.volume.addEventListener("input", () => {
  const volume = Number(ui.volume.value);
  ui.volumeValue.value = `${volume}%`;
  ui.volumeValue.textContent = `${volume}%`;
  ui.volume.setAttribute("aria-valuetext", `${volume} percent`);
  ui.volume.style.setProperty("--volume", `${volume}%`);
  settings.volume = volume / 100;
});
ui.volume.addEventListener("change", () => save({ volume: Number(ui.volume.value) / 100 }));

ui.test.addEventListener("click", async () => {
  try {
    ui.test.disabled = true;
    ui.test.querySelector("span").textContent = "Playing…";
    await chrome.storage.local.set(settings);
    await previewSound(settings.soundId);
    setStatus(`Playing ${soundById(settings.soundId).name}.`);
  } catch (error) {
    console.error("[ScreamGPT] Test sound failed:", error);
    setStatus(error.message || "Couldn’t play this sound. Reload the extension and try again.", true);
  } finally {
    setTimeout(() => {
      ui.test.disabled = false;
      ui.test.querySelector("span").textContent = "Test sound";
    }, 550);
  }
});

ui.customFile.addEventListener("change", async () => {
  const file = ui.customFile.files && ui.customFile.files[0];
  if (!file) return;
  const extensionOk = /\.(mp3|wav)$/i.test(file.name);
  const supportedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"];
  const typeOk = !file.type || supportedTypes.includes(file.type);
  if (!extensionOk || !typeOk) {
    setStatus("Please choose an MP3 or WAV file.", true);
    ui.customFile.value = "";
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    setStatus("Keep custom audio under 20 MB.", true);
    ui.customFile.value = "";
    return;
  }
  try {
    const inferredMime = /\.wav$/i.test(file.name) ? "audio/wav" : "audio/mpeg";
    await ScreamGPTStorage.put("customAudio", file.slice(0, file.size, file.type || inferredMime));
    customFileName = file.name;
    settings.soundId = "custom";
    await chrome.storage.local.set({ customAudioName: customFileName, soundId: "custom" });
    buildSoundMenu();
    updateControls();
    setStatus("Custom sound saved on this device.");
  } catch (error) {
    console.error("[ScreamGPT] Custom sound save failed:", error);
    setStatus("Couldn’t save that audio file. Check extension storage permissions.", true);
  } finally {
    ui.customFile.value = "";
  }
});

ui.removeCustom.addEventListener("click", async () => {
  try {
    await ScreamGPTStorage.remove("customAudio");
    customFileName = "";
    settings.soundId = "chime";
    await chrome.storage.local.set({ customAudioName: "", soundId: "chime" });
    buildSoundMenu();
    updateControls();
    setStatus("Custom sound removed.");
  } catch (error) {
    console.error("[ScreamGPT] Custom sound removal failed:", error);
    setStatus("Couldn’t remove the custom sound.", true);
  }
});

// The hidden file input is triggered from a styled label; make it keyboard-friendly too.
document.querySelector(".choose-button").addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    ui.customFile.click();
  }
});

ui.accessibilityDetails.addEventListener("toggle", () => {
  document.body.classList.toggle("accessibility-open", ui.accessibilityDetails.open);
});
ui.highContrast.addEventListener("change", () => save({ highContrast: ui.highContrast.checked }, "Contrast preference saved."));
ui.largeText.addEventListener("change", () => save({ largeText: ui.largeText.checked }, "Text size preference saved."));
ui.reducedMotion.addEventListener("change", () => save({ reducedMotion: ui.reducedMotion.checked }, "Motion preference saved."));
ui.keyboardNavigation.addEventListener("change", () => save({ keyboardNavigation: ui.keyboardNavigation.checked }, "Keyboard preference saved."));

load().catch(error => {
  console.error("[ScreamGPT] Could not load saved settings:", error);
  setStatus("Couldn’t load settings. Reload ScreamGPT and try again.", true);
});
