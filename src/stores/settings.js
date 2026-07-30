import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'state-tracker-settings'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(loadSettings())

  function loadSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) return JSON.parse(data)
    } catch {}
    return { theme: 'dark' }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
  }

  return { settings }
})