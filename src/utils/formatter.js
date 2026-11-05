/**
 * Utility functions for formatting currency, numbers, and strings
 */

/**
 * Format number to Indonesian Rupiah (e.g. Rp 15.000.000)
 * @param {number|string} amount
 * @param {boolean} includePrefix
 * @returns {string}
 */
export function formatRupiah(amount, includePrefix = true) {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount) || 0
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(numeric)

  return includePrefix ? `Rp ${formatted}` : formatted
}

/**
 * Format number to compact representation (e.g. 15.5 jt or 250 rb)
 * @param {number} amount
 * @returns {string}
 */
export function formatCompactRupiah(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} M`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')} Jt`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)} Rb`
  }
  return num.toString()
}

/**
 * Format percentage (e.g. 75%)
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(value, decimals = 0) {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0
  return `${num.toFixed(decimals)}%`
}

/**
 * Generate a unique ID
 * @param {string} prefix
 * @returns {string}
 */
export function generateId(prefix = 'item') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}
