<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Настройки</h1>
    </header>

    <div class="bg-white dark:bg-gray-800 p-5 rounded-[16px] shadow-sm space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">Тема</label>

        <div class="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            v-for="theme in themes"
            :key="theme.value"
            @click="settingsStore.updateTheme(theme.value)"
            :class="[
              'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
              settingsStore.settings.theme === theme.value
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            ]"
          >
            {{ theme.label }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">Хранение данных</label>

        <select
          :value="settingsStore.settings.dataRetentionDays"
          @change="onRetentionChange"
          class="w-full h-11 px-3 bg-gray-100 dark:bg-gray-700 border-none rounded-[12px] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary"
        >
          <option :value="0">Без ограничений</option>
          <option :value="30">30 дней</option>
          <option :value="90">90 дней</option>
        </select>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 p-5 rounded-[16px] shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Данные</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Удаление всех записей необратимо.</p>

      <button
        @click="confirmClear"
        class="w-full h-11 bg-red-500 hover:bg-red-600 text-white font-medium rounded-[12px] transition-colors"
      >
        Удалить все данные
      </button>
    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '../stores/settings'
import { useEntriesStore } from '../stores/entries'

const settingsStore = useSettingsStore()
const entriesStore = useEntriesStore()

const themes = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Темная' },
  { value: 'system', label: 'Системная' }
]

function onRetentionChange(event) {
  const days = Number(event.target.value)
  settingsStore.updateRetention(days)
  entriesStore.cleanupOldEntries(days)
}

function confirmClear() {
  if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
    entriesStore.clearAll()
    alert('Все данные удалены.')
  }
}
</script>