<template>
  <div class="relative w-full max-w-[300px] mx-auto aspect-square">
    <svg 
      viewBox="0 0 200 200" 
      class="w-full h-full touch-none" 
      @pointermove="onPointerMove" 
      @pointerup="onPointerUp" 
      @pointercancel="onPointerUp"
    >
      <g v-for="level in 5" :key="level">
        <polygon :points="getPolygonPoints(level)" fill="none" stroke="currentColor" class="text-gray-200 dark:text-gray-700" stroke-width="0.5" />
      </g>
      
      <g v-for="i in 5" :key="i">
        <line :x1="100" :y1="100" :x2="getPoint(100, i).x" :y2="getPoint(100, i).y" stroke="currentColor" class="text-gray-200 dark:text-gray-700" stroke-width="0.5" />
      </g>

      <polygon :points="dataPoints" fill="url(#gradient)" fill-opacity="0.4" stroke="#8B5CF6" stroke-width="2" />

      <g v-for="(criterion, index) in criteria" :key="criterion.key">
        <circle 
          :cx="getPoint(values[criterion.key], index).x" 
          :cy="getPoint(values[criterion.key], index).y" 
          r="6" 
          fill="#8B5CF6" 
          class="cursor-pointer"
          :class="{'fill-pink-500': ui.activeCriterion === criterion.key}"
          @pointerdown.stop="startDrag(criterion.key)"
        />
        
        <text 
          :x="getPoint(125, index).x" 
          :y="getPoint(125, index).y" 
          text-anchor="middle" 
          dominant-baseline="middle"
          class="text-[10px] font-medium fill-gray-600 dark:fill-gray-300 select-none"
        >
          {{ criterion.label }}
        </text>
        
        <text 
          :x="getPoint(142, index).x" 
          :y="getPoint(142, index).y" 
          text-anchor="middle" 
          dominant-baseline="middle"
          class="text-[12px] font-bold fill-gray-900 dark:fill-gray-100 select-none"
        >
          {{ values[criterion.key] }}
        </text>
      </g>

      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8B5CF6" />
          <stop offset="100%" stop-color="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/ui'

const props = defineProps({
  values: { type: Object, required: true }
})
const emit = defineEmits(['update'])

const ui = useUiStore()
const cx = 100, cy = 100, maxR = 80

const criteria = [
  { key: 'sleep', label: 'Сон' },
  { key: 'energy', label: 'Бодрость' },
  { key: 'mood', label: 'Настроение' },
  { key: 'productivity', label: 'Продукт.' },
  { key: 'body', label: 'Тело' }
]

function getPoint(value, index) {
  const angle = (Math.PI * 2 * index / 5) - (Math.PI / 2)
  const r = (value / 5) * maxR
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle)
  }
}

function getPolygonPoints(level) {
  return Array.from({ length: 5 }, (_, i) => {
    const p = getPoint(level, i)
    return `${p.x},${p.y}`
  }).join(' ')
}

const dataPoints = computed(() => {
  return criteria.map((c, i) => {
    const p = getPoint(props.values[c.key], i)
    return `${p.x},${p.y}`
  }).join(' ')
})

let dragKey = null

function startDrag(key) {
  dragKey = key
  ui.isDragging = true
  ui.activeCriterion = key
}

function onPointerMove(e) {
  if (!ui.isDragging || dragKey === null) return
  const svg = e.currentTarget
  const rect = svg.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 200
  const y = ((e.clientY - rect.top) / rect.height) * 200
  
  const dx = x - cx
  const dy = y - cy
  const dist = Math.sqrt(dx * dx + dy * dy)
  let value = Math.round((dist / maxR) * 5)
  value = Math.max(1, Math.min(5, value))
  
  emit('update', { ...props.values, [dragKey]: value })
}

function onPointerUp() {
  if (ui.isDragging) {
    ui.isDragging = false
    ui.activeCriterion = null
    dragKey = null
  }
}
</script>