<script setup>
import { ref, computed } from 'vue'
import { useWeddingStore } from '@/stores/weddingStore'
import { CHECKLIST_CATEGORIES } from '@/utils/defaultData'
import { isOverdue } from '@/utils/date'
import TaskCard from '@/components/checklist/TaskCard.vue'
import TaskModal from '@/components/checklist/TaskModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import {
  Search,
  Filter,
  Plus,
  AlertCircle,
  CheckCircle2,
  ListFilter,
  Sparkles,
  ArrowUpDown,
  Layers,
} from 'lucide-vue-next'

const store = useWeddingStore()

// State filters
const selectedCategory = ref('Semua')
const selectedStatus = ref('Semua')
const selectedPriority = ref('Semua')
const searchQuery = ref('')
const sortBy = ref('deadline_asc') // 'deadline_asc' | 'deadline_desc' | 'priority' | 'name'
const filterOnlyOverdue = ref(false)

// Modals
const isModalOpen = ref(false)
const editingTask = ref(null)
const isConfirmOpen = ref(false)
const taskToDelete = ref(null)

// Category progress map
const categoryStats = computed(() => {
  return store.categoryProgress
})

// Filtered tasks
const filteredTasks = computed(() => {
  return store.tasks
    .filter((task) => {
      // Category filter
      if (selectedCategory.value !== 'Semua' && task.category !== selectedCategory.value) {
        return false
      }
      // Status filter
      if (selectedStatus.value !== 'Semua' && task.status !== selectedStatus.value) {
        return false
      }
      // Priority filter
      if (selectedPriority.value !== 'Semua' && task.priority !== selectedPriority.value) {
        return false
      }
      // Overdue filter
      if (filterOnlyOverdue.value && !isOverdue(task.deadline, task.status)) {
        return false
      }
      // Search filter
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        const matchesTitle = task.title?.toLowerCase().includes(q)
        const matchesDesc = task.description?.toLowerCase().includes(q)
        const matchesNotes = task.notes?.toLowerCase().includes(q)
        if (!matchesTitle && !matchesDesc && !matchesNotes) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy.value === 'deadline_asc') {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      if (sortBy.value === 'deadline_desc') {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
      }
      if (sortBy.value === 'priority') {
        const weights = { High: 3, Medium: 2, Low: 1 }
        return (weights[b.priority] || 0) - (weights[a.priority] || 0)
      }
      if (sortBy.value === 'name') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })
})

function openAddTask(cat = null) {
  editingTask.value = null
  if (cat && cat !== 'Semua') {
    selectedCategory.value = cat
  }
  isModalOpen.value = true
}

function openEditTask(task) {
  editingTask.value = task
  isModalOpen.value = true
}

function handleSaveTask(taskData) {
  if (editingTask.value) {
    store.updateTask(editingTask.value.id, taskData)
  } else {
    store.addTask(taskData)
  }
  isModalOpen.value = false
  editingTask.value = null
}

function confirmDelete(task) {
  taskToDelete.value = task
  isConfirmOpen.value = true
}

function executeDelete() {
  if (taskToDelete.value) {
    store.deleteTask(taskToDelete.value.id)
    taskToDelete.value = null
  }
}

