import React, { useEffect, useState } from "react";
import Callout from "./Callout";

export default function Info() {
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);

  useEffect(async () => {
    alert("asking for microphone");
    const permissions = navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    permissions.then(() => {
      setIsMicrophoneEnabled(true);
    });
  }, []);

  return (
    <main>
      <h1>Welcome to ChassistantGPT!</h1>
      <Callout type="info">
        If you wish to use ChassistantGPT in this browsing session,
        <strong>please keep this tab open</strong>
      </Callout>
      {isMicrophoneEnabled ? (
        <Callout type="success">
          <div class="container">
            <span class="blinking-dot"></span> ChassistantGPT is ready for your
            voice commands
          </div>
        </Callout>
      ) : (
        <Callout type="warning">
          ChassistantGPT is requesting access to your{" "}
          <strong>microphone</strong> so it may hear your voice commands
        </Callout>
      )}
      <h2>How To Use</h2>
      <p>
        ChassistantGPT is a voice assistant. It can be triggered by saying
        <strong>"Hey Skynet"</strong>. If a prompt follows as part of the same
        sentence, ChassistantGPT will forward the prompt directly to ChatGPT.
      </p>
      <p>
        If not, a "beep" sound will follow (accompanied by switching of the
        popup icon to red), signifying ChassistantGPT is waiting for input. You
        may then utter the prompt that will be sent to ChatGPT. Before sending,
        ChassistantGPT will say "OK, coming up". While waiting for a response
        from ChatGPT, the popup icon will turn green.
      </p>
      <p>
        In addition to the voice response from ChatGPT, you can view the last
        given answer by clicking on ChassistantGPT's popup.
      </p>
      <p>
        You may stop ChassistantGPT's voice playback at any time by pressing{" "}
        <strong>Cmd/Ctrl + B.</strong>
      </p>
      <p>
        ChassistantGPT relies on your existing session with ChatGPT. If you're
        not logged in, please do so at
        <a target="_blank" href="https://chat.openai.com/chat">
          https://chat.openai.com/chat
        </a>
        .
      </p>
      <h2>Privacy</h2>
      <p>
        This extension <strong>does not</strong> store any data. It
        <strong>does not</strong>
        transmit data from your device, except for direct communication with
        ChatGPT. It has no permissions other than access to the relevant OpenAI
        domains.
      </p>
    </main>
  );
}
