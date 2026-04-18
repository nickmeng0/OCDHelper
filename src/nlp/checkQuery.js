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
  const words = tokenize(queryString)
  const blockSet = new Set(blockList.map(w => w.toLowerCase()))
  const matchedTerm = words.find(w => blockSet.has(w))
  if (matchedTerm) return { blocked: true, mechanism: 'keyword', matchedTerm }
  return { blocked: false }
}
