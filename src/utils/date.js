export function getLocalISODate(date = new Date()) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  
  export function parseISODate(dateStr) {
    return new Date(`${dateStr}T00:00:00`)
  }
  
  export function isValidISODate(dateStr) {
    if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false
    const d = parseISODate(dateStr)
    return !Number.isNaN(d.getTime()) && getLocalISODate(d) === dateStr
  }
  
  export function formatTimestamp(date = new Date()) {
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yy = String(date.getFullYear()).slice(-2)
    const HH = String(date.getHours()).padStart(2, '0')
    const MM = String(date.getMinutes()).padStart(2, '0')
    return `${dd}.${mm}.${yy} ${HH}:${MM}`
  }
  
  export function formatISOToDDMMYY(dateStr) {
    if (!isValidISODate(dateStr)) return dateStr
    const d = parseISODate(dateStr)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yy = String(d.getFullYear()).slice(-2)
    return `${dd}.${mm}.${yy}`
  }
  
  export function getExportFileDate(date = new Date()) {
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${dd}${mm}${yyyy}`
  }