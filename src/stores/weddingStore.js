import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import confetti from 'canvas-confetti'
import {
  STORAGE_KEYS,
  getLocalStorage,
  setLocalStorage,
  initializeDefaultData,
  exportAllData,
  importAllData,
  resetAllData,
} from '@/utils/storage'
import {
  DEFAULT_PROFILE,
  DEFAULT_TASKS,
  DEFAULT_BUDGET,
  DEFAULT_VENDORS,
  DEFAULT_GUESTS,
  DEFAULT_TIMELINE,
  DEFAULT_ACTIVITIES,
  CHECKLIST_CATEGORIES,
  BUDGET_CATEGORIES,
} from '@/utils/defaultData'
import {
  DEFAULT_INVITATION_BASE_URL,
  generateInvitationUrl,
  generateInvitationMessage,
  generateWhatsAppShareUrl,
} from '@/utils/invitation'
import { isOverdue } from '@/utils/date'
import { generateId } from '@/utils/formatter'
import { useToastStore } from './toastStore'

export const useWeddingStore = defineStore('wedding', () => {
  const toastStore = useToastStore()

  // Make sure defaults are set in localStorage
  initializeDefaultData()

  // Reactive State
  const initialProfile = getLocalStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE)
  if (!initialProfile.invitationBaseUrl) {
    initialProfile.invitationBaseUrl = DEFAULT_INVITATION_BASE_URL
  }
  const profile = ref(initialProfile)
  const tasks = ref(getLocalStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS))
  const budget = ref(getLocalStorage(STORAGE_KEYS.BUDGET, DEFAULT_BUDGET))
  const vendors = ref(getLocalStorage(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS))
  const guests = ref(getLocalStorage(STORAGE_KEYS.GUESTS, DEFAULT_GUESTS))
  const timeline = ref(getLocalStorage(STORAGE_KEYS.TIMELINE, DEFAULT_TIMELINE))
  const activities = ref(getLocalStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES))
  const settings = ref(getLocalStorage(STORAGE_KEYS.SETTINGS, { theme: 'default', currency: 'IDR' }))

  // Save Helpers
  function saveProfile() {
    setLocalStorage(STORAGE_KEYS.PROFILE, profile.value)
  }
  function saveTasks() {
    setLocalStorage(STORAGE_KEYS.TASKS, tasks.value)
  }
  function saveBudget() {
    setLocalStorage(STORAGE_KEYS.BUDGET, budget.value)
  }
  function saveVendors() {
    setLocalStorage(STORAGE_KEYS.VENDORS, vendors.value)
  }
  function saveGuests() {
    setLocalStorage(STORAGE_KEYS.GUESTS, guests.value)
  }
  function saveTimeline() {
    setLocalStorage(STORAGE_KEYS.TIMELINE, timeline.value)
  }
  function saveActivities() {
    setLocalStorage(STORAGE_KEYS.ACTIVITIES, activities.value)
  }
  function saveSettings() {
    setLocalStorage(STORAGE_KEYS.SETTINGS, settings.value)
  }

  // Activity Logger
  function logActivity(action, title, category = 'General') {
    const newAct = {
      id: generateId('act'),
      action,
      title,
      category,
      timestamp: Date.now(),
    }
    activities.value.unshift(newAct)
    if (activities.value.length > 30) {
      activities.value = activities.value.slice(0, 30)
    }
    saveActivities()
  }

  // Confetti trigger
  function triggerCelebration() {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C58F91', '#D8BD8A', '#A8B5A0', '#F2E6CE', '#ECCFD0'],
      })
    } catch {
      // ignore in environments without canvas
    }
  }

  // --- Computed Getters ---

  // Task Stats
  const totalTasks = computed(() => tasks.value.length)
  const completedTasks = computed(() => tasks.value.filter((t) => t.status === 'Completed').length)
  const pendingTasks = computed(() => tasks.value.filter((t) => t.status !== 'Completed').length)
  const overdueTasks = computed(() => tasks.value.filter((t) => isOverdue(t.deadline, t.status)).length)

  const overallProgressPercentage = computed(() => {
    if (totalTasks.value === 0) return 0
    return Math.round((completedTasks.value / totalTasks.value) * 100)
  })

  // Category-level progress
  const categoryProgress = computed(() => {
    return CHECKLIST_CATEGORIES.map((cat) => {
      const catTasks = tasks.value.filter((t) => t.category === cat)
      const total = catTasks.length
      const completed = catTasks.filter((t) => t.status === 'Completed').length
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
      return {
        category: cat,
        total,
        completed,
        percentage,
      }
    })
  })

  // Upcoming Tasks (sorted by nearest deadline, not completed)
  const upcomingTasks = computed(() => {
    return [...tasks.value]
      .filter((t) => t.status !== 'Completed')
      .sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      })
      .slice(0, 6)
  })

  // Budget Stats
  const totalBudget = computed(() => Number(profile.value.targetBudget) || 0)
  const totalEstimatedCost = computed(() => {
    return budget.value.reduce((acc, item) => acc + (Number(item.estimatedCost) || 0), 0)
  })
  const totalActualCost = computed(() => {
    return budget.value.reduce((acc, item) => acc + (Number(item.actualCost) || 0), 0)
  })
  const totalPaid = computed(() => {
    return budget.value.reduce((acc, item) => {
      if (item.status === 'Lunas') return acc + (Number(item.actualCost) || 0)
      if (item.status === 'DP') return acc + (Number(item.paidAmount) || 0)
      return acc
    }, 0)
  })
  const totalPendingPayment = computed(() => {
    const pending = totalActualCost.value - totalPaid.value
    return pending > 0 ? pending : 0
  })
  const remainingBudget = computed(() => {
    return totalBudget.value - totalActualCost.value
  })

  // Budget Breakdown by Category for Chart
  const budgetCategoryBreakdown = computed(() => {
    return BUDGET_CATEGORIES.map((cat) => {
      const items = budget.value.filter((b) => b.category === cat)
      const estimated = items.reduce((sum, i) => sum + (Number(i.estimatedCost) || 0), 0)
      const actual = items.reduce((sum, i) => sum + (Number(i.actualCost) || 0), 0)
      const paid = items.reduce((sum, i) => {
        if (i.status === 'Lunas') return sum + (Number(i.actualCost) || 0)
        if (i.status === 'DP') return sum + (Number(i.paidAmount) || 0)
        return sum
      }, 0)
      return {
        category: cat,
        count: items.length,
        estimated,
        actual,
        paid,
      }
    }).filter((c) => c.estimated > 0 || c.actual > 0)
  })

  // Guest Stats
  const guestStats = computed(() => {
    const totalCount = guests.value.length
    const totalPax = guests.value.reduce((sum, g) => sum + (Number(g.pax) || 1), 0)
    const invitedCount = guests.value.filter((g) => g.invitationStatus === 'Sudah Diundang').length
    const confirmedHadir = guests.value.filter((g) => g.rsvpStatus === 'Hadir').reduce((s, g) => s + (Number(g.pax) || 1), 0)
    const confirmedTidakHadir = guests.value.filter((g) => g.rsvpStatus === 'Tidak Hadir').reduce((s, g) => s + (Number(g.pax) || 1), 0)
    const pendingRSVP = guests.value.filter((g) => g.rsvpStatus === 'Pending').reduce((s, g) => s + (Number(g.pax) || 1), 0)

    return {
      totalGuests: totalCount,
      totalPax,
      invitedCount,
      confirmedHadir,
      confirmedTidakHadir,
      pendingRSVP,
    }
  })

  // Vendor Stats
  const vendorStats = computed(() => {
    const total = vendors.value.length
    const booked = vendors.value.filter((v) => v.status === 'Booked').length
    const negotiation = vendors.value.filter((v) => v.status === 'Negotiation').length
    const survey = vendors.value.filter((v) => v.status === 'Survey').length
    const uncontacted = vendors.value.filter((v) => v.status === 'Belum Dihubungi').length
    const totalSpend = vendors.value
      .filter((v) => v.status === 'Booked')
      .reduce((sum, v) => sum + (Number(v.priceOffer) || 0), 0)

    return {
      total,
      booked,
      negotiation,
      survey,
      uncontacted,
      totalSpend,
    }
  })

  // Recent Activities
  const recentActivities = computed(() => activities.value.slice(0, 10))

  // --- Actions ---

  // Profile / Settings
  function updateProfile(newProfile) {
    profile.value = { ...profile.value, ...newProfile }
    saveProfile()
    logActivity('Mengubah profil', 'Profil calon pengantin & pernikahan diperbarui', 'Settings')
    toastStore.success('Profil pernikahan berhasil diperbarui!')
  }

  function updateInvitationBaseUrl(url) {
    profile.value.invitationBaseUrl = (url || '').trim() || DEFAULT_INVITATION_BASE_URL
    saveProfile()
    toastStore.success('URL Website Undangan berhasil diperbarui!')
  }

  function getGuestInvitationUrl(guestName) {
    return generateInvitationUrl(guestName, profile.value.invitationBaseUrl)
  }

  function getGuestInvitationMessage(guest) {
    return generateInvitationMessage(guest, profile.value, profile.value.invitationBaseUrl)
  }

  // Task Actions
  function addTask(taskData) {
    const newTask = {
      id: generateId('task'),
      createdAt: new Date().toISOString(),
      status: 'Todo',
      priority: 'Medium',
      ...taskData,
    }
    tasks.value.unshift(newTask)
    saveTasks()
    logActivity('Menambahkan task', newTask.title, newTask.category)
    toastStore.success(`Task "${newTask.title}" berhasil ditambahkan!`)
    return newTask
  }

  function updateTask(id, updatedData) {
    const index = tasks.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      const oldStatus = tasks.value[index].status
      tasks.value[index] = { ...tasks.value[index], ...updatedData, updatedAt: new Date().toISOString() }
      saveTasks()
      logActivity('Mengedit task', tasks.value[index].title, tasks.value[index].category)
      
      if (oldStatus !== 'Completed' && updatedData.status === 'Completed') {
        triggerCelebration()
      }
      toastStore.success('Perubahan task berhasil disimpan!')
    }
  }

  function deleteTask(id) {
    const target = tasks.value.find((t) => t.id === id)
    if (target) {
      tasks.value = tasks.value.filter((t) => t.id !== id)
      saveTasks()
      logActivity('Menghapus task', target.title, target.category)
      toastStore.info(`Task "${target.title}" telah dihapus.`)
    }
  }

  function toggleTaskStatus(id) {
    const task = tasks.value.find((t) => t.id === id)
    if (!task) return

    if (task.status === 'Completed') {
      task.status = 'Todo'
      saveTasks()
      logActivity('Membatalkan selesai task', task.title, task.category)
      toastStore.info(`Task "${task.title}" ditandai belum selesai.`)
    } else {
      task.status = 'Completed'
      saveTasks()
      triggerCelebration()
      logActivity('Menyelesaikan task', task.title, task.category)
      toastStore.success(`Selamat! Task "${task.title}" selesai dikerjakan! 🎉`)
    }
  }

  // Budget Actions
  function addExpense(expenseData) {
    const newExpense = {
      id: generateId('bud'),
      status: 'Belum Dibayar',
      paidAmount: 0,
      createdAt: new Date().toISOString(),
      ...expenseData,
    }
    budget.value.unshift(newExpense)
    saveBudget()
    logActivity('Menambahkan pengeluaran', `${newExpense.title} (${newExpense.category})`, 'Budget')
    toastStore.success(`Pengeluaran "${newExpense.title}" berhasil dicatat!`)
    return newExpense
  }

  function updateExpense(id, updatedData) {
    const index = budget.value.findIndex((b) => b.id === id)
    if (index !== -1) {
      budget.value[index] = { ...budget.value[index], ...updatedData, updatedAt: new Date().toISOString() }
      saveBudget()
      logActivity('Mengedit pengeluaran', budget.value[index].title, 'Budget')
      toastStore.success('Data pengeluaran berhasil diperbarui!')
    }
  }

  function deleteExpense(id) {
    const target = budget.value.find((b) => b.id === id)
    if (target) {
      budget.value = budget.value.filter((b) => b.id !== id)
      saveBudget()
      logActivity('Menghapus pengeluaran', target.title, 'Budget')
      toastStore.info(`Pengeluaran "${target.title}" telah dihapus.`)
    }
  }

  // Vendor Actions
  function addVendor(vendorData) {
    const newVendor = {
      id: generateId('ven'),
      status: 'Belum Dihubungi',
      createdAt: new Date().toISOString(),
      ...vendorData,
    }
    vendors.value.unshift(newVendor)
    saveVendors()
    logActivity('Menambahkan vendor', newVendor.name, 'Vendors')
    toastStore.success(`Vendor "${newVendor.name}" berhasil ditambahkan!`)
    return newVendor
  }

  function updateVendor(id, updatedData) {
    const index = vendors.value.findIndex((v) => v.id === id)
    if (index !== -1) {
      vendors.value[index] = { ...vendors.value[index], ...updatedData, updatedAt: new Date().toISOString() }
      saveVendors()
      logActivity('Mengedit vendor', vendors.value[index].name, 'Vendors')
      toastStore.success('Data vendor berhasil diperbarui!')
    }
  }

  function deleteVendor(id) {
    const target = vendors.value.find((v) => v.id === id)
    if (target) {
      vendors.value = vendors.value.filter((v) => v.id !== id)
      saveVendors()
      logActivity('Menghapus vendor', target.name, 'Vendors')
      toastStore.info(`Vendor "${target.name}" telah dihapus.`)
    }
  }

  // Guest Actions
  function addGuest(guestData) {
    const newGuest = {
      id: generateId('gst'),
      pax: 1,
      invitationStatus: 'Belum Diundang',
      rsvpStatus: 'Pending',
      createdAt: new Date().toISOString(),
      ...guestData,
    }
    guests.value.unshift(newGuest)
    saveGuests()
    logActivity('Menambahkan tamu', `${newGuest.name} (${newGuest.pax} pax)`, 'Guests')
    toastStore.success(`Tamu "${newGuest.name}" berhasil ditambahkan ke daftar!`)
    return newGuest
  }

  function updateGuest(id, updatedData) {
    const index = guests.value.findIndex((g) => g.id === id)
    if (index !== -1) {
      guests.value[index] = { ...guests.value[index], ...updatedData, updatedAt: new Date().toISOString() }
      saveGuests()
      logActivity('Mengedit tamu', guests.value[index].name, 'Guests')
      toastStore.success('Data tamu berhasil diperbarui!')
    }
  }

  function deleteGuest(id) {
    const target = guests.value.find((g) => g.id === id)
    if (target) {
      guests.value = guests.value.filter((g) => g.id !== id)
      saveGuests()
      logActivity('Menghapus tamu', target.name, 'Guests')
      toastStore.info(`Tamu "${target.name}" telah dihapus.`)
    }
  }

  function toggleGuestInvitation(id) {
    const guest = guests.value.find((g) => g.id === id)
    if (!guest) return
    guest.invitationStatus = guest.invitationStatus === 'Sudah Diundang' ? 'Belum Diundang' : 'Sudah Diundang'
    saveGuests()
    logActivity('Mengubah status undangan', `${guest.name}: ${guest.invitationStatus}`, 'Guests')
    toastStore.info(`Status undangan "${guest.name}" diubah ke "${guest.invitationStatus}".`)
  }

  function updateGuestRSVP(id, status) {
    const guest = guests.value.find((g) => g.id === id)
    if (!guest) return
    guest.rsvpStatus = status
    saveGuests()
    logActivity('Mengubah RSVP tamu', `${guest.name}: ${status}`, 'Guests')
    toastStore.success(`RSVP "${guest.name}" diperbarui: ${status}`)
  }

  // Timeline Actions
  function addTimelineItem(item) {
    const newItem = {
      id: generateId('tl'),
      completed: false,
      ...item,
    }
    timeline.value.push(newItem)
    timeline.value.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    saveTimeline()
    logActivity('Menambahkan agenda timeline', newItem.title, 'Timeline')
    toastStore.success(`Agenda "${newItem.title}" ditambahkan ke timeline!`)
    return newItem
  }

  function updateTimelineItem(id, updatedData) {
    const index = timeline.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      timeline.value[index] = { ...timeline.value[index], ...updatedData }
      timeline.value.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      saveTimeline()
      logActivity('Mengedit agenda timeline', timeline.value[index].title, 'Timeline')
      toastStore.success('Agenda timeline diperbarui!')
    }
  }

  function deleteTimelineItem(id) {
    const target = timeline.value.find((t) => t.id === id)
    if (target) {
      timeline.value = timeline.value.filter((t) => t.id !== id)
      saveTimeline()
      logActivity('Menghapus agenda timeline', target.title, 'Timeline')
      toastStore.info(`Agenda "${target.title}" dihapus.`)
    }
  }

  function toggleTimelineComplete(id) {
    const item = timeline.value.find((t) => t.id === id)
    if (!item) return
    item.completed = !item.completed
    saveTimeline()
    if (item.completed) triggerCelebration()
    toastStore.success(`Status agenda "${item.title}" diperbarui.`)
  }

  // Backup & Restore
  function downloadJsonBackup() {
    const jsonStr = exportAllData()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const fileName = `wedding-planner-backup-${profile.value.groomName.split(' ')[0]}-${profile.value.brideName.split(' ')[0]}-${new Date().toISOString().slice(0, 10)}.json`
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toastStore.success('Backup data berhasil diunduh!')
  }

  function restoreFromJson(jsonString) {
    const result = importAllData(jsonString)
    if (result.success) {
      // Reload store state from localStorage
      profile.value = getLocalStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE)
      tasks.value = getLocalStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS)
      budget.value = getLocalStorage(STORAGE_KEYS.BUDGET, DEFAULT_BUDGET)
      vendors.value = getLocalStorage(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS)
      guests.value = getLocalStorage(STORAGE_KEYS.GUESTS, DEFAULT_GUESTS)
      timeline.value = getLocalStorage(STORAGE_KEYS.TIMELINE, DEFAULT_TIMELINE)
      activities.value = getLocalStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES)
      settings.value = getLocalStorage(STORAGE_KEYS.SETTINGS, {})
      toastStore.success(result.message)
      return true
    } else {
      toastStore.error(result.message)
      return false
    }
  }

  function resetAll() {
    resetAllData()
    profile.value = { ...DEFAULT_PROFILE }
    tasks.value = [...DEFAULT_TASKS]
    budget.value = [...DEFAULT_BUDGET]
    vendors.value = [...DEFAULT_VENDORS]
    guests.value = [...DEFAULT_GUESTS]
    timeline.value = [...DEFAULT_TIMELINE]
    activities.value = [...DEFAULT_ACTIVITIES]
    settings.value = { theme: 'default', currency: 'IDR' }
    toastStore.info('Seluruh data berhasil di-reset ke kondisi awal bawaan.')
  }

  return {
    // State
    profile,
    tasks,
    budget,
    vendors,
    guests,
    timeline,
    activities,
    settings,

    // Getters
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    overallProgressPercentage,
    categoryProgress,
    upcomingTasks,
    totalBudget,
    totalEstimatedCost,
    totalActualCost,
    totalPaid,
    totalPendingPayment,
    remainingBudget,
    budgetCategoryBreakdown,
    guestStats,
    vendorStats,
    recentActivities,

    // Actions
    updateProfile,
    updateInvitationBaseUrl,
    getGuestInvitationUrl,
    getGuestInvitationMessage,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    addExpense,
    updateExpense,
    deleteExpense,
    addVendor,
    updateVendor,
    deleteVendor,
    addGuest,
    updateGuest,
    deleteGuest,
    toggleGuestInvitation,
    updateGuestRSVP,
    addTimelineItem,
    updateTimelineItem,
    deleteTimelineItem,
    toggleTimelineComplete,
    downloadJsonBackup,
    restoreFromJson,
    resetAll,
    triggerCelebration,
    logActivity,
  }
})
