const WARNING_THRESHOLD = 20000
const CRITICAL_THRESHOLD = 23750

export function checkStorageLimits(entriesCount) {
  return {
    isWarning: entriesCount >= WARNING_THRESHOLD && entriesCount < CRITICAL_THRESHOLD,
    isCritical: entriesCount >= CRITICAL_THRESHOLD
  }
}

export function isLocalStorageAvailable() {
  try {
    const key = '__extrackt_storage_test__'
    localStorage.setItem(key, '1')
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}