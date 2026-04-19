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

export async function checkEntailment(query, obsessions, { threshold = 0.5 } = {}) {
  if (!obsessions.length) return { blocked: false }

  const classify = await getClassifier()
  // Each obsession is the premise; the search is the hypothesis.
  // NLI direction: does this obsession entail that I'd make this search?
  const searchHypothesis = `I am searching for information about ${query}`

  const results = await classify(obsessions, [searchHypothesis], {
    multi_label: true,
    hypothesis_template: '{}',
  })

  // results is an array — one entry per obsession, each with scores[0] for the single label
  const items = Array.isArray(results) ? results : [results]
  let highestScore = 0
  let matchedObsession = null
  for (let i = 0; i < items.length; i++) {
    const score = items[i].scores[0]
    if (score > highestScore) {
      highestScore = score
      matchedObsession = obsessions[i]
    }
  }

  if (highestScore >= threshold) {
    return { blocked: true, mechanism: 'entailment', matchedObsession, score: highestScore }
  }
  return { blocked: false }
}
