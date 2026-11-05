<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useWeddingStore } from '@/stores/weddingStore'
import { calculateCountdown, formatDateShort } from '@/utils/date'
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  Briefcase,
  Users,
  CalendarDays,
  Settings,
  Heart,
  Sparkles,
} from 'lucide-vue-next'

const route = useRoute()
const store = useWeddingStore()

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Checklist Persiapan', path: '/checklist', icon: CheckSquare, badge: () => store.pendingTasks },
  { name: 'Budget Planner', path: '/budget', icon: Wallet },
  { name: 'Vendor Directory', path: '/vendors', icon: Briefcase },
  { name: 'Daftar Tamu (RSVP)', path: '/guests', icon: Users, badge: () => store.guestStats.totalGuests },
  { name: 'Timeline & Rundown', path: '/timeline', icon: CalendarDays },
  { name: 'Pengaturan', path: '/settings', icon: Settings },
]

const coupleInitials = computed(() => {
  const g = store.profile.groomName?.trim().charAt(0) || 'S'
  const b = store.profile.brideName?.trim().charAt(0) || 'A'
  return `${g} & ${b}`
})

const countdown = computed(() => {
  return calculateCountdown(store.profile.weddingDate)
})
</script>

<template>
  <aside
    class="w-72 bg-white/90 backdrop-blur-md border-r border-rose-100 flex flex-col justify-between h-screen sticky top-0 z-30 transition-all select-none"
  >
    <!-- Brand / Monogram Header -->
    <div class="p-6 border-b border-rose-50/80">
      <div class="flex items-center gap-3">
        <div
          class="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose to-rose-600 text-white flex items-center justify-center font-serif text-lg font-bold shadow-md shadow-rose/25"
        >
          <Heart class="w-5 h-5 fill-white" />
        </div>
        <div>
          <h1 class="font-display font-bold text-lg text-charcoal tracking-wide flex items-center gap-1.5">
            Eternity
            <span class="text-[10px] uppercase font-sans font-semibold tracking-widest px-2 py-0.5 rounded-full bg-champagne-100 text-champagne-800">
              Planner
            </span>
          </h1>
          <p class="text-xs text-charcoal-400 font-sans mt-0.5">
            Wedding Preparation
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 custom-scrollbar">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all group',
          route.path === item.path
            ? 'bg-rose-50 text-rose font-semibold shadow-sm shadow-rose/10'
            : 'text-charcoal-500 hover:bg-ivory hover:text-charcoal',
        ]"
      >
        <div class="flex items-center gap-3">
          <component
            :is="item.icon"
            :class="[
              'w-5 h-5 transition-transform group-hover:scale-110',
              route.path === item.path ? 'text-rose' : 'text-charcoal-400 group-hover:text-charcoal',
            ]"
          />
          <span>{{ item.name }}</span>
        </div>

        <span
          v-if="item.badge && item.badge()"
          :class="[
            'text-[10px] font-bold px-2 py-0.5 rounded-full',
            route.path === item.path ? 'bg-rose text-white' : 'bg-charcoal-100 text-charcoal-600',
          ]"
        >
          {{ item.badge() }}
        </span>
      </RouterLink>
    </nav>

    <!-- Couple Mini Card & Countdown Footer -->
    <div class="p-4 border-t border-rose-50/80">
      <div class="bg-gradient-to-br from-ivory to-rose-50/50 rounded-2xl p-3.5 border border-rose-100/70">
        <div class="flex items-center gap-2.5 mb-2">
          <div
            class="w-9 h-9 rounded-full bg-champagne-200 text-champagne-800 flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-sm"
          >
            {{ coupleInitials }}
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-xs font-serif font-bold text-charcoal truncate">
              {{ store.profile.groomName.split(' ')[0] }} & {{ store.profile.brideName.split(' ')[0] }}
            </h4>
            <p class="text-[10px] text-charcoal-400 truncate">
              {{ formatDateShort(store.profile.weddingDate) }}
            </p>
          </div>
        </div>

        <!-- Countdown Pill -->
        <div class="bg-white/80 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] border border-rose-100/50">
          <span class="text-charcoal-400 font-medium flex items-center gap-1">
            <Sparkles class="w-3 h-3 text-champagne" /> Hari Menuju H:
          </span>
          <span class="font-serif font-bold text-rose">
            {{ countdown.isPast ? 'Selesai 💍' : `${countdown.totalDays} Hari` }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>
