// ERP Companion — Background Service Worker

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERVENTION_PATH = '/content/intervention.html'
const OFFSCREEN_URL = 'offscreen/offscreen.html'
const MAX_RULE_ID = 2_147_483_647

// ─── Utilities ────────────────────────────────────────────────────────────────

function isValidRuleId(id) {
  return Number.isInteger(id) && id >= 1 && id <= MAX_RULE_ID
}

function getInterventionUrl(params = {}) {
  const base = chrome.runtime.getURL(INTERVENTION_PATH)
  const qs = new URLSearchParams(params).toString()
  return qs ? `${base}?${qs}` : base
}

function normalizeDomain(raw) {
  return raw.trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .toLowerCase()
}

// ─── Offscreen document management ───────────────────────────────────────────

let _offscreenCreating = null

async function ensureOffscreen() {
  if (_offscreenCreating) return _offscreenCreating
  const exists = await chrome.offscreen.hasDocument().catch(() => false)
  if (exists) return
  _offscreenCreating = chrome.offscreen
    .createDocument({
      url: chrome.runtime.getURL(OFFSCREEN_URL),
      reasons: ['WORKERS'],
      justification: 'Run NLP keyword processing in isolated context',
    })
    .catch(err => { if (!err.message.toLowerCase().includes('already')) throw err })
    .finally(() => { _offscreenCreating = null })
  return _offscreenCreating
}

function sendToOffscreen(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ ...message, target: 'offscreen' }, response => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message))
      else if (!response) reject(new Error('No response from offscreen document'))
      else resolve(response)
    })
  })
}

// ─── Query checking (runs inline — no offscreen round-trip) ──────────────────


async function handleSearchQuery(query, tabId) {
  try {
    const { blockList: rawBlockList = [] } = await chrome.storage.local.get(['blockList'])
    const blockList = rawBlockList.filter(w => typeof w === 'string')

    const lowerQuery = query.toLowerCase()
    let matchedTerm = null
    for (const term of blockList) {
      const lowerTerm = term.toLowerCase()
      const matched = lowerTerm.includes(' ')
        ? lowerQuery.includes(lowerTerm)
        : new RegExp(`\\b${lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(lowerQuery)
      if (matched) { matchedTerm = term; break }
    }
    if (matchedTerm) {
      console.log(`[ERP] Query blocked: "${query}" matched keyword "${matchedTerm}"`)
      const params = { site: 'google.com', mechanism: 'keyword', query, term: matchedTerm }
      await chrome.tabs.update(tabId, { url: getInterventionUrl(params) })
      return { blocked: true }
    }

    // ── Mechanism 2: NLI entailment check ──────────────────────────────────────
    const { obsessionLogs = [] } = await chrome.storage.local.get(['obsessionLogs'])
    const obsessions = obsessionLogs.map(log => log.text).filter(Boolean)
    if (!obsessions.length) return { blocked: false }

    await ensureOffscreen()
    const entailResult = await sendToOffscreen({ type: 'CHECK_ENTAILMENT', query, obsessions })
    if (!entailResult?.blocked) return { blocked: false }

    console.log(`[ERP] Query blocked by entailment: "${query}" matched "${entailResult.matchedObsession}" (score=${entailResult.score?.toFixed(2)})`)
    const entailParams = { site: 'google.com', mechanism: 'entailment', query, term: entailResult.matchedObsession }
    await chrome.tabs.update(tabId, { url: getInterventionUrl(entailParams) })
    return { blocked: true }
  } catch (err) {
    console.warn('[ERP] handleSearchQuery error:', err.message)
    return { blocked: false }
  }
}

// ─── Entry processing ─────────────────────────────────────────────────────────

async function processNewEntry(text, id) {
  await ensureOffscreen()
  const { blockList: rawBlockList = [] } = await chrome.storage.local.get(['blockList'])
  const blockList = rawBlockList.filter(w => typeof w === 'string')

  const result = await sendToOffscreen({
    type: 'PROCESS_NEW_ENTRY', text, id,
    existingBlockList: blockList,
  })
  if (result?.error) throw new Error(result.error)

  await chrome.storage.local.set({ blockList: result.newBlockList })

  console.log(`[ERP] processNewEntry id=${id}: keywords=[${result.keywords?.join(', ')}], +${result.addedTerms?.length} block terms`)
  return { keywords: result.keywords, addedTerms: result.addedTerms }
}

// ─── URL block rule management (urlBlockList) ─────────────────────────────────

async function addBlockRule(url, ruleId) {
  if (!isValidRuleId(ruleId)) { console.warn(`[ERP] Invalid rule ID: ${ruleId}`); return }
  const domain = normalizeDomain(url)
  if (!domain) return
  try { await chrome.declarativeNetRequest.updateDynamicRules({ addRules: [], removeRuleIds: [ruleId] }) } catch (_) {}
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
      id: ruleId, priority: 1,
      action: { type: 'redirect', redirect: { url: getInterventionUrl({ site: domain, mechanism: 'url' }) } },
      condition: { urlFilter: `*${domain}*`, resourceTypes: ['main_frame'] },
    }],
    removeRuleIds: [],
  })
  console.log(`[ERP] Block rule added: ${domain} (id=${ruleId})`)
}

async function removeBlockRule(ruleId) {
  if (!isValidRuleId(ruleId)) { console.warn(`[ERP] Invalid rule ID: ${ruleId}`); return }
  await chrome.declarativeNetRequest.updateDynamicRules({ addRules: [], removeRuleIds: [ruleId] })
  console.log(`[ERP] Block rule removed (id=${ruleId})`)
}

async function syncRulesFromStorage() {
  const { urlBlockList = [] } = await chrome.storage.local.get('urlBlockList')
  const valid = urlBlockList.filter(item => isValidRuleId(item.id))
  const invalid = urlBlockList.filter(item => !isValidRuleId(item.id))
  if (invalid.length) {
    console.warn(`[ERP] Dropping ${invalid.length} entry/entries with invalid IDs.`)
    await chrome.storage.local.set({ urlBlockList: valid })
  }
  const existing = await chrome.declarativeNetRequest.getDynamicRules()
  const existingIds = new Set(existing.map(r => r.id))
  for (const item of valid) {
    if (item.active && !existingIds.has(item.id)) await addBlockRule(item.url, item.id).catch(console.error)
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(syncRulesFromStorage)
chrome.runtime.onStartup.addListener(syncRulesFromStorage)

// ─── Message router ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const respond = (promise) => {
    promise
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ error: err.message }))
    return true
  }

  switch (message.type) {
    case 'SEARCH_QUERY': {
      const tabId = sender.tab?.id
      if (!tabId) { sendResponse({ blocked: false }); return true }
      handleSearchQuery(message.query, tabId)
        .then(sendResponse)
        .catch(() => sendResponse({ blocked: false }))
      return true
    }

    case 'PROCESS_NEW_ENTRY':
      return respond(processNewEntry(message.text, message.id))

    case 'ADD_BLOCK_RULE':
      return respond(addBlockRule(message.url, message.ruleId).then(() => ({ success: true })))

    case 'REMOVE_BLOCK_RULE':
      return respond(removeBlockRule(message.ruleId).then(() => ({ success: true })))

    case 'GET_MODEL_STATUS':
      return respond(Promise.resolve({ embedder: 'idle', classifier: 'idle', summarizer: 'idle' }))
  }
})
