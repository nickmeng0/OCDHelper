function LogList({ logs, onDelete }) {
  if (!logs.length) {
    return (
      <div>
        <h2>History</h2>
        <p>No obsessions logged yet.</p>
      </div>
    )
  }

  return (
    <div>
      <h2>History ({logs.length})</h2>
      {[...logs].reverse().map(log => (
        <div key={log.id} style={{ borderBottom: '1px solid #ddd', paddingBottom: 10, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <p style={{ margin: '0 0 6px', flex: 1 }}>{log.text}</p>
            <button
              onClick={() => onDelete(log.id)}
              title="Delete entry"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#aaa',
                fontSize: '1em',
                padding: '0 2px',
                lineHeight: 1,
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#e74c3c'}
              onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
            >
              ✕
            </button>
          </div>
          <small style={{ color: '#888' }}>{new Date(log.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  )
}

export default LogList
