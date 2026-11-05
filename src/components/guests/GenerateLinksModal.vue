<script setup>
import { ref, computed, watch } from 'vue'
import { useWeddingStore } from '@/stores/weddingStore'
import { useToastStore } from '@/stores/toastStore'
import { GUEST_CATEGORIES } from '@/utils/defaultData'
import {
  generateInvitationUrl,
  generateInvitationMessage,
  generateWhatsAppShareUrl,
  DEFAULT_INVITATION_BASE_URL,
} from '@/utils/invitation'
import {
  X,
  Search,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Share2,
  Download,
  Link as LinkIcon,
  Globe,
  RotateCcw,
  Sparkles,
  Users,
} from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const store = useWeddingStore()
const toastStore = useToastStore()

// State
const searchQuery = ref('')
const selectedCategory = ref('Semua')
const selectedInvitationStatus = ref('Semua')
const copiedId = ref(null)
const copiedType = ref(null) // 'link' | 'message' | 'all'

// Base URL input state
const baseUrlInput = ref(store.profile.invitationBaseUrl || DEFAULT_INVITATION_BASE_URL)

watch(
  () => store.profile.invitationBaseUrl,
  (newVal) => {
    if (newVal) {
      baseUrlInput.value = newVal
    }
  }
)

function handleSaveBaseUrl() {
  const url = baseUrlInput.value.trim() || DEFAULT_INVITATION_BASE_URL
  baseUrlInput.value = url
  store.updateInvitationBaseUrl(url)
}

function handleResetBaseUrl() {
  baseUrlInput.value = DEFAULT_INVITATION_BASE_URL
  store.updateInvitationBaseUrl(DEFAULT_INVITATION_BASE_URL)
}

