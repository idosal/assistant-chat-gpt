# ChassistantGPT

A **Chrome** browser extension that embeds ChatGPT as a hands-free voice assistant in the background. Everything is a simple "Hey, Skynet" away!

Please read the contents of the tab that will open when you install the extension. It contains important information about how to use the extension.
To keep the extension free to use, it is only supported in Chrome (not including other Chromium-based browsers). However, the code is supported on all modern browsers, but the underlying text-to-speech engine would require payment.

Regarding privacy, it's important to note that the extension's only permission is limited access to `chat.openai.com` (webpage + fetch without CORS).
It does not store any data. It does not transmit data from your device, except for the sentence that directly follows the "Hey Skynet" command, which is sent straight to ChatGPT.

Pull requests and suggestions are welcome.

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

## Credit

This project's template is based on the very cool [wong2/chat-gpt-google-extension](https://github.com/wong2/chat-gpt-google-extensione)
