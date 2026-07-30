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
      Your browser does not support local storage
    </div>

    <div
      v-else-if="entriesStore.storageStatus.isWarning"
      class="p-4 bg-yellow-900/30 border border-yellow-800 rounded-[12px] text-sm text-yellow-200"
    >
      Storage is running low. Export your data and clear history.
    </div>

    <div
      v-else-if="entriesStore.storageStatus.isCritical && !existingEntry"
      class="p-4 bg-red-900/30 border border-red-800 rounded-[12px] text-sm text-red-200"
    >
      Storage limit reached. Export and delete data to continue.
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
  { key: 'sleep', label: 'Sleep' },
  { key: 'energy', label: 'Energy' },
  { key: 'mood', label: 'Mood' },
  { key: 'productivity', label: 'Focus' },
  { key: 'body', label: 'Body' }
]

const defaultValues = {
  sleep: 3,
  energy: 3,
  mood: 3,
  productivity: 3,
  body: 3
}

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
  return date.toLocaleDateString('en-US', {
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
    saveStatus.value = 'Saving blocked'
    return
  }

  saveStatus.value = 'Saving...'
  clearTimeout(debounceTimer)

  debounceTimer = setTimeout(() => {
    const result = entriesStore.upsertEntry({
      date: ui.selectedDate,
      ...currentValues.value
    })

    if (result.success) {
      saveStatus.value = 'Saved'
    } else if (result.error === 'quota') {
      saveStatus.value = 'Storage full'
    } else {
      saveStatus.value = 'Saving blocked'
    }

    setTimeout(() => {
      saveStatus.value = ''
    }, 2000)
  }, 500)
}
</script>