import React, { useState, useEffect } from 'react';
import { setVoice } from "../content/audio.mjs";

const VoiceDropdown = () => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('Google US English');

  useEffect(() => {
    const voices = new Promise(function (resolve) {
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

    voices.then((voices) => {
      setVoices(voices);
    })
  }, []);

  // send voice with target name to background script
  const handleChange = (event) => {
    setSelectedVoice(event.target.value);
    console.log(voices.find(voice => voice.name === event.target.value));
    setVoice(voices.find(voice => voice.name === event.target.value));
  };

  return (
    <div style={{ display: "flex", alignItems: 'flex-end', justifyContent: "space-between" }}>
      <label style={{ paddingRight:" 10px" }}>
        Voice
      </label>
      <select value={ selectedVoice } onChange={handleChange}>
        {voices.map((voice) => (
          <option key={voice.name} value={voice.name}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>
    </div>
  );
};

export default VoiceDropdown ;