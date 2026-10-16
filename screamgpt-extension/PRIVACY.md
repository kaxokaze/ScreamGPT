# ScreamGPT Privacy

ScreamGPT is designed to run locally in your browser. It does not require an account, API key, or ScreamGPT server.

## Local storage

- Preferences are stored using browser extension storage.
- A custom MP3/WAV file is stored in IndexedDB within the extension’s browser origin.

ScreamGPT does not collect or send prompts, response text, account information, or browsing history to a ScreamGPT server.

## Page access

On `https://chatgpt.com/*`, the content script checks the visible generation Stop control to infer when a response has finished. It does not read or transmit conversation text. A readiness check is used to detect whether the content script is missing or outdated.

If needed, the extension injects a refresh reminder only into the active ChatGPT page. That page reloads only after the user clicks the reload button.

## Permissions

- `storage`: save preferences.
- `offscreen`: play built-in and custom sounds when the popup is closed.
- `scripting`: inject a refresh reminder into a ChatGPT page when needed.
- `https://chatgpt.com/*` host access: observe visible response-generation state and check content-script readiness.

ScreamGPT has no desktop notifications, analytics, external fonts, remote audio assets, account system, API keys, or remote logging.

ScreamGPT is an unofficial independent project and is not affiliated with, endorsed by, or sponsored by OpenAI. ChatGPT is a trademark of its respective owner.
