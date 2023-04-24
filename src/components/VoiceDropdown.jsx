import React, { useState, useEffect } from 'react';
import { setVoice, testVoice } from "../content/audio.mjs";

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
      // Sort voices by language
      voices.sort((a, b) => a.lang.localeCompare(b.lang));

      // Limit number of voices shown to 250
      voices = voices.slice(0, 250);

      setVoices(voices);
    })
  }, []);

  // send voice with target name to background script
  const handleChange = (event) => {
    setSelectedVoice(event.target.value);
    setVoice(voices.find(voice => voice.name === event.target.value));
  };
  
  const handleLanguageChange = (event) => {
  setSelectedLanguage(event.target.value);  
    // Filter voices by selected language
  const filteredVoices = voices.filter(voice => voice.lang === event.target.value);

  // Set selected voice to the first voice in the filtered voices
  setSelectedVoice(filteredVoices[0].name);
  setVoice(filteredVoices[0]);
  };

  return (
    <div className='setting-object'  style={{ display: "flex", alignItems: 'flex-end', justifyContent: "space-between" }}>
      <label style={{ paddingRight:" 10px" }}>
        Voice
      </label>
      <select value={ selectedLanguage } onChange={handleLanguageChange}>
      {voices.map((voice) => (
      <option key={voice.name} value={voice.lang}>
      {voice.lang}
      </option>
      ))}
      </select>
      <select value={ selectedVoice } onChange={handleVoiceChange}>
      {voices.map((voice) => (
      <option key={voice.name} value={voice.name}>
      {voice.name}
      </option>
      ))}
      </select>
      <button class="voice-test-btn" onClick={testVoice}>🔊 Test Voice</button>
    </div>
  );
};

export default VoiceDropdown ;
