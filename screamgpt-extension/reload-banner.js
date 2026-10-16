(() => {
  "use strict";
  const hostId = "screamgpt-reload-banner-host";
  if (document.getElementById(hostId) || window.__screamGPTReloadBannerV160) return;
  window.__screamGPTReloadBannerV160 = true;

  const host = document.createElement("div");
  host.id = hostId;
  host.style.cssText = "position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483647;width:min(520px,calc(100vw - 24px));";
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .banner { display:flex; align-items:center; gap:10px; padding:10px 11px; border:1px solid #e5e5e7; border-radius:10px; background:#fff; color:#17171a; box-shadow:0 5px 18px rgba(0,0,0,.09); font:500 13px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif; letter-spacing:-.012em; }
    .mark { display:grid;place-items:center;width:30px;height:30px;flex:0 0 30px;border-radius:8px;background:#ff365c;color:#fff; }
    .mark svg { width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round; }
    .copy { min-width:0;flex:1; }
    .title { display:block;font-size:13px;font-weight:700;line-height:1.3; }
    .desc { display:block;margin-top:2px;color:#5f636d;font-size:12px; }
    button { font:inherit;cursor:pointer; }
    .reload { flex:0 0 auto;border:1px solid #d91e49;border-radius:7px;padding:7px 10px;background:#d91e49;color:#fff;font-size:12px;font-weight:700;white-space:nowrap; }
    .reload:hover { background:#bd173e; }
    .dismiss { display:grid;place-items:center;width:28px;height:28px;flex:0 0 28px;border:0;border-radius:6px;background:transparent;color:#5f636d;font-size:20px;line-height:1; }
    .dismiss:hover { background:#f2f3f5;color:#17171a; }
    button:focus-visible { outline:2px solid #9e1734;outline-offset:2px; }
    @media(prefers-color-scheme:dark) {
      .banner { background:#242426;color:#f5f5f7;border-color:#414145;box-shadow:0 8px 24px rgba(0,0,0,.32); }
      .desc { color:#b9bac1; }
      .dismiss { color:#b9bac1; }
      .dismiss:hover { background:#38383b;color:#fff; }
    }
    @media(prefers-reduced-motion:reduce) { *,*::before,*::after { transition:none!important;animation:none!important; } }
  `;

  const banner = document.createElement("div");
  banner.className = "banner";
  banner.setAttribute("role", "status");
  banner.setAttribute("aria-label", "ScreamGPT setup reminder");

  const mark = document.createElement("span");
  mark.className = "mark";
  mark.setAttribute("aria-hidden", "true");
  mark.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 10v4m4-8v12m4-15v18m4-13v8m4-11v14"/></svg>';

  const copy = document.createElement("span");
  copy.className = "copy";
  const title = document.createElement("strong");
  title.className = "title";
  title.textContent = "ScreamGPT needs a quick refresh";
  const desc = document.createElement("span");
  desc.className = "desc";
  desc.textContent = "Reload this page to enable completion sounds.";
  copy.append(title, desc);

  const reload = document.createElement("button");
  reload.className = "reload";
  reload.type = "button";
  reload.textContent = "Reload page";
  reload.addEventListener("click", async () => {
    reload.disabled = true;
    reload.textContent = "Reloading…";
    try {
      const response = await chrome.runtime.sendMessage({ type: "RELOAD_CHATGPT_PAGE" });
      if (!response || !response.ok) throw new Error(response?.error || "Could not reload this page.");
    } catch (error) {
      reload.disabled = false;
      reload.textContent = "Try again";
      desc.textContent = error.message || "Could not reload this page.";
    }
  });

  const dismiss = document.createElement("button");
  dismiss.className = "dismiss";
  dismiss.type = "button";
  dismiss.textContent = "×";
  dismiss.setAttribute("aria-label", "Dismiss ScreamGPT setup reminder");
  dismiss.addEventListener("click", () => host.remove());

  banner.append(mark, copy, reload, dismiss);
  shadow.append(style, banner);
  (document.documentElement || document.body).appendChild(host);
})();
