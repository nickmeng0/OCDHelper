import { tokenize } from './utils.js'

// ── Mechanism 1: keyword match (sync) ─────────────────────────────────────────

function termMatches(lowerQuery, lowerTerm) {
  if (lowerTerm.includes(' ')) return lowerQuery.includes(lowerTerm)
  const escaped = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`).test(lowerQuery)
}

export function checkQuery(queryString, { blockList = [] } = {}) {
  const lowerQuery = queryString.toLowerCase()
  for (const term of blockList) {
    if (termMatches(lowerQuery, term.toLowerCase()))
      return { blocked: true, mechanism: 'keyword', matchedTerm: term }
  }
  return { blocked: false }
}

// ── Mechanism 2: NLI entailment check (async) ─────────────────────────────────
// Checks whether any saved obsession semantically entails the search query.
//
// Dynamic import keeps @xenova/transformers out of the module graph until this
// function is first called — tests that only exercise checkQuery stay fast.

const MODEL_ID = 'Xenova/nli-deberta-v3-small'
let _classifier = null

async function getClassifier() {
  if (!_classifier) {
    const { pipeline, env } = await import('@xenova/transformers')
    env.allowLocalModels = false
    env.allowRemoteModels = true
    // WASM binaries are copied to assets/ by the vite build plugin
    env.backends.onnx.wasm.wasmPaths = chrome.runtime.getURL('assets/')
    _classifier = await pipeline('zero-shot-classification', MODEL_ID)
  }
  return _classifier
}

const SEARCH_HYPOTHESES = [
  q => `I am obsessively searching for information about ${q}`,
  q => `I really want to find out ${q}`,
]

export async function checkEntailment(query, obsessions, { threshold = 0.5 } = {}) {
  if (!obsessions.length) return { blocked: false }

  const classify = await getClassifier()
  const hypotheses = SEARCH_HYPOTHESES.map(fn => fn(query))

  // Premises = obsessions, hypotheses = all search framings.
  // multi_label scores every (obsession, hypothesis) pair independently.
  // NLI direction: does this obsession entail that I'd make this search?
  const results = await classify(obsessions, hypotheses, {
    multi_label: true,
    hypothesis_template: '{}',
  })

  // results: one entry per obsession, scores[j] = score for hypothesis j
  const items = Array.isArray(results) ? results : [results]
  let highestScore = 0
  let matchedObsession = null
  for (let i = 0; i < items.length; i++) {
    const maxScore = Math.max(...items[i].scores)
    if (maxScore > highestScore) {
      highestScore = maxScore
      matchedObsession = obsessions[i]
    }
  }

  if (highestScore >= threshold) {
    return { blocked: true, mechanism: 'entailment', matchedObsession, score: highestScore }
  }
  return { blocked: false }
}
