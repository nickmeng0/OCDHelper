import { checkQuery } from '../src/nlp/checkQuery.js'
import { processNewEntry } from '../src/nlp/processNewEntry.js'
import { checkEntailment } from '../src/nlp/checkEntailment.js'

// TODO: import { pipeline } from '@xenova/transformers'

// ── Classifier singleton ───────────────────────────────────────────────────────
// Loaded once per offscreen document lifetime; the browser's Cache API persists
// the model weights across restarts so subsequent loads are fast (~instant).

const MODEL_ID = 'Xenova/nli-deberta-v3-small'
let _classifier = null

async function getClassifier() {
  // TODO: if (!_classifier) _classifier = await pipeline('zero-shot-classification', MODEL_ID)
  // TODO: return _classifier
  throw new Error('getClassifier: not yet implemented')
}

// ── Message router ─────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target !== 'offscreen') return false

  console.log('[ERP offscreen] received:', message.type)

  // CHECK_ENTAILMENT is async (model inference) — handle separately so we can
  // return true to keep the message channel open while awaiting the pipeline.
  if (message.type === 'CHECK_ENTAILMENT') {
    // TODO: wire up once checkEntailment and getClassifier are implemented
    // getClassifier()
    //   .then(classify => checkEntailment(message.query, message.obsessions, { classify }))
    //   .then(sendResponse)
    //   .catch(err => sendResponse({ error: err.message }))
    sendResponse({ error: 'CHECK_ENTAILMENT: not yet implemented' })
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
