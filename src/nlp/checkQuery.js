import { tokenize } from './utils.js'

/**
 * Check a search query against the keyword blockList.
 * Pure synchronous function — no models, no storage access.
 *
 * @param {string}   queryString
 * @param {object}   deps
 * @param {string[]} deps.blockList  flat keyword list
 * @returns {{ blocked: boolean, mechanism?: string, matchedTerm?: string }}
 */
export function checkQuery(queryString, { blockList = [] } = {}) {
  const lowerQuery = queryString.toLowerCase()
  const queryWords = new Set(tokenize(queryString))
  for (const term of blockList) {
    const lowerTerm = term.toLowerCase()
    const matched = lowerTerm.includes(' ')
      ? lowerQuery.includes(lowerTerm)
      : queryWords.has(lowerTerm)
    if (matched) return { blocked: true, mechanism: 'keyword', matchedTerm: term }
  }
  return { blocked: false }
}
