import { useState } from 'react'

const inputStyle = {
  flex: 1,
  padding: '9px 12px',
  border: '1.5px solid #e0e0f0',
  borderRadius: 8,
  fontSize: '0.875em',
  background: 'rgba(255,255,255,0.75)',
  color: '#1e1b4b',
  outline: 'none',
}

const btnPrimary = {
  padding: '9px 16px',
  background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: '0.875em',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(99,102,241,0.2)',
}

const btnGhost = {
  padding: '4px 10px',
  background: 'none',
  border: '1px solid #e0e0f0',
  borderRadius: 6,
  fontSize: '0.78em',
  color: '#9ca3af',
  cursor: 'pointer',
}

function BlockListManager({ blockList, onAdd, onRemove, onToggle }) {
  const [input, setInput] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    const url = input.trim()
    if (!url) return
    onAdd(url)
    setInput('')
  }

  return (
    <div>
      <h2 style={{ fontSize: '1em', fontWeight: 600, color: '#1e1b4b', marginBottom: 14 }}>
        Blocked Sites
      </h2>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. reddit.com"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = '#e0e0f0'}
        />
        <button type="submit" style={btnPrimary}>Add</button>
      </form>

      {blockList.length === 0 && (
        <p style={{ fontSize: '0.85em', color: '#9ca3af' }}>No sites blocked yet.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {blockList.map(item => (
          <li key={item.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            marginBottom: 6,
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid #e0e0f0',
            borderRadius: 8,
          }}>
            <input
              type="checkbox"
              checked={item.active}
              onChange={() => onToggle(item.id)}
              title={item.active ? 'Disable block' : 'Enable block'}
              style={{ accentColor: '#6366f1', cursor: 'pointer' }}
            />
            <span style={{
              flex: 1,
              fontSize: '0.875em',
              color: item.active ? '#1e1b4b' : '#9ca3af',
              textDecoration: item.active ? 'none' : 'line-through',
            }}>
              {item.url}
            </span>
            <button onClick={() => onRemove(item.id)} style={btnGhost}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      {blockList.length > 0 && (
        <p style={{ fontSize: '0.75em', color: '#9ca3af', marginTop: 12, lineHeight: 1.4 }}>
          Blocked sites redirect to an ERP practice page. Uncheck to temporarily disable.
        </p>
      )}
    </div>
  )
}

export default BlockListManager
