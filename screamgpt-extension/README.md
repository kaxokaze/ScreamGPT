# ScreamGPT v1.6.0

**Let her scream when she’s done.**

ScreamGPT plays a selected sound when ChatGPT finishes generating a response. This folder is the complete, ready-to-load browser extension. It includes the manifest, JavaScript, icons, and all eight built-in WAV files.

## Install

1. Download or clone the ScreamGPT repository and extract it if necessary.
2. Open `brave://extensions`, `chrome://extensions`, or `edge://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this **`screamgpt-extension` folder**, the folder that contains `manifest.json`.
5. Open or refresh [ChatGPT](https://chatgpt.com). If ScreamGPT shows a refresh reminder on the ChatGPT page, click **Reload page**.
6. Open the ScreamGPT popup, choose a sound, and click **Test sound**.

**No Node.js, npm, build command, or account is needed.**

## Features

- Eight built-in sounds: Soft Chime, Ding, Pop, Digital, Marimba, Glass, Glitch, and Bubble.
- Custom MP3/WAV sound selection, stored locally in IndexedDB.
- Sound selector, separate preview action, volume slider, and Test sound.
- Light and dark themes that follow the operating system setting.
- Accessibility options for larger text, high contrast, reduced motion, and keyboard navigation.
- A refresh reminder appears on ChatGPT only when the content script is missing or outdated. The user must click the reload button.
- No desktop notifications, analytics, remote fonts, remote audio assets, or collection of conversation content.

## Privacy

Preferences and custom audio stay on the device. The content script checks ChatGPT’s visible generation Stop control; it does not read conversation text. See [PRIVACY.md](PRIVACY.md).

## Compatibility

- Chromium Manifest V3 extension
- Minimum Chrome version: 116
- Intended for Chrome, Brave, and Edge

ChatGPT’s web interface can change, so completion detection and audio playback should be verified in the target browser. ScreamGPT is unofficial and is not affiliated with or endorsed by OpenAI.
