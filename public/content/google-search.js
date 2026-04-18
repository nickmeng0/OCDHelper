// ERP Companion — Google Search content script
// Intercepts search queries and asks the service worker whether the query
// semantically resembles a logged obsession.

(function () {
  'use strict'

  let lastSentQuery = null

  function getQuery() {
    return new URLSearchParams(location.search).get('q') || ''
  }

  function maybeNotify() {
    const q = getQuery()
    if (!q || q === lastSentQuery) return
    lastSentQuery = q
    chrome.runtime.sendMessage({ type: 'SEARCH_QUERY', query: q })
  }

  // Initial page load.
  maybeNotify()

  // Google SPA navigation: Google updates the URL via history.pushState without
  // a full page reload. Monkey-patch the history methods to catch these transitions.
  ;['pushState', 'replaceState'].forEach(method => {
    const original = history[method].bind(history)
    history[method] = function (...args) {
      original(...args)
      maybeNotify()
    }
  })

  window.addEventListener('popstate', maybeNotify)
})()
