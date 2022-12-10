import React from 'react'

export default function Callout({ type, children }) {
  return <div className={`callout ${type}`}>{children}</div>
}
