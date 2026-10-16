# ScreamGPT Privacy

ScreamGPT is designed to run locally in your browser. It does not require an account, API key, or ScreamGPT server.

## What is stored locally

- Preferences, such as the selected sound and volume, are stored using browser extension storage.
- A custom MP3/WAV sound is stored in IndexedDB within the extension’s browser origin.

This data is used to provide the extension’s settings and audio playback. ScreamGPT does not collect or send prompts, response text, account information, or browsing history to a ScreamGPT server.

## What the extension observes

On `https://chatgpt.com/*`, the content script checks the page’s visible generation Stop control to infer when a response has finished. It does not read or transmit conversation text. The extension also answers a readiness check so it can tell whether the content script needs refreshing.

If the active ChatGPT page needs refreshing, ScreamGPT can inject a small reminder on that ChatGPT page. The page reloads only after the user clicks the reminder’s reload button. The reminder is not shown in the extension popup or on unrelated websites.

## Permissions

- `storage`: save extension preferences.
- `offscreen`: play the selected sound while the popup is closed.
- `scripting`: inject the refresh reminder into an open ChatGPT page when needed.
- `https://chatgpt.com/*` host access: detect response-generation state and check whether the content script is ready.

ScreamGPT does not include desktop notifications, analytics, external fonts, remote audio files, an account system, API keys, or remote logging.

ScreamGPT is an unofficial independent project and is not affiliated with, endorsed by, or sponsored by OpenAI. ChatGPT is a trademark of its respective owner.
