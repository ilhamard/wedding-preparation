<script setup>
import { useWeddingStore } from '@/stores/weddingStore'
import { formatRelativeDate, isOverdue } from '@/utils/date'
import { RouterLink } from 'vue-router'
import { Calendar, AlertCircle, CheckCircle2, ArrowRight, Clock } from 'lucide-vue-next'

const store = useWeddingStore()

function priorityClass(priority) {
  switch (priority) {
    case 'High':
      return 'bg-rose-100 text-rose-700 border-rose-200'
    case 'Medium':
      return 'bg-champagne-100 text-champagne-800 border-champagne-200'
    default:
      return 'bg-sage-100 text-sage-800 border-sage-200'
  }
}
</script>

<template>
  <div class="glass-card rounded-3xl p-6 border border-rose-100/70 shadow-soft flex flex-col justify-between h-full">
    <div>
      <div class="flex items-center justify-between pb-4 border-b border-rose-50 mb-4">
        <div>
          <h3 class="text-base sm:text-lg font-serif font-bold text-charcoal flex items-center gap-2">
            <Clock class="w-4 h-4 text-rose" />
            Tugas Mendatang (Upcoming Tasks)
          </h3>
          <p class="text-xs text-charcoal-400 mt-0.5">
            Daftar pekerjaan dengan tenggat waktu terdekat
          </p>
        </div>

        <RouterLink
          to="/checklist"
          class="text-xs font-medium text-rose hover:text-rose-700 flex items-center gap-1 transition-colors"
        >
          <span>Kelola Semua</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </RouterLink>
      </div>

      <!-- Empty state if all done -->
      <div v-if="store.upcomingTasks.length === 0" class="py-10 text-center">
        <CheckCircle2 class="w-10 h-10 text-sage mx-auto mb-2 opacity-80" />
        <p class="text-sm font-medium text-charcoal">Semua tugas terdekat selesai!</p>
        <p class="text-xs text-charcoal-400 mt-0.5">Hebat, persiapan pernikahan Anda berjalan sangat lancar.</p>
      </div>

      <!-- Task items list -->
      <div v-else class="space-y-3">
        <div
          v-for="task in store.upcomingTasks"
          :key="task.id"
          class="group p-3.5 rounded-2xl bg-white hover:bg-ivory border border-rose-100/60 hover:border-rose-200 transition-all flex items-start gap-3 shadow-sm hover:shadow"
        >
          <!-- Quick Checkbox -->
          <button
            type="button"
            @click="store.toggleTaskStatus(task.id)"
            class="mt-0.5 w-5 h-5 rounded-lg border-2 border-charcoal-200 hover:border-rose flex items-center justify-center transition-colors shrink-0 group-hover:scale-105"
            title="Tandai selesai"
          >
            <div class="w-2.5 h-2.5 rounded-sm bg-transparent group-hover:bg-rose/40"></div>
          </button>

          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <span class="text-[10px] font-medium px-2 py-0.5 rounded-md bg-ivory-200 text-charcoal-600">
                {{ task.category }}
              </span>
              <span
                :class="[
                  'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                  priorityClass(task.priority),
                ]"
              >
                {{ task.priority }}
              </span>
            </div>

            <h4 class="text-xs sm:text-sm font-medium text-charcoal leading-snug truncate">
              {{ task.title }}
            </h4>

            <div class="flex items-center gap-3 mt-2 text-[11px]">
              <span
                :class="[
                  'flex items-center gap-1 font-medium',
                  isOverdue(task.deadline, task.status)
                    ? 'text-rose-600 font-semibold'
                    : 'text-charcoal-400',
                ]"
              >
                <component
                  :is="isOverdue(task.deadline, task.status) ? AlertCircle : Calendar"
                  class="w-3.5 h-3.5 shrink-0"
                />
                {{ formatRelativeDate(task.deadline) }}
                <span v-if="isOverdue(task.deadline, task.status)" class="text-[10px] uppercase tracking-wider">
                  (Overdue)
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pt-4 border-t border-rose-50 mt-4 text-center">
      <RouterLink
        to="/checklist"
        class="inline-flex items-center gap-2 text-xs font-semibold text-rose hover:text-rose-700 py-1.5 px-4 rounded-xl hover:bg-rose-50 transition-colors"
      >
        <span>Lihat Semua {{ store.totalTasks }} Checklist</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </RouterLink>
    </div>
  </div>
</template>
