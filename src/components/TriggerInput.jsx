import React, { useState } from 'react';
import { setTriggerPhrase } from "../content/audio.mjs";

const VoiceDropdown = () => {
  const [trigger, setTrigger] = useState('Hey girl');

  const handleChange = (event) => {
    setTrigger(event.target.value);
    setTriggerPhrase(event.target.value);
  };

  return (
    <div className='setting-object' style={{ display: "flex", alignItems: 'flex-end', justifyContent: "space-between" }}>
      <label style={{ paddingRight:" 10px" }}>
       Trigger phrase
      </label>
      <input type="text" value={ trigger } onChange={ handleChange } />
    </div>
  );
};

export default VoiceDropdown ;