<script setup>
import { ref, computed } from 'vue'
import { useWeddingStore } from '@/stores/weddingStore'
import { VENDOR_CATEGORIES } from '@/utils/defaultData'
import { formatRupiah, formatCompactRupiah } from '@/utils/formatter'
import VendorModal from '@/components/vendors/VendorModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatCard from '@/components/common/StatCard.vue'
import {
  Briefcase,
  Search,
  Plus,
  Phone,
  MessageCircle,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  HelpCircle,
  DollarSign,
} from 'lucide-vue-next'

const store = useWeddingStore()

// State filters
const searchQuery = ref('')
const selectedCategory = ref('Semua')
const selectedStatus = ref('Semua')

// Modals
const isModalOpen = ref(false)
const editingVendor = ref(null)
const isConfirmOpen = ref(false)
const vendorToDelete = ref(null)

const filteredVendors = computed(() => {
  return store.vendors.filter((v) => {
    if (selectedCategory.value !== 'Semua' && v.category !== selectedCategory.value) {
      return false
    }
    if (selectedStatus.value !== 'Semua' && v.status !== selectedStatus.value) {
      return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchName = v.name?.toLowerCase().includes(q)
      const matchPIC = v.contactPerson?.toLowerCase().includes(q)
      const matchNotes = v.notes?.toLowerCase().includes(q)
      if (!matchName && !matchPIC && !matchNotes) return false
    }
    return true
  })
})

function formatWhatsappUrl(phone, vendorName) {
  if (!phone) return '#'
  let clean = phone.replace(/[^0-9]/g, '')
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1)
  }
  const text = encodeURIComponent(
    `Halo ${vendorName}, saya ingin menanyakan perihal ketersediaan tanggal dan paket pernikahan kami.`
  )
  return `https://wa.me/${clean}?text=${text}`
}

function openAddVendor() {
  editingVendor.value = null
  isModalOpen.value = true
}

function openEditVendor(vendor) {
  editingVendor.value = vendor
  isModalOpen.value = true
}

function handleSaveVendor(data) {
  if (editingVendor.value) {
    store.updateVendor(editingVendor.value.id, data)
  } else {
    store.addVendor(data)
  }
  isModalOpen.value = false
  editingVendor.value = null
}

function confirmDeleteVendor(vendor) {
  vendorToDelete.value = vendor
  isConfirmOpen.value = true
}

function executeDeleteVendor() {
  if (vendorToDelete.value) {
    store.deleteVendor(vendorToDelete.value.id)
    vendorToDelete.value = null
  }
}

function statusBadgeClass(status) {
  switch (status) {
    case 'Booked':
      return 'bg-sage-100 text-sage-800 border-sage-200'
    case 'Negotiation':
      return 'bg-champagne-100 text-champagne-800 border-champagne-200'
    case 'Survey':
      return 'bg-rose-100 text-rose-800 border-rose-200'
    default:
      return 'bg-charcoal-100 text-charcoal-700 border-charcoal-200'
  }
}
</script>

