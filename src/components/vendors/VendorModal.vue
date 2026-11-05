<script setup>
import { ref, watch } from 'vue'
import { VENDOR_CATEGORIES } from '@/utils/defaultData'
import { X, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  vendor: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  name: '',
  category: 'Venue',
  contactPerson: '',
  phone: '',
  priceOffer: 0,
  status: 'Belum Dihubungi',
  instagram: '',
  notes: '',
})

const errors = ref({})

watch(
  () => props.vendor,
  (newVal) => {
    if (newVal) {
      form.value = {
        name: newVal.name || '',
        category: newVal.category || 'Venue',
        contactPerson: newVal.contactPerson || '',
        phone: newVal.phone || '',
        priceOffer: newVal.priceOffer || 0,
        status: newVal.status || 'Belum Dihubungi',
        instagram: newVal.instagram || '',
        notes: newVal.notes || '',
      }
    } else {
      form.value = {
        name: '',
        category: 'Venue',
        contactPerson: '',
        phone: '',
        priceOffer: 0,
        status: 'Belum Dihubungi',
        instagram: '',
        notes: '',
      }
    }
    errors.value = {}
  },
  { immediate: true }
)

function validate() {
  errors.value = {}
  if (!form.value.name.trim()) {
    errors.value.name = 'Nama vendor wajib diisi'
  }
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return

  emit('save', {
    ...form.value,
    priceOffer: Number(form.value.priceOffer) || 0,
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
                  {{ vendor ? 'Edit Informasi Vendor' : 'Tambah Vendor Baru' }}
                </h3>
                <p class="text-xs text-charcoal-400 mt-0.5">
                  Catat detail kontak, penawaran harga, dan status kerja sama
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
              <!-- Vendor Name -->
              <div>
                <label class="block font-medium text-charcoal mb-1">
                  Nama Vendor <span class="text-rose">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Misal: Artisan Floral Studio"
                  class="w-full px-4 py-2.5 rounded-xl border bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  :class="errors.name ? 'border-rose ring-1 ring-rose' : 'border-charcoal-200'"
                />
                <span v-if="errors.name" class="text-rose text-xs mt-1 block font-medium">
                  {{ errors.name }}
                </span>
              </div>

              <!-- Category & Status Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Kategori Vendor
                  </label>
                  <select
                    v-model="form.category"
                    class="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  >
                    <option v-for="cat in VENDOR_CATEGORIES" :key="cat" :value="cat">
                      {{ cat }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Status Booking
                  </label>
                  <select
                    v-model="form.status"
                    class="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  >
                    <option value="Belum Dihubungi">Belum Dihubungi</option>
                    <option value="Survey">Survey</option>
                    <option value="Negotiation">Negotiation (Negosiasi)</option>
                    <option value="Booked">Booked (Terkonfirmasi Deal)</option>
                  </select>
                </div>
              </div>

              <!-- Contact Person & Phone Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Nama Kontak (PIC)
                  </label>
                  <input
                    v-model="form.contactPerson"
                    type="text"
                    placeholder="Misal: Mas Kevin"
                    class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  />
                </div>

                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Nomor WhatsApp / Telp
                  </label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    placeholder="Misal: 08123456789"
                    class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  />
                </div>
              </div>

              <!-- Price Offer & Instagram / Website Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Harga Penawaran / Deal (Rp)
                  </label>
                  <input
                    v-model.number="form.priceOffer"
                    type="number"
                    min="0"
                    step="50000"
                    class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  />
                </div>

                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Instagram / Link Web
                  </label>
                  <input
                    v-model="form.instagram"
                    type="text"
                    placeholder="@vendor atau https://..."
                    class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  />
                </div>
              </div>

              <!-- Notes -->
              <div>
                <label class="block font-medium text-charcoal mb-1">
                  Catatan / Termasuk Dalam Paket
                </label>
                <textarea
                  v-model="form.notes"
                  rows="3"
                  placeholder="Rincian paket yang ditawarkan, syarat pembayaran, dll..."
                  class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors resize-none"
                ></textarea>
              </div>

              <!-- Action buttons -->
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
                  <span>{{ vendor ? 'Simpan Vendor' : 'Tambahkan Vendor' }}</span>
                </button>
              </div>
            </form>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>
