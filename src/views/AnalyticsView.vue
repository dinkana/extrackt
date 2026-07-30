<!-- src/views/AnalyticsView.vue -->
<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-gray-100">Analytics</h1>
    </header>
    <div class="flex gap-2 bg-gray-800 p-1 rounded-xl">
      <button
        v-for="period in periods"
        :key="period.value"
        @click="currentPeriod = period.value"
        :class="[
          'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
          currentPeriod === period.value
            ? 'bg-gray-700 text-gray-100 shadow-sm'
            : 'text-gray-400'
        ]"
      >
        {{ period.label }}
      </button>
    </div>
    <div class="bg-gray-800 p-4 rounded-[16px] shadow-sm h-[320px]">
      <Line v-if="chartData" :data="chartData" :options="chartOptions" />
      <p v-else class="text-center text-gray-400 py-20">No data to display</p>
    </div>
    <button
      @click="exportXlsx"
      :disabled="entriesStore.entries.length === 0"
      class="w-full h-11 bg-primary hover:bg-primary-dark text-white font-medium rounded-[12px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Export XLSX
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
const currentPeriod = ref('week')
const periods = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
]
const criteriaConfig = [
  { key: 'sleep', label: 'Sleep', color: '#8B5CF6' },
  { key: 'energy', label: 'Energy', color: '#A78BFA' },
  { key: 'mood', label: 'Mood', color: '#EC4899' },
  { key: 'productivity', label: 'Focus', color: '#F472B6' },
  { key: 'body', label: 'Body', color: '#6366F1' }
]

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
    return date.toLocaleDateString('en-US', {
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
    pointRadius: 4,
    pointHoverRadius: 6
  }))
  return { labels, datasets }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 20,
      bottom: 20,
      left: 10,
      right: 10
    }
  },
  scales: {
    y: {
      min: 0,
      max: 6,
      ticks: {
        stepSize: 1,
        color: '#9CA3AF',
        callback: function (value) {
          if (value < 1 || value > 5) return null
          return value
        }
      },
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      }
    },
    x: {
      ticks: {
        color: '#9CA3AF'
      },
      grid: {
        display: false
      }
    }
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#9CA3AF',
        usePointStyle: true,
        pointStyle: 'circle'
      }
    }
  }
}

async function exportXlsx() {
  if (entriesStore.entries.length === 0) return
  const XLSX = await import('xlsx')
  const ws = {}
  const headers = ['Date', 'Time', 'Sleep', 'Energy', 'Mood', 'Body', 'Focus']
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
  XLSX.utils.book_append_sheet(wb, ws, 'States')
  XLSX.writeFile(wb, `state-tracker-${getExportFileDate()}.xlsx`)
}
</script>