import { v4 as uuidv4 } from 'uuid'
import { fetchSSE } from './fetch-sse.mjs'

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
let triggerPhrase = 'hey girl'
let pauseHandler
let longPauseHandler
let isFillerEnabled = true;
const history = []

const recognition = new webkitSpeechRecognition()
recognition.lang = 'en-US'
recognition.continuous = true

export function setFillerEnabled(enabled) {
  isFillerEnabled = enabled;
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

allVoicesObtained.then((voices) => {
  const usVoice = voices.find((voice) => voice.name === 'Google US English')
  if (usVoice) {
    setVoice(usVoice)
  }
})

export function getVoice() {
  console.log('get voice', voice)
  return voice
}

export function setVoice(v) {
  console.log('setVoice', v)
  if (recognition.lang !== v.lang) {
    recognition.stop();
  }

  voice = v;
}

export function setTriggerPhrase(t) {
  console.log('setPhrase', t)

  triggerPhrase = t;
}

function stopAnswer() {
  shouldStop = true
}

function setIcon(url) {
  chrome.action.setIcon({
    path: chrome.runtime.getURL(url),
  })
}

function updateHistory(message) {
  if (!history?.length) {
    return;
  }

  history[history.length - 1].text = message;
}

function addToHistory(message, isChatGPT) {
  let direction = 'outgoing'
  if (isChatGPT) {
    lastMessage = message
    direction = 'incoming'
  } else {
    lastInstruction = message
  }

  history.push({ text: message, time: new Date(), direction })
}

async function getAnswerFromChatGPT(question, callback) {
  try {
    addToHistory(question, false)
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
          if (lastMessage) {
            updateHistory(text)
          } else {
            addToHistory(lastMessage, true)
          }

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
    clearPauseFillers();
    const historySuffix = e.message === 'UNAUTHORIZED' ? '. Please authenticate at https://chat.openai.com/chat' : ''
    addToHistory("Error from ChatGPT: " + e.message + historySuffix, true);
    const voiceSuffix = e.message === 'UNAUTHORIZED' ? ' Please authenticate at chat.openai.com' : ''
    const utterance = new SpeechSynthesisUtterance('I\'m sorry. Chat G P T returned an error.' + voiceSuffix)
    utterance.volume = 0.5
    if (getVoice()) {
      utterance.voice = getVoice()
    }
    speechSynthesis.speak(utterance)
    setIcon('assets/logo.png')
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

function addPauseFillers() {
  pauseHandler = window.setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance("ummm, lets see");
    utterance.volume = 0.5;
    utterance.rate = 0.8;
    if (getVoice()) {
      utterance.voice = getVoice();
    }
    speechSynthesis.speak(utterance);
  }, 5000);

  longPauseHandler = window.setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance("uhmmm...");
    utterance.volume = 0.5;
    utterance.rate = 0.6;
    if (getVoice()) {
      utterance.voice = getVoice();
    }
    speechSynthesis.speak(utterance);
  }, 12000);
}

function addAckFiller() {
  const utterance = new SpeechSynthesisUtterance("okay. coming up");
  utterance.volume = 0.5;
  utterance.rate = 0.9;
  if (getVoice()) {
    utterance.voice = getVoice();
  }
  speechSynthesis.speak(utterance);
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

  if (getVoice().lang === 'en-US' && isFillerEnabled) {
    addAckFiller();
    addPauseFillers();
  }
}

function clearPauseFillers() {
  window.clearTimeout(pauseHandler);
  pauseHandler = undefined;
  window.clearTimeout(longPauseHandler);
  longPauseHandler = undefined;
}

function processAnswer(answer) {
  clearPauseFillers();
  setIcon('assets/logo.png')
  const currentUtterance = new SpeechSynthesisUtterance(answer.trimStart())
  currentUtterance.rate = 0.9
  if (getVoice()) {
    currentUtterance.voice = getVoice()
  }
  speechSynthesis.speak(currentUtterance)
}

function sessionKeepAlive() {
  window.setInterval(() => getAccessToken(), 4 * 60 * 1000)
}

async function notifyStartListening() {
  setIcon('assets/logo_recording.png')
  const utterance = new SpeechSynthesisUtterance("beep!");
  utterance.rate = 2;
  utterance.pitch = 1.5;
  if (getVoice()) {
    utterance.voice = getVoice();
  }
  speechSynthesis.speak(utterance);
}

try {
  let isActive = false

  function startListening() {
    notifyStartListening();
    isActive = true
  }

  recognition.addEventListener('result', async () => {
    const transcript = event.results[event.results?.length - 1][0].transcript
    console.log(transcript)
    if (isActive) {
      let instruction = transcript
      if (transcript.trimStart().startsWith(triggerPhrase)) {
        instruction = transcript.trimStart().substring(triggerPhrase.length)
      }
      isActive = false
      getAnswer(instruction)
      return
    }

    const trimmed = transcript.trimStart().trimEnd().toLowerCase()
    if (trimmed.startsWith(triggerPhrase)) {
      const instruction = trimmed.substring(triggerPhrase.length)
      if (instruction && instruction?.length > 2) {
        getAnswer(instruction)
        return
      } else {
        startListening()
      }
    }
  })

  recognition.addEventListener('error', (event) => {
    console.log(event)
    setIcon('assets/logo.png')
  })

  recognition.onend = function () {
    setIcon('assets/logo.png')
    recognition.lang = getVoice()?.lang || 'en-US'
    recognition.start()
  }

  recognition.start()

  chrome.commands.onCommand.addListener(function (command) {
    if (command === 'stop-playback') {
      speechSynthesis.cancel()
      stopAnswer()
    }

    if (command === 'start-listening') {
      if (isActive) {
        isActive = false
        setIcon('assets/logo.png')
      } else {
        startListening()
      }
    }
  })

  // Listen for history query from the popup
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === 'getHistory') {
      sendResponse({ history })
    }

    return false
  })

  tryToPreventClose()
  sessionKeepAlive()
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
