import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLocalISODate } from '../utils/date'

export const useUiStore = defineStore('ui', () => {
  const currentView = ref('home')
  const selectedDate = ref(getLocalISODate())
  const isDragging = ref(false)
  const activeCriterion = ref(null)

  return {
    currentView,
    selectedDate,
    isDragging,
    activeCriterion
  }
})