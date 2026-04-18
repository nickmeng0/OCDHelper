import { useState, useEffect, useCallback } from 'react'
import ObsessionLogger from './components/ObsessionLogger'
import LogList from './components/LogList'
import BlockListManager from './components/BlockListManager'

const TABS = [
  { id: 'log', label: 'Log' },
  { id: 'history', label: 'History' },
  { id: 'blocklist', label: 'Block List' },
]

function App() {
  const [tab, setTab] = useState('log')
  const [logs, setLogs] = useState([])
  const [urlBlockList, setUrlBlockList] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(
      ['obsessionLogs', 'urlBlockList'],
      data => {
        setLogs(data.obsessionLogs || [])
        setUrlBlockList(data.urlBlockList || [])
        setReady(true)
      }
    )
  }, [])

  // ── Log management ──────────────────────────────────────────────────────────

  const saveLog = useCallback(entry => {
    setLogs(prev => {
      const next = [...prev, entry]
      chrome.storage.local.set({ obsessionLogs: next })
      return next
    })
  }, [])

  const updateLog = useCallback((id, updates) => {
    setLogs(prev => {
      const next = prev.map(log => log.id === id ? { ...log, ...updates } : log)
      chrome.storage.local.set({ obsessionLogs: next })
      return next
    })
  }, [])

  const deleteLog = useCallback(async id => {
    const { obsessionLogs = [], blockList = [] } = await chrome.storage.local.get(['obsessionLogs', 'blockList'])

    const toDelete = obsessionLogs.find(log => log.id === id)
    const next = obsessionLogs.filter(log => log.id !== id)
    const updates = { obsessionLogs: next }

    if (toDelete?.keywords?.length) {
      const stillUsed = new Set(
        next.flatMap(log => log.keywords ?? []).map(w => w.toLowerCase())
      )
      const toRemoveSet = new Set(
        toDelete.keywords.map(w => w.toLowerCase()).filter(w => !stillUsed.has(w))
      )
      if (toRemoveSet.size) {
        updates.blockList = blockList.filter(w => !toRemoveSet.has(w.toLowerCase()))
      }
    }

    await chrome.storage.local.set(updates)
    setLogs(next)
  }, [])

  // ── URL block list management ───────────────────────────────────────────────

  const addBlockItem = useCallback(url => {
    const id = Math.ceil(Math.random() * 1e9)
    const item = { id, url, active: true }
    setUrlBlockList(prev => {
      const next = [...prev, item]
      chrome.storage.local.set({ urlBlockList: next })
      return next
    })
    chrome.runtime.sendMessage({ type: 'ADD_BLOCK_RULE', url, ruleId: id })
  }, [])

  const removeBlockItem = useCallback(id => {
    setUrlBlockList(prev => {
      const next = prev.filter(item => item.id !== id)
      chrome.storage.local.set({ urlBlockList: next })
      return next
    })
    chrome.runtime.sendMessage({ type: 'REMOVE_BLOCK_RULE', ruleId: id })
  }, [])

  const toggleBlockItem = useCallback(id => {
    setUrlBlockList(prev => {
      const next = prev.map(item => {
        if (item.id !== id) return item
        const updated = { ...item, active: !item.active }
        if (updated.active) {
          chrome.runtime.sendMessage({ type: 'ADD_BLOCK_RULE', url: item.url, ruleId: id })
        } else {
          chrome.runtime.sendMessage({ type: 'REMOVE_BLOCK_RULE', ruleId: id })
        }
        return updated
      })
      chrome.storage.local.set({ urlBlockList: next })
      return next
    })
  }, [])

  if (!ready) return <div style={{ padding: 16 }}>Loading…</div>

  return (
    <div style={{ width: 400, padding: 16, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.1em', margin: '0 0 12px' }}>ERP Companion</h1>

      <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: '1px solid #ddd', paddingBottom: 8, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '4px 10px',
              fontWeight: tab === t.id ? 'bold' : 'normal',
              borderBottom: tab === t.id ? '2px solid #333' : '2px solid transparent',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid #333' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.9em',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'log' && <ObsessionLogger onLog={saveLog} onLogUpdate={updateLog} />}
      {tab === 'history' && <LogList logs={logs} onDelete={deleteLog} />}
      {tab === 'blocklist' && (
        <BlockListManager
          blockList={urlBlockList}
          onAdd={addBlockItem}
          onRemove={removeBlockItem}
          onToggle={toggleBlockItem}
        />
      )}
    </div>
  )
}

export default App
