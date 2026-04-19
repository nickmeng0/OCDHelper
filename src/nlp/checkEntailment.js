// Mechanism 2: NLI-based entailment check.
// Determines whether any saved obsession "entails" the current search query,
// meaning the search is likely driven by the obsession.
//
// Uses zero-shot classification (NLI under the hood):
//   sequence  = "I am searching for information about <query>"
//   labels    = obsession log entry texts
//   multi_label = true  (each obsession scored independently)
//
// The pipeline is NOT created here — it is injected via `classify` so that
// the caller (offscreen.js) can own the singleton and cache it across calls.
//
// @param {string}   query        - raw search query string
// @param {string[]} obsessions   - obsession log entry texts to check against
// @param {object}   deps
// @param {Function} deps.classify - bound ZeroShotClassificationPipeline callable
// @param {number}   [deps.threshold=0.7] - minimum entailment score to block
// @returns {Promise<{ blocked: boolean, matchedObsession?: string, score?: number }>}

export async function checkEntailment(query, obsessions, { classify, threshold = 0.7 }) {
  // TODO: guard — return { blocked: false } if obsessions is empty

  // TODO: build the hypothesis string
  // const hypothesis = `I am searching for information about ${query}`

  // TODO: call the pipeline
  // const result = await classify(hypothesis, obsessions, { multi_label: true })
  // result shape: { sequence, labels: string[], scores: number[] }

  // TODO: find the highest-scoring obsession above the threshold
  // iterate result.labels / result.scores in parallel, find first score >= threshold

  // TODO: return { blocked: true, matchedObsession, score } or { blocked: false }

  throw new Error('checkEntailment: not yet implemented')
}
