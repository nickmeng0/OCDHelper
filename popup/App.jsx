import { useState, useEffect, useCallback } from 'react'
import ObsessionLogger from './components/ObsessionLogger'
import LogList from './components/LogList'
import BlockListManager from './components/BlockListManager'

const TABS = [
  { id: 'log', label: 'Log' },
  { id: 'history', label: 'History' },
  { id: 'blocklist', label: 'Block List' },
]

const styles = {
  root: {
    width: 400,
    minHeight: 500,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '20px 20px 0',
  },
  title: {
    fontSize: '1.15em',
    fontWeight: 700,
    color: '#1e1b4b',
    letterSpacing: '-0.3px',
  },
  tabBar: {
    display: 'flex',
    gap: 0,
    margin: '16px 0 0',
    borderBottom: '1px solid #e0e0f0',
  },
  content: {
    padding: '20px',
    flex: 1,
  },
}

function tabStyle(active) {
  return {
    padding: '8px 14px',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
    color: active ? '#6366f1' : '#6b7280',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    fontSize: '0.875em',
    letterSpacing: '0.1px',
    transition: 'color 0.15s',
    marginBottom: -1,
  }
}

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

  if (!ready) return <div style={{ padding: 24, color: '#6b7280' }}>Loading…</div>

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <h1 style={styles.title}>ERP Companion</h1>
        <div style={styles.tabBar}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={tabStyle(tab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.content}>
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
    </div>
  )
}

export default App
