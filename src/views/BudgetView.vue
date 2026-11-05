<script setup>
import { ref, computed } from 'vue'
import { useWeddingStore } from '@/stores/weddingStore'
import { BUDGET_CATEGORIES } from '@/utils/defaultData'
import { formatRupiah, formatCompactRupiah } from '@/utils/formatter'
import BudgetChart from '@/components/budget/BudgetChart.vue'
import BudgetModal from '@/components/budget/BudgetModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatCard from '@/components/common/StatCard.vue'
import {
  Wallet,
  Calculator,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Edit2,
  Trash2,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Percent,
} from 'lucide-vue-next'

const store = useWeddingStore()

// State filters
const selectedCategory = ref('Semua')
const selectedStatus = ref('Semua')
const searchQuery = ref('')

// Modals
const isModalOpen = ref(false)
const editingExpense = ref(null)
const isConfirmOpen = ref(false)
const expenseToDelete = ref(null)

// Target Budget quick edit modal/state
const isEditingTarget = ref(false)
const targetBudgetInput = ref(store.totalBudget)

function startEditTarget() {
  targetBudgetInput.value = store.totalBudget
  isEditingTarget.value = true
}

function saveTargetBudget() {
  store.updateProfile({ targetBudget: Number(targetBudgetInput.value) || 0 })
  isEditingTarget.value = false
}

// Filtered expenses
const filteredExpenses = computed(() => {
  return store.budget.filter((item) => {
    if (selectedCategory.value !== 'Semua' && item.category !== selectedCategory.value) {
      return false
    }
    if (selectedStatus.value !== 'Semua' && item.status !== selectedStatus.value) {
      return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchTitle = item.title?.toLowerCase().includes(q)
      const matchNotes = item.notes?.toLowerCase().includes(q)
      if (!matchTitle && !matchNotes) return false
    }
    return true
  })
})

// Budget usage percent
const budgetUsagePercent = computed(() => {
  if (store.totalBudget === 0) return 0
  return Math.min(Math.round((store.totalActualCost / store.totalBudget) * 100), 100)
})

function openAddExpense() {
  editingExpense.value = null
  isModalOpen.value = true
}

function openEditExpense(expense) {
  editingExpense.value = expense
  isModalOpen.value = true
}

function handleSaveExpense(data) {
  if (editingExpense.value) {
    store.updateExpense(editingExpense.value.id, data)
  } else {
    store.addExpense(data)
  }
  isModalOpen.value = false
  editingExpense.value = null
}

function confirmDeleteExpense(expense) {
  expenseToDelete.value = expense
  isConfirmOpen.value = true
}

function executeDeleteExpense() {
  if (expenseToDelete.value) {
    store.deleteExpense(expenseToDelete.value.id)
    expenseToDelete.value = null
  }
}

function statusBadgeStyle(status) {
  switch (status) {
    case 'Lunas':
      return 'bg-sage-100 text-sage-800 border-sage-200'
    case 'DP':
      return 'bg-champagne-100 text-champagne-800 border-champagne-200'
    default:
      return 'bg-charcoal-100 text-charcoal-700 border-charcoal-200'
  }
}
</script>

