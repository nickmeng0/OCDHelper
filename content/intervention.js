// ERP Companion — Intervention Page
// Shown when:
//   a) A declarativeNetRequest rule blocks a manually-listed URL, OR
//   b) A Google search query semantically matches a logged obsession.

const ERP_PROMPTS = [
  'Your discomfort is temporary. What would happen if you sat with this feeling for 5 minutes?',
  'OCD demands certainty. Can you tolerate the uncertainty instead of seeking reassurance?',
  'Rate your anxiety 1–10. Research shows it peaks and then falls — can you wait for the drop?',
  'Every time you resist a compulsion, you weaken the OCD pathway. This moment counts.',
]

function getRandomPrompt() {
  return ERP_PROMPTS[Math.floor(Math.random() * ERP_PROMPTS.length)]
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getParams() {
  const p = new URLSearchParams(location.search)
  return {
    site: p.get('site') || 'this site',
    mechanism: p.get('mechanism') || null,
    term: p.get('term') || null,
    label: p.get('label') || null,
    matchedTheme: p.get('matchedTheme') || null,
    query: p.get('query') || null,
    score: parseFloat(p.get('score') || '0') || null,
  }
}

function normalizeDomain(url) {
  return url.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase()
}

function buildContextBlock({ site, mechanism, term, label, matchedTheme, query, score }) {
  const pct = score ? ` (${Math.round(score * 100)}% match)` : ''
  const q = query ? `<em>"${escapeHtml(query)}"</em>` : `your search`

  if (mechanism === 'keyword') {
    return `
      <p style="color:#555;margin-bottom:16px;">
        ${q} on <strong>${escapeHtml(site)}</strong> matched a blocked keyword:
        <strong>${escapeHtml(term || '')}</strong>
      </p>
    `
  }
  if (mechanism === 'cluster') {
    return `
      <p style="color:#555;margin-bottom:16px;">
        ${q} on <strong>${escapeHtml(site)}</strong> matched an obsession cluster${pct}:
        <strong>${escapeHtml(label || '')}</strong>
      </p>
    `
  }
  if (mechanism === 'theme') {
    return `
      <p style="color:#555;margin-bottom:16px;">
        ${q} on <strong>${escapeHtml(site)}</strong> matched a saved theme${pct}:
        <strong>${escapeHtml(matchedTheme || '')}</strong>
      </p>
    `
  }
  return `
    <p style="color:#555;margin-bottom:16px;">
      You've blocked <strong>${escapeHtml(site)}</strong> as part of your OCD therapy.
    </p>
  `
}

function render() {
  const params = getParams()
  const root = document.getElementById('root')

  root.innerHTML = `
    <div style="max-width:520px;margin:80px auto;padding:32px;font-family:sans-serif;border:2px solid #333;border-radius:8px;text-align:center;">
      <h1 style="font-size:1.4em;margin-bottom:8px;">ERP Pause</h1>

      ${buildContextBlock(params)}

      <div style="background:#f5f5f5;padding:16px;border-radius:6px;margin-bottom:24px;">
        <p id="erp-prompt" style="font-size:1.05em;line-height:1.6;margin:0;">
          ${escapeHtml(getRandomPrompt())}
        </p>
      </div>

      <div style="margin-bottom:20px;">
        <label for="anxiety-input">Current anxiety level (1–10):&nbsp;</label>
        <input id="anxiety-input" type="number" min="1" max="10" value="6" style="width:56px;" />
      </div>

      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button id="btn-practice" style="padding:10px 20px;cursor:pointer;font-size:1em;">
          Practice ERP — Go Back
        </button>
        <button id="btn-proceed"
          style="padding:10px 20px;cursor:pointer;font-size:1em;background:#c0392b;color:#fff;border:none;border-radius:4px;">
          Proceed Anyway
        </button>
      </div>

      <p style="margin-top:20px;font-size:0.8em;color:#999;">
        To unblock a site permanently, open the ERP Companion popup and remove it from your block list.
      </p>
    </div>
  `

  document.getElementById('btn-practice').addEventListener('click', () => {
    const level = document.getElementById('anxiety-input').value
    logDecision('resisted', level, params)
    goBack()
  })

  document.getElementById('btn-proceed').addEventListener('click', async () => {
    const level = document.getElementById('anxiety-input').value
    logDecision('proceeded', level, params)
    await proceedToSite(params.site)
  })
}

function logDecision(decision, anxietyLevel, { site, obsession, score }) {
  chrome.storage.local.get(['interventionLog'], data => {
    const log = data.interventionLog || []
    log.push({
      timestamp: new Date().toISOString(),
      site,
      obsession: obsession || null,
      similarityScore: score || null,
      anxietyLevel: parseInt(anxietyLevel, 10) || null,
      decision,
    })
    chrome.storage.local.set({ interventionLog: log })
  })
}

function goBack() {
  // go(-2) skips over the blocked URL entry so we don't re-trigger the rule.
  if (history.length > 2) {
    history.go(-2)
  } else {
    location.href = 'chrome://newtab/'
  }
}

async function proceedToSite(site) {
  const { urlBlockList = [] } = await chrome.storage.local.get('urlBlockList')
  const item = urlBlockList.find(b => normalizeDomain(b.url) === site)

  if (item) {
    // Temporarily lift the block rule for 10 minutes, then restore.
    await chrome.runtime.sendMessage({ type: 'REMOVE_BLOCK_RULE', ruleId: item.id })
    location.href = `https://${site}`
    setTimeout(
      () => chrome.runtime.sendMessage({ type: 'ADD_BLOCK_RULE', url: item.url, ruleId: item.id }),
      10 * 60 * 1000
    )
  } else {
    // Semantic-only match — no declarativeNetRequest rule to lift; navigate directly.
    location.href = site.startsWith('http') ? site : `https://${site}`
  }
}

render()
