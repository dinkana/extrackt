<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Аналитика</h1>
    </header>

    <div class="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
      <button
        v-for="period in periods"
        :key="period.value"
        @click="currentPeriod = period.value"
        :class="[
          'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
          currentPeriod === period.value
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
            : 'text-gray-500 dark:text-gray-400'
        ]"
      >
        {{ period.label }}
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 rounded-[16px] shadow-sm h-[320px]">
      <Line v-if="chartData" :data="chartData" :options="chartOptions" />
      <p v-else class="text-center text-gray-500 dark:text-gray-400 py-20">Нет данных для отображения</p>
    </div>

    <button
      @click="exportXlsx"
      :disabled="entriesStore.entries.length === 0"
      class="w-full h-11 bg-primary hover:bg-primary-dark text-white font-medium rounded-[12px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Экспорт XLSX
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { useEntriesStore } from '../stores/entries'
import { useSettingsStore } from '../stores/settings'
import {
  getLocalISODate,
  parseISODate,
  getExportFileDate,
  formatISOToDDMMYY
} from '../utils/date'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const entriesStore = useEntriesStore()
const settingsStore = useSettingsStore()

const currentPeriod = ref('week')

const periods = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'year', label: 'Год' }
]

const criteriaConfig = [
  { key: 'sleep', label: 'Сон', color: '#8B5CF6' },
  { key: 'energy', label: 'Бодрость', color: '#A78BFA' },
  { key: 'mood', label: 'Настроение', color: '#EC4899' },
  { key: 'productivity', label: 'Продуктивность', color: '#F472B6' },
  { key: 'body', label: 'Тело', color: '#6366F1' }
]

const isDark = computed(() => {
  if (settingsStore.settings.theme === 'dark') return true
  if (settingsStore.settings.theme === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
})

const filteredEntries = computed(() => {
  const now = new Date()
  let days = 7

  if (currentPeriod.value === 'month') days = 30
  if (currentPeriod.value === 'year') days = 365

  const cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days)
  const cutoffStr = getLocalISODate(cutoffDate)

  return entriesStore.entries
    .filter(entry => entry.date >= cutoffStr)
    .sort((a, b) => a.date.localeCompare(b.date))
})

const chartData = computed(() => {
  if (filteredEntries.value.length === 0) return null

  const labels = filteredEntries.value.map(entry => {
    const date = parseISODate(entry.date)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    })
  })

  const datasets = criteriaConfig.map(criterion => ({
    label: criterion.label,
    data: filteredEntries.value.map(entry => entry[criterion.key]),
    borderColor: criterion.color,
    backgroundColor: `${criterion.color}33`,
    tension: 0.3,
    pointRadius: 3,
    pointHoverRadius: 5
  }))

  return { labels, datasets }
})

const chartOptions = computed(() => {
  const textColor = isDark.value ? '#9CA3AF' : '#6B7280'
  const gridColor = isDark.value ? 'rgba(156, 163, 175, 0.1)' : 'rgba(107, 114, 128, 0.1)'

  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          color: textColor
        },
        grid: { color: gridColor }
      },
      x: {
        ticks: { color: textColor },
        grid: { display: false }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  }
})

async function exportXlsx() {
  if (entriesStore.entries.length === 0) return

  const XLSX = await import('xlsx')

  const ws = {}
  const headers = ['Дата', 'Время', 'Сон', 'Бодрость', 'Настроение', 'Тело', 'Продуктивность']

  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' })

  const sortedEntries = [...entriesStore.entries].sort((a, b) => a.date.localeCompare(b.date))

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i]
    const [timestampDate, timestampTime] = entry.timestamp ? entry.timestamp.split(' ') : []

    const row = [
      timestampDate || formatISOToDDMMYY(entry.date),
      timestampTime || '',
      entry.sleep,
      entry.energy,
      entry.mood,
      entry.body,
      entry.productivity
    ]

    XLSX.utils.sheet_add_aoa(ws, [row], { origin: { r: i + 1, c: 0 } })
  }

  ws['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: sortedEntries.length, c: headers.length - 1 }
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Состояния')

  XLSX.writeFile(wb, `state-tracker-${getExportFileDate()}.xlsx`)
}
</script>