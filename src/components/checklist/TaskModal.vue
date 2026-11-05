<script setup>
import { ref, watch } from 'vue'
import { CHECKLIST_CATEGORIES } from '@/utils/defaultData'
import { X, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  task: {
    type: Object,
    default: null,
  },
  defaultCategory: {
    type: String,
    default: 'Administrasi Pernikahan',
  },
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  title: '',
  description: '',
  category: props.defaultCategory || 'Administrasi Pernikahan',
  deadline: '',
  priority: 'Medium',
  status: 'Todo',
  notes: '',
})

const errors = ref({})

watch(
  () => props.task,
  (newVal) => {
    if (newVal) {
      form.value = {
        title: newVal.title || '',
        description: newVal.description || '',
        category: newVal.category || props.defaultCategory,
        deadline: newVal.deadline || '',
        priority: newVal.priority || 'Medium',
        status: newVal.status || 'Todo',
        notes: newVal.notes || '',
      }
    } else {
      form.value = {
        title: '',
        description: '',
        category: props.defaultCategory || 'Administrasi Pernikahan',
        deadline: '',
        priority: 'Medium',
        status: 'Todo',
        notes: '',
      }
    }
    errors.value = {}
  },
  { immediate: true }
)

function validate() {
  errors.value = {}
  if (!form.value.title.trim()) {
    errors.value.title = 'Nama tugas / persiapan wajib diisi'
  }
  if (!form.value.category) {
    errors.value.category = 'Pilih kategori persiapan'
  }
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return

  emit('save', {
    ...form.value,
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
                  {{ task ? 'Edit Tugas Persiapan' : 'Tambah Tugas Baru' }}
                </h3>
                <p class="text-xs text-charcoal-400 mt-0.5">
                  Isi rincian tugas persiapan pernikahan Anda
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
              <!-- Title -->
              <div>
                <label class="block font-medium text-charcoal mb-1">
                  Nama Tugas <span class="text-rose">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="Misal: Booking fotografer hari H"
                  class="w-full px-4 py-2.5 rounded-xl border bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  :class="errors.title ? 'border-rose ring-1 ring-rose' : 'border-charcoal-200'"
                />
                <span v-if="errors.title" class="text-rose text-xs mt-1 block font-medium">
                  {{ errors.title }}
                </span>
              </div>

              <!-- Category & Priority Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Kategori <span class="text-rose">*</span>
                  </label>
                  <select
                    v-model="form.category"
                    class="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  >
                    <option v-for="cat in CHECKLIST_CATEGORIES" :key="cat" :value="cat">
                      {{ cat }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Prioritas
                  </label>
                  <select
                    v-model="form.priority"
                    class="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  >
                    <option value="Low">Low (Rendah)</option>
                    <option value="Medium">Medium (Sedang)</option>
                    <option value="High">High (Tinggi/Penting)</option>
                  </select>
                </div>
              </div>

              <!-- Deadline & Status Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Tenggat Waktu (Deadline)
                  </label>
                  <input
                    v-model="form.deadline"
                    type="date"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  />
                </div>

                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Status Pengerjaan
                  </label>
                  <select
                    v-model="form.status"
                    class="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  >
                    <option value="Todo">Todo (Belum Mulai)</option>
                    <option value="In Progress">In Progress (Sedang Dikerjakan)</option>
                    <option value="Completed">Completed (Selesai)</option>
                  </select>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block font-medium text-charcoal mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  v-model="form.description"
                  rows="2"
                  placeholder="Rincian atau langkah pelaksanaan tugas ini..."
                  class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors resize-none"
                ></textarea>
              </div>

              <!-- Notes -->
              <div>
                <label class="block font-medium text-charcoal mb-1">
                  Catatan Tambahan / Kontak / Referensi
                </label>
                <textarea
                  v-model="form.notes"
                  rows="2"
                  placeholder="Misal: Nomor telepon PIC atau catatan khusus..."
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
                  <span>{{ task ? 'Simpan Perubahan' : 'Tambahkan Tugas' }}</span>
                </button>
              </div>
            </form>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>
