import { useState } from 'react'

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
      <h2>Block List</h2>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. reddit.com"
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>

      {blockList.length === 0 && <p>No sites blocked yet.</p>}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {blockList.map(item => (
          <li
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
              padding: '4px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <input
              type="checkbox"
              checked={item.active}
              onChange={() => onToggle(item.id)}
              title={item.active ? 'Disable block' : 'Enable block'}
            />
            <span
              style={{
                flex: 1,
                textDecoration: item.active ? 'none' : 'line-through',
                color: item.active ? 'inherit' : '#aaa',
              }}
            >
              {item.url}
            </span>
            <button onClick={() => onRemove(item.id)} style={{ fontSize: '0.8em' }}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <p style={{ fontSize: '0.75em', color: '#666', marginTop: 12 }}>
        Blocked sites redirect to an ERP practice page.
        Uncheck to temporarily disable a rule without removing it.
      </p>
    </div>
  )
}

export default BlockListManager
