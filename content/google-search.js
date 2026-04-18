// ERP Companion — Google Search Query Detector
// Runs at document_start on https://www.google.com/search*
// Extracts the search query and forwards it to the service worker for checking.

(function () {
  function getQuery() {
    return new URLSearchParams(location.search).get('q') || ''
  }

  function sendQuery(query) {
    const q = query.trim()
    if (!q) return
    chrome.runtime.sendMessage({ type: 'SEARCH_QUERY', query: q })
  }

  // Fire immediately on page load.
  sendQuery(getQuery())

  // Google updates the URL client-side for subsequent searches without a full
  // page reload (pushState). Watch for that so we catch every search.
  let lastQuery = getQuery()
  const observer = new MutationObserver(() => {
    const current = getQuery()
    if (current && current !== lastQuery) {
      lastQuery = current
      sendQuery(current)
    }
  })

  observer.observe(document.documentElement, { childList: true, subtree: true })
})()
