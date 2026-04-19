// ERP Companion — Google Search content script

(function () {
  'use strict'

  let lastSentQuery = null

  function getQuery() {
    return new URLSearchParams(location.search).get('q') || ''
  }

  function showOverlay() {
    if (document.getElementById('erp-overlay')) return
    const div = document.createElement('div')
    div.id = 'erp-overlay'
    Object.assign(div.style, {
      position: 'fixed',
      inset: '0',
      background: '#fff',
      zIndex: '2147483647',
    })
    ;(document.documentElement || document).appendChild(div)
  }

  function removeOverlay() {
    document.getElementById('erp-overlay')?.remove()
  }

  async function maybeNotify() {
    const q = getQuery()
    if (!q || q === lastSentQuery) return
    lastSentQuery = q

    showOverlay()

    try {
      const result = await chrome.runtime.sendMessage({ type: 'SEARCH_QUERY', query: q })
      if (!result?.blocked) removeOverlay()
      // if blocked, SW redirects the tab — overlay disappears with the page
    } catch {
      removeOverlay()
    }
  }

  maybeNotify()

  ;['pushState', 'replaceState'].forEach(method => {
    const original = history[method].bind(history)
    history[method] = function (...args) {
      original(...args)
      maybeNotify()
    }
  })

  window.addEventListener('popstate', maybeNotify)
})()
