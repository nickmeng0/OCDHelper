function LogList({ logs, onDelete }) {
  if (!logs.length) {
    return (
      <div>
        <h2 style={{ fontSize: '1em', fontWeight: 600, color: '#1e1b4b', marginBottom: 10 }}>
          History
        </h2>
        <p style={{ fontSize: '0.85em', color: '#9ca3af' }}>No obsessions logged yet.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: '1em', fontWeight: 600, color: '#1e1b4b', marginBottom: 14 }}>
        History <span style={{ fontWeight: 400, color: '#9ca3af' }}>({logs.length})</span>
      </h2>

      {[...logs].reverse().map(log => (
        <div key={log.id} style={{
          padding: '12px 14px',
          marginBottom: 8,
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid #e0e0f0',
          borderRadius: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <p style={{ margin: 0, fontSize: '0.875em', color: '#1e1b4b', lineHeight: 1.5, flex: 1 }}>
              {log.text}
            </p>
            <button
              onClick={() => onDelete(log.id)}
              title="Delete entry"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#d1d5db',
                fontSize: '0.95em',
                padding: '0 2px',
                lineHeight: 1,
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.74em', color: '#9ca3af' }}>
            {new Date(log.timestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}

export default LogList
