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
    return { theme: 'system', dataRetentionDays: 0 }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
  }

  function updateTheme(theme) {
    settings.value.theme = theme
    applyTheme(theme)
    saveSettings()
  }

  function updateRetention(days) {
    settings.value.dataRetentionDays = days
    saveSettings()
  }

  function applyTheme(theme) {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  applyTheme(settings.value.theme)

  return { settings, updateTheme, updateRetention }
})