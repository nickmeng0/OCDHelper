import { useState } from 'react'

function ThemeManager({ themes, onAdd, onRemove }) {
  const [input, setInput] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    const phrase = input.trim()
    if (!phrase || themes.includes(phrase)) return
    onAdd(phrase)
    setInput('')
  }

  return (
    <div>
      <h2>Themes</h2>
      <p style={{ fontSize: '0.82em', color: '#555', marginTop: 0 }}>
        Describe your fear in plain language. More specific = fewer false blocks.
      </p>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. fear of getting sick from animals"
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>

      {themes.length === 0 && (
        <p style={{ fontSize: '0.85em', color: '#aaa' }}>No themes saved yet.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {themes.map((theme, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: 8,
              padding: '6px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <span style={{ flex: 1, fontSize: '0.9em' }}>{theme}</span>
            <button onClick={() => onRemove(i)} style={{ fontSize: '0.8em', flexShrink: 0 }}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <p style={{ fontSize: '0.75em', color: '#888', marginTop: 12 }}>
        Search queries matching any theme will redirect to an ERP practice page.
        Mechanism 3 — zero-shot entailment (DeBERTa).
      </p>
    </div>
  )
}

export default ThemeManager
