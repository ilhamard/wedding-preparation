<script setup>
import { ref, computed } from 'vue'
import { useWeddingStore } from '@/stores/weddingStore'
import { useToastStore } from '@/stores/toastStore'
import { GUEST_CATEGORIES } from '@/utils/defaultData'
import { formatDateIndo } from '@/utils/date'
import GuestModal from '@/components/guests/GuestModal.vue'
import GenerateLinksModal from '@/components/guests/GenerateLinksModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatCard from '@/components/common/StatCard.vue'
import {
  generateInvitationUrl,
  generateInvitationMessage,
  generateWhatsAppShareUrl,
} from '@/utils/invitation'
import {
  Users,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Plus,
  Share2,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  MessageCircle,
  Link2,
  ExternalLink,
  Sparkles,
} from 'lucide-vue-next'

const store = useWeddingStore()
const toastStore = useToastStore()

// State filters
const searchQuery = ref('')
const selectedCategory = ref('Semua')
const selectedRSVP = ref('Semua')
const selectedInvitation = ref('Semua')

// Modals
const isModalOpen = ref(false)
const isLinksModalOpen = ref(false)
const editingGuest = ref(null)
const isConfirmOpen = ref(false)
const guestToDelete = ref(null)

const filteredGuests = computed(() => {
  return store.guests.filter((g) => {
    if (selectedCategory.value !== 'Semua' && g.category !== selectedCategory.value) {
      return false
    }
    if (selectedRSVP.value !== 'Semua' && g.rsvpStatus !== selectedRSVP.value) {
      return false
    }
    if (selectedInvitation.value !== 'Semua' && g.invitationStatus !== selectedInvitation.value) {
      return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchName = g.name?.toLowerCase().includes(q)
      const matchNotes = g.notes?.toLowerCase().includes(q)
      if (!matchName && !matchNotes) return false
    }
    return true
  })
})

function openAddGuest() {
  editingGuest.value = null
  isModalOpen.value = true
}

function openEditGuest(guest) {
  editingGuest.value = guest
  isModalOpen.value = true
}

function handleSaveGuest(data) {
  if (editingGuest.value) {
    store.updateGuest(editingGuest.value.id, data)
  } else {
    store.addGuest(data)
  }
  isModalOpen.value = false
  editingGuest.value = null
}

function confirmDeleteGuest(guest) {
  guestToDelete.value = guest
  isConfirmOpen.value = true
}

function executeDeleteGuest() {
  if (guestToDelete.value) {
    store.deleteGuest(guestToDelete.value.id)
    guestToDelete.value = null
  }
}

// Generate personalized WhatsApp message template (dengan link undangan digital)
function copyInvitationText(guest) {
  const msg = generateInvitationMessage(guest, store.profile, store.profile.invitationBaseUrl)
  navigator.clipboard.writeText(msg).then(() => {
    toastStore.success(`Teks undangan untuk "${guest.name}" berhasil disalin ke clipboard!`)
  })
}

function copyGuestLink(guest) {
  const link = generateInvitationUrl(guest.name, store.profile.invitationBaseUrl)
  navigator.clipboard.writeText(link).then(() => {
    toastStore.success(`Link undangan untuk "${guest.name}" berhasil disalin!`)
  })
}

function openGuestLink(guest) {
  const link = generateInvitationUrl(guest.name, store.profile.invitationBaseUrl)
  window.open(link, '_blank')
}

function shareWhatsApp(guest) {
  const msg = generateInvitationMessage(guest, store.profile, store.profile.invitationBaseUrl)
  const url = generateWhatsAppShareUrl(msg)
  window.open(url, '_blank')
}

function rsvpBadgeStyle(status) {
  switch (status) {
    case 'Hadir':
      return 'bg-sage-100 text-sage-800 border-sage-200'
    case 'Tidak Hadir':
      return 'bg-rose-100 text-rose-800 border-rose-200'
    default:
      return 'bg-champagne-100 text-champagne-800 border-champagne-200'
  }
}
</script>

