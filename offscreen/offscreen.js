import { checkQuery } from '../src/nlp/checkQuery.js'
import { processNewEntry } from '../src/nlp/processNewEntry.js'

// ── Message router ─────────────────────────────────────────────────────────────
// Receives messages from the service worker, runs pure NLP functions, and
// returns results synchronously. No ML models, no storage access.

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target !== 'offscreen') return false

  console.log('[ERP offscreen] received:', message.type)

  try {
    switch (message.type) {
      case 'CHECK_QUERY':
        sendResponse(checkQuery(message.query, {
          blockList: message.blockList || [],
        }))
        break

      case 'PROCESS_NEW_ENTRY':
        sendResponse(processNewEntry(message.text, message.id, {
          existingBlockList: message.existingBlockList || [],
        }))
        break

      default:
        sendResponse({ error: `Unknown message type: ${message.type}` })
    }
  } catch (err) {
    console.error('[ERP offscreen] error:', err)
    sendResponse({ error: err.message })
  }

  return false
})

console.log('[ERP offscreen] listener registered')
