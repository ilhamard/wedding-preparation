<script setup>
import { computed, ref } from 'vue'
import { formatCompactRupiah, formatRupiah, formatPercent } from '@/utils/formatter'
import { BarChart3, PieChart, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  totalActual: {
    type: Number,
    default: 0,
  },
})

const chartType = ref('bars') // 'bars' | 'donut'

// Romantic pastel color palette
const palette = [
  '#C58F91', // Dusty Rose
  '#D8BD8A', // Champagne Gold
  '#A8B5A0', // Sage Green
  '#E0B2B4', // Soft Mauve
  '#8E9C86', // Deep Sage
  '#C4A56E', // Warm Gold
  '#B27678', // Rose Dark
  '#DCE4D8', // Light Sage
  '#F2E6CE', // Pale Gold
  '#AAA5A1', // Soft Charcoal
  '#E8D5AE', // Champagne Light
]

const chartData = computed(() => {
  const maxVal = Math.max(...props.categories.map((c) => c.actual || c.estimated), 1)
  return props.categories.map((item, index) => {
    const val = item.actual > 0 ? item.actual : item.estimated
    const percent = props.totalActual > 0 ? (val / props.totalActual) * 100 : 0
    return {
      ...item,
      color: palette[index % palette.length],
      percent,
      barHeightPercent: Math.max(Math.round((val / maxVal) * 100), 12),
    }
  })
})

// Donut calculation
const donutSlices = computed(() => {
  let accumulatedAngle = 0
  return chartData.value.map((item) => {
    const angle = (item.percent / 100) * 360
    const startAngle = accumulatedAngle
    accumulatedAngle += angle

    // SVG arc coordinates
    const r = 40
    const cx = 50
    const cy = 50

    const x1 = cx + r * Math.cos((Math.PI * (startAngle - 90)) / 180)
    const y1 = cy + r * Math.sin((Math.PI * (startAngle - 90)) / 180)
    const x2 = cx + r * Math.cos((Math.PI * (startAngle + angle - 90)) / 180)
    const y2 = cy + r * Math.sin((Math.PI * (startAngle + angle - 90)) / 180)

    const largeArcFlag = angle > 180 ? 1 : 0
    const pathData = angle >= 359.9
      ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

    return {
      ...item,
      pathData,
    }
  })
})
</script>

<template>
  <div class="glass-card rounded-3xl p-6 border border-rose-100/70 shadow-soft">
    <!-- Chart Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-rose-50 mb-6">
      <div>
        <h3 class="text-base sm:text-lg font-serif font-bold text-charcoal flex items-center gap-2">
          <BarChart3 class="w-4 h-4 text-rose" />
          Distribusi Anggaran Berdasarkan Kategori
        </h3>
        <p class="text-xs text-charcoal-400 mt-0.5">
          Perbandingan proporsi pengeluaran persiapan pernikahan
        </p>
      </div>

      <!-- Toggle Bar / Donut view -->
      <div class="flex items-center gap-1 p-1 bg-ivory rounded-xl border border-rose-100/60 text-xs">
        <button
          type="button"
          @click="chartType = 'bars'"
          :class="[
            'px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5',
            chartType === 'bars' ? 'bg-white text-rose font-bold shadow-sm' : 'text-charcoal-500 hover:text-charcoal',
          ]"
        >
          <BarChart3 class="w-3.5 h-3.5" />
          <span>Batang (Bar)</span>
        </button>
        <button
          type="button"
          @click="chartType = 'donut'"
          :class="[
            'px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5',
            chartType === 'donut' ? 'bg-white text-rose font-bold shadow-sm' : 'text-charcoal-500 hover:text-charcoal',
          ]"
        >
          <PieChart class="w-3.5 h-3.5" />
          <span>Lingkaran (Donut)</span>
        </button>
      </div>
    </div>

    <!-- Empty State if no categories -->
    <div v-if="chartData.length === 0" class="py-12 text-center text-xs text-charcoal-400">
      Belum ada data pengeluaran yang tercatat.
    </div>

    <!-- Bar Chart View -->
    <div v-else-if="chartType === 'bars'" class="space-y-6">
      <!-- Bars Graph Container -->
      <div class="h-56 sm:h-64 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 border-b border-charcoal-100">
        <div
          v-for="item in chartData"
          :key="item.category"
          class="flex-1 flex flex-col items-center h-full justify-end group relative"
        >
          <!-- Tooltip on hover -->
          <div
            class="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-12 z-20 bg-charcoal text-white text-[10px] sm:text-xs rounded-xl py-1.5 px-2.5 whitespace-nowrap shadow-lg"
          >
            <p class="font-bold">{{ item.category }}</p>
            <p>{{ formatRupiah(item.actual || item.estimated) }} ({{ item.percent.toFixed(1) }}%)</p>
          </div>

          <!-- Value on top of bar on larger screens -->
          <span class="text-[10px] font-semibold text-charcoal-500 mb-1 hidden sm:block">
            {{ formatCompactRupiah(item.actual || item.estimated) }}
          </span>

          <!-- Animated Bar Column -->
          <div
            class="w-full max-w-[42px] rounded-t-xl transition-all duration-500 group-hover:brightness-95 shadow-sm"
            :style="{
              height: `${item.barHeightPercent}%`,
              backgroundColor: item.color,
            }"
          ></div>

          <!-- Category label beneath bar -->
          <div class="mt-2 text-center w-full truncate">
            <span class="text-[9px] sm:text-[11px] font-medium text-charcoal-500 truncate block">
              {{ item.category.split(' ')[0] }}
            </span>
          </div>
        </div>
      </div>

      <!-- Legend Pill Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2">
        <div
          v-for="item in chartData"
          :key="item.category"
          class="flex items-center gap-2 p-2 rounded-xl bg-ivory/50 border border-rose-50 text-xs"
        >
          <div class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: item.color }"></div>
          <div class="min-w-0 flex-1 truncate">
            <p class="font-medium text-charcoal truncate text-[11px]">{{ item.category }}</p>
            <p class="text-[10px] text-charcoal-400 font-semibold">{{ formatRupiah(item.actual || item.estimated) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Donut Chart View -->
    <div v-else class="flex flex-col md:flex-row items-center justify-around gap-6 py-4">
      <div class="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0">
        <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FAF8F5" stroke-width="14" />
          <path
            v-for="slice in donutSlices"
            :key="slice.category"
            :d="slice.pathData"
            :fill="slice.color"
            class="transition-all duration-300 hover:opacity-80 cursor-pointer"
          />
          <!-- Inner circle hole to create donut -->
          <circle cx="50" cy="50" r="26" fill="#FFFFFF" />
        </svg>

        <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span class="text-[10px] uppercase font-semibold text-charcoal-400">Total Aktual</span>
          <span class="text-xs sm:text-sm font-serif font-bold text-rose">
            {{ formatCompactRupiah(totalActual) }}
          </span>
        </div>
      </div>

      <!-- Donut Legend list -->
      <div class="flex-1 w-full max-w-sm space-y-2">
        <div
          v-for="item in chartData"
          :key="item.category"
          class="flex items-center justify-between text-xs p-2 rounded-xl bg-ivory/40"
        >
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.color }"></div>
            <span class="font-medium text-charcoal truncate text-[11px]">{{ item.category }}</span>
          </div>
          <div class="text-right shrink-0 pl-2">
            <span class="font-semibold text-charcoal">{{ formatRupiah(item.actual || item.estimated) }}</span>
            <span class="text-[10px] text-charcoal-400 ml-1.5 font-bold">({{ item.percent.toFixed(1) }}%)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
