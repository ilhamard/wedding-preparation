<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { LayoutDashboard, CheckSquare, Wallet, Users, MoreHorizontal } from 'lucide-vue-next'

const route = useRoute()
const emit = defineEmits(['openMenu'])

const items = [
  { name: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'Checklist', path: '/checklist', icon: CheckSquare },
  { name: 'Budget', path: '/budget', icon: Wallet },
  { name: 'Tamu', path: '/guests', icon: Users },
]
</script>

<template>
  <div
    class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-100/80 px-2 py-1 shadow-lg pb-safe"
  >
    <div class="flex items-center justify-around max-w-md mx-auto">
      <RouterLink
        v-for="item in items"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-w-[56px] text-[10px] font-medium transition-colors',
          route.path === item.path ? 'text-rose font-bold' : 'text-charcoal-400 hover:text-charcoal',
        ]"
      >
        <div
          :class="[
            'p-1 rounded-xl mb-0.5 transition-transform active:scale-90',
            route.path === item.path ? 'bg-rose-50 text-rose' : '',
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
        </div>
        <span>{{ item.name }}</span>
      </RouterLink>

      <!-- More Menu Button -->
      <button
        type="button"
        @click="emit('openMenu')"
        class="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-w-[56px] text-[10px] font-medium text-charcoal-400 hover:text-charcoal"
      >
        <div class="p-1 rounded-xl mb-0.5">
          <MoreHorizontal class="w-5 h-5" />
        </div>
        <span>Menu</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Safe area padding for iPhones with home indicator bar */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 8px);
}
</style>
