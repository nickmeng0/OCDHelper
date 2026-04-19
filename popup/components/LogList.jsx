function distressColor(level) {
  if (level <= 3) return '#16a34a'
  if (level <= 6) return '#d97706'
  return '#dc2626'
}

function distressLabel(level) {
  if (level <= 3) return 'mild'
  if (level <= 6) return 'moderate'
  return 'extreme'
}

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
      <h2 style={{ fontSize: '1em', fontWeight: 600, color: '#1e1b4b', marginBottom: 6 }}>
        History <span style={{ fontWeight: 400, color: '#9ca3af' }}>({logs.length})</span>
      </h2>
      <p style={{ fontSize: '0.78em', color: '#7c7c9a', lineHeight: 1.5, marginBottom: 14 }}>
        Take note of any common themes, such as control, harm, health, etc.
      </p>

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <p style={{ margin: 0, fontSize: '0.74em', color: '#9ca3af', flex: 1 }}>
              {new Date(log.timestamp).toLocaleString()}
            </p>
            {log.distress != null && (
              <span style={{
                fontSize: '0.74em',
                fontWeight: 600,
                color: distressColor(log.distress),
                background: 'rgba(0,0,0,0.04)',
                borderRadius: 6,
                padding: '2px 7px',
                whiteSpace: 'nowrap',
              }}>
                {log.distress}/10 — {distressLabel(log.distress)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default LogList
