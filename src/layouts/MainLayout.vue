<script setup>
import { ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import Sidebar from '@/components/common/Sidebar.vue'
import Navbar from '@/components/common/Navbar.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import Toast from '@/components/common/Toast.vue'
import {
  X,
  LayoutDashboard,
  CheckSquare,
  Wallet,
  Briefcase,
  Users,
  CalendarDays,
  Settings,
  Heart,
} from 'lucide-vue-next'

const isMobileDrawerOpen = ref(false)
const route = useRoute()

const mobileNavLinks = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Checklist Persiapan', path: '/checklist', icon: CheckSquare },
  { name: 'Budget Planner', path: '/budget', icon: Wallet },
  { name: 'Vendor Directory', path: '/vendors', icon: Briefcase },
  { name: 'Daftar Tamu (RSVP)', path: '/guests', icon: Users },
  { name: 'Timeline & Rundown', path: '/timeline', icon: CalendarDays },
  { name: 'Pengaturan', path: '/settings', icon: Settings },
]

function closeDrawer() {
  isMobileDrawerOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-ivory flex flex-col antialiased">
    <!-- Toast Global -->
    <Toast />

    <div class="flex flex-1">
      <!-- Desktop Sidebar -->
      <div class="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      <!-- Mobile Drawer Backdrop & Drawer -->
      <teleport to="body">
        <transition
          enter-active-class="transition-opacity ease-linear duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity ease-linear duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isMobileDrawerOpen"
            class="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm lg:hidden"
            @click="closeDrawer"
          ></div>
        </transition>

        <transition
          enter-active-class="transition ease-in-out duration-300 transform"
          enter-from-class="-translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition ease-in-out duration-200 transform"
          leave-from-class="translate-x-0"
          leave-to-class="-translate-x-full"
        >
          <div
            v-if="isMobileDrawerOpen"
            class="fixed inset-y-0 left-0 z-50 w-72 bg-white p-6 shadow-2xl flex flex-col justify-between lg:hidden"
          >
            <div>
              <div class="flex items-center justify-between pb-5 border-b border-rose-100">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-10 h-10 rounded-2xl bg-rose text-white flex items-center justify-center font-serif text-lg font-bold shadow-md shadow-rose/25"
                  >
                    <Heart class="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h2 class="font-display font-bold text-base text-charcoal">Eternity</h2>
                    <p class="text-[10px] text-charcoal-400">Wedding Preparation</p>
                  </div>
                </div>

                <button
                  type="button"
                  @click="closeDrawer"
                  class="p-2 rounded-xl text-charcoal-400 hover:text-charcoal hover:bg-ivory"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <div class="mt-6 space-y-1.5">
                <RouterLink
                  v-for="link in mobileNavLinks"
                  :key="link.path"
                  :to="link.path"
                  @click="closeDrawer"
                  :class="[
                    'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors',
                    route.path === link.path
                      ? 'bg-rose-50 text-rose font-semibold'
                      : 'text-charcoal-500 hover:bg-ivory hover:text-charcoal',
                  ]"
                >
                  <component :is="link.icon" class="w-5 h-5 text-current" />
                  <span>{{ link.name }}</span>
                </RouterLink>
              </div>
            </div>

            <div class="pt-4 border-t border-rose-50 text-center">
              <p class="text-[11px] text-charcoal-400">
                Eternity Wedding Planner &bull; Local Storage
              </p>
            </div>
          </div>
        </transition>
      </teleport>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Navbar @toggleMobileMenu="isMobileDrawerOpen = !isMobileDrawerOpen" />

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <slot />
        </main>
      </div>
    </div>

    <!-- Mobile Bottom Navigation -->
    <BottomNav @openMenu="isMobileDrawerOpen = true" />
  </div>
</template>
