/**
 * Debug switches, read from the address bar (never on by default):
 *   ?fast    story text writes 8× faster
 *   ?unlock  every page's next arrow is unlocked from the start
 * e.g. http://127.0.0.1:5179/?page=4&fast&unlock
 */
const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams()
export const debug = {
  fast: q.has('fast'),
  unlock: q.has('unlock'),
}