<template>
  <div class="space-y-6 sm:space-y-8">
    <!-- Header with Action -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-serif font-bold text-charcoal tracking-tight flex items-center gap-2">
          <span>Budget & Anggaran Pernikahan</span>
        </h1>
        <p class="text-xs sm:text-sm text-charcoal-400 mt-1">
          Pantau alokasi biaya, estimasi vs aktual, dan status pembayaran vendor
        </p>
      </div>

      <button
        type="button"
        @click="openAddExpense"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose/25 hover:bg-rose-600 transition-all active:scale-95"
      >
        <Plus class="w-4 h-4" />
        <span>Catat Pengeluaran Baru</span>
      </button>
    </div>

    <!-- Summary Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      <!-- Target Budget Card -->
      <div class="glass-card rounded-3xl p-5 border border-rose-100/70 shadow-soft flex flex-col justify-between">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-xs font-medium uppercase tracking-wider text-charcoal-400">Target Budget</span>
            <h3 class="text-xl sm:text-2xl font-serif font-bold text-charcoal mt-1">
              {{ formatCompactRupiah(store.totalBudget) }}
            </h3>
          </div>
          <button
            type="button"
            @click="startEditTarget"
            class="p-2 rounded-xl text-rose hover:bg-rose-50 transition-colors"
            title="Edit Target Budget"
          >
            <Edit2 class="w-4 h-4" />
          </button>
        </div>
        <p class="text-[11px] text-charcoal-400 mt-2">
          {{ formatRupiah(store.totalBudget) }}
        </p>
      </div>

      <!-- Actual Cost Card -->
      <StatCard
        title="Total Biaya Aktual"
        :value="formatCompactRupiah(store.totalActualCost)"
        :subtext="`Estimasi awal: ${formatCompactRupiah(store.totalEstimatedCost)}`"
        :icon="Calculator"
        variant="rose"
      />

      <!-- Paid Amount Card -->
      <StatCard
        title="Sudah Dibayar (Lunas + DP)"
        :value="formatCompactRupiah(store.totalPaid)"
        :subtext="`Belum lunas: ${formatCompactRupiah(store.totalPendingPayment)}`"
        :icon="CheckCircle2"
        variant="sage"
      />

      <!-- Remaining Budget Card -->
      <StatCard
        title="Sisa Budget Tersedia"
        :value="formatCompactRupiah(store.remainingBudget)"
        :subtext="store.remainingBudget >= 0 ? 'Masih dalam batas anggaran' : 'Melebihi target anggaran!'"
        :icon="Wallet"
        :variant="store.remainingBudget >= 0 ? 'champagne' : 'rose'"
      />
    </div>

    <!-- Budget Consumption Progress Gauge -->
    <div class="glass-card rounded-3xl p-5 border border-rose-100/70 shadow-soft">
      <div class="flex items-center justify-between text-xs font-semibold mb-2">
        <span class="text-charcoal-600 flex items-center gap-1.5">
          <Percent class="w-3.5 h-3.5 text-rose" />
          Penyerapan Anggaran Terhadap Target
        </span>
        <span :class="budgetUsagePercent > 95 ? 'text-rose-600 font-bold' : 'text-charcoal'">
          {{ budgetUsagePercent }}% Terpakai ({{ formatRupiah(store.totalActualCost) }})
        </span>
      </div>

      <div class="w-full h-3.5 rounded-full bg-ivory-200 overflow-hidden p-0.5 border border-rose-100">
        <div
          class="h-full rounded-full transition-all duration-700 ease-out"
          :class="[
            budgetUsagePercent > 100
              ? 'bg-rose-600'
              : budgetUsagePercent > 85
              ? 'bg-champagne-600'
              : 'bg-gradient-to-r from-sage to-rose',
          ]"
          :style="{ width: `${Math.min(budgetUsagePercent, 100)}%` }"
        ></div>
      </div>

      <div class="flex items-center justify-between text-[11px] text-charcoal-400 mt-2">
        <span>Pengeluaran Aktual: {{ formatRupiah(store.totalActualCost) }}</span>
        <span>Sisa Saldo: {{ formatRupiah(store.remainingBudget) }}</span>
      </div>
    </div>

    <!-- Category Distribution Visualization Chart -->
    <BudgetChart
      :categories="store.budgetCategoryBreakdown"
      :total-actual="store.totalActualCost"
    />

    <!-- Expenses List / Table Section -->
    <div class="glass-card rounded-3xl p-6 border border-rose-100/70 shadow-soft space-y-5">
      <!-- Toolbar: Title & Filters -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-rose-50">
        <div>
          <h3 class="text-lg font-serif font-bold text-charcoal">
            Rincian Pengeluaran Pernikahan
          </h3>
          <p class="text-xs text-charcoal-400 mt-0.5">
            Daftar pengeluaran lengkap dengan status pembayaran
          </p>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <!-- Search -->
          <div class="relative flex-1 sm:w-56">
            <Search class="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari pengeluaran..."
              class="w-full pl-9 pr-3 py-1.5 rounded-xl border border-charcoal-200 bg-ivory/60 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30"
            />
          </div>

          <!-- Category filter -->
          <select
            v-model="selectedCategory"
            class="px-3 py-1.5 rounded-xl border border-charcoal-200 bg-ivory/60 text-charcoal text-xs focus:outline-none"
          >
            <option value="Semua">Semua Kategori</option>
            <option v-for="cat in BUDGET_CATEGORIES" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>

          <!-- Status filter -->
          <select
            v-model="selectedStatus"
            class="px-3 py-1.5 rounded-xl border border-charcoal-200 bg-ivory/60 text-charcoal text-xs focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Belum Dibayar">Belum Dibayar</option>
            <option value="DP">DP</option>
            <option value="Lunas">Lunas</option>
          </select>
        </div>
      </div>

      <!-- Expenses Table (Desktop) / Cards (Mobile) -->
      <div v-if="filteredExpenses.length > 0">
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-rose-100 text-charcoal-400 uppercase tracking-wider text-[10px]">
                <th class="py-3 px-3">Item Pengeluaran</th>
                <th class="py-3 px-3">Kategori</th>
                <th class="py-3 px-3 text-right">Estimasi</th>
                <th class="py-3 px-3 text-right">Biaya Aktual</th>
                <th class="py-3 px-3 text-right">Dibayar</th>
                <th class="py-3 px-3 text-center">Status</th>
                <th class="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-rose-50">
              <tr
                v-for="item in filteredExpenses"
                :key="item.id"
                class="hover:bg-ivory/60 transition-colors"
              >
                <td class="py-3.5 px-3">
                  <div class="font-semibold text-charcoal">{{ item.title }}</div>
                  <div v-if="item.notes" class="text-[11px] text-charcoal-400 italic line-clamp-1">
                    {{ item.notes }}
                  </div>
                </td>
                <td class="py-3.5 px-3">
                  <span class="px-2 py-0.5 rounded-full bg-ivory-200 text-charcoal-600 text-[10px] font-medium">
                    {{ item.category }}
                  </span>
                </td>
                <td class="py-3.5 px-3 text-right text-charcoal-500 font-mono">
                  {{ formatRupiah(item.estimatedCost) }}
                </td>
                <td class="py-3.5 px-3 text-right font-semibold text-charcoal font-mono">
                  {{ formatRupiah(item.actualCost) }}
                </td>
                <td class="py-3.5 px-3 text-right text-sage-700 font-semibold font-mono">
                  {{ formatRupiah(item.paidAmount) }}
                </td>
                <td class="py-3.5 px-3 text-center">
                  <span
                    :class="[
                      'inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold border',
                      statusBadgeStyle(item.status),
                    ]"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td class="py-3.5 px-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      @click="openEditExpense(item)"
                      class="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal hover:bg-rose-50"
                      title="Edit"
                    >
                      <Edit2 class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="confirmDeleteExpense(item)"
                      class="p-1.5 rounded-lg text-charcoal-400 hover:text-rose hover:bg-rose-50"
                      title="Hapus"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card List -->
        <div class="md:hidden space-y-3">
          <div
            v-for="item in filteredExpenses"
            :key="item.id"
            class="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-2.5 text-xs"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="text-[10px] font-medium px-2 py-0.5 rounded-md bg-ivory-200 text-charcoal-600">
                  {{ item.category }}
                </span>
                <h4 class="font-semibold text-charcoal text-sm mt-1">{{ item.title }}</h4>
              </div>
              <span
                :class="[
                  'px-2 py-0.5 rounded-md text-[10px] font-semibold border shrink-0',
                  statusBadgeStyle(item.status),
                ]"
              >
                {{ item.status }}
              </span>
            </div>

            <p v-if="item.notes" class="text-[11px] text-charcoal-400 italic">
              {{ item.notes }}
            </p>

            <div class="grid grid-cols-3 gap-2 pt-2 border-t border-rose-50 text-[11px]">
              <div>
                <span class="text-charcoal-400 block text-[10px]">Estimasi</span>
                <span class="font-medium text-charcoal-600">{{ formatCompactRupiah(item.estimatedCost) }}</span>
              </div>
              <div>
                <span class="text-charcoal-400 block text-[10px]">Biaya Aktual</span>
                <span class="font-bold text-charcoal">{{ formatCompactRupiah(item.actualCost) }}</span>
              </div>
              <div>
                <span class="text-charcoal-400 block text-[10px]">Sudah Dibayar</span>
                <span class="font-semibold text-sage-700">{{ formatCompactRupiah(item.paidAmount) }}</span>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-rose-50">
              <button
                type="button"
                @click="openEditExpense(item)"
                class="px-3 py-1 rounded-lg border border-charcoal-200 text-charcoal-600 text-xs font-medium"
              >
                Edit
              </button>
              <button
                type="button"
                @click="confirmDeleteExpense(item)"
                class="px-3 py-1 rounded-lg border border-rose-200 text-rose text-xs font-medium"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else
        title="Belum Ada Pengeluaran Ditemukan"
        description="Catat pengeluaran baru untuk mengontrol budget persiapan pernikahan Anda."
        action-text="Tambah Pengeluaran"
        @action="openAddExpense"
      />
    </div>

    <!-- Target Budget Edit Modal -->
    <teleport to="body">
      <div
        v-if="isEditingTarget"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm"
        @click.self="isEditingTarget = false"
      >
        <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 text-charcoal">
          <h3 class="text-lg font-serif font-bold text-charcoal mb-1">
            Ubah Target Budget
          </h3>
          <p class="text-xs text-charcoal-400 mb-4">
            Tentukan total pagu anggaran yang direncanakan
          </p>

          <div class="mb-5">
            <label class="block text-xs font-medium text-charcoal mb-1">Total Target (Rp)</label>
            <input
              v-model.number="targetBudgetInput"
              type="number"
              step="1000000"
              min="0"
              class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-rose/30 text-sm font-semibold"
            />
            <p class="text-[11px] text-rose mt-1">
              {{ formatRupiah(targetBudgetInput) }}
            </p>
          </div>

          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              @click="isEditingTarget = false"
              class="px-4 py-2 rounded-xl border border-charcoal-200 text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="button"
              @click="saveTargetBudget"
              class="px-4 py-2 rounded-xl bg-rose text-white text-xs font-medium shadow-sm hover:bg-rose-600"
            >
              Simpan Target
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Expense Modal -->
    <BudgetModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :expense="editingExpense"
      @close="isModalOpen = false"
      @save="handleSaveExpense"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :is-open="isConfirmOpen"
      title="Hapus Pengeluaran Ini?"
      :message="`Apakah Anda yakin ingin menghapus catatan pengeluaran '${expenseToDelete?.title}'? Data ini akan mempengaruhi total anggaran.`"
      confirm-text="Ya, Hapus"
      type="danger"
      @confirm="executeDeleteExpense"
      @cancel="expenseToDelete = null"
      @update:is-open="isConfirmOpen = $event"
    />
  </div>
</template>
