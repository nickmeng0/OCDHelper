export function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  return denom === 0 ? 0 : dot / denom
}

// Returns unique lowercase alphabetic tokens longer than 3 chars.
export function tokenize(text) {
  return [...new Set(
    text.toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3 && /^[a-z]+$/.test(w))
  )]
}
