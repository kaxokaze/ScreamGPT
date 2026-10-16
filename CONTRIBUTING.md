# Contributing

Thanks for helping improve ScreamGPT.

## Before submitting a change

- Keep the interface minimal and usable in light and dark themes.
- Do not add analytics, remote fonts, remote audio, or collection of conversation content.
- Preserve the ready-to-load `screamgpt-extension/` structure. End users should not need Node.js, npm, or a build step to install it.
- Test changes in a Chromium browser and clearly describe what you tested. ChatGPT’s interface can change, so completion detection should be checked in a live ChatGPT tab.
- When reporting an issue, include browser/version and reproducible steps. Remove private conversation content and personal data.
- Do not submit secrets, credentials, browser-profile data, or personal tokens.

## Pull request checklist

- [ ] The extension folder still contains all runtime files, sounds, and icons.
- [ ] The manifest is valid JSON and all referenced local files exist.
- [ ] The change does not introduce unneeded permissions or external requests.
- [ ] Manual tests and any known limitations are described in the pull request.
