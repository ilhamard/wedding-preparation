import { formatDateIndo } from './date.js'

export const DEFAULT_INVITATION_BASE_URL = 'https://udangan-digital-ilham-ana.vercel.app/'

/**
 * Format nama tamu ke query parameter ?to=nama+tamu
 * Contoh: "Agus dan Pasangan" -> "https://udangan-digital-ilham-ana.vercel.app/?to=Agus+dan+Pasangan"
 */
export function generateInvitationUrl(guestName = '', baseUrl = DEFAULT_INVITATION_BASE_URL) {
  const base = (baseUrl || DEFAULT_INVITATION_BASE_URL).trim()
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  const trimmedName = (guestName || '').trim()

  if (!trimmedName) {
    return cleanBase
  }

  // Mengubah spasi menjadi '+' sesuai format query string, encode karakter khusus lainnya
  const encodedName = encodeURIComponent(trimmedName).replace(/%20/g, '+')
  return `${cleanBase}?to=${encodedName}`
}

/**
 * Buat template pesan WhatsApp lengkap yang menyertakan link undangan digital
 */
export function generateInvitationMessage(guest, profile = {}, baseUrl = DEFAULT_INVITATION_BASE_URL) {
  const guestName = guest?.name || 'Tamu Undangan'
  const gName = profile.groomName || 'Mempelai Pria'
  const bName = profile.brideName || 'Mempelai Wanita'
  const dateStr = profile.weddingDate ? formatDateIndo(profile.weddingDate, true) : 'Tanggal Acara'
  const venue = [profile.venueName, profile.venueCity].filter(Boolean).join(', ') || 'Lokasi Acara'
  const invitationLink = generateInvitationUrl(guestName, profile.invitationBaseUrl || baseUrl)

  return `Kepada Yth.
Bapak/Ibu/Saudara/i
*${guestName}*

Assalamu’alaikum Warahmatullahi Wabarakatuh / Salam Sejahtera,

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami:

💍 *${gName} & ${bName}*

📅 *Hari/Tanggal:* ${dateStr}
📍 *Tempat:* ${venue}

Untuk melihat rincian informasi acara, lokasi maps, serta konfirmasi kehadiran (RSVP), silakan kunjungi tautan undangan digital kami:
🔗 ${invitationLink}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu.

Hormat kami,
*${gName.split(' ')[0]} & ${bName.split(' ')[0]}*`
}

/**
 * Buat tautan langsung ke WhatsApp (wa.me atau web)
 */
export function generateWhatsAppShareUrl(message, phone = '') {
  const cleanPhone = (phone || '').replace(/\D/g, '')
  const encodedText = encodeURIComponent(message)
  if (cleanPhone) {
    const formattedPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`
}
