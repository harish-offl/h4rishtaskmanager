// Central localStorage-based data store for Arrise Business Tracker
const PREFIX = 'arrise_biz_'

export function getStore(key) {
  try { return JSON.parse(localStorage.getItem(PREFIX + key) || 'null') } catch { return null }
}
export function setStore(key, val) {
  localStorage.setItem(PREFIX + key, JSON.stringify(val))
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function formatINR(amount) {
  if (!amount && amount !== 0) return '₹0'
  return '₹' + Number(amount).toLocaleString('en-IN')
}
