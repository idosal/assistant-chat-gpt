import React, { useEffect, useState } from 'react'
import MarkdownIt from 'markdown-it'
import parse from 'html-react-parser'

export default function Popup() {
  const [lastAnswer, setLastAnswer] = useState('')
  const [lastInstruction, setLastInstruction] = useState('')
  const markdown = new MarkdownIt()

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'getLastAnswer' }, function (response) {
      // Handle the response from the background service worker
      setLastAnswer(response.answer)
      setLastInstruction(response.instruction)
    })
    window.setInterval(() => {
      // Send a message to the background service worker
      chrome.runtime.sendMessage({ type: 'getLastAnswer' }, function (response) {
        // Handle the response from the background service worker
        setLastAnswer(response.answer)
        setLastInstruction(response.instruction)
      })
    }, 1000)
  }, [])

  return !lastInstruction ? (
    <main>
      <p>Ask a question by saying "Hey Skynet" followed by your question</p>
    </main>
  ) : (
    <main>
      <p>Last question:</p>
      <p>{lastInstruction}</p>
      <br />
      <p>Last response:</p>
      {parse(markdown.render(lastAnswer))}
    </main>
  )
}
