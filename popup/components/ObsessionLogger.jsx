import { useState } from 'react'

const STATUS = { idle: null, pending: 'pending', done: 'done', error: 'error' }

function ObsessionLogger({ onLog, onLogUpdate }) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState(STATUS.idle)
  const [result, setResult] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    const entry = {
      id: Math.ceil(Math.random() * 1e9),
      text: trimmed,
      timestamp: new Date().toISOString(),
    }

    onLog(entry)
    setText('')
    setStatus(STATUS.pending)
    setResult(null)

    chrome.runtime.sendMessage({ type: 'PROCESS_NEW_ENTRY', text: trimmed, id: entry.id })
      .then(res => {
        if (res?.error) { setStatus(STATUS.error); return }
        setStatus(STATUS.done)
        setResult(res)
        onLogUpdate(entry.id, { keywords: res.keywords ?? [] })
      })
      .catch(() => setStatus(STATUS.error))
  }

  return (
    <div>
      <h2>Log Obsession</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Describe the obsessive thought as it occurred…"
          rows={5}
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
        <button type="submit" disabled={status === STATUS.pending} style={{ marginTop: 8 }}>
          Save Log
        </button>
      </form>

      {status === STATUS.pending && (
        <p style={{ fontSize: '0.78em', color: '#888', marginTop: 6 }}>
          Analysing… (first run downloads ~300 MB of models)
        </p>
      )}

      {status === STATUS.done && result && (
        <div style={{ fontSize: '0.78em', color: '#2e7d32', marginTop: 6 }}>
          <div><strong>Keywords:</strong> {result.keywords?.join(', ')}</div>
          {result.addedTerms?.length > 0 && (
            <div style={{ marginTop: 2 }}>
              <strong>New block terms:</strong> {result.addedTerms.length} ({result.addedTerms.slice(0, 5).join(', ')}{result.addedTerms.length > 5 ? '…' : ''})
            </div>
          )}
        </div>
      )}

      {status === STATUS.error && (
        <p style={{ fontSize: '0.78em', color: '#c0392b', marginTop: 6 }}>
          Analysis failed — check the service worker console.
        </p>
      )}
    </div>
  )
}

export default ObsessionLogger
