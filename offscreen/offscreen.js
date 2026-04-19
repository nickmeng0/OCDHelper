import { checkQuery, checkEntailment } from '../src/nlp/checkQuery.js'
import { processNewEntry } from '../src/nlp/processNewEntry.js'

// ── Message router ─────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target !== 'offscreen') return false

  console.log('[ERP offscreen] received:', message.type)

  // CHECK_ENTAILMENT is async (model load + inference) — handle before the sync
  // block so we can return true to keep the message channel open.
  if (message.type === 'CHECK_ENTAILMENT') {
    checkEntailment(message.query, message.obsessions || [], {
      threshold: message.threshold,
    })
      .then(sendResponse)
      .catch(err => {
        console.error('[ERP offscreen] CHECK_ENTAILMENT error:', err)
        sendResponse({ error: err.message })
      })
    return true // keep channel open for async response
  }

  // Synchronous handlers
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
