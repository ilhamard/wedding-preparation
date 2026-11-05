<script setup>
import { useToastStore } from '@/stores/toastStore'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const toastStore = useToastStore()

function getIcon(type) {
  switch (type) {
    case 'success':
      return CheckCircle2
    case 'error':
      return AlertCircle
    case 'warning':
      return AlertTriangle
    default:
      return Info
  }
}

function getStyle(type) {
  switch (type) {
    case 'success':
      return {
        card: 'bg-white border-sage/40 text-charcoal shadow-soft-md',
        iconBg: 'bg-sage-100 text-sage-700',
        bar: 'bg-sage',
      }
    case 'error':
      return {
        card: 'bg-white border-rose/40 text-charcoal shadow-soft-md',
        iconBg: 'bg-rose-100 text-rose-700',
        bar: 'bg-rose',
      }
    case 'warning':
      return {
        card: 'bg-white border-champagne/40 text-charcoal shadow-soft-md',
        iconBg: 'bg-champagne-100 text-champagne-700',
        bar: 'bg-champagne',
      }
    default:
      return {
        card: 'bg-white border-charcoal-200 text-charcoal shadow-soft-md',
        iconBg: 'bg-ivory-200 text-charcoal-600',
        bar: 'bg-charcoal-400',
      }
  }
}
</script>

<template>
  <div
    class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
  >
    <transition-group
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all',
          getStyle(toast.type).card,
        ]"
      >
        <!-- Accent line -->
        <div :class="['absolute top-0 left-0 bottom-0 w-1.5', getStyle(toast.type).bar]"></div>

        <div class="flex items-start gap-3 pl-1.5">
          <div :class="['p-1.5 rounded-xl shrink-0', getStyle(toast.type).iconBg]">
            <component :is="getIcon(toast.type)" class="w-5 h-5" />
          </div>

          <div class="flex-1 min-w-0 pr-2">
            <h4 class="text-sm font-semibold text-charcoal leading-tight">
              {{ toast.title }}
            </h4>
            <p class="text-xs text-charcoal-400 mt-0.5 leading-relaxed break-words">
              {{ toast.message }}
            </p>
          </div>

          <button
            @click="toastStore.removeToast(toast.id)"
            class="text-charcoal-300 hover:text-charcoal-600 p-1 rounded-lg transition-colors shrink-0"
            title="Tutup"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>
