(() => {
  "use strict";
  if (window.__screamGPTCompletionDetector) return;
  window.__screamGPTCompletionDetector = true;

  const CONTENT_SCRIPT_VERSION = "1.6.0";
  let wasGenerating = false;
  let manualStopClicked = false;
  let lastCompletionAt = 0;

  function buttonText(button) {
    return [
      button.getAttribute("aria-label") || "",
      button.getAttribute("title") || "",
      button.getAttribute("data-testid") || "",
      button.innerText || ""
    ].join(" ").trim();
  }

  function isStopButton(button) {
    return /\bstop\b|stop generating|stop response|cancel generation/i.test(buttonText(button));
  }

  function isGenerating() {
    return Array.from(document.querySelectorAll("button")).some(isStopButton);
  }

  // If the user manually clicks Stop, don't treat that as a completed answer.
  document.addEventListener("click", event => {
    const button = event.target && event.target.closest ? event.target.closest("button") : null;
    if (button && isStopButton(button) && wasGenerating) {
      manualStopClicked = true;
    }
  }, true);

  let lastObserved = false;
  setInterval(() => {
    const active = isGenerating();

    if (active) {
      if (!wasGenerating) manualStopClicked = false;
      wasGenerating = true;
      lastObserved = true;
      return;
    }

    if (wasGenerating) {
      wasGenerating = false;
      if (lastObserved && !manualStopClicked && Date.now() - lastCompletionAt > 1500) {
        lastCompletionAt = Date.now();
        try {
          chrome.runtime.sendMessage({ type: "CHATGPT_RESPONSE_COMPLETE" }).catch(() => {});
        } catch (_) {}
      }
      manualStopClicked = false;
    }
    lastObserved = false;
  }, 250);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.type === "SCREAMGPT_PING") {
      sendResponse({ ready: true, version: CONTENT_SCRIPT_VERSION });
    }
  });

  console.info("[ScreamGPT] Completion detector ready.");
})();
