# ChassistantGPT

A **Chrome** browser extension that embeds ChatGPT as a hands-free voice assistant in the background. Everything is a simple "Hey, Skynet" away!

Please read the contents of the tab that will open when you install the extension. It contains important information about how to use the extension.
To keep the extension free to use, the speech capabilities are only supported in Chrome (excluding other Chromium-based browsers). However, the code is functional on all modern browsers.

<img width="1031" alt="image" src="https://user-images.githubusercontent.com/18148989/206879916-285b79a3-12e1-4de7-bf97-c9094954407d.png">

## Installation

#### Local Install

1. Download `chrome.zip` from [Releases](https://github.com/idosal/assistant-chat-gpt/releases).
2. Unzip the file.
3. In Chrome, go to the extensions page (`chrome://extensions`).
4. Enable Developer Mode.
5. Drag the unzipped folder anywhere on the page to import it (do not delete the folder afterwards).

#### Install from Chrome Web Store (Preferred)

To be updated once the extension is approved.

## Build from source

1. Clone the repo
2. Install dependencies with `npm`
3. Run `npm run build`
4. Follow the steps in the "Local Install" section above (with the resulting `/build/chrome.zip`).

## Roadmap
- [ X ] Turn popup into a chat with the entire session history
- [ ] Improve code playbacks
- [ ] Beautify tab UI

## Contribution
Pull requests and suggestions are welcome.

Many thanks to the brilliant @talkor for improving the UI!

This project's template is based on the very cool [wong2/chat-gpt-google-extension](https://github.com/wong2/chat-gpt-google-extensione)

