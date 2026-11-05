<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWeddingStore } from '@/stores/weddingStore'
import { formatCompactRupiah, formatRupiah } from '@/utils/formatter'
import HeroOverview from '@/components/dashboard/HeroOverview.vue'
import UpcomingTasks from '@/components/dashboard/UpcomingTasks.vue'
import RecentActivity from '@/components/dashboard/RecentActivity.vue'
import StatCard from '@/components/common/StatCard.vue'
import TaskModal from '@/components/checklist/TaskModal.vue'
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wallet,
  Users,
  Plus,
  ArrowUpRight,
  Sparkles,
} from 'lucide-vue-next'

const router = useRouter()
const store = useWeddingStore()

const isTaskModalOpen = ref(false)

function openAddTaskModal() {
  isTaskModalOpen.value = true
}

function handleSaveTask(taskData) {
  store.addTask(taskData)
  isTaskModalOpen.value = false
}
</script>

<template>
  <div class="space-y-6 sm:space-y-8">
    <!-- Hero Wedding Overview & Live Countdown -->
    <HeroOverview />

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      <StatCard
        title="Total Tugas"
        :value="store.totalTasks"
        :subtext="`${store.overallProgressPercentage}% persiapan telah rampung`"
        :icon="ListTodo"
        variant="charcoal"
      />

      <StatCard
        title="Tugas Selesai"
        :value="store.completedTasks"
        :subtext="`Tersisa ${store.pendingTasks} tugas lagi`"
        :icon="CheckCircle2"
        variant="sage"
      />

      <StatCard
        title="Tugas Pending"
        :value="store.pendingTasks"
        :subtext="`Menunggu dikerjakan`"
        :icon="Clock"
        variant="champagne"
      />

      <StatCard
        title="Tugas Overdue"
        :value="store.overdueTasks"
        :subtext="store.overdueTasks > 0 ? 'Perlu tindakan segera!' : 'Tidak ada tugas terlambat'"
        :icon="AlertTriangle"
        variant="rose"
      />
    </div>

    <!-- Quick Overview Stats: Budget & Guests Highlight Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <!-- Budget Highlight Card -->
      <div class="glass-card rounded-3xl p-6 border border-rose-100/70 shadow-soft flex flex-col justify-between">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-xs font-semibold text-rose uppercase tracking-wider">Ringkasan Anggaran</span>
            <h3 class="text-xl sm:text-2xl font-serif font-bold text-charcoal mt-1">
              {{ formatRupiah(store.totalActualCost) }}
            </h3>
            <p class="text-xs text-charcoal-400 mt-0.5">
              dari total target {{ formatRupiah(store.totalBudget) }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose flex items-center justify-center">
            <Wallet class="w-5 h-5" />
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-rose-50 flex items-center justify-between text-xs">
          <div class="flex gap-4">
            <div>
              <span class="text-charcoal-400 block text-[10px]">Lunas / DP</span>
              <span class="font-semibold text-sage-700">{{ formatCompactRupiah(store.totalPaid) }}</span>
            </div>
            <div>
              <span class="text-charcoal-400 block text-[10px]">Sisa Budget</span>
              <span class="font-semibold text-charcoal">{{ formatCompactRupiah(store.remainingBudget) }}</span>
            </div>
          </div>
          <button
            type="button"
            @click="router.push('/budget')"
            class="inline-flex items-center gap-1 font-semibold text-rose hover:text-rose-700 transition-colors"
          >
            <span>Rincian Budget</span>
            <ArrowUpRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Guests Highlight Card -->
      <div class="glass-card rounded-3xl p-6 border border-rose-100/70 shadow-soft flex flex-col justify-between">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-xs font-semibold text-sage uppercase tracking-wider">Status Tamu & RSVP</span>
            <h3 class="text-xl sm:text-2xl font-serif font-bold text-charcoal mt-1">
              {{ store.guestStats.confirmedHadir }} Pax Hadir
            </h3>
            <p class="text-xs text-charcoal-400 mt-0.5">
              Total estimasi {{ store.guestStats.totalPax }} pax dari {{ store.guestStats.totalGuests }} undangan
            </p>
          </div>
          <div class="w-10 h-10 rounded-2xl bg-sage-50 text-sage flex items-center justify-center">
            <Users class="w-5 h-5" />
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-rose-50 flex items-center justify-between text-xs">
          <div class="flex gap-4">
            <div>
              <span class="text-charcoal-400 block text-[10px]">Terkirim</span>
              <span class="font-semibold text-charcoal">{{ store.guestStats.invitedCount }}</span>
            </div>
            <div>
              <span class="text-charcoal-400 block text-[10px]">Menunggu RSVP</span>
              <span class="font-semibold text-champagne-800">{{ store.guestStats.pendingRSVP }} pax</span>
            </div>
          </div>
          <button
            type="button"
            @click="router.push('/guests')"
            class="inline-flex items-center gap-1 font-semibold text-sage hover:text-sage-800 transition-colors"
          >
            <span>Kelola Tamu</span>
            <ArrowUpRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Action Bar -->
    <div
      class="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-rose-100/60 shadow-soft flex flex-wrap items-center justify-between gap-3"
    >
      <div class="flex items-center gap-2">
        <Sparkles class="w-4 h-4 text-rose" />
        <span class="text-xs sm:text-sm font-semibold text-charcoal">Aksi Cepat Persiapan:</span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @click="openAddTaskModal"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose text-white text-xs font-semibold shadow-sm hover:bg-rose-600 transition-all active:scale-95"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Tambah Task Baru</span>
        </button>

        <button
          type="button"
          @click="router.push('/budget')"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ivory hover:bg-rose-50 text-charcoal text-xs font-semibold border border-rose-100 transition-all active:scale-95"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Catat Biaya</span>
        </button>

        <button
          type="button"
          @click="router.push('/guests')"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ivory hover:bg-sage-50 text-charcoal text-xs font-semibold border border-sage-100 transition-all active:scale-95"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Tambah Tamu</span>
        </button>

        <button
          type="button"
          @click="router.push('/vendors')"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ivory hover:bg-champagne-50 text-charcoal text-xs font-semibold border border-champagne-100 transition-all active:scale-95"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Tambah Vendor</span>
        </button>
      </div>
    </div>

    <!-- Upcoming Tasks and Recent Activities Split Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
      <UpcomingTasks />
      <RecentActivity />
    </div>

    <!-- Task Modal Component -->
    <TaskModal
      v-if="isTaskModalOpen"
      :is-open="isTaskModalOpen"
      @close="isTaskModalOpen = false"
      @save="handleSaveTask"
    />
  </div>
</template>
