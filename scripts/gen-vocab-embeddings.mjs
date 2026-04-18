/**
 * Pre-embeds all words in src/vocab/words.json using all-MiniLM-L6-v2 and
 * writes the results to src/vocab/vocab-embeddings.json.
 *
 * Run once before building the extension:
 *   node scripts/gen-vocab-embeddings.mjs
 *
 * Requires Node.js >= 18 and a working npm install. The model (~80 MB) is
 * downloaded to the local transformers.js cache on first run.
 */

import { pipeline } from '@xenova/transformers'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const words = JSON.parse(readFileSync(resolve(root, 'src/vocab/words.json'), 'utf8'))

console.log(`[gen-vocab] Loading all-MiniLM-L6-v2 …`)
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true })
console.log(`[gen-vocab] Model ready. Embedding ${words.length} words …`)

const result = {}
const unique = [...new Set(words)]

for (let i = 0; i < unique.length; i++) {
  const word = unique[i]
  const out = await embedder(word, { pooling: 'mean', normalize: true })
  // Store at 4-decimal precision to keep file size manageable.
  result[word] = Array.from(out.data).map(v => Math.round(v * 10000) / 10000)
  if ((i + 1) % 100 === 0) console.log(`  ${i + 1} / ${unique.length}`)
}

const outPath = resolve(root, 'src/vocab/vocab-embeddings.json')
writeFileSync(outPath, JSON.stringify(result))
console.log(`[gen-vocab] Wrote ${unique.length} embeddings → ${outPath}`)
