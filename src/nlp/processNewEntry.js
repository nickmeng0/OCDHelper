import nlp from 'compromise'

export function processNewEntry(text, id, { existingBlockList = [] } = {}) {
  const doc = nlp(text)
  // const nouns = doc.nouns().out('array')
  const nouns = doc.nouns().toSingular().out('array')

  const keywords = [...new Set(
    nouns
      // .flatMap(n => n.toLowerCase().split(/\s+/))
      // .map(w => w.replace(/[^a-z]/g, ''))
      .map(w => w.toLowerCase())
      .filter(w => w.length > 3)
  )]
  console.log(keywords)
  const existingSet = new Set(existingBlockList.map(w => w.toLowerCase()))
  const addedTerms = keywords.filter(w => !existingSet.has(w))
  const newBlockList = [...existingBlockList, ...addedTerms]
  return { keywords, addedTerms, newBlockList }
}
