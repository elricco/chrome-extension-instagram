/**
 * Browser Polyfill
 * Ensures compatibility between Chrome and Firefox
 */

// Firefox uses 'browser', Chrome uses 'chrome'
// This creates a unified API
if (typeof browser === 'undefined') {
  var browser = chrome;
}

// Export for modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = browser;
}
