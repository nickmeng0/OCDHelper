import { describe, it, expect } from 'vitest'
import { checkQuery } from '../checkQuery.js'

describe('checkQuery — keyword match', () => {
  it('returns blocked:false when blockList is empty', () => {
    expect(checkQuery('contamination', { blockList: [] }).blocked).toBe(false)
  })

  it('blocks when a query word is in blockList', () => {
    const result = checkQuery('how to clean contamination', { blockList: ['contamination'] })
    expect(result).toEqual({ blocked: true, mechanism: 'keyword', matchedTerm: 'contamination' })
  })

  it('is case-insensitive', () => {
    const result = checkQuery('CONTAMINATION risk', { blockList: ['contamination'] })
    expect(result.blocked).toBe(true)
    expect(result.mechanism).toBe('keyword')
  })

  it('skips short tokens (<= 3 chars)', () => {
    const result = checkQuery('the cat sat', { blockList: ['cat', 'sat', 'the'] })
    expect(result.blocked).toBe(false)
  })

  it('returns blocked:false when no word matches', () => {
    const result = checkQuery('clean water usage', { blockList: ['contamination'] })
    expect(result.blocked).toBe(false)
  })

  it('matches the first blocked term found', () => {
    const result = checkQuery('wash hands with soap', { blockList: ['wash', 'soap'] })
    expect(result.blocked).toBe(true)
    expect(result.matchedTerm).toBeDefined()
  })
})
