<script setup>
import { ref, computed } from 'vue'
import { useWeddingStore } from '@/stores/weddingStore'
import { formatDateIndo, formatRelativeDate, calculateCountdown } from '@/utils/date'
import AgendaModal from '@/components/timeline/AgendaModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Sparkles,
  Calendar,
  Check,
} from 'lucide-vue-next'

const store = useWeddingStore()

const filterTab = ref('all') // 'all' | 'upcoming' | 'completed'

// Modals
const isModalOpen = ref(false)
const editingAgenda = ref(null)
const isConfirmOpen = ref(false)
const agendaToDelete = ref(null)

const filteredTimeline = computed(() => {
  return store.timeline.filter((item) => {
    if (filterTab.value === 'upcoming') return !item.completed
    if (filterTab.value === 'completed') return item.completed
    return true
  })
})

function openAddAgenda() {
  editingAgenda.value = null
  isModalOpen.value = true
}

function openEditAgenda(agenda) {
  editingAgenda.value = agenda
  isModalOpen.value = true
}

function handleSaveAgenda(data) {
  if (editingAgenda.value) {
    store.updateTimelineItem(editingAgenda.value.id, data)
  } else {
    store.addTimelineItem(data)
  }
  isModalOpen.value = false
  editingAgenda.value = null
}

function confirmDeleteAgenda(agenda) {
  agendaToDelete.value = agenda
  isConfirmOpen.value = true
}

function executeDeleteAgenda() {
  if (agendaToDelete.value) {
    store.deleteTimelineItem(agendaToDelete.value.id)
    agendaToDelete.value = null
  }
}
</script>

<template>
  <div class="space-y-6 sm:space-y-8">
    <!-- Header with Action -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-serif font-bold text-charcoal tracking-tight flex items-center gap-2">
          <span>Timeline & Rundown Pernikahan</span>
        </h1>
        <p class="text-xs sm:text-sm text-charcoal-400 mt-1">
          Tahapan persiapan dari H-180 hingga hari H akad dan resepsi pernikahan
        </p>
      </div>

      <button
        type="button"
        @click="openAddAgenda"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose/25 hover:bg-rose-600 transition-all active:scale-95"
      >
        <Plus class="w-4 h-4" />
        <span>Tambah Agenda Timeline</span>
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="flex items-center gap-2 p-1 bg-white rounded-2xl border border-rose-100/70 w-fit text-xs">
      <button
        type="button"
        @click="filterTab = 'all'"
        :class="[
          'px-4 py-2 rounded-xl font-medium transition-all',
          filterTab === 'all' ? 'bg-rose text-white font-bold shadow-sm shadow-rose/20' : 'text-charcoal-500 hover:text-charcoal',
        ]"
      >
        Semua Agenda ({{ store.timeline.length }})
      </button>
      <button
        type="button"
        @click="filterTab = 'upcoming'"
        :class="[
          'px-4 py-2 rounded-xl font-medium transition-all',
          filterTab === 'upcoming' ? 'bg-rose text-white font-bold shadow-sm shadow-rose/20' : 'text-charcoal-500 hover:text-charcoal',
        ]"
      >
        Mendatang ({{ store.timeline.filter(t => !t.completed).length }})
      </button>
      <button
        type="button"
        @click="filterTab = 'completed'"
        :class="[
          'px-4 py-2 rounded-xl font-medium transition-all',
          filterTab === 'completed' ? 'bg-rose text-white font-bold shadow-sm shadow-rose/20' : 'text-charcoal-500 hover:text-charcoal',
        ]"
      >
        Selesai ({{ store.timeline.filter(t => t.completed).length }})
      </button>
    </div>

    <!-- Timeline List with Connected Line -->
    <div v-if="filteredTimeline.length > 0" class="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-rose-200">
      <div
        v-for="item in filteredTimeline"
        :key="item.id"
        class="relative flex items-start gap-4 group"
      >
        <!-- Timeline Node Circle -->
        <button
          type="button"
          @click="store.toggleTimelineComplete(item.id)"
          class="absolute -left-6 sm:-left-8 mt-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all z-10 shrink-0"
          :class="[
            item.completed
              ? 'bg-sage border-sage text-white shadow-sm'
              : 'bg-white border-rose text-transparent hover:bg-rose-50',
          ]"
          :title="item.completed ? 'Tandai belum selesai' : 'Tandai selesai'"
        >
          <Check class="w-3.5 h-3.5 stroke-[3]" />
        </button>

        <!-- Timeline Card -->
        <div
          class="flex-1 glass-card rounded-3xl p-5 sm:p-6 border transition-all duration-200"
          :class="[
            item.completed
              ? 'border-sage-200 bg-white/70 opacity-80'
              : 'border-rose-100 hover:border-rose-200 hover:shadow-soft-md bg-white',
          ]"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div class="flex flex-wrap items-center gap-2">
              <!-- Phase Tag -->
              <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-champagne-100 text-champagne-800">
                {{ item.phase }}
              </span>

              <!-- Status Tag -->
              <span
                :class="[
                  'text-[10px] font-semibold px-2 py-0.5 rounded-md',
                  item.completed ? 'bg-sage-100 text-sage-800' : 'bg-rose-100 text-rose-800',
                ]"
              >
                {{ item.completed ? 'Selesai' : 'Mendatang' }}
              </span>
            </div>

            <!-- Date & Countdown -->
            <div class="flex items-center gap-1.5 text-xs text-charcoal-400">
              <Calendar class="w-3.5 h-3.5 text-rose" />
              <span class="font-medium text-charcoal">{{ formatDateIndo(item.date) }}</span>
              <span>({{ formatRelativeDate(item.date) }})</span>
            </div>
          </div>

          <h3
            class="text-base sm:text-lg font-serif font-bold transition-colors"
            :class="item.completed ? 'line-through text-charcoal-400' : 'text-charcoal'"
          >
            {{ item.title }}
          </h3>

          <p v-if="item.description" class="text-xs sm:text-sm text-charcoal-500 mt-2 leading-relaxed">
            {{ item.description }}
          </p>

          <!-- Card Actions -->
          <div class="mt-4 pt-3 border-t border-rose-50 flex items-center justify-between">
            <button
              type="button"
              @click="store.toggleTimelineComplete(item.id)"
              class="text-xs font-semibold text-rose hover:text-rose-700 flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 class="w-3.5 h-3.5 text-sage" />
              <span>{{ item.completed ? 'Tandai Belum Selesai' : 'Tandai Agenda Selesai' }}</span>
            </button>

            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="openEditAgenda(item)"
                class="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal hover:bg-ivory"
                title="Edit Agenda"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click="confirmDeleteAgenda(item)"
                class="p-1.5 rounded-lg text-charcoal-400 hover:text-rose hover:bg-rose-50"
                title="Hapus Agenda"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else
      title="Belum Ada Agenda Timeline"
      description="Tambahkan milestone tanggal penting untuk memandu perjalanan persiapan pernikahan Anda."
      action-text="Tambah Agenda"
      @action="openAddAgenda"
    />

    <!-- Agenda Modal -->
    <AgendaModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :agenda="editingAgenda"
      @close="isModalOpen = false"
      @save="handleSaveAgenda"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :is-open="isConfirmOpen"
      title="Hapus Agenda Timeline?"
      :message="`Apakah Anda yakin ingin menghapus agenda '${agendaToDelete?.title}'?`"
      confirm-text="Ya, Hapus"
      type="danger"
      @confirm="executeDeleteAgenda"
      @cancel="agendaToDelete = null"
      @update:is-open="isConfirmOpen = $event"
    />
  </div>
</template>
