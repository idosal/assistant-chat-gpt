import React, { useEffect, useState } from 'react'
import Callout from './Callout'

export default function Info() {
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false)
  const isChrome = checkIsChrome()

  useEffect(async () => {
    const permissions = navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    })
    permissions.then(() => {
      setIsMicrophoneEnabled(true)
    })
  }, [])

  return (
    <main>
      <h1>Welcome to ChassistantGPT!</h1>
      {!isChrome && <Callout type="error">
        Uh oh, it looks like you're not using Chrome. Unfortunately, ChassistantGPT is not supported by other browsers
        at this time. If you are using Chrome, please carry on.
      </Callout>}
      <Callout type="info">
        If you wish to use ChassistantGPT in this browsing session,{' '}
        <strong>please keep this tab open</strong>. Otherwise, ChassistantGPT will not be able to hear you.
      </Callout>
      <h2>Status</h2>
      {isMicrophoneEnabled ? (
        <Callout type="success">
          <div class="container">
            <span class="blinking-dot"></span> ChassistantGPT is ready for your
            voice commands
          </div>
        </Callout>
      ) : (
        <Callout type="warning">
          ChassistantGPT is requesting access to your{' '}
          <strong>microphone</strong> so it may hear your voice commands
        </Callout>
      )}
      <h2>What is ChassistantGPT?</h2>
      <p>
        ChassistantGPT is a ChatGPT voice assistant.
      </p>
      <h2>How To Use</h2>
      <ul>
        <li>
          Say <strong>"Hey girl"</strong> followed by your prompt. For
          example: <em>"Hey girl, what is love?"</em> or{' '}
          <em>"Hey Skeynet... Tell me a joke"</em>.
        </li>
        <li>
          If a prompt follows as part of the same sentence, ChassistantGPT will
          forward the prompt directly to ChatGPT. If not, a "beep" sound will
          follow (accompanied by switching of the popup icon to red), signifying
          ChassistantGPT is waiting for input.
        </li>
        <li>
          Before sending to ChatGPT, ChassistantGPT will say "OK, coming up".
          While waiting for a response from ChatGPT, the popup icon will turn
          green.
        </li>
        <li>
          In addition to the voice response from ChatGPT, you can view the full conversation
          at any time by clicking on ChassistantGPT's popup.
        </li>
        <li>
          You may stop ChassistantGPT's voice playback at any time by pressing{' '}
          <strong>Cmd/Ctrl + B.</strong>
        </li>
      </ul>

      <h2>Privacy</h2>
      <p>
        ChassistantGPT <strong>relies on your existing session with ChatGPT</strong>. If you
        aren't logged in, please do so at{' '}
        <a target="_blank" href="https://chat.openai.com/chat">
          https://chat.openai.com/chat
        </a>
        .
      </p>
      <p>
        The extension does not store any data. It does not transmit data from your device, except for the sentence that directly follows the "Hey, girl" command, which is sent straight to ChatGPT.

        The extension's only permission is limited access to `chat.openai.com` (webpage + fetch without CORS). It{' '}
        <strong>does not</strong> store any data. It <strong>does not</strong>{' '}
        except for the sentence that directly follows the "Hey, girl" command, which is sent straight to ChatGPT.
      </p>
    </main>
  )
}

function checkIsChrome() {
  const isChromium = !!window.chrome
  const brands = window.navigator?.userAgentData?.brands
  return isChromium && brands?.length === 3
}

