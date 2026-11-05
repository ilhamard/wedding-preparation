<script setup>
import { ref, computed } from 'vue'
import { useWeddingStore } from '@/stores/weddingStore'
import { useToastStore } from '@/stores/toastStore'
import { formatRupiah } from '@/utils/formatter'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import {
  Settings,
  User,
  Calendar,
  MapPin,
  Wallet,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-vue-next'

const store = useWeddingStore()
const toastStore = useToastStore()

const form = ref({
  groomName: store.profile.groomName || '',
  brideName: store.profile.brideName || '',
  weddingDate: store.profile.weddingDate || '',
  weddingTime: store.profile.weddingTime || '',
  venueName: store.profile.venueName || '',
  venueCity: store.profile.venueCity || '',
  targetBudget: store.profile.targetBudget || 0,
  themeColor: store.profile.themeColor || 'Dusty Rose & Champagne Gold',
  invitationBaseUrl: store.profile.invitationBaseUrl || 'https://udangan-digital-ilham-ana.vercel.app/',
  notes: store.profile.notes || '',
})

const fileInput = ref(null)
const isResetConfirmOpen = ref(false)

function saveProfileSettings() {
  store.updateProfile({
    ...form.value,
    targetBudget: Number(form.value.targetBudget) || 0,
  })
}

function handleExport() {
  store.downloadJsonBackup()
}

function triggerImport() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result
    if (typeof content === 'string') {
      const ok = store.restoreFromJson(content)
      if (ok) {
        // Sync local form with updated profile
        form.value = {
          groomName: store.profile.groomName,
          brideName: store.profile.brideName,
          weddingDate: store.profile.weddingDate,
          weddingTime: store.profile.weddingTime,
          venueName: store.profile.venueName,
          venueCity: store.profile.venueCity,
          targetBudget: store.profile.targetBudget,
          themeColor: store.profile.themeColor,
          invitationBaseUrl: store.profile.invitationBaseUrl || 'https://udangan-digital-ilham-ana.vercel.app/',
          notes: store.profile.notes,
        }
      }
    }
  }
  reader.readAsText(file)
  // reset file input
  event.target.value = ''
}

function handleReset() {
  store.resetAll()
  form.value = {
    groomName: store.profile.groomName,
    brideName: store.profile.brideName,
    weddingDate: store.profile.weddingDate,
    weddingTime: store.profile.weddingTime,
    venueName: store.profile.venueName,
    venueCity: store.profile.venueCity,
    targetBudget: store.profile.targetBudget,
    themeColor: store.profile.themeColor,
    invitationBaseUrl: store.profile.invitationBaseUrl || 'https://udangan-digital-ilham-ana.vercel.app/',
    notes: store.profile.notes,
  }
}

// Storage size estimation
const estimatedStorageKb = computed(() => {
  let total = 0
  for (let x in localStorage) {
    if (localStorage.hasOwnProperty(x)) {
      total += (localStorage[x].length * 2)
    }
  }
  return (total / 1024).toFixed(2)
})
</script>

