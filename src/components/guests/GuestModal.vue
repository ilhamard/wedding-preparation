<script setup>
import { ref, computed, watch } from 'vue'
import { useWeddingStore } from '@/stores/weddingStore'
import { GUEST_CATEGORIES } from '@/utils/defaultData'
import { generateInvitationUrl } from '@/utils/invitation'
import { X, Sparkles, Copy, Check, Link as LinkIcon } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  guest: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'save'])
const store = useWeddingStore()

const form = ref({
  name: '',
  category: 'Keluarga',
  pax: 1,
  invitationStatus: 'Belum Diundang',
  rsvpStatus: 'Pending',
  notes: '',
})

const errors = ref({})
const isCopied = ref(false)

const previewUrl = computed(() => {
  return generateInvitationUrl(form.value.name, store.profile.invitationBaseUrl)
})

function copyPreviewLink() {
  if (!previewUrl.value) return
  navigator.clipboard.writeText(previewUrl.value).then(() => {
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  })
}

watch(
  () => props.guest,
  (newVal) => {
    if (newVal) {
      form.value = {
        name: newVal.name || '',
        category: newVal.category || 'Keluarga',
        pax: newVal.pax || 1,
        invitationStatus: newVal.invitationStatus || 'Belum Diundang',
        rsvpStatus: newVal.rsvpStatus || 'Pending',
        notes: newVal.notes || '',
      }
    } else {
      form.value = {
        name: '',
        category: 'Keluarga',
        pax: 1,
        invitationStatus: 'Belum Diundang',
        rsvpStatus: 'Pending',
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
    errors.value.name = 'Nama tamu wajib diisi'
  }
  if (!form.value.pax || form.value.pax < 1) {
    errors.value.pax = 'Jumlah tamu minimal 1 orang'
  }
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return

  emit('save', {
    ...form.value,
    pax: Number(form.value.pax) || 1,
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
            class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-rose-100 text-charcoal my-8 relative"
          >
            <!-- Header -->
            <div class="flex items-center justify-between pb-4 border-b border-rose-50 mb-5">
              <div>
                <h3 class="text-xl font-serif font-bold text-charcoal">
                  {{ guest ? 'Edit Data Tamu' : 'Tambah Tamu Undangan' }}
                </h3>
                <p class="text-xs text-charcoal-400 mt-0.5">
                  Catat nama tamu, jumlah pax, dan status kehadiran
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
              <!-- Guest Name -->
              <div>
                <label class="block font-medium text-charcoal mb-1">
                  Nama Tamu / Keluarga <span class="text-rose">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Misal: Om Bambang & Tante Sri"
                  class="w-full px-4 py-2.5 rounded-xl border bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  :class="errors.name ? 'border-rose ring-1 ring-rose' : 'border-charcoal-200'"
                />
                <span v-if="errors.name" class="text-rose text-xs mt-1 block font-medium">
                  {{ errors.name }}
                </span>

                <!-- Live Preview of Generated Invitation URL -->
                <div v-if="form.name.trim()" class="mt-2.5 p-2.5 rounded-xl bg-ivory/80 border border-rose-100 space-y-1">
                  <div class="flex items-center justify-between text-[11px] font-semibold text-charcoal-600">
                    <span class="flex items-center gap-1 text-rose">
                      <Sparkles class="w-3 h-3" />
                      <span>Preview Link Undangan:</span>
                    </span>
                    <button
                      type="button"
                      @click="copyPreviewLink"
                      class="text-rose hover:text-rose-700 flex items-center gap-1 text-[10px] font-medium"
                    >
                      <Check v-if="isCopied" class="w-3 h-3 text-sage-600" />
                      <Copy v-else class="w-3 h-3" />
                      <span>{{ isCopied ? 'Tersalin' : 'Salin' }}</span>
                    </button>
                  </div>
                  <div class="text-[10px] font-mono text-charcoal-700 break-all select-all">
                    {{ previewUrl }}
                  </div>
                </div>
              </div>

              <!-- Category & Pax Row -->
              <div class="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Kategori Tamu
                  </label>
                  <select
                    v-model="form.category"
                    class="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  >
                    <option v-for="cat in GUEST_CATEGORIES" :key="cat" :value="cat">
                      {{ cat }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Jumlah Orang (Pax) <span class="text-rose">*</span>
                  </label>
                  <input
                    v-model.number="form.pax"
                    type="number"
                    min="1"
                    max="50"
                    class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  />
                </div>
              </div>

              <!-- Invitation & RSVP Status Row -->
              <div class="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Status Undangan
                  </label>
                  <select
                    v-model="form.invitationStatus"
                    class="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  >
                    <option value="Belum Diundang">Belum Diundang</option>
                    <option value="Sudah Diundang">Sudah Diundang</option>
                  </select>
                </div>

                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Konfirmasi RSVP
                  </label>
                  <select
                    v-model="form.rsvpStatus"
                    class="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  >
                    <option value="Pending">Pending (Belum Konfirmasi)</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Tidak Hadir">Tidak Hadir</option>
                  </select>
                </div>
              </div>

              <!-- Notes -->
              <div>
                <label class="block font-medium text-charcoal mb-1">
                  Catatan Khusus (Meja VIP, Alamat, dll.)
                </label>
                <textarea
                  v-model="form.notes"
                  rows="2"
                  placeholder="Misal: Meja VIP Keluarga, butuh kursi roda..."
                  class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors resize-none"
                ></textarea>
              </div>

              <!-- Actions -->
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
                  <span>{{ guest ? 'Simpan Perubahan' : 'Tambahkan Tamu' }}</span>
                </button>
              </div>
            </form>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>
