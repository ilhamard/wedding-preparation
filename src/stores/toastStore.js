import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  /**
   * Add a new toast notification
   * @param {{ message: string, type?: 'success'|'error'|'warning'|'info', title?: string, duration?: number }} options
   */
  function showToast({ message, type = 'success', title = '', duration = 4000 }) {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    
    // Sensible default titles if not provided
    let defaultTitle = title
    if (!defaultTitle) {
      if (type === 'success') defaultTitle = 'Berhasil'
      else if (type === 'error') defaultTitle = 'Terjadi Kesalahan'
      else if (type === 'warning') defaultTitle = 'Perhatian'
      else defaultTitle = 'Informasi'
    }

    const toast = { id, message, type, title: defaultTitle }
    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  function success(message, title = 'Berhasil') {
    showToast({ message, type: 'success', title })
  }

  function error(message, title = 'Gagal') {
    showToast({ message, type: 'error', title })
  }

  function warning(message, title = 'Peringatan') {
    showToast({ message, type: 'warning', title })
  }

  function info(message, title = 'Info') {
    showToast({ message, type: 'info', title })
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    removeToast,
  }
})
