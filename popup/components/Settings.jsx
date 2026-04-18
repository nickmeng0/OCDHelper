import { useEffect, useState } from 'react'

const DEFAULTS = {
  clusterEntailmentThreshold: 0.60,
  themeEntailmentThreshold: 0.45,
  synonymSimilarityThreshold: 0.82,
  clusterSimilarityThreshold: 0.65,
}

const MODEL_LABELS = {
  embedder: 'MiniLM (embeddings)',
  classifier: 'DeBERTa (entailment)',
  summarizer: 'DistilBART (cluster labels)',
}

const STATUS_COLORS = { idle: '#aaa', loading: '#e67e22', ready: '#27ae60' }

function SliderRow({ label, settingKey, value, min, max, step = 0.01, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: '0.85em', display: 'flex', justifyContent: 'space-between' }}>
        <span>{label}</span>
        <strong>{value.toFixed(2)}</strong>
      </label>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(settingKey, parseFloat(e.target.value))}
        style={{ width: '100%', marginTop: 4 }}
      />
    </div>
  )
}

function Settings({ settings, onSettingChange }) {
  const [modelStatus, setModelStatus] = useState({ embedder: 'idle', classifier: 'idle', summarizer: 'idle' })

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_MODEL_STATUS' }, res => {
      if (res && !res.error) setModelStatus(res)
    })
  }, [])

  const s = { ...DEFAULTS, ...settings }

  return (
    <div>
      <h2>Settings</h2>

      <h3 style={{ fontSize: '0.9em', margin: '16px 0 8px' }}>Blocking thresholds</h3>

      <SliderRow
        label="Cluster entailment threshold (Mechanism 2)"
        settingKey="clusterEntailmentThreshold"
        value={s.clusterEntailmentThreshold}
        min={0.40} max={0.85}
        onChange={onSettingChange}
      />
      <SliderRow
        label="Theme entailment threshold (Mechanism 3)"
        settingKey="themeEntailmentThreshold"
        value={s.themeEntailmentThreshold}
        min={0.30} max={0.75}
        onChange={onSettingChange}
      />
      <SliderRow
        label="Synonym similarity threshold (Mechanism 1)"
        settingKey="synonymSimilarityThreshold"
        value={s.synonymSimilarityThreshold}
        min={0.70} max={0.95}
        onChange={onSettingChange}
      />
      <SliderRow
        label="Cluster similarity threshold"
        settingKey="clusterSimilarityThreshold"
        value={s.clusterSimilarityThreshold}
        min={0.50} max={0.85}
        onChange={onSettingChange}
      />

      <h3 style={{ fontSize: '0.9em', margin: '20px 0 8px' }}>Model status</h3>
      <p style={{ fontSize: '0.78em', color: '#666', marginTop: 0, marginBottom: 8 }}>
        First-time use downloads ~300 MB of models (cached after that).
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {Object.entries(MODEL_LABELS).map(([key, label]) => (
          <li key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', marginBottom: 6 }}>
            <span>{label}</span>
            <span style={{ color: STATUS_COLORS[modelStatus[key]] || '#aaa', fontWeight: 'bold' }}>
              {modelStatus[key] || 'idle'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Settings
