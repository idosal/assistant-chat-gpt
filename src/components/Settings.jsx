import React, { useState } from 'react';
import { setFillerEnabled, setTriggerPhrase } from "../content/audio.mjs";
import Toggle from 'react-toggle'
import "react-toggle/style.css" // for ES6 modules

const Settings = () => {
  const [isFillerEnabled, setIsFillerEnabled] = useState(true);
  // send voice with target name to background script
  const handleChange = (event) => {
    setIsFillerEnabled(event.target.checked);
    setFillerEnabled(event.target.checked);
  };

  return (
    <div className='setting-object' style={{ display: "flex", alignItems: 'flex-end', justifyContent: "space-between" }}>
      <Toggle
        id='filler'
        defaultChecked={ isFillerEnabled }
        onChange={ handleChange } />
      <label style={{paddingLeft: "10px" }}>Natural conversation</label>
    </div>
  );
};

export default Settings;