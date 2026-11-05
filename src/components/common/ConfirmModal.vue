<script setup>
import { AlertTriangle, Trash2, HelpCircle } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Konfirmasi Tindakan',
  },
  message: {
    type: String,
    default: 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  },
  confirmText: {
    type: String,
    default: 'Ya, Lanjutkan',
  },
  cancelText: {
    type: String,
    default: 'Batal',
  },
  type: {
    type: String,
    default: 'danger', // 'danger' | 'warning' | 'info'
  },
})

const emit = defineEmits(['confirm', 'cancel', 'update:isOpen'])

function handleConfirm() {
  emit('confirm')
  emit('update:isOpen', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:isOpen', false)
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
        class="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm"
        @click.self="handleCancel"
      >
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-rose-100 text-charcoal text-center relative overflow-hidden"
          >
            <!-- Decorative circle -->
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              :class="[
                type === 'danger'
                  ? 'bg-rose-100 text-rose-600'
                  : type === 'warning'
                  ? 'bg-champagne-100 text-champagne-700'
                  : 'bg-sage-100 text-sage-700',
              ]"
            >
              <component
                :is="type === 'danger' ? Trash2 : type === 'warning' ? AlertTriangle : HelpCircle"
                class="w-8 h-8"
              />
            </div>

            <h3 class="text-xl font-serif font-bold text-charcoal tracking-wide mb-2">
              {{ title }}
            </h3>

            <p class="text-sm text-charcoal-400 mb-6 leading-relaxed">
              {{ message }}
            </p>

            <div class="flex items-center justify-center gap-3">
              <button
                type="button"
                @click="handleCancel"
                class="flex-1 px-4 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-600 hover:bg-ivory text-sm font-medium transition-colors"
              >
                {{ cancelText }}
              </button>
              <button
                type="button"
                @click="handleConfirm"
                :class="[
                  'flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-md transition-all active:scale-95',
                  type === 'danger'
                    ? 'bg-rose hover:bg-rose-600 shadow-rose/30'
                    : 'bg-charcoal hover:bg-charcoal-700 shadow-charcoal/20',
                ]"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>
