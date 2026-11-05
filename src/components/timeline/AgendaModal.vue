<script setup>
import { ref, watch } from 'vue'
import { X, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  agenda: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  phase: 'H-90 (3 Bulan Sebelum)',
  title: '',
  date: '',
  description: '',
  completed: false,
})

const errors = ref({})

watch(
  () => props.agenda,
  (newVal) => {
    if (newVal) {
      form.value = {
        phase: newVal.phase || 'H-90 (3 Bulan Sebelum)',
        title: newVal.title || '',
        date: newVal.date || '',
        description: newVal.description || '',
        completed: Boolean(newVal.completed),
      }
    } else {
      form.value = {
        phase: 'H-90 (3 Bulan Sebelum)',
        title: '',
        date: '',
        description: '',
        completed: false,
      }
    }
    errors.value = {}
  },
  { immediate: true }
)

function validate() {
  errors.value = {}
  if (!form.value.title.trim()) {
    errors.value.title = 'Judul agenda / milestone wajib diisi'
  }
  if (!form.value.date) {
    errors.value.date = 'Pilih tanggal target'
  }
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return
  emit('save', { ...form.value })
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
                  {{ agenda ? 'Edit Agenda Timeline' : 'Tambah Milestone Timeline' }}
                </h3>
                <p class="text-xs text-charcoal-400 mt-0.5">
                  Tentukan fase persiapan dan tanggal pelaksanaan
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
                  Judul Milestone / Agenda <span class="text-rose">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="Misal: Sesi Foto Prewedding & Fitting Busana"
                  class="w-full px-4 py-2.5 rounded-xl border bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors"
                  :class="errors.title ? 'border-rose ring-1 ring-rose' : 'border-charcoal-200'"
                />
                <span v-if="errors.title" class="text-rose text-xs mt-1 block font-medium">
                  {{ errors.title }}
                </span>
              </div>

              <!-- Phase & Date Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Fase Persiapan
                  </label>
                  <input
                    v-model="form.phase"
                    type="text"
                    placeholder="Misal: H-60 (2 Bulan)"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 text-xs"
                  />
                </div>

                <div>
                  <label class="block font-medium text-charcoal mb-1">
                    Tanggal Target <span class="text-rose">*</span>
                  </label>
                  <input
                    v-model="form.date"
                    type="date"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 text-xs"
                    :class="errors.date ? 'border-rose' : 'border-charcoal-200'"
                  />
                  <span v-if="errors.date" class="text-rose text-[11px] mt-1 block">
                    {{ errors.date }}
                  </span>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block font-medium text-charcoal mb-1">
                  Rincian Kegiatan / Catatan Rundown
                </label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="Jadwal detail atau PIC pelaksana..."
                  class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-colors resize-none"
                ></textarea>
              </div>

              <!-- Status Checkbox -->
              <div class="flex items-center gap-2 pt-1">
                <input
                  id="agendaCompleted"
                  v-model="form.completed"
                  type="checkbox"
                  class="w-4 h-4 rounded text-rose focus:ring-rose"
                />
                <label for="agendaCompleted" class="text-xs text-charcoal cursor-pointer font-medium">
                  Tandai agenda ini telah selesai terlaksana
                </label>
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
                  <span>{{ agenda ? 'Simpan Agenda' : 'Tambahkan Agenda' }}</span>
                </button>
              </div>
            </form>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>
