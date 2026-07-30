<template>
  <div class="space-y-6">
    <header class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-100">extrackt</h1>
      <span class="text-sm text-gray-400">{{ formattedDate }}</span>
    </header>

    <div
      v-if="!entriesStore.storageAvailable"
      class="p-4 bg-red-900/30 border border-red-800 rounded-[12px] text-sm text-red-200"
    >
      Ваш браузер не поддерживает локальное хранение
    </div>

    <div
      v-else-if="entriesStore.storageStatus.isWarning"
      class="p-4 bg-yellow-900/30 border border-yellow-800 rounded-[12px] text-sm text-yellow-200"
    >
      Память заполнена. Экспортируйте данные в XLSX и очистите историю.
    </div>

    <div
      v-else-if="entriesStore.storageStatus.isCritical && !existingEntry"
      class="p-4 bg-red-900/30 border border-red-800 rounded-[12px] text-sm text-red-200"
    >
      Критический предел. Новые записи заблокированы. Экспортируйте и удалите данные.
    </div>

    <PentagonChart :values="currentValues" @update="onChartUpdate" />

    <div class="space-y-4 bg-gray-800 p-5 rounded-[16px] shadow-sm">
      <div v-for="criterion in criteria" :key="criterion.key" class="flex items-center gap-4">
        <label class="w-28 text-sm font-medium text-gray-200">{{ criterion.label }}</label>

        <input
          type="range"
          min="1"
          max="5"
          step="1"
          :value="currentValues[criterion.key]"
          @input="onSliderInput(criterion.key, $event)"
          :disabled="isBlocked"
          class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500 disabled:opacity-50"
        />

        <span class="w-6 text-center font-bold text-gray-100 tabular-nums">
          {{ currentValues[criterion.key] }}
        </span>
      </div>
    </div>

    <div class="text-center text-xs text-gray-400 h-4 transition-opacity">
      {{ saveStatus }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEntriesStore } from '../stores/entries'
import { useUiStore } from '../stores/ui'
import { getLocalISODate, parseISODate } from '../utils/date'
import PentagonChart from '../components/PentagonChart.vue'

const entriesStore = useEntriesStore()
const ui = useUiStore()

const criteria = [
  { key: 'sleep', label: 'Сон' },
  { key: 'energy', label: 'Бодрость' },
  { key: 'mood', label: 'Настроение' },
  { key: 'productivity', label: 'Продуктивность' },
  { key: 'body', label: 'Тело' }
]

const defaultValues = { sleep: 3, energy: 3, mood: 3, productivity: 3, body: 3 }
const currentValues = ref({ ...defaultValues })
const saveStatus = ref('')

let debounceTimer = null

const existingEntry = computed(() => entriesStore.getEntryByDate(ui.selectedDate))

const isBlocked = computed(() => {
  if (!entriesStore.storageAvailable) return true
  if (entriesStore.storageStatus.isCritical && !existingEntry.value) return true
  return false
})

const formattedDate = computed(() => {
  const date = parseISODate(ui.selectedDate)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

onMounted(() => {
  ui.selectedDate = getLocalISODate()

  const existing = entriesStore.getEntryByDate(ui.selectedDate)
  if (existing) {
    currentValues.value = {
      sleep: existing.sleep,
      energy: existing.energy,
      mood: existing.mood,
      productivity: existing.productivity,
      body: existing.body
    }
  }
})

function updateValue(key, value) {
  currentValues.value[key] = value
  triggerSave()
}

function onSliderInput(key, event) {
  updateValue(key, parseInt(event.target.value, 10))
}

function onChartUpdate(newValues) {
  if (isBlocked.value) return
  currentValues.value = newValues
  triggerSave()
}

function triggerSave() {
  if (isBlocked.value) {
    saveStatus.value = 'Сохранение заблокировано'
    return
  }

  saveStatus.value = 'Изменения...'
  clearTimeout(debounceTimer)

  debounceTimer = setTimeout(() => {
    const result = entriesStore.upsertEntry({
      date: ui.selectedDate,
      ...currentValues.value
    })

    if (result.success) {
      saveStatus.value = 'Сохранено'
    } else if (result.error === 'quota') {
      saveStatus.value = 'Память заполнена'
    } else {
      saveStatus.value = 'Сохранение заблокировано'
    }

    setTimeout(() => {
      saveStatus.value = ''
    }, 2000)
  }, 500)
}
</script>