<template>
  <div class="space-y-6 sm:space-y-8">
    <!-- Header with Action -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-serif font-bold text-charcoal tracking-tight flex items-center gap-2">
          <span>Daftar Tamu Undangan (RSVP)</span>
        </h1>
        <p class="text-xs sm:text-sm text-charcoal-400 mt-1">
          Kelola data tamu, jumlah pax, status pengiriman undangan, dan konfirmasi kehadiran
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          @click="isLinksModalOpen = true"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-rose-200 text-rose hover:bg-rose-50 text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95"
          title="Buka generator link tamu digital (?to=...)"
        >
          <Sparkles class="w-4 h-4 text-rose" />
          <span>Generate Link Undangan</span>
        </button>

        <button
          type="button"
          @click="openAddGuest"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose/25 hover:bg-rose-600 transition-all active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Tamu Baru</span>
        </button>
      </div>
    </div>

    <!-- Summary Statistics -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      <StatCard
        title="Total Tamu (Pax)"
        :value="`${store.guestStats.totalPax} Pax`"
        :subtext="`Dari ${store.guestStats.totalGuests} data undangan`"
        :icon="Users"
        variant="charcoal"
      />

      <StatCard
        title="Undangan Terkirim"
        :value="`${store.guestStats.invitedCount} Undangan`"
        :subtext="`${store.guestStats.totalGuests - store.guestStats.invitedCount} belum dikirim`"
        :icon="Send"
        variant="champagne"
      />

      <StatCard
        title="Konfirmasi Hadir"
        :value="`${store.guestStats.confirmedHadir} Pax`"
        :subtext="`Telah mengonfirmasi hadir`"
        :icon="CheckCircle2"
        variant="sage"
      />

      <StatCard
        title="Belum Konfirmasi"
        :value="`${store.guestStats.pendingRSVP} Pax`"
        :subtext="`Menunggu konfirmasi RSVP`"
        :icon="Clock"
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
          placeholder="Cari nama tamu atau catatan..."
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
          <option v-for="cat in GUEST_CATEGORIES" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>

        <!-- RSVP Filter -->
        <select
          v-model="selectedRSVP"
          class="px-3 py-2 rounded-xl border border-charcoal-200 bg-ivory/60 text-charcoal text-xs focus:outline-none"
        >
          <option value="Semua">Semua RSVP</option>
          <option value="Hadir">Hadir</option>
          <option value="Pending">Pending</option>
          <option value="Tidak Hadir">Tidak Hadir</option>
        </select>

        <!-- Invitation Filter -->
        <select
          v-model="selectedInvitation"
          class="px-3 py-2 rounded-xl border border-charcoal-200 bg-ivory/60 text-charcoal text-xs focus:outline-none"
        >
          <option value="Semua">Semua Undangan</option>
          <option value="Sudah Diundang">Sudah Diundang</option>
          <option value="Belum Diundang">Belum Diundang</option>
        </select>
      </div>
    </div>

    <!-- Guest Table (Desktop) / Cards (Mobile) -->
    <div class="glass-card rounded-3xl p-6 border border-rose-100/70 shadow-soft">
      <div v-if="filteredGuests.length > 0">
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-rose-100 text-charcoal-400 uppercase tracking-wider text-[10px]">
                <th class="py-3 px-3">Nama Tamu</th>
                <th class="py-3 px-3">Kategori</th>
                <th class="py-3 px-3 text-center">Pax</th>
                <th class="py-3 px-3 text-center">Status Undangan</th>
                <th class="py-3 px-3 text-center">RSVP Kehadiran</th>
                <th class="py-3 px-3">Catatan</th>
                <th class="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-rose-50">
              <tr
                v-for="guest in filteredGuests"
                :key="guest.id"
                class="hover:bg-ivory/60 transition-colors"
              >
                <!-- Guest Name -->
                <td class="py-3.5 px-3">
                  <div class="font-semibold text-charcoal">{{ guest.name }}</div>
                  <a
                    :href="generateInvitationUrl(guest.name, store.profile.invitationBaseUrl)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[10px] text-rose/80 hover:text-rose hover:underline inline-flex items-center gap-1 mt-0.5 font-mono"
                    title="Buka link undangan digital di tab baru"
                  >
                    <Link2 class="w-2.5 h-2.5" />
                    <span>?to={{ encodeURIComponent(guest.name).replace(/%20/g, '+') }}</span>
                  </a>
                </td>

                <!-- Category -->
                <td class="py-3.5 px-3">
                  <span class="px-2.5 py-0.5 rounded-full bg-ivory-200 text-charcoal-600 text-[10px] font-medium">
                    {{ guest.category }}
                  </span>
                </td>

                <!-- Pax -->
                <td class="py-3.5 px-3 text-center font-bold text-charcoal">
                  {{ guest.pax }} Pax
                </td>

                <!-- Invitation Status Toggle -->
                <td class="py-3.5 px-3 text-center">
                  <button
                    type="button"
                    @click="store.toggleGuestInvitation(guest.id)"
                    :class="[
                      'px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all active:scale-95',
                      guest.invitationStatus === 'Sudah Diundang'
                        ? 'bg-sage-100 text-sage-800 border-sage-200'
                        : 'bg-ivory text-charcoal-500 border-charcoal-200 hover:border-rose',
                    ]"
                  >
                    {{ guest.invitationStatus }}
                  </button>
                </td>

                <!-- RSVP Selector -->
                <td class="py-3.5 px-3 text-center">
                  <div class="inline-flex rounded-xl bg-ivory p-0.5 border border-charcoal-200 text-[10px]">
                    <button
                      type="button"
                      @click="store.updateGuestRSVP(guest.id, 'Hadir')"
                      :class="[
                        'px-2 py-0.5 rounded-lg font-medium transition-colors',
                        guest.rsvpStatus === 'Hadir' ? 'bg-sage text-white font-bold shadow-xs' : 'text-charcoal-500 hover:text-charcoal',
                      ]"
                    >
                      Hadir
                    </button>
                    <button
                      type="button"
                      @click="store.updateGuestRSVP(guest.id, 'Pending')"
                      :class="[
                        'px-2 py-0.5 rounded-lg font-medium transition-colors',
                        guest.rsvpStatus === 'Pending' ? 'bg-champagne text-white font-bold shadow-xs' : 'text-charcoal-500 hover:text-charcoal',
                      ]"
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      @click="store.updateGuestRSVP(guest.id, 'Tidak Hadir')"
                      :class="[
                        'px-2 py-0.5 rounded-lg font-medium transition-colors',
                        guest.rsvpStatus === 'Tidak Hadir' ? 'bg-rose text-white font-bold shadow-xs' : 'text-charcoal-500 hover:text-charcoal',
                      ]"
                    >
                      Batal
                    </button>
                  </div>
                </td>

                <!-- Notes -->
                <td class="py-3.5 px-3 text-charcoal-400 text-[11px] italic max-w-xs truncate">
                  {{ guest.notes || '-' }}
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      @click="copyGuestLink(guest)"
                      class="p-1.5 rounded-lg text-charcoal-400 hover:text-rose hover:bg-rose-50 transition-colors"
                      title="Salin Link Undangan Digital"
                    >
                      <Link2 class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="openGuestLink(guest)"
                      class="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal hover:bg-ivory transition-colors"
                      title="Buka Undangan Digital di Tab Baru"
                    >
                      <ExternalLink class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="shareWhatsApp(guest)"
                      class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Kirim Pesan via WhatsApp"
                    >
                      <MessageCircle class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="copyInvitationText(guest)"
                      class="p-1.5 rounded-lg text-rose hover:bg-rose-50 transition-colors"
                      title="Salin Teks Undangan WA Lengkap"
                    >
                      <Share2 class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="openEditGuest(guest)"
                      class="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal hover:bg-ivory transition-colors"
                      title="Edit"
                    >
                      <Edit2 class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      @click="confirmDeleteGuest(guest)"
                      class="p-1.5 rounded-lg text-charcoal-400 hover:text-rose hover:bg-rose-50 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card List -->
        <div class="md:hidden space-y-3">
          <div
            v-for="guest in filteredGuests"
            :key="guest.id"
            class="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-3 text-xs"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="text-[10px] font-medium px-2 py-0.5 rounded-md bg-ivory-200 text-charcoal-600">
                  {{ guest.category }}
                </span>
                <h4 class="font-semibold text-charcoal text-sm mt-1">{{ guest.name }}</h4>
              </div>
              <span class="font-bold text-rose font-serif text-sm">
                {{ guest.pax }} Pax
              </span>
            </div>

            <p v-if="guest.notes" class="text-[11px] text-charcoal-400 italic">
              {{ guest.notes }}
            </p>

            <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-50">
              <button
                type="button"
                @click="store.toggleGuestInvitation(guest.id)"
                :class="[
                  'px-2.5 py-1 rounded-full text-[10px] font-semibold border',
                  guest.invitationStatus === 'Sudah Diundang'
                    ? 'bg-sage-100 text-sage-800 border-sage-200'
                    : 'bg-ivory text-charcoal-500 border-charcoal-200',
                ]"
              >
                {{ guest.invitationStatus }}
              </button>

              <span
                :class="[
                  'px-2.5 py-1 rounded-full text-[10px] font-semibold border',
                  rsvpBadgeStyle(guest.rsvpStatus),
                ]"
              >
                RSVP: {{ guest.rsvpStatus }}
              </span>
            </div>

            <!-- Mobile Link Preview Box -->
            <div class="p-2 rounded-xl bg-ivory/60 border border-charcoal-200/50 flex items-center justify-between gap-2 font-mono text-[10px] text-charcoal-600">
              <span class="truncate">{{ generateInvitationUrl(guest.name, store.profile.invitationBaseUrl) }}</span>
              <button
                type="button"
                @click="copyGuestLink(guest)"
                class="shrink-0 p-1 text-charcoal-500 hover:text-rose"
                title="Salin Link"
              >
                <Link2 class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Mobile Action Row -->
            <div class="flex items-center justify-between pt-2 border-t border-rose-50 flex-wrap gap-2">
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="copyGuestLink(guest)"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose text-xs font-semibold active:scale-95 transition-all"
                  title="Salin Link Undangan"
                >
                  <Link2 class="w-3 h-3" />
                  <span>Link</span>
                </button>
                <button
                  type="button"
                  @click="shareWhatsApp(guest)"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold active:scale-95 transition-all"
                  title="Kirim via WhatsApp"
                >
                  <MessageCircle class="w-3 h-3" />
                  <span>WA</span>
                </button>
                <button
                  type="button"
                  @click="copyInvitationText(guest)"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ivory-200 text-charcoal-700 text-xs font-semibold active:scale-95 transition-all"
                  title="Salin Pesan WA Lengkap"
                >
                  <Share2 class="w-3 h-3" />
                  <span>Pesan</span>
                </button>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="openGuestLink(guest)"
                  class="p-1 text-charcoal-400 hover:text-charcoal"
                  title="Buka Link Undangan"
                >
                  <ExternalLink class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  @click="openEditGuest(guest)"
                  class="p-1 text-charcoal-400 hover:text-charcoal"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  @click="confirmDeleteGuest(guest)"
                  class="p-1 text-charcoal-400 hover:text-rose"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else
        title="Belum Ada Tamu Ditemukan"
        description="Tambahkan nama tamu untuk mendata kehadiran dan menyebarkan undangan digital."
        action-text="Tambah Tamu"
        @action="openAddGuest"
      />
    </div>

    <!-- Generate Links Modal -->
    <GenerateLinksModal
      v-if="isLinksModalOpen"
      :is-open="isLinksModalOpen"
      @close="isLinksModalOpen = false"
    />

    <!-- Guest Modal -->
    <GuestModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :guest="editingGuest"
      @close="isModalOpen = false"
      @save="handleSaveGuest"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :is-open="isConfirmOpen"
      title="Hapus Tamu Undangan?"
      :message="`Apakah Anda yakin ingin menghapus '${guestToDelete?.name}' dari daftar tamu?`"
      confirm-text="Ya, Hapus"
      type="danger"
      @confirm="executeDeleteGuest"
      @cancel="guestToDelete = null"
      @update:is-open="isConfirmOpen = $event"
    />
  </div>
</template>
