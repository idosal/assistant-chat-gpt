import React, { useEffect, useRef, useState } from "react";
import {
  MessageList,
  Message,
  MessageSeparator
} from "@chatscope/chat-ui-kit-react";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

export default function Popup() {
  const msgListRef = useRef();
  const [history, setHistory] = useState([])

  function handleHistory(response) {
    if (!response?.length) {
      return;
    }

    if (response.length > history?.length) {
      msgListRef.current.scrollToBottom("auto");
    }

    setHistory(response);
  }

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'getHistory' }, function (response) {
      handleHistory(response.history);
    })
    window.setInterval(() => {
      chrome.runtime.sendMessage({ type: 'getHistory' }, function (response) {
        handleHistory(response.history);
      })
    }, 1000)
  }, [])

  return <main>
    <MessageList ref={msgListRef}>
      <Message model={{
        message: "Hello! I'm your ChatGPT assistant. To start, simply say \"Hey Skynet\", followed by your prompt.",
        position: 'single',
        direction: 'incoming',
      }} />
      {history?.length ? <MessageSeparator content={history[0].time.toLocaleString()} /> : null}
      {history.map(message => <Message model={{
        message: message.text,
        position: 'single',
        direction: message.direction,
      }} />)}
    </MessageList>
  </main>
}