<template>
  <div class="space-y-6 sm:space-y-8 max-w-4xl">
    <!-- Header -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-serif font-bold text-charcoal tracking-tight flex items-center gap-2">
        <span>Pengaturan & Manajemen Data</span>
      </h1>
      <p class="text-xs sm:text-sm text-charcoal-400 mt-1">
        Kelola profil calon pengantin, tanggal, venue, target anggaran, serta backup & restore database
      </p>
    </div>

    <!-- Couple & Wedding Details Form Card -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 border border-rose-100/70 shadow-soft">
      <div class="flex items-center gap-2.5 pb-4 border-b border-rose-50 mb-6">
        <div class="w-8 h-8 rounded-xl bg-rose-50 text-rose flex items-center justify-center">
          <User class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-serif font-bold text-charcoal">
            Informasi Pasangan & Pernikahan
          </h3>
          <p class="text-xs text-charcoal-400">
            Data ini akan ditampilkan di seluruh dashboard dan ringkasan acara
          </p>
        </div>
      </div>

      <form @submit.prevent="saveProfileSettings" class="space-y-5 text-xs sm:text-sm">
        <!-- Names -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-medium text-charcoal mb-1">
              Nama Calon Pengantin Pria
            </label>
            <input
              v-model="form.groomName"
              type="text"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose text-xs sm:text-sm transition-colors"
            />
          </div>

          <div>
            <label class="block font-medium text-charcoal mb-1">
              Nama Calon Pengantin Wanita
            </label>
            <input
              v-model="form.brideName"
              type="text"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose text-xs sm:text-sm transition-colors"
            />
          </div>
        </div>

        <!-- Date & Time -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-medium text-charcoal mb-1">
              Tanggal Pernikahan (Akad/Resepsi)
            </label>
            <input
              v-model="form.weddingDate"
              type="date"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label class="block font-medium text-charcoal mb-1">
              Waktu Acara
            </label>
            <input
              v-model="form.weddingTime"
              type="text"
              placeholder="Misal: 08:00 - 14:00 WIB"
              class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 text-xs sm:text-sm"
            />
          </div>
        </div>

        <!-- Venue & City -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-medium text-charcoal mb-1">
              Nama Gedung / Venue
            </label>
            <input
              v-model="form.venueName"
              type="text"
              placeholder="Misal: Grand Ballroom Hotel Mulia"
              class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label class="block font-medium text-charcoal mb-1">
              Kota / Lokasi
            </label>
            <input
              v-model="form.venueCity"
              type="text"
              placeholder="Misal: Jakarta Pusat"
              class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 text-xs sm:text-sm"
            />
          </div>
        </div>

        <!-- Budget & Theme -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-medium text-charcoal mb-1">
              Target Anggaran Pernikahan (Rp)
            </label>
            <input
              v-model.number="form.targetBudget"
              type="number"
              step="1000000"
              min="0"
              class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 text-xs sm:text-sm font-semibold"
            />
            <p class="text-[11px] text-charcoal-400 mt-1">
              {{ formatRupiah(form.targetBudget) }}
            </p>
          </div>

          <div>
            <label class="block font-medium text-charcoal mb-1">
              Tema / Palet Warna
            </label>
            <input
              v-model="form.themeColor"
              type="text"
              placeholder="Misal: Dusty Rose & Champagne Gold"
              class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 text-xs sm:text-sm"
            />
          </div>
        </div>

        <!-- Digital Invitation Website URL -->
        <div>
          <label class="block font-medium text-charcoal mb-1">
            URL Website Undangan Digital (Base Domain)
          </label>
          <input
            v-model="form.invitationBaseUrl"
            type="url"
            placeholder="https://udangan-digital-ilham-ana.vercel.app/"
            class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 font-mono text-xs sm:text-sm"
          />
          <p class="text-[11px] text-charcoal-400 mt-1">
            Digunakan sebagai base URL pembuatan tautan undangan personalisasi tamu dengan parameter <code>?to=nama+tamu</code> di menu Daftar Tamu.
          </p>
        </div>

        <!-- Notes -->
        <div>
          <label class="block font-medium text-charcoal mb-1">
            Catatan Tambahan Konsep Pernikahan
          </label>
          <textarea
            v-model="form.notes"
            rows="2"
            class="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 bg-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose/30 text-xs sm:text-sm resize-none"
          ></textarea>
        </div>

        <div class="pt-2 flex justify-end">
          <button
            type="submit"
            class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-rose text-white text-xs sm:text-sm font-semibold shadow-md shadow-rose/25 hover:bg-rose-600 transition-all active:scale-95"
          >
            <Sparkles class="w-4 h-4" />
            <span>Simpan Perubahan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Data Management: Export & Import JSON Card -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 border border-rose-100/70 shadow-soft">
      <div class="flex items-center gap-2.5 pb-4 border-b border-rose-50 mb-6">
        <div class="w-8 h-8 rounded-xl bg-champagne-100 text-champagne-800 flex items-center justify-center">
          <HardDrive class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-serif font-bold text-charcoal">
            Backup & Pemulihan Data (Export / Import JSON)
          </h3>
          <p class="text-xs text-charcoal-400">
            Simpan cadangan data persiapan pernikahan Anda atau pindahkan ke perangkat lain
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Export Box -->
        <div class="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 class="text-sm font-bold text-charcoal flex items-center gap-2">
              <Download class="w-4 h-4 text-rose" />
              <span>Export Seluruh Data</span>
            </h4>
            <p class="text-xs text-charcoal-400 mt-1 leading-relaxed">
              Unduh seluruh data checklist, budget, vendor, tamu, dan timeline ke file <code>.json</code>.
            </p>
          </div>
          <button
            type="button"
            @click="handleExport"
            class="mt-4 w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Download class="w-4 h-4" />
            <span>Unduh Backup JSON</span>
          </button>
        </div>

        <!-- Import Box -->
        <div class="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 class="text-sm font-bold text-charcoal flex items-center gap-2">
              <Upload class="w-4 h-4 text-sage-700" />
              <span>Import Data dari File</span>
            </h4>
            <p class="text-xs text-charcoal-400 mt-1 leading-relaxed">
              Pulihkan data dari file backup JSON yang pernah Anda unduh sebelumnya.
            </p>
          </div>
          <div>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              class="hidden"
              @change="onFileSelected"
            />
            <button
              type="button"
              @click="triggerImport"
              class="mt-4 w-full py-2.5 px-4 rounded-xl border border-sage-200 bg-sage-50 hover:bg-sage-100 text-sage-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Upload class="w-4 h-4" />
              <span>Pilih File Backup JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Danger Zone: Reset All Data Card -->
    <div class="glass-card rounded-3xl p-6 sm:p-8 border border-rose-200/80 bg-rose-50/20 shadow-soft">
      <div class="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h3 class="text-base sm:text-lg font-serif font-bold text-rose-800 flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-rose" />
            Reset Seluruh Data Aplikasi
          </h3>
          <p class="text-xs text-charcoal-500 mt-1 max-w-xl leading-relaxed">
            Tindakan ini akan mengembalikan seluruh data pernikahan (checklist, pengeluaran, vendor, tamu, dan timeline) ke data bawaan awal. Pastikan Anda telah mengunduh backup sebelum melakukan reset.
          </p>
        </div>

        <button
          type="button"
          @click="isResetConfirmOpen = true"
          class="px-4 py-2.5 rounded-xl bg-white border border-rose-300 text-rose hover:bg-rose hover:text-white text-xs font-semibold transition-all active:scale-95 shadow-sm"
        >
          Reset ke Data Awal
        </button>
      </div>

      <div class="mt-4 pt-4 border-t border-rose-100/60 flex items-center justify-between text-[11px] text-charcoal-400">
        <span>Penggunaan LocalStorage browser: ~{{ estimatedStorageKb }} KB</span>
        <span class="flex items-center gap-1 text-sage-700 font-medium">
          <CheckCircle2 class="w-3.5 h-3.5" /> Data tersimpan lokal di browser
        </span>
      </div>
    </div>

    <!-- Confirm Reset Modal -->
    <ConfirmModal
      :is-open="isResetConfirmOpen"
      title="Reset Seluruh Data Aplikasi?"
      message="Apakah Anda yakin ingin menghapus semua perubahan dan mengembalikan ke data default bawaan? Tindakan ini tidak dapat dibatalkan jika Anda belum memiliki file backup."
      confirm-text="Ya, Reset Sekarang"
      type="danger"
      @confirm="handleReset"
      @cancel="isResetConfirmOpen = false"
      @update:is-open="isResetConfirmOpen = $event"
    />
  </div>
</template>
