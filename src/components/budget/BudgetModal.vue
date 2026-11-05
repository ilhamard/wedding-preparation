<script setup>
import { ref, watch } from 'vue'
import { BUDGET_CATEGORIES } from '@/utils/defaultData'
import { X, Sparkles, DollarSign } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  expense: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  title: '',
  category: 'Venue',
  estimatedCost: 0,
  actualCost: 0,
  paidAmount: 0,
  status: 'Belum Dibayar',
  notes: '',
})

const errors = ref({})

watch(
  () => props.expense,
  (newVal) => {
    if (newVal) {
      form.value = {
        title: newVal.title || '',
        category: newVal.category || 'Venue',
        estimatedCost: newVal.estimatedCost || 0,
        actualCost: newVal.actualCost || 0,
        paidAmount: newVal.paidAmount || 0,
        status: newVal.status || 'Belum Dibayar',
        notes: newVal.notes || '',
      }
    } else {
      form.value = {
        title: '',
        category: 'Venue',
        estimatedCost: 0,
        actualCost: 0,
        paidAmount: 0,
        status: 'Belum Dibayar',
        notes: '',
      }
    }
    errors.value = {}
  },
  { immediate: true }
)

// Auto adjust paid amount based on status if needed
function handleStatusChange() {
  if (form.value.status === 'Lunas') {
    form.value.paidAmount = form.value.actualCost || form.value.estimatedCost
  } else if (form.value.status === 'Belum Dibayar') {
    form.value.paidAmount = 0
  }
}

function validate() {
  errors.value = {}
  if (!form.value.title.trim()) {
    errors.value.title = 'Nama pengeluaran wajib diisi'
  }
  if (form.value.estimatedCost < 0 || form.value.actualCost < 0) {
    errors.value.amount = 'Nominal biaya tidak boleh negatif'
  }
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return

  emit('save', {
    ...form.value,
    estimatedCost: Number(form.value.estimatedCost) || 0,
    actualCost: Number(form.value.actualCost) || 0,
    paidAmount: Number(form.value.paidAmount) || 0,
  })
}
</script>

<template>
  <teleport to="body">
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm overflow-y-auto"
        @click.self="emit('close')"
      >
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-3"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-100 text-charcoal my-8 relative"
          >
            <!-- Header -->
            <div class="flex items-center justify-between pb-4 border-b border-rose-50 mb-5">
              <div>
                <h3 class="text-xl font-serif font-bold text-charcoal">
                  {{ expense ? 'Edit Pengeluaran' : 'Catat Pengeluaran Baru' }}
                </h3>
                <p class="text-xs text-charcoal-400 mt-0.5">
                  Kelola estimasi dan realisasi anggaran pernikahan
                </p>
              </div>
              <button
                type="button"
                @click="emit('close')"
                class="p-2 rounded-xl text-charcoal-400 hover:text-charcoal hover:bg-ivory"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-4 text-xs sm:text-sm">
              <!-- Item Title -->
              <div>
                <label class="block font-medium text-charcoal mb-1">
                  Nama Item / Pengeluaran <span class="text-rose">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="Misal: Sewa Gedung Ballroom & Catering"
                  class="w-full px-4 py-2.5 rounded-xl border bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  :class="errors.title ? 'border-rose ring-1 ring-rose' : 'border-charcoal-200'"
                />
                <span v-if="errors.title" class="text-rose text-xs mt-1 block font-medium">
                  {{ errors.title }}
                </span>
              </div>

              <!-- Category -->
              <div>
                <label class="block font-medium text-charcoal mb-1">
                  Kategori Pengeluaran <span class="text-rose">*</span>
                </label>
                <select
                  v-model="form.category"
                  class="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                >
                  <option v-for="cat in BUDGET_CATEGORIES" :key="cat" :value="cat">
                    {{ cat }}
                  </option>
                </select>
              </div>

              <!-- Estimated & Actual Cost Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Estimasi Biaya (Rp)
                  </label>
                  <input
                    v-model.number="form.estimatedCost"
                    type="number"
                    min="0"
                    step="50000"
                    class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  />
                </div>

                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Biaya Aktual / Kontrak (Rp)
                  </label>
                  <input
                    v-model.number="form.actualCost"
                    type="number"
                    min="0"
                    step="50000"
                    class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  />
                </div>
              </div>

              <!-- Payment Status & Paid Amount Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Status Pembayaran
                  </label>
                  <select
                    v-model="form.status"
                    @change="handleStatusChange"
                    class="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  >
                    <option value="Belum Dibayar">Belum Dibayar</option>
                    <option value="DP">DP (Uang Muka / Sebagian)</option>
                    <option value="Lunas">Lunas (100% Terbayar)</option>
                  </select>
                </div>

                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Jumlah Sudah Dibayar (Rp)
                  </label>
                  <input
                    v-model.number="form.paidAmount"
                    type="number"
                    min="0"
                    step="50000"
                    :disabled="form.status === 'Belum Dibayar'"
                    class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <!-- Notes -->
              <div>
                <label class="block font-medium text-charcoal mb-1">
                  Catatan Pembayaran / Nomor Rekening Vendor
                </label>
                <textarea
                  v-model="form.notes"
                  rows="2"
                  placeholder="Misal: DP 30% ditransfer tanggal 12, pelunasan H-14..."
                  class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors resize-none"
                ></textarea>
              </div>

              <!-- Submit Buttons -->
              <div class="pt-4 border-t border-rose-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  @click="emit('close')"
                  class="px-4 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-600 hover:bg-ivory text-xs sm:text-sm font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  class="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-rose text-white text-xs sm:text-sm font-medium shadow-md shadow-rose/25 hover:bg-rose-600 transition-all active:scale-95"
                >
                  <Sparkles class="w-4 h-4" />
                  <span>{{ expense ? 'Simpan Perubahan' : 'Catat Pengeluaran' }}</span>
                </button>
              </div>
            </form>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>