function resetFilters() {
  selectedCategory.value = 'Semua'
  selectedStatus.value = 'Semua'
  selectedPriority.value = 'Semua'
  searchQuery.value = ''
  filterOnlyOverdue.value = false
  sortBy.value = 'deadline_asc'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Action -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-serif font-bold text-charcoal tracking-tight flex items-center gap-2">
          <span>Checklist Persiapan Pernikahan</span>
        </h1>
        <p class="text-xs sm:text-sm text-charcoal-400 mt-1">
          Pantau seluruh tahapan persiapan dari administrasi KUA hingga honeymoon
        </p>
      </div>

      <button
        type="button"
        @click="openAddTask()"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose/25 hover:bg-rose-600 transition-all active:scale-95"
      >
        <Plus class="w-4 h-4" />
        <span>Tambah Tugas Baru</span>
      </button>
    </div>

    <!-- Category Progress Carousel / Pills -->
    <div class="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-rose-100/70 shadow-soft">
      <div class="flex items-center justify-between mb-3 text-xs font-semibold text-charcoal-500">
        <span class="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Layers class="w-3.5 h-3.5 text-rose" /> Kategori Persiapan & Progress
        </span>
        <span>{{ store.completedTasks }}/{{ store.totalTasks }} Tugas Terselesaikan</span>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        <!-- All Category Pill -->
        <button
          type="button"
          @click="selectedCategory = 'Semua'"
          :class="[
            'shrink-0 px-4 py-2 rounded-2xl text-xs font-medium border transition-all flex items-center gap-2',
            selectedCategory === 'Semua'
              ? 'bg-rose text-white border-rose shadow-sm shadow-rose/20'
              : 'bg-ivory hover:bg-rose-50 border-charcoal-100 text-charcoal-600',
          ]"
        >
          <span>Semua Kategori</span>
          <span
            :class="[
              'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
              selectedCategory === 'Semua' ? 'bg-white/20 text-white' : 'bg-charcoal-100 text-charcoal-600',
            ]"
          >
            {{ store.totalTasks }}
          </span>
        </button>

        <!-- Dynamic Category Pills -->
        <button
          v-for="catStat in categoryStats"
          :key="catStat.category"
          type="button"
          @click="selectedCategory = catStat.category"
          :class="[
            'shrink-0 px-4 py-2 rounded-2xl text-xs font-medium border transition-all flex items-center gap-2',
            selectedCategory === catStat.category
              ? 'bg-rose text-white border-rose shadow-sm shadow-rose/20'
              : 'bg-ivory hover:bg-rose-50 border-charcoal-100 text-charcoal-600',
          ]"
        >
          <span>{{ catStat.category }}</span>
          <span
            :class="[
              'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
              selectedCategory === catStat.category
                ? 'bg-white/20 text-white'
                : catStat.percentage === 100
                ? 'bg-sage-100 text-sage-800'
                : 'bg-charcoal-100 text-charcoal-600',
            ]"
          >
            {{ catStat.completed }}/{{ catStat.total }} ({{ catStat.percentage }}%)
          </span>
        </button>
      </div>
    </div>

    <!-- Overdue Alert Banner if overdue tasks exist -->
    <div
      v-if="store.overdueTasks > 0"
      class="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs sm:text-sm text-rose-900 shadow-sm"
    >
      <div class="flex items-center gap-2.5">
        <AlertCircle class="w-5 h-5 text-rose shrink-0" />
        <span>
          Ada <strong>{{ store.overdueTasks }} tugas</strong> yang sudah melewati batas waktu (deadline).
        </span>
      </div>
      <button
        type="button"
        @click="filterOnlyOverdue = !filterOnlyOverdue"
        class="shrink-0 px-3 py-1.5 rounded-xl border border-rose-300 font-medium text-xs hover:bg-rose-100 transition-colors"
      >
        {{ filterOnlyOverdue ? 'Tampilkan Semua' : 'Filter Overdue Saja' }}
      </button>
    </div>

    <!-- Search & Filters Toolbar -->
    <div
      class="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-rose-100/60 shadow-soft flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm"
    >
      <!-- Search Input -->
      <div class="relative flex-1 min-w-[220px]">
        <Search class="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari checklist tugas persiapan..."
          class="w-full pl-9 pr-4 py-2 rounded-xl border border-charcoal-200 bg-ivory/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose text-xs sm:text-sm transition-colors"
        />
      </div>

      <!-- Filters Row -->
      <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <!-- Status Filter -->
        <select
          v-model="selectedStatus"
          class="px-3 py-2 rounded-xl border border-charcoal-200 bg-ivory/60 text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-rose/30"
        >
          <option value="Semua">Semua Status</option>
          <option value="Todo">Todo (Belum Mulai)</option>
          <option value="In Progress">In Progress (Sedang Jalan)</option>
          <option value="Completed">Completed (Selesai)</option>
        </select>

        <!-- Priority Filter -->
        <select
          v-model="selectedPriority"
          class="px-3 py-2 rounded-xl border border-charcoal-200 bg-ivory/60 text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-rose/30"
        >
          <option value="Semua">Semua Prioritas</option>
          <option value="High">Tinggi (High)</option>
          <option value="Medium">Sedang (Medium)</option>
          <option value="Low">Rendah (Low)</option>
        </select>

        <!-- Sort By -->
        <select
          v-model="sortBy"
          class="px-3 py-2 rounded-xl border border-charcoal-200 bg-ivory/60 text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-rose/30"
        >
          <option value="deadline_asc">Deadline Terdekat</option>
          <option value="deadline_desc">Deadline Terjauh</option>
          <option value="priority">Prioritas Tertinggi</option>
          <option value="name">Nama (A - Z)</option>
        </select>

        <button
          v-if="selectedCategory !== 'Semua' || selectedStatus !== 'Semua' || selectedPriority !== 'Semua' || searchQuery || filterOnlyOverdue"
          type="button"
          @click="resetFilters"
          class="px-3 py-2 text-rose hover:text-rose-700 text-xs font-semibold underline underline-offset-2"
        >
          Reset Filter
        </button>
      </div>
    </div>

    <!-- Active Filter Summary -->
    <div class="flex items-center justify-between text-xs text-charcoal-400 px-1">
      <span>
        Menampilkan <strong>{{ filteredTasks.length }}</strong> dari total <strong>{{ store.totalTasks }}</strong> tugas
      </span>
      <span v-if="selectedCategory !== 'Semua'" class="text-rose font-medium">
        Kategori: {{ selectedCategory }}
      </span>
    </div>

    <!-- Tasks Grid List -->
    <div v-if="filteredTasks.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @toggle="store.toggleTaskStatus"
        @edit="openEditTask"
        @delete="confirmDelete"
      />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else
      title="Tidak Ada Tugas Ditemukan"
      description="Coba ubah kata kunci pencarian atau sesuaikan filter untuk melihat tugas persiapan lainnya."
      action-text="Tambah Tugas di Kategori Ini"
      @action="openAddTask(selectedCategory !== 'Semua' ? selectedCategory : null)"
    />

    <!-- Task Add/Edit Modal -->
    <TaskModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :task="editingTask"
      :default-category="selectedCategory !== 'Semua' ? selectedCategory : 'Administrasi Pernikahan'"
      @close="isModalOpen = false"
      @save="handleSaveTask"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :is-open="isConfirmOpen"
      title="Hapus Tugas Ini?"
      :message="`Apakah Anda yakin ingin menghapus checklist '${taskToDelete?.title}'? Data yang dihapus tidak dapat dipulihkan.`"
      confirm-text="Ya, Hapus"
      cancel-text="Batal"
      type="danger"
      @confirm="executeDelete"
      @cancel="taskToDelete = null"
      @update:is-open="isConfirmOpen = $event"
    />
  </div>
</template>