// Filtered guests
const filteredGuests = computed(() => {
  return store.guests.filter((g) => {
    if (selectedCategory.value !== 'Semua' && g.category !== selectedCategory.value) {
      return false
    }
    if (selectedInvitationStatus.value !== 'Semua' && g.invitationStatus !== selectedInvitationStatus.value) {
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

function getGuestLink(guest) {
  return generateInvitationUrl(guest.name, baseUrlInput.value)
}

function copyGuestLink(guest) {
  const link = getGuestLink(guest)
  navigator.clipboard.writeText(link).then(() => {
    copiedId.value = guest.id
    copiedType.value = 'link'
    toastStore.success(`Link undangan untuk "${guest.name}" disalin!`)
    setTimeout(() => {
      if (copiedId.value === guest.id && copiedType.value === 'link') {
        copiedId.value = null
        copiedType.value = null
      }
    }, 2000)
  })
}

function copyGuestMessage(guest) {
  const msg = generateInvitationMessage(guest, store.profile, baseUrlInput.value)
  navigator.clipboard.writeText(msg).then(() => {
    copiedId.value = guest.id
    copiedType.value = 'message'
    toastStore.success(`Pesan undangan lengkap untuk "${guest.name}" disalin!`)
    setTimeout(() => {
      if (copiedId.value === guest.id && copiedType.value === 'message') {
        copiedId.value = null
        copiedType.value = null
      }
    }, 2000)
  })
}

function openWhatsApp(guest) {
  const msg = generateInvitationMessage(guest, store.profile, baseUrlInput.value)
  const url = generateWhatsAppShareUrl(msg)
  window.open(url, '_blank')
}

// Bulk copy all visible links
function copyAllLinks() {
  if (filteredGuests.value.length === 0) {
    toastStore.warning('Tidak ada tamu yang dipilih untuk disalin.')
    return
  }

  const lines = filteredGuests.value.map((g, idx) => {
    const link = getGuestLink(g)
    return `${idx + 1}. ${g.name} (${g.pax} pax)\nLink: ${link}`
  })

  const fullText = `DAFTAR LINK UNDANGAN DIGITAL PERNIKAHAN\n${store.profile.groomName} & ${store.profile.brideName}\n\n` + lines.join('\n\n')

  navigator.clipboard.writeText(fullText).then(() => {
    copiedId.value = 'all'
    copiedType.value = 'all'
    toastStore.success(`${filteredGuests.value.length} link tamu berhasil disalin ke clipboard!`)
    setTimeout(() => {
      if (copiedId.value === 'all') {
        copiedId.value = null
        copiedType.value = null
      }
    }, 2500)
  })
}

// Export to CSV
function exportLinksCsv() {
  if (filteredGuests.value.length === 0) {
    toastStore.warning('Tidak ada tamu untuk diexport.')
    return
  }

  const headers = ['No', 'Nama Tamu', 'Kategori', 'Pax', 'Status Undangan', 'RSVP', 'Link Undangan Digital']
  const rows = filteredGuests.value.map((g, idx) => [
    idx + 1,
    `"${(g.name || '').replace(/"/g, '""')}"`,
    `"${(g.category || '').replace(/"/g, '""')}"`,
    g.pax || 1,
    `"${(g.invitationStatus || '').replace(/"/g, '""')}"`,
    `"${(g.rsvpStatus || '').replace(/"/g, '""')}"`,
    `"${getGuestLink(g)}"`,
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    `link-undangan-tamu-${new Date().toISOString().slice(0, 10)}.csv`
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toastStore.success('File CSV link undangan berhasil diunduh!')
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
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-charcoal/50 backdrop-blur-sm overflow-y-auto"
        @click.self="emit('close')"
      >
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-3"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            class="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-rose-100 text-charcoal my-6 relative flex flex-col max-h-[90vh]"
          >
            <!-- Modal Header -->
            <div class="flex items-start justify-between pb-4 border-b border-rose-100 gap-3">
              <div>
                <h3 class="text-xl sm:text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
                  <Sparkles class="w-5 h-5 text-rose" />
                  <span>Generate Link Undangan Digital</span>
                </h3>
                <p class="text-xs sm:text-sm text-charcoal-400 mt-1">
                  Format tautan otomatis berdasarkan nama di Daftar Tamu (RSVP) menggunakan parameter <code>?to=nama+tamu</code>
                </p>
              </div>
              <button
                type="button"
                @click="emit('close')"
                class="p-2 rounded-xl text-charcoal-400 hover:text-charcoal hover:bg-ivory transition-colors"
                title="Tutup"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Scrollable Content -->
            <div class="overflow-y-auto flex-1 space-y-5 py-4 pr-1">
              <!-- Base URL Configuration Box -->
              <div class="p-4 rounded-2xl bg-ivory/60 border border-rose-100 space-y-2">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <label class="text-xs font-semibold text-charcoal flex items-center gap-1.5">
                    <Globe class="w-3.5 h-3.5 text-rose" />
                    <span>Domain / URL Utama Undangan Digital (Base URL)</span>
                  </label>
                  <button
                    type="button"
                    @click="handleResetBaseUrl"
                    class="text-[11px] text-charcoal-400 hover:text-rose flex items-center gap-1 transition-colors"
                    title="Kembalikan ke URL default"
                  >
                    <RotateCcw class="w-3 h-3" />
                    <span>Reset Default</span>
                  </button>
                </div>

                <div class="flex items-center gap-2">
                  <input
                    v-model="baseUrlInput"
                    type="url"
                    placeholder="https://udangan-digital-ilham-ana.vercel.app/"
                    class="flex-1 px-3.5 py-2 rounded-xl border border-charcoal-200 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose font-mono"
                  />
                  <button
                    type="button"
                    @click="handleSaveBaseUrl"
                    class="px-4 py-2 rounded-xl bg-charcoal text-white hover:bg-charcoal-800 text-xs font-medium transition-colors whitespace-nowrap active:scale-95"
                  >
                    Simpan URL
                  </button>
                </div>
                <p class="text-[11px] text-charcoal-400">
                  Format query yang dihasilkan: <code class="text-rose font-semibold">{{ baseUrlInput.endsWith('/') ? baseUrlInput : baseUrlInput + '/' }}?to=agus+dan+pasangan</code>
                </p>
              </div>

              <!-- Filter and Bulk Actions Bar -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                <!-- Search & Filters -->
                <div class="flex flex-wrap items-center gap-2 flex-1">
                  <!-- Search -->
                  <div class="relative flex-1 min-w-[180px]">
                    <Search class="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Cari nama tamu..."
                      class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-charcoal-200 bg-ivory/40 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30"
                    />
                  </div>

                  <!-- Category -->
                  <select
                    v-model="selectedCategory"
                    class="px-2.5 py-1.5 rounded-xl border border-charcoal-200 bg-ivory/40 text-charcoal text-xs focus:outline-none"
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option v-for="cat in GUEST_CATEGORIES" :key="cat" :value="cat">
                      {{ cat }}
                    </option>
                  </select>

                  <!-- Invitation Status -->
                  <select
                    v-model="selectedInvitationStatus"
                    class="px-2.5 py-1.5 rounded-xl border border-charcoal-200 bg-ivory/40 text-charcoal text-xs focus:outline-none"
                  >
                    <option value="Semua">Semua Undangan</option>
                    <option value="Sudah Diundang">Sudah Diundang</option>
                    <option value="Belum Diundang">Belum Diundang</option>
                  </select>
                </div>

                <!-- Bulk Action Buttons -->
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    @click="copyAllLinks"
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose border border-rose-200 hover:bg-rose-100 font-semibold text-xs transition-colors active:scale-95"
                    title="Salin rekap seluruh link ke clipboard"
                  >
                    <Check v-if="copiedId === 'all'" class="w-3.5 h-3.5 text-sage-600" />
                    <Copy v-else class="w-3.5 h-3.5" />
                    <span>{{ copiedId === 'all' ? 'Tersalin!' : 'Salin Semua Link' }}</span>
                  </button>

                  <button
                    type="button"
                    @click="exportLinksCsv"
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ivory text-charcoal-700 border border-charcoal-200 hover:bg-ivory-200 font-medium text-xs transition-colors active:scale-95"
                    title="Download rekap CSV link tamu"
                  >
                    <Download class="w-3.5 h-3.5" />
                    <span class="hidden sm:inline">Export CSV</span>
                  </button>
                </div>
              </div>

              <!-- Guest Links Table / Cards -->
              <div v-if="filteredGuests.length > 0" class="border border-rose-100 rounded-2xl overflow-hidden">
                <!-- Desktop Table -->
                <div class="hidden md:block overflow-x-auto max-h-[420px] overflow-y-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-ivory/80 sticky top-0 z-10 border-b border-rose-100 text-charcoal-500 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th class="py-2.5 px-3">Nama Tamu</th>
                        <th class="py-2.5 px-3">Kategori & Pax</th>
                        <th class="py-2.5 px-3">Link Undangan Digital (?to=...)</th>
                        <th class="py-2.5 px-3 text-right">Aksi Cepat</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-rose-50 bg-white">
                      <tr
                        v-for="guest in filteredGuests"
                        :key="guest.id"
                        class="hover:bg-ivory/40 transition-colors"
                      >
                        <!-- Guest Info -->
                        <td class="py-3 px-3">
                          <div class="font-semibold text-charcoal">{{ guest.name }}</div>
                          <span
                            :class="[
                              'inline-block mt-0.5 px-2 py-0.2 rounded-full text-[9px] font-semibold border',
                              guest.invitationStatus === 'Sudah Diundang'
                                ? 'bg-sage-100 text-sage-800 border-sage-200'
                                : 'bg-ivory text-charcoal-500 border-charcoal-200',
                            ]"
                          >
                            {{ guest.invitationStatus }}
                          </span>
                        </td>

                        <!-- Category & Pax -->
                        <td class="py-3 px-3">
                          <div class="text-charcoal-600">{{ guest.category }}</div>
                          <div class="text-[11px] text-charcoal-400 font-medium">{{ guest.pax }} Pax</div>
                        </td>

                        <!-- Link with quick copy -->
                        <td class="py-3 px-3 max-w-sm">
                          <div class="flex items-center gap-1.5 p-1.5 rounded-lg bg-ivory/70 border border-charcoal-200/60 font-mono text-[11px] text-charcoal-600">
                            <span class="truncate select-all" :title="getGuestLink(guest)">
                              {{ getGuestLink(guest) }}
                            </span>
                            <button
                              type="button"
                              @click="copyGuestLink(guest)"
                              class="shrink-0 p-1 rounded-md text-charcoal-400 hover:text-rose hover:bg-white transition-colors"
                              title="Salin Link"
                            >
                              <Check v-if="copiedId === guest.id && copiedType === 'link'" class="w-3.5 h-3.5 text-sage-600" />
                              <Copy v-else class="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <!-- Actions -->
                        <td class="py-3 px-3 text-right">
                          <div class="flex items-center justify-end gap-1.5">
                            <!-- Open Link -->
                            <a
                              :href="getGuestLink(guest)"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal hover:bg-ivory transition-colors"
                              title="Buka Undangan di Tab Baru"
                            >
                              <ExternalLink class="w-3.5 h-3.5" />
                            </a>

                            <!-- WhatsApp Direct -->
                            <button
                              type="button"
                              @click="openWhatsApp(guest)"
                              class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Kirim Pesan via WhatsApp"
                            >
                              <MessageCircle class="w-3.5 h-3.5" />
                            </button>

                            <!-- Copy Full Message -->
                            <button
                              type="button"
                              @click="copyGuestMessage(guest)"
                              class="p-1.5 rounded-lg text-rose hover:bg-rose-50 transition-colors"
                              title="Salin Pesan Undangan Lengkap"
                            >
                              <Check v-if="copiedId === guest.id && copiedType === 'message'" class="w-3.5 h-3.5 text-sage-600" />
                              <Share2 v-else class="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Mobile Card List -->
                <div class="md:hidden divide-y divide-rose-50 max-h-[420px] overflow-y-auto">
                  <div
                    v-for="guest in filteredGuests"
                    :key="guest.id"
                    class="p-3.5 space-y-2 bg-white"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <div class="font-semibold text-charcoal text-xs">{{ guest.name }}</div>
                        <div class="flex items-center gap-1.5 mt-0.5">
                          <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-ivory-200 text-charcoal-600">
                            {{ guest.category }}
                          </span>
                          <span class="text-[10px] text-charcoal-400 font-medium">
                            {{ guest.pax }} Pax
                          </span>
                        </div>
                      </div>

                      <span
                        :class="[
                          'px-2 py-0.5 rounded-full text-[9px] font-semibold border',
                          guest.invitationStatus === 'Sudah Diundang'
                            ? 'bg-sage-100 text-sage-800 border-sage-200'
                            : 'bg-ivory text-charcoal-500 border-charcoal-200',
                        ]"
                      >
                        {{ guest.invitationStatus }}
                      </span>
                    </div>

                    <!-- Link Preview Box -->
                    <div class="p-2 rounded-xl bg-ivory/70 border border-charcoal-200/60 font-mono text-[10px] text-charcoal-600 flex items-center justify-between gap-2">
                      <span class="truncate">{{ getGuestLink(guest) }}</span>
                      <button
                        type="button"
                        @click="copyGuestLink(guest)"
                        class="shrink-0 p-1 text-charcoal-500 hover:text-rose"
                        title="Salin Link"
                      >
                        <Check v-if="copiedId === guest.id && copiedType === 'link'" class="w-3.5 h-3.5 text-sage-600" />
                        <Copy v-else class="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <!-- Actions Row -->
                    <div class="flex items-center justify-between pt-1 gap-2 text-xs">
                      <button
                        type="button"
                        @click="copyGuestLink(guest)"
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose font-medium text-[11px]"
                      >
                        <Copy class="w-3 h-3" />
                        <span>Salin Link</span>
                      </button>

                      <div class="flex items-center gap-2">
                        <a
                          :href="getGuestLink(guest)"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="p-1.5 rounded-lg text-charcoal-500 hover:bg-ivory"
                          title="Buka Link"
                        >
                          <ExternalLink class="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          @click="openWhatsApp(guest)"
                          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-[11px]"
                        >
                          <MessageCircle class="w-3 h-3" />
                          <span>Kirim WA</span>
                        </button>
                        <button
                          type="button"
                          @click="copyGuestMessage(guest)"
                          class="p-1.5 rounded-lg text-charcoal-500 hover:text-rose"
                          title="Salin Teks Pesan"
                        >
                          <Share2 class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-10 px-4 bg-ivory/30 rounded-2xl border border-dashed border-rose-200">
                <Users class="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
                <h4 class="text-sm font-semibold text-charcoal">Tidak ada tamu yang sesuai filter</h4>
                <p class="text-xs text-charcoal-400 mt-1">
                  Coba ubah kata kunci pencarian atau filter kategori di atas.
                </p>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 border-t border-rose-100 flex items-center justify-between text-xs">
              <span class="text-charcoal-400">
                Menampilkan <strong>{{ filteredGuests.length }}</strong> dari <strong>{{ store.guests.length }}</strong> tamu
              </span>
              <button
                type="button"
                @click="emit('close')"
                class="px-5 py-2 rounded-xl bg-charcoal text-white hover:bg-charcoal-800 text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>
