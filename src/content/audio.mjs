import { v4 as uuidv4 } from 'uuid'
import { fetchSSE } from './fetch-sse.mjs'

console.log('requesting mic access')
navigator.webkitGetUserMedia(
  { audio: true },
  () => {},
  () => {},
)

let conversationId = ''
let parentMessageId = ''
let lastMessage = ''
let lastPartIndex = 1
let lastPart = ''
let shouldStop = false
let lastInstruction = ''
let voice
const CHASSISTANT_TRIGGER = 'hey skynet'
let pauseHandler

function stopAnswer() {
  shouldStop = true
}

const allVoicesObtained = new Promise(function (resolve) {
  let voices = window.speechSynthesis.getVoices()
  if (voices.length !== 0) {
    resolve(voices)
  } else {
    window.speechSynthesis.addEventListener('voiceschanged', function () {
      voices = window.speechSynthesis.getVoices()
      resolve(voices)
    })
  }
})

function setIcon(url) {
  chrome.action.setIcon({
    path: chrome.runtime.getURL(url),
  })
}

async function getAnswerFromChatGPT(question, callback) {
  try {
    lastInstruction = question
    lastMessage = ''
    const accessToken = await getAccessToken()
    const body = {
      action: 'next',
      messages: [
        {
          id: uuidv4(),
          role: 'user',
          content: {
            content_type: 'text',
            parts: [question],
          },
        },
      ],
      model: 'text-davinci-002-render',
      parent_message_id: uuidv4(),
    }
    if (conversationId) {
      body.conversation_id = conversationId
    }
    if (parentMessageId) {
      body.parent_message_id = parentMessageId
    }

    await fetchSSE('https://chat.openai.com/backend-api/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      onMessage(message) {
        if (message === '[DONE]') {
          callback(lastPart)
          callback(message)
          lastPartIndex = 1

          return
        }

        const data = JSON.parse(message)
        conversationId = data.conversation_id
        parentMessageId = data.message.id
        const text = data.message?.content?.parts?.[0]
        if (text) {
          lastMessage = text
          const split = data.message?.content?.parts?.[0].split('.')
          if (split?.length > 1 && split?.length > lastPartIndex) {
            callback(lastPart)
            lastPartIndex++
          }

          lastPart = split[split.length - 1]
        }
      },
    })
  } catch (e) {
    console.error(e)
  }
}

async function getAccessToken() {
  const resp = await fetch('https://chat.openai.com/api/auth/session', {})
    .then((r) => r.json())
    .catch(() => ({}))
  if (!resp.accessToken) {
    throw new Error('UNAUTHORIZED')
  }
  return resp.accessToken
}

async function getAnswer(question) {
  getAnswerFromChatGPT(question, (answer) => {
    if (answer === '[DONE]') {
      shouldStop = false
      return
    }

    if (shouldStop) {
      return
    }

    if (answer) {
      processAnswer(answer)
    }
  })
  setIcon('assets/logo_handling.png')
  const utterance = new SpeechSynthesisUtterance('okay. coming up')
  utterance.volume = 0.5
  utterance.rate = 0.9
  if (voice) {
    utterance.voice = voice
  }
  speechSynthesis.speak(utterance)

  pauseHandler = window.setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance('ummm, lets see')
    utterance.volume = 0.5
    utterance.rate = 0.8
    if (voice) {
      utterance.voice = voice
    }
    speechSynthesis.speak(utterance)
  }, 5000)
}

function processAnswer(answer) {
  window.clearTimeout(pauseHandler)
  pauseHandler = undefined
  setIcon('assets/logo.png')
  const currentUtterance = new SpeechSynthesisUtterance(answer.trimStart())
  if (voice) {
    currentUtterance.voice = voice
  }
  speechSynthesis.speak(currentUtterance)
}

try {
  let isActive = false
  allVoicesObtained.then((voices) => {
    const ukVoice = voices.find((voice) => voice.name === 'Google US English')
    if (ukVoice) {
      voice = ukVoice
    }
  })
  const recognition = new webkitSpeechRecognition()
  recognition.lang = 'en-US'
  recognition.continuous = true

  function startListening() {
    console.log('start listening for commands')
    isActive = true
    setIcon('assets/logo_recording.png')
  }

  recognition.addEventListener('result', async () => {
    const transcript = event.results[event.results?.length - 1][0].transcript
    console.log(transcript)
    if (isActive) {
      isActive = false
      getAnswer(transcript)
      return
    }

    const trimmed = transcript.trimStart().trimEnd().toLowerCase()
    if (trimmed.startsWith(CHASSISTANT_TRIGGER)) {
      const instruction = trimmed.substring(CHASSISTANT_TRIGGER.length)
      if (instruction && instruction?.length > 2) {
        getAnswer(instruction)
        return
      } else {
        startListening()
      }
      const utterance = new SpeechSynthesisUtterance('beep!')
      utterance.rate = 2
      utterance.pitch = 1.5
      if (voice) {
        utterance.voice = voice
      }
      speechSynthesis.speak(utterance)
    }
  })

  recognition.addEventListener('error', (event) => {
    console.log(event)
    setIcon('assets/logo.png')
  })

  recognition.onend = function () {
    setIcon('assets/logo.png')
    recognition.start()
  }

  recognition.start()

  chrome.commands.onCommand.addListener(function (command) {
    if (command === 'stop-playback') {
      speechSynthesis.cancel()
      stopAnswer()
    }
  })

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === 'getLastAnswer') {
      sendResponse({ answer: lastMessage, instruction: lastInstruction })
    }

    return false
  })

  tryToPreventClose()
} catch (e) {
  console.error(e)
}

function tryToPreventClose() {
  window.addEventListener('mousedown', () => {
    window.addEventListener('beforeunload', function (e) {
      // Show a confirmation message
      const confirmationMessage =
        "If you leave this page, AssistantGPT won't work until it is restarted. Are you sure you want to leave?"
      e.returnValue = confirmationMessage // Gecko, Trident, Chrome 34+
      return confirmationMessage // Gecko, WebKit, Chrome <34
    })
  })
}
