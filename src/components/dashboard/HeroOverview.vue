<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWeddingStore } from '@/stores/weddingStore'
import { calculateCountdown, formatDateIndo } from '@/utils/date'
import { Calendar, MapPin, Sparkles, Heart, CheckCircle2 } from 'lucide-vue-next'

const store = useWeddingStore()

// Live ticking countdown
const now = ref(Date.now())
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const countdown = computed(() => {
  // access now.value to make it tick reactively every second
  if (!now.value) return calculateCountdown(store.profile.weddingDate)
  return calculateCountdown(store.profile.weddingDate)
})

const progress = computed(() => store.overallProgressPercentage)
</script>

<template>
  <div
    class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-rose-50/40 to-champagne-50/50 border border-rose-100/80 p-6 sm:p-8 lg:p-10 shadow-soft-md"
  >
    <!-- Romantic decorative ambient circles -->
    <div
      class="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-rose-200/20 blur-3xl pointer-events-none"
    ></div>
    <div
      class="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-champagne-200/25 blur-3xl pointer-events-none"
    ></div>

    <div class="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
      <!-- Left side: Names, Venue, Date -->
      <div class="max-w-xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/70 text-rose-700 text-xs font-medium mb-3">
          <Sparkles class="w-3.5 h-3.5" />
          <span>The Royal Wedding of</span>
        </div>

        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-charcoal tracking-tight leading-tight">
          {{ store.profile.groomName }}
          <span class="font-serif italic font-normal text-rose px-1">&</span>
          {{ store.profile.brideName }}
        </h1>

        <div class="flex flex-wrap items-center gap-y-2 gap-x-4 mt-4 text-xs sm:text-sm text-charcoal-400">
          <div class="flex items-center gap-1.5">
            <Calendar class="w-4 h-4 text-rose" />
            <span>{{ formatDateIndo(store.profile.weddingDate, true) }}</span>
          </div>

          <span class="text-charcoal-200 hidden sm:inline">&bull;</span>

          <div class="flex items-center gap-1.5">
            <MapPin class="w-4 h-4 text-champagne-700" />
            <span>{{ store.profile.venueName }}, {{ store.profile.venueCity }}</span>
          </div>
        </div>

        <!-- Overall Preparation Progress -->
        <div class="mt-6">
          <div class="flex items-center justify-between text-xs font-medium mb-2">
            <span class="text-charcoal-500 flex items-center gap-1.5">
              <CheckCircle2 class="w-3.5 h-3.5 text-sage" />
              Progress Persiapan Pernikahan
            </span>
            <span class="font-bold text-rose">{{ progress }}% Selesai</span>
          </div>
          <div class="w-full h-3 rounded-full bg-rose-100/50 overflow-hidden p-0.5 border border-rose-100">
            <div
              class="h-full rounded-full bg-gradient-to-r from-rose to-champagne transition-all duration-700 ease-out"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <div class="flex justify-between items-center text-[11px] text-charcoal-400 mt-1.5">
            <span>{{ store.completedTasks }} dari {{ store.totalTasks }} tugas selesai</span>
            <span>{{ store.pendingTasks }} tugas tersisa</span>
          </div>
        </div>
      </div>

      <!-- Right side: Countdown Digital Timer -->
      <div
        class="w-full lg:w-auto bg-white/90 backdrop-blur-md border border-rose-100 rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col items-center"
      >
        <p class="text-xs uppercase font-medium tracking-widest text-charcoal-400 mb-4 flex items-center gap-1.5">
          <Heart class="w-3.5 h-3.5 fill-rose text-rose" />
          <span>Menuju Hari Bahagia</span>
        </p>

        <div v-if="countdown.isPast" class="text-center py-4">
          <span class="text-2xl font-serif font-bold text-rose">
            Selamat Berbahagia! 💍✨
          </span>
          <p class="text-xs text-charcoal-400 mt-1">Hari pernikahan telah tiba.</p>
        </div>

        <div v-else class="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          <!-- Days -->
          <div class="bg-ivory/80 rounded-2xl p-2.5 sm:p-3.5 min-w-[58px] sm:min-w-[70px] border border-rose-50 shadow-sm">
            <span class="text-2xl sm:text-3xl font-serif font-bold text-charcoal block leading-none">
              {{ String(countdown.days).padStart(2, '0') }}
            </span>
            <span class="text-[10px] sm:text-xs font-sans text-charcoal-400 uppercase tracking-wider block mt-1.5">
              Hari
            </span>
          </div>

          <!-- Hours -->
          <div class="bg-ivory/80 rounded-2xl p-2.5 sm:p-3.5 min-w-[58px] sm:min-w-[70px] border border-rose-50 shadow-sm">
            <span class="text-2xl sm:text-3xl font-serif font-bold text-charcoal block leading-none">
              {{ String(countdown.hours).padStart(2, '0') }}
            </span>
            <span class="text-[10px] sm:text-xs font-sans text-charcoal-400 uppercase tracking-wider block mt-1.5">
              Jam
            </span>
          </div>

          <!-- Minutes -->
          <div class="bg-ivory/80 rounded-2xl p-2.5 sm:p-3.5 min-w-[58px] sm:min-w-[70px] border border-rose-50 shadow-sm">
            <span class="text-2xl sm:text-3xl font-serif font-bold text-charcoal block leading-none">
              {{ String(countdown.minutes).padStart(2, '0') }}
            </span>
            <span class="text-[10px] sm:text-xs font-sans text-charcoal-400 uppercase tracking-wider block mt-1.5">
              Menit
            </span>
          </div>

          <!-- Seconds -->
          <div class="bg-rose-50/70 rounded-2xl p-2.5 sm:p-3.5 min-w-[58px] sm:min-w-[70px] border border-rose-100 shadow-sm">
            <span class="text-2xl sm:text-3xl font-serif font-bold text-rose block leading-none">
              {{ String(countdown.seconds).padStart(2, '0') }}
            </span>
            <span class="text-[10px] sm:text-xs font-sans text-rose-600 uppercase tracking-wider block mt-1.5">
              Detik
            </span>
          </div>
        </div>

        <div class="mt-4 text-center">
          <span class="inline-block text-[11px] text-charcoal-400">
            Total sisa waktu: <strong class="text-charcoal">{{ countdown.totalDays }} hari</strong> lagi
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