<template>
  <div class="space-y-6 sm:space-y-8">
    <!-- Header with Action -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-serif font-bold text-charcoal tracking-tight flex items-center gap-2">
          <span>Vendor Directory</span>
        </h1>
        <p class="text-xs sm:text-sm text-charcoal-400 mt-1">
          Katalog vendor rekanan pernikahan: venue, katering, foto, MUA, dekorasi, & musik
        </p>
      </div>

      <button
        type="button"
        @click="openAddVendor"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose/25 hover:bg-rose-600 transition-all active:scale-95"
      >
        <Plus class="w-4 h-4" />
        <span>Tambah Vendor Baru</span>
      </button>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      <StatCard
        title="Total Vendor"
        :value="store.vendorStats.total"
        subtext="Vendor terdaftar"
        :icon="Briefcase"
        variant="charcoal"
      />

      <StatCard
        title="Booked (Deal)"
        :value="store.vendorStats.booked"
        :subtext="`Total: ${formatCompactRupiah(store.vendorStats.totalSpend)}`"
        :icon="CheckCircle2"
        variant="sage"
      />

      <StatCard
        title="Dalam Negosiasi"
        :value="store.vendorStats.negotiation"
        subtext="Menunggu kesepakatan harga"
        :icon="Clock"
        variant="champagne"
      />

      <StatCard
        title="Tahap Survey"
        :value="store.vendorStats.survey"
        subtext="Bandingkan portofolio & paket"
        :icon="HelpCircle"
        variant="rose"
      />
    </div>

    <!-- Search & Filters Toolbar -->
    <div
      class="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-rose-100/60 shadow-soft flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm"
    >
      <!-- Search Input -->
      <div class="relative flex-1 min-w-[220px]">
        <Search class="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama vendor, PIC, atau catatan..."
          class="w-full pl-9 pr-4 py-2 rounded-xl border border-charcoal-200 bg-ivory/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 text-xs sm:text-sm transition-colors"
        />
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <!-- Category Filter -->
        <select
          v-model="selectedCategory"
          class="px-3 py-2 rounded-xl border border-charcoal-200 bg-ivory/60 text-charcoal text-xs focus:outline-none"
        >
          <option value="Semua">Semua Kategori</option>
          <option v-for="cat in VENDOR_CATEGORIES" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>

        <!-- Status Filter -->
        <select
          v-model="selectedStatus"
          class="px-3 py-2 rounded-xl border border-charcoal-200 bg-ivory/60 text-charcoal text-xs focus:outline-none"
        >
          <option value="Semua">Semua Status</option>
          <option value="Belum Dihubungi">Belum Dihubungi</option>
          <option value="Survey">Survey</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Booked">Booked</option>
        </select>
      </div>
    </div>

    <!-- Vendors Grid -->
    <div v-if="filteredVendors.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      <div
        v-for="v in filteredVendors"
        :key="v.id"
        class="glass-card rounded-3xl p-5 border border-rose-100/70 hover:border-rose-200 shadow-soft hover:shadow-soft-md transition-all flex flex-col justify-between group"
      >
        <div>
          <!-- Card Header: Category & Status -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-ivory-200 text-charcoal-600">
              {{ v.category }}
            </span>
            <span
              :class="[
                'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                statusBadgeClass(v.status),
              ]"
            >
              {{ v.status }}
            </span>
          </div>

          <!-- Vendor Name -->
          <h3 class="text-base sm:text-lg font-serif font-bold text-charcoal leading-snug group-hover:text-rose transition-colors">
            {{ v.name }}
          </h3>

          <!-- Contact Person & Phone -->
          <div class="mt-3 space-y-1.5 text-xs text-charcoal-500">
            <p v-if="v.contactPerson" class="flex items-center gap-1.5">
              <span class="text-charcoal-400">PIC:</span>
              <strong class="text-charcoal">{{ v.contactPerson }}</strong>
            </p>

            <p v-if="v.phone" class="flex items-center gap-1.5">
              <Phone class="w-3.5 h-3.5 text-rose shrink-0" />
              <span>{{ v.phone }}</span>
            </p>

            <p v-if="v.instagram" class="flex items-center gap-1.5 text-charcoal-400">
              <span class="font-mono text-[11px] text-rose-700 truncate">{{ v.instagram }}</span>
            </p>
          </div>

          <!-- Notes -->
          <p
            v-if="v.notes"
            class="text-xs text-charcoal-400 mt-3 p-2.5 rounded-xl bg-ivory/60 border border-rose-50/70 line-clamp-3 leading-relaxed"
          >
            {{ v.notes }}
          </p>
        </div>

        <!-- Price & Action Footer -->
        <div class="mt-4 pt-4 border-t border-rose-50 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] uppercase tracking-wider text-charcoal-400 font-medium">Penawaran Biaya</span>
            <span class="text-sm font-bold font-serif text-charcoal">
              {{ formatRupiah(v.priceOffer) }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-2 pt-1">
            <!-- Direct WhatsApp link -->
            <a
              v-if="v.phone"
              :href="formatWhatsappUrl(v.phone, v.name)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-50 hover:bg-sage-100 text-sage-800 text-xs font-semibold border border-sage-200 transition-colors"
            >
              <MessageCircle class="w-3.5 h-3.5" />
              <span>Chat WA</span>
            </a>
            <div v-else></div>

            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="openEditVendor(v)"
                class="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal hover:bg-ivory transition-colors"
                title="Edit Vendor"
              >
                <Edit2 class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click="confirmDeleteVendor(v)"
                class="p-1.5 rounded-lg text-charcoal-400 hover:text-rose hover:bg-rose-50 transition-colors"
                title="Hapus Vendor"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else
      title="Belum Ada Vendor Ditemukan"
      description="Tambahkan vendor pernikahan untuk mencatat penawaran harga dan detail kontak."
      action-text="Tambah Vendor"
      @action="openAddVendor"
    />

    <!-- Vendor Modal -->
    <VendorModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :vendor="editingVendor"
      @close="isModalOpen = false"
      @save="handleSaveVendor"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :is-open="isConfirmOpen"
      title="Hapus Vendor Ini?"
      :message="`Apakah Anda yakin ingin menghapus data vendor '${vendorToDelete?.name}'?`"
      confirm-text="Ya, Hapus"
      type="danger"
      @confirm="executeDeleteVendor"
      @cancel="vendorToDelete = null"
      @update:is-open="isConfirmOpen = $event"
    />
  </div>
</template>
