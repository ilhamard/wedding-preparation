<script setup>
import { Sparkles } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    default: 'Belum Ada Data',
  },
  description: {
    type: String,
    default: 'Mulai tambahkan data untuk melihat rangkuman persiapan pernikahan Anda di sini.',
  },
  actionText: {
    type: String,
    default: '',
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
})

defineEmits(['action'])
</script>

<template>
  <div class="py-12 px-4 text-center max-w-sm mx-auto flex flex-col items-center">
    <div
      class="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose mb-4 shadow-sm"
    >
      <component :is="icon || Sparkles" class="w-8 h-8" />
    </div>

    <h4 class="text-lg font-serif font-semibold text-charcoal mb-1">
      {{ title }}
    </h4>

    <p class="text-xs sm:text-sm text-charcoal-400 mb-5 leading-relaxed">
      {{ description }}
    </p>

    <button
      v-if="actionText"
      type="button"
      @click="$emit('action')"
      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose text-white text-xs sm:text-sm font-medium shadow-md shadow-rose/25 hover:bg-rose-600 transition-all active:scale-95"
    >
      <Sparkles class="w-4 h-4" />
      {{ actionText }}
    </button>
  </div>
</template>
