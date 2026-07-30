<template>
  <div class="min-h-screen flex flex-col">
    <main class="flex-1 p-4 pb-24 max-w-2xl mx-auto w-full">
      <HomeView v-if="ui.currentView === 'home'" />
      <AnalyticsView v-else-if="ui.currentView === 'analytics'" />
      <SettingsView v-else-if="ui.currentView === 'settings'" />
    </main>

    <nav class="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around h-16 items-center shadow-lg">
      <button
        @click="ui.currentView = 'home'"
        :class="navClass('home')"
        class="flex flex-col items-center justify-center flex-1 h-full text-xs font-medium"
      >
        Главная
      </button>

      <button
        @click="ui.currentView = 'analytics'"
        :class="navClass('analytics')"
        class="flex flex-col items-center justify-center flex-1 h-full text-xs font-medium"
      >
        Аналитика
      </button>

      <button
        @click="ui.currentView = 'settings'"
        :class="navClass('settings')"
        class="flex flex-col items-center justify-center flex-1 h-full text-xs font-medium"
      >
        Настройки
      </button>
    </nav>
  </div>
</template>

<script setup>
import { defineAsyncComponent, onMounted } from 'vue'
import { useUiStore } from './stores/ui'
import { useEntriesStore } from './stores/entries'
import HomeView from './views/HomeView.vue'

const AnalyticsView = defineAsyncComponent(() => import('./views/AnalyticsView.vue'))
const SettingsView = defineAsyncComponent(() => import('./views/SettingsView.vue'))

const ui = useUiStore()
const entriesStore = useEntriesStore()

onMounted(() => {
  if (!entriesStore.storageAvailable) {
    alert('Ваш браузер не поддерживает локальное хранение')
  }
})

const navClass = view => [
  'transition-colors',
  ui.currentView === view ? 'text-primary' : 'text-gray-400'
]
</script>