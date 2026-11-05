<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  subtext: {
    type: String,
    default: '',
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  variant: {
    type: String,
    default: 'rose', // 'rose' | 'sage' | 'champagne' | 'charcoal'
  },
})

const variantClasses = {
  rose: {
    bg: 'bg-rose-50/60 hover:bg-rose-50',
    iconBg: 'bg-rose text-white shadow-rose/25',
    accentText: 'text-rose-700',
    border: 'border-rose-100',
  },
  sage: {
    bg: 'bg-sage-50/60 hover:bg-sage-50',
    iconBg: 'bg-sage text-white shadow-sage/25',
    accentText: 'text-sage-700',
    border: 'border-sage-100',
  },
  champagne: {
    bg: 'bg-champagne-50/60 hover:bg-champagne-50',
    iconBg: 'bg-champagne text-white shadow-champagne/25',
    accentText: 'text-champagne-700',
    border: 'border-champagne-100',
  },
  charcoal: {
    bg: 'bg-white hover:bg-ivory-50',
    iconBg: 'bg-charcoal text-white shadow-charcoal/20',
    accentText: 'text-charcoal-700',
    border: 'border-charcoal-100',
  },
}
</script>

<template>
  <div
    class="glass-card rounded-3xl p-5 border transition-all duration-300 hover:shadow-soft-md group relative overflow-hidden flex flex-col justify-between"
    :class="[variantClasses[variant]?.border || 'border-rose-100/60']"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-wider text-charcoal-400 mb-1">
          {{ title }}
        </p>
        <h3 class="text-2xl sm:text-3xl font-serif font-bold text-charcoal tracking-tight">
          {{ value }}
        </h3>
      </div>

      <div
        v-if="icon"
        class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform duration-300 group-hover:scale-105"
        :class="[variantClasses[variant]?.iconBg || 'bg-rose text-white']"
      >
        <component :is="icon" class="w-5 h-5" />
      </div>
    </div>

    <div v-if="subtext" class="mt-3 pt-3 border-t border-charcoal-50 flex items-center justify-between text-xs">
      <span class="text-charcoal-400 font-normal truncate">
        {{ subtext }}
      </span>
    </div>
  </div>
</template>
