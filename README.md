# ScreamGPT

**Let her scream when she’s done.**

ScreamGPT is a small, local-first browser extension that plays a sound when ChatGPT finishes generating a response.

## Install in Chrome, Brave, or Edge

**No Node.js, npm, build command, or account is required.** The extension is already packaged with its sound files and icons.

1. **Get the files.** Clone this repository, or on GitHub choose **Code → Download ZIP** and extract it.
2. Open your browser’s extensions page:
   - Brave: `brave://extensions`
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the **`screamgpt-extension` folder** from the repository you downloaded. Select the folder that contains `manifest.json`—not the outer repository folder.
6. Open or refresh [ChatGPT](https://chatgpt.com). If ScreamGPT displays a refresh reminder on the ChatGPT page, click **Reload page**.
7. Open the ScreamGPT extension popup and click **Test sound**.

That’s it. You can now choose a sound and volume. Send a ChatGPT message to check completion playback.

## Features

- Eight built-in sounds: Soft Chime, Ding, Pop, Digital, Marimba, Glass, Glitch, and Bubble.
- Custom MP3 or WAV sound files stored locally in the extension’s browser storage.
- Sound selection, preview, volume control, and a **Test sound** action.
- Minimal light and dark themes that follow the operating system setting.
- Accessibility options for larger text, high contrast, reduced motion, and keyboard use.
- A reload reminder injected into a ChatGPT page only when the extension content script is missing or out of date. Reloading happens only after the user clicks the button.
- No desktop notifications, analytics, remote fonts, or remote audio assets.

## Privacy

ScreamGPT stores preferences in browser extension storage and custom audio in local IndexedDB. It does not collect or send prompts, response text, account information, or browsing history to a ScreamGPT server. See [PRIVACY.md](PRIVACY.md) for details.

## Project details

- Extension version: **1.6.0**
- Extension platform: Chromium Manifest V3
- Minimum Chrome version: **116**
- Source folder to load: **`screamgpt-extension/`**

ScreamGPT is an independent, unofficial project and is not affiliated with, endorsed by, or sponsored by OpenAI. ChatGPT is a trademark of its respective owner.
