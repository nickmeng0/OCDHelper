import { describe, it, expect } from 'vitest'
import { processNewEntry } from '../processNewEntry.js'

const TEXT = 'I keep worrying about contamination and germs all day'

describe('processNewEntry — keyword extraction', () => {
  it('extracts at least one keyword from OCD-relevant text', () => {
    const { keywords } = processNewEntry(TEXT, 1)
    expect(keywords.length).toBeGreaterThan(0)
  })

  it('keywords contain content related to the entry', () => {
    const { keywords } = processNewEntry(TEXT, 1)
    const joined = keywords.join(' ')
    expect(joined).toMatch(/contamination|germ/)
  })


})

describe('processNewEntry — blockList update', () => {
  it('adds extracted keywords to newBlockList', () => {
    const { addedTerms, newBlockList } = processNewEntry(TEXT, 1, { existingBlockList: [] })
    expect(addedTerms.length).toBeGreaterThan(0)
    expect(newBlockList).toEqual(expect.arrayContaining(addedTerms))
  })

  it('does not duplicate terms already in existingBlockList', () => {
    const first = processNewEntry(TEXT, 1, { existingBlockList: [] })
    const { addedTerms } = processNewEntry(TEXT, 2, { existingBlockList: first.newBlockList })
    expect(addedTerms).toHaveLength(0)
  })

  it('does not mutate the existingBlockList array', () => {
    const existing = ['prior']
    const originalLength = existing.length
    processNewEntry(TEXT, 1, { existingBlockList: existing })
    expect(existing.length).toBe(originalLength)
  })

  it('returns newBlockList as union of existing and new terms', () => {
    const { newBlockList } = processNewEntry(TEXT, 1, { existingBlockList: ['prior'] })
    expect(newBlockList).toContain('prior')
    expect(newBlockList.length).toBeGreaterThan(1)
  })
})
