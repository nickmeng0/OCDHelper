import { useState } from 'react'

const STATUS = { idle: null, pending: 'pending', done: 'done', error: 'error' }

function ObsessionLogger({ onLog, onLogUpdate }) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState(STATUS.idle)

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

    chrome.runtime.sendMessage({ type: 'PROCESS_NEW_ENTRY', text: trimmed, id: entry.id })
      .then(res => {
        if (res?.error) { setStatus(STATUS.error); return }
        setStatus(STATUS.done)
        onLogUpdate(entry.id, { keywords: res.keywords ?? [] })
      })
      .catch(() => setStatus(STATUS.error))
  }

  return (
    <div>
      <h2 style={{ fontSize: '1em', fontWeight: 600, color: '#1e1b4b', marginBottom: 4 }}>
        Log an obsession
      </h2>
      <p style={{ fontSize: '0.78em', color: '#7c7c9a', lineHeight: 1.5, marginBottom: 14 }}>
        Be as honest and specific as possible. Semantic analysis runs entirely
        on your device, so your entries are private and never shared.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Describe the obsessive thought as it occurred in first person…"
          rows={5}
          style={{
            width: '100%',
            padding: '12px 14px',
            border: '1.5px solid #e0e0f0',
            borderRadius: 10,
            fontSize: '0.9em',
            lineHeight: 1.6,
            resize: 'vertical',
            background: 'rgba(255,255,255,0.75)',
            color: '#1e1b4b',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = '#e0e0f0'}
        />

        <button
          type="submit"
          disabled={status === STATUS.pending || !text.trim()}
          style={{
            marginTop: 10,
            width: '100%',
            padding: '11px 0',
            background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: '0.9em',
            fontWeight: 600,
            letterSpacing: '0.2px',
            cursor: status === STATUS.pending ? 'not-allowed' : 'pointer',
            opacity: (status === STATUS.pending || !text.trim()) ? 0.55 : 1,
            boxShadow: '0 2px 10px rgba(99,102,241,0.25)',
            transition: 'opacity 0.15s',
          }}
        >
          {status === STATUS.pending ? 'Saving…' : 'Save Entry'}
        </button>
      </form>

      {status === STATUS.done && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          padding: '10px 14px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          fontSize: '0.85em',
          color: '#166534',
          fontWeight: 500,
        }}>
          <span>✓</span>
          <span>Entry logged and being analyzed locally.</span>
        </div>
      )}

      {status === STATUS.error && (
        <div style={{
          marginTop: 12,
          padding: '10px 14px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          fontSize: '0.85em',
          color: '#991b1b',
        }}>
          Analysis failed — check the service worker console.
        </div>
      )}
    </div>
  )
}

export default ObsessionLogger
