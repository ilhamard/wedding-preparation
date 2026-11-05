<script setup>
import { computed } from 'vue'
import { formatDateShort, formatRelativeDate, isOverdue } from '@/utils/date'
import {
  Calendar,
  AlertCircle,
  Check,
  Edit2,
  Trash2,
  FileText,
  Clock,
} from 'lucide-vue-next'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['toggle', 'edit', 'delete'])

const isPastDue = computed(() => isOverdue(props.task.deadline, props.task.status))
const isCompleted = computed(() => props.task.status === 'Completed')

function priorityStyle(priority) {
  switch (priority) {
    case 'High':
      return 'bg-rose-100/90 text-rose-800 border-rose-200'
    case 'Medium':
      return 'bg-champagne-100/90 text-champagne-800 border-champagne-200'
    default:
      return 'bg-sage-100/90 text-sage-800 border-sage-200'
  }
}

function statusStyle(status) {
  switch (status) {
    case 'Completed':
      return 'bg-sage-100 text-sage-800'
    case 'In Progress':
      return 'bg-champagne-100 text-champagne-800'
    default:
      return 'bg-charcoal-100 text-charcoal-700'
  }
}
</script>

<template>
  <div
    class="glass-card rounded-2xl p-4 sm:p-5 border transition-all duration-200 relative group"
    :class="[
      isCompleted
        ? 'border-sage-200/60 bg-white/60 opacity-80'
        : isPastDue
        ? 'border-rose-300 bg-white shadow-soft'
        : 'border-rose-100/70 bg-white hover:border-rose-200 hover:shadow-soft-md',
    ]"
  >
    <div class="flex items-start gap-3.5">
      <!-- Custom Checkbox -->
      <button
        type="button"
        @click="emit('toggle', task.id)"
        class="mt-1 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 focus:outline-none"
        :class="[
          isCompleted
            ? 'bg-sage border-sage text-white shadow-sm'
            : 'border-charcoal-300 hover:border-rose bg-white',
        ]"
        :title="isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'"
      >
        <Check v-if="isCompleted" class="w-4 h-4 stroke-[3]" />
      </button>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
          <!-- Category badge -->
          <span class="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-ivory-200 text-charcoal-600">
            {{ task.category }}
          </span>

          <!-- Priority badge -->
          <span
            :class="[
              'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
              priorityStyle(task.priority),
            ]"
          >
            {{ task.priority }}
          </span>

          <!-- Status badge -->
          <span
            :class="[
              'text-[10px] font-medium px-2 py-0.5 rounded-md',
              statusStyle(task.status),
            ]"
          >
            {{ task.status === 'Completed' ? 'Selesai' : task.status === 'In Progress' ? 'Proses' : 'Todo' }}
          </span>
        </div>

        <!-- Title -->
        <h4
          class="text-sm sm:text-base font-semibold leading-snug break-words transition-colors"
          :class="isCompleted ? 'line-through text-charcoal-400' : 'text-charcoal'"
        >
          {{ task.title }}
        </h4>

        <!-- Description -->
        <p
          v-if="task.description"
          class="text-xs text-charcoal-500 mt-1 leading-relaxed line-clamp-2"
        >
          {{ task.description }}
        </p>

        <!-- Notes if any -->
        <div
          v-if="task.notes"
          class="mt-2.5 p-2 rounded-xl bg-ivory text-[11px] text-charcoal-600 flex items-start gap-1.5 border border-rose-50/80"
        >
          <FileText class="w-3.5 h-3.5 text-champagne-700 shrink-0 mt-0.5" />
          <span class="italic break-words">{{ task.notes }}</span>
        </div>

        <!-- Meta Footer: Deadline & Actions -->
        <div class="mt-3 pt-3 border-t border-rose-50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <!-- Deadline -->
          <div class="flex items-center gap-1.5">
            <component
              :is="isPastDue ? AlertCircle : isCompleted ? Clock : Calendar"
              class="w-3.5 h-3.5 shrink-0"
              :class="isPastDue ? 'text-rose' : 'text-charcoal-400'"
            />
            <span
              :class="[
                'font-medium text-[11px]',
                isPastDue ? 'text-rose font-bold' : 'text-charcoal-500',
              ]"
            >
              {{ task.deadline ? formatDateShort(task.deadline) : 'Tanpa deadline' }}
              <span v-if="task.deadline" class="text-charcoal-400">
                ({{ formatRelativeDate(task.deadline) }})
              </span>
              <span v-if="isPastDue" class="text-[10px] uppercase font-bold text-rose ml-1">
                [Overdue]
              </span>
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 sm:opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              @click="emit('edit', task)"
              class="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal hover:bg-rose-50 transition-colors"
              title="Edit Task"
            >
              <Edit2 class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              @click="emit('delete', task)"
              class="p-1.5 rounded-lg text-charcoal-400 hover:text-rose hover:bg-rose-50 transition-colors"
              title="Hapus Task"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
