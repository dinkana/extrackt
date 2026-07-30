<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold text-gray-100">Settings</h1>
    </header>

    <div class="bg-gray-800 p-5 rounded-[16px] shadow-sm">
      <h2 class="text-lg font-semibold text-gray-100 mb-2">Data</h2>
      <p class="text-sm text-gray-400 mb-4">Deleting all records is permanent and cannot be undone.</p>
      <button
        @click="confirmClear"
        class="w-full h-11 bg-red-500 hover:bg-red-600 text-white font-medium rounded-[12px] transition-colors"
      >
        Delete all data
      </button>
    </div>
  </div>
</template>

<script setup>
import { useEntriesStore } from '../stores/entries'

const entriesStore = useEntriesStore()

function confirmClear() {
  if (confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
    entriesStore.clearAll()
    alert('All data has been deleted.')
  }
}
</script>