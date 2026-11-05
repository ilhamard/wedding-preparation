<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWeddingStore } from '@/stores/weddingStore'
import { formatDateIndo } from '@/utils/date'
import { Menu, Heart, Sparkles, Calendar } from 'lucide-vue-next'

defineProps({
  isMobileMenuOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggleMobileMenu'])
const route = useRoute()
const store = useWeddingStore()

const pageTitle = computed(() => {
  switch (route.name) {
    case 'dashboard':
      return 'Dashboard Overview'
    case 'checklist':
      return 'Checklist Persiapan'
    case 'budget':
      return 'Budget & Anggaran'
    case 'vendors':
      return 'Direktori Vendor'
    case 'guests':
      return 'Daftar Tamu & RSVP'
    case 'timeline':
      return 'Timeline & Rundown'
    case 'settings':
      return 'Pengaturan Aplikasi'
    default:
      return 'Wedding Planner'
  }
})

const coupleShort = computed(() => {
  const g = store.profile.groomName.split(' ')[0]
  const b = store.profile.brideName.split(' ')[0]
  return `${g} & ${b}`
})
</script>

<template>
  <header
    class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rose-100/70 px-4 sm:px-8 py-3.5 flex items-center justify-between"
  >
    <div class="flex items-center gap-3">
      <!-- Mobile Menu Trigger -->
      <button
        type="button"
        @click="emit('toggleMobileMenu')"
        class="lg:hidden p-2 rounded-xl text-charcoal-500 hover:text-charcoal hover:bg-rose-50 transition-colors"
        aria-label="Buka Menu"
      >
        <Menu class="w-6 h-6" />
      </button>

      <div>
        <h2 class="text-base sm:text-xl font-serif font-bold text-charcoal tracking-tight flex items-center gap-2">
          {{ pageTitle }}
        </h2>
        <p class="hidden sm:block text-xs text-charcoal-400">
          Kelola seluruh persiapan pernikahan dengan rapi dan terencana
        </p>
      </div>
    </div>

    <!-- Right Header Elements -->
    <div class="flex items-center gap-3 sm:gap-4">
      <!-- Wedding Date Badge -->
      <div
        class="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ivory border border-rose-100 text-xs text-charcoal-500"
      >
        <Calendar class="w-3.5 h-3.5 text-rose" />
        <span>{{ formatDateIndo(store.profile.weddingDate) }}</span>
      </div>

      <!-- Couple Pill -->
      <div
        class="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-rose-50/80 border border-rose-200/60 shadow-sm"
      >
        <div
          class="w-7 h-7 rounded-full bg-rose text-white flex items-center justify-center font-serif font-bold text-xs shadow-sm"
        >
          <Heart class="w-3.5 h-3.5 fill-white" />
        </div>
        <span class="text-xs sm:text-sm font-serif font-bold text-charcoal truncate max-w-[120px] sm:max-w-none">
          {{ coupleShort }}
        </span>
      </div>
    </div>
  </header>
</template>
