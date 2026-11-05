<script setup>
import { useWeddingStore } from '@/stores/weddingStore'
import { formatTimeAgo } from '@/utils/date'
import { Activity, PlusCircle, CheckCircle2, Edit3, Trash2, Tag, RefreshCw } from 'lucide-vue-next'

const store = useWeddingStore()

function getActivityIcon(action) {
  if (action.includes('Menambah')) return PlusCircle
  if (action.includes('Menyelesaikan')) return CheckCircle2
  if (action.includes('Mengedit') || action.includes('Mengubah')) return Edit3
  if (action.includes('Menghapus')) return Trash2
  return Tag
}

function getActivityColor(action) {
  if (action.includes('Menyelesaikan')) return 'bg-sage-100 text-sage-700'
  if (action.includes('Menghapus')) return 'bg-rose-100 text-rose-700'
  if (action.includes('Menambah')) return 'bg-champagne-100 text-champagne-800'
  return 'bg-ivory-200 text-charcoal-700'
}
</script>

<template>
  <div class="glass-card rounded-3xl p-6 border border-rose-100/70 shadow-soft flex flex-col justify-between h-full">
    <div>
      <div class="flex items-center justify-between pb-4 border-b border-rose-50 mb-4">
        <div>
          <h3 class="text-base sm:text-lg font-serif font-bold text-charcoal flex items-center gap-2">
            <Activity class="w-4 h-4 text-champagne-700" />
            Aktivitas Terkini (Recent Activities)
          </h3>
          <p class="text-xs text-charcoal-400 mt-0.5">
            Log pembaruan data persiapan pernikahan Anda
          </p>
        </div>

        <span class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-champagne-100 text-champagne-800">
          Realtime
        </span>
      </div>

      <div v-if="store.recentActivities.length === 0" class="py-10 text-center">
        <Activity class="w-10 h-10 text-charcoal-300 mx-auto mb-2 opacity-50" />
        <p class="text-sm font-medium text-charcoal">Belum ada aktivitas tercatat</p>
      </div>

      <div v-else class="space-y-3.5">
        <div
          v-for="act in store.recentActivities"
          :key="act.id"
          class="flex items-start gap-3 text-xs"
        >
          <div
            :class="[
              'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-0.5',
              getActivityColor(act.action),
            ]"
          >
            <component :is="getActivityIcon(act.action)" class="w-4 h-4" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-baseline justify-between gap-2">
              <span class="font-semibold text-charcoal truncate">
                {{ act.action }}
              </span>
              <span class="text-[10px] text-charcoal-400 shrink-0">
                {{ formatTimeAgo(act.timestamp) }}
              </span>
            </div>
            <p class="text-charcoal-500 text-xs mt-0.5 break-words line-clamp-2">
              {{ act.title }}
            </p>
            <span v-if="act.category" class="inline-block text-[10px] text-charcoal-400 mt-1 font-medium">
              &bull; {{ act.category }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="pt-4 border-t border-rose-50 mt-4 flex items-center justify-between text-[11px] text-charcoal-400">
      <span>Tersimpan otomatis di LocalStorage</span>
      <span class="flex items-center gap-1 text-sage font-medium">
        <RefreshCw class="w-3 h-3 animate-spin" style="animation-duration: 8s;" /> Tersinkron
      </span>
    </div>
  </div>
</template>
