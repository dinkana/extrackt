import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { checkStorageLimits, isLocalStorageAvailable } from '../utils/storage'
import { formatTimestamp, getLocalISODate, isValidISODate } from '../utils/date'
import { uuidv4 } from '../utils/id'

const STORAGE_KEY = 'state-tracker-entries'

export const useEntriesStore = defineStore('entries', () => {
  const storageAvailable = isLocalStorageAvailable()
  const entries = ref(storageAvailable ? loadEntries() : [])

  const storageStatus = computed(() => checkStorageLimits(entries.value.length))

  function loadEntries() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []
      const parsed = JSON.parse(data)
      return parsed.map(validateEntry).filter(Boolean)
    } catch {
      return []
    }
  }

  function validateEntry(entry) {
    if (!entry || !isValidISODate(entry.date)) return null

    const createdAtRaw = Number(entry.createdAt)
    const createdAt = Number.isFinite(createdAtRaw) ? createdAtRaw : Date.now()

    const updatedAtRaw = Number(entry.updatedAt)
    const updatedAt = Number.isFinite(updatedAtRaw) ? updatedAtRaw : createdAt

    return {
      id: typeof entry.id === 'string' && entry.id ? entry.id : uuidv4(),
      date: entry.date,
      timestamp: typeof entry.timestamp === 'string' && entry.timestamp
        ? entry.timestamp
        : formatTimestamp(new Date(createdAt)),
      sleep: clamp(entry.sleep),
      energy: clamp(entry.energy),
      mood: clamp(entry.mood),
      body: clamp(entry.body),
      productivity: clamp(entry.productivity),
      createdAt,
      updatedAt
    }
  }

  function clamp(value) {
    const num = Math.round(Number(value))
    return Number.isInteger(num) && num >= 1 && num <= 5 ? num : 3
  }

  function saveEntries() {
    if (!storageAvailable) return false

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
      return true
    } catch {
      return false
    }
  }

  function getEntryByDate(dateStr) {
    return entries.value.find(entry => entry.date === dateStr)
  }

  function upsertEntry(entry) {
    if (!storageAvailable) {
      return { success: false, error: 'storage' }
    }

    const index = entries.value.findIndex(item => item.date === entry.date)
    const isNew = index === -1

    if (isNew && storageStatus.value.isCritical) {
      return { success: false, error: 'critical' }
    }

    const fullEntry = {
      ...entry,
      timestamp: formatTimestamp(),
      updatedAt: Date.now()
    }

    let previous = null

    if (isNew) {
      entries.value.push({
        id: uuidv4(),
        createdAt: Date.now(),
        ...fullEntry
      })
    } else {
      previous = { ...entries.value[index] }
      entries.value[index] = {
        ...previous,
        ...fullEntry
      }
    }

    const saved = saveEntries()

    if (!saved) {
      if (isNew) {
        entries.value.pop()
      } else {
        entries.value[index] = previous
      }

      return { success: false, error: 'quota' }
    }

    return { success: true }
  }

  function cleanupOldEntries(retentionDays) {
    if (!storageAvailable || !retentionDays || retentionDays <= 0) return

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - retentionDays)
    const cutoffStr = getLocalISODate(cutoff)

    const initialLength = entries.value.length
    entries.value = entries.value.filter(entry => entry.date >= cutoffStr)

    if (entries.value.length !== initialLength) {
      saveEntries()
    }
  }

  function clearAll() {
    entries.value = []
    if (storageAvailable) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    entries,
    storageAvailable,
    storageStatus,
    getEntryByDate,
    upsertEntry,
    cleanupOldEntries,
    clearAll
  }
})