import { describe, it, expect } from 'vitest'
import { processNewEntry } from '../processNewEntry.js'

const TEXT = 'I keep worrying about contamination and germs all day'

describe('processNewEntry — keyword extraction', () => {
  it('extracts nouns from the entry text', () => {
    const { keywords } = processNewEntry(TEXT, 1)
    expect(keywords.length).toBeGreaterThan(0)
    expect(keywords).toContain('contamination')
    expect(keywords).toContain('germs')
  })

  it('does not include non-nouns like verbs or adjectives', () => {
    const { keywords } = processNewEntry('running fast feels great today', 1)
    expect(keywords).not.toContain('running')
    expect(keywords).not.toContain('fast')
  })

  it('excludes nouns of 3 chars or fewer', () => {
    const { keywords } = processNewEntry('the dog ate mud today', 1)
    expect(keywords).not.toContain('dog')
    expect(keywords).not.toContain('mud')
  })
})

describe('processNewEntry — blockList update', () => {
  it('adds extracted nouns to newBlockList', () => {
    const { addedTerms, newBlockList } = processNewEntry(TEXT, 1, { existingBlockList: [] })
    expect(addedTerms.length).toBeGreaterThan(0)
    expect(newBlockList).toEqual(expect.arrayContaining(addedTerms))
  })

  it('does not duplicate terms already in existingBlockList', () => {
    const { addedTerms } = processNewEntry(TEXT, 1, {
      existingBlockList: ['contamination', 'germs'],
    })
    expect(addedTerms).not.toContain('contamination')
    expect(addedTerms).not.toContain('germs')
  })

  it('does not mutate the existingBlockList array', () => {
    const existing = ['contamination']
    const originalLength = existing.length
    processNewEntry(TEXT, 1, { existingBlockList: existing })
    expect(existing.length).toBe(originalLength)
  })

  it('returns newBlockList as union of existing and new terms', () => {
    const { newBlockList } = processNewEntry(TEXT, 1, { existingBlockList: ['prior'] })
    expect(newBlockList).toContain('prior')
    expect(newBlockList).toContain('contamination')
  })
})
