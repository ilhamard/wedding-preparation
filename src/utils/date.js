/**
 * Indonesian Date & Time Utilities and Live Countdown
 */

const BULAN_INDO = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const BULAN_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
]

const HARI_INDO = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
]

/**
 * Format date into Indonesian locale
 * @param {string|Date} dateInput
 * @param {boolean} includeDay
 * @returns {string}
 */
export function formatDateIndo(dateInput, includeDay = false) {
  if (!dateInput) return '-'
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return '-'

  const dayName = HARI_INDO[d.getDay()]
  const day = d.getDate()
  const month = BULAN_INDO[d.getMonth()]
  const year = d.getFullYear()

  return includeDay ? `${dayName}, ${day} ${month} ${year}` : `${day} ${month} ${year}`
}

/**
 * Format short date (e.g. 14 Nov 2026)
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDateShort(dateInput) {
  if (!dateInput) return '-'
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return '-'
  return `${d.getDate()} ${BULAN_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Checks if a task is overdue
 * @param {string|Date} deadline
 * @param {string} status
 * @returns {boolean}
 */
export function isOverdue(deadline, status = '') {
  if (!deadline) return false
  if (status === 'Completed') return false

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(deadline)
  d.setHours(0, 0, 0, 0)

  return d.getTime() < now.getTime()
}

/**
 * Returns human-friendly relative date in Indonesian
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatRelativeDate(dateInput) {
  if (!dateInput) return '-'
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(dateInput)
  d.setHours(0, 0, 0, 0)

  const diffTime = d.getTime() - now.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Besok'
  if (diffDays === -1) return 'Kemarin'
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} hari lagi`
  if (diffDays < -1) return `${Math.abs(diffDays)} hari lewat`

  return formatDateShort(dateInput)
}

/**
 * Format relative time for activities feed (e.g. "5 menit lalu", "2 jam lalu")
 * @param {string|Date|number} timestamp
 * @returns {string}
 */
export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Baru saja'
  const time = new Date(timestamp).getTime()
  const now = Date.now()
  const seconds = Math.floor((now - time) / 1000)

  if (seconds < 60) return 'Baru saja'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit yang lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam yang lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari yang lalu`

  return formatDateShort(timestamp)
}

/**
 * Calculate countdown components towards wedding day
 * @param {string|Date} targetDate
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, isPast: boolean, totalDays: number }}
 */
export function calculateCountdown(targetDate) {
  if (!targetDate) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, totalDays: 0 }
  }

  const target = new Date(targetDate).getTime()
  const now = Date.now()
  const diff = target - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, totalDays: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    totalDays: days,
  }
}
