/**
 * Robust LocalStorage Helper for Wedding Preparation Planner
 */

import {
  DEFAULT_PROFILE,
  DEFAULT_TASKS,
  DEFAULT_BUDGET,
  DEFAULT_VENDORS,
  DEFAULT_GUESTS,
  DEFAULT_TIMELINE,
  DEFAULT_ACTIVITIES,
} from './defaultData'

export const STORAGE_KEYS = {
  PROFILE: 'wedding_profile',
  TASKS: 'wedding_tasks',
  BUDGET: 'wedding_budget',
  VENDORS: 'wedding_vendors',
  GUESTS: 'wedding_guests',
  TIMELINE: 'wedding_timeline',
  ACTIVITIES: 'wedding_activities',
  SETTINGS: 'wedding_settings',
}

/**
 * Safe get item from LocalStorage
 * @param {string} key
 * @param {any} fallback
 * @returns {any}
 */
export function getLocalStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null || raw === undefined) return fallback
    return JSON.parse(raw)
  } catch (error) {
    console.error(`[LocalStorage] Error parsing key "${key}":`, error)
    return fallback
  }
}

/**
 * Safe set item in LocalStorage
 * @param {string} key
 * @param {any} data
 */
export function setLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`[LocalStorage] Error writing key "${key}":`, error)
  }
}

/**
 * Remove key from LocalStorage
 * @param {string} key
 */
export function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`[LocalStorage] Error removing key "${key}":`, error)
  }
}

/**
 * Initialize default data if not present in LocalStorage
 */
export function initializeDefaultData() {
  if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
    setLocalStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE)
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    setLocalStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS)
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUDGET)) {
    setLocalStorage(STORAGE_KEYS.BUDGET, DEFAULT_BUDGET)
  }
  if (!localStorage.getItem(STORAGE_KEYS.VENDORS)) {
    setLocalStorage(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS)
  }
  if (!localStorage.getItem(STORAGE_KEYS.GUESTS)) {
    setLocalStorage(STORAGE_KEYS.GUESTS, DEFAULT_GUESTS)
  }
  if (!localStorage.getItem(STORAGE_KEYS.TIMELINE)) {
    setLocalStorage(STORAGE_KEYS.TIMELINE, DEFAULT_TIMELINE)
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    setLocalStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES)
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    setLocalStorage(STORAGE_KEYS.SETTINGS, {
      theme: 'default',
      currency: 'IDR',
      language: 'id',
    })
  }
}

/**
 * Export all wedding data into a JSON string
 * @returns {string}
 */
export function exportAllData() {
  const payload = {
    app: 'WeddingPreparationPlanner',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {
      profile: getLocalStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE),
      tasks: getLocalStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS),
      budget: getLocalStorage(STORAGE_KEYS.BUDGET, DEFAULT_BUDGET),
      vendors: getLocalStorage(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS),
      guests: getLocalStorage(STORAGE_KEYS.GUESTS, DEFAULT_GUESTS),
      timeline: getLocalStorage(STORAGE_KEYS.TIMELINE, DEFAULT_TIMELINE),
      activities: getLocalStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES),
      settings: getLocalStorage(STORAGE_KEYS.SETTINGS, {}),
    },
  }

  return JSON.stringify(payload, null, 2)
}

/**
 * Import all wedding data from a JSON string
 * @param {string} jsonString
 * @returns {{ success: boolean, message: string }}
 */
export function importAllData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString)
    if (!parsed || typeof parsed !== 'object' || !parsed.data) {
      return { success: false, message: 'Format data JSON tidak valid atau struktur rusak.' }
    }

    const { profile, tasks, budget, vendors, guests, timeline, activities, settings } = parsed.data

    if (profile) setLocalStorage(STORAGE_KEYS.PROFILE, profile)
    if (Array.isArray(tasks)) setLocalStorage(STORAGE_KEYS.TASKS, tasks)
    if (Array.isArray(budget)) setLocalStorage(STORAGE_KEYS.BUDGET, budget)
    if (Array.isArray(vendors)) setLocalStorage(STORAGE_KEYS.VENDORS, vendors)
    if (Array.isArray(guests)) setLocalStorage(STORAGE_KEYS.GUESTS, guests)
    if (Array.isArray(timeline)) setLocalStorage(STORAGE_KEYS.TIMELINE, timeline)
    if (Array.isArray(activities)) setLocalStorage(STORAGE_KEYS.ACTIVITIES, activities)
    if (settings) setLocalStorage(STORAGE_KEYS.SETTINGS, settings)

    return { success: true, message: 'Data persiapan pernikahan berhasil diimpor sepenuhnya!' }
  } catch (error) {
    return { success: false, message: `Gagal memproses file JSON: ${error.message}` }
  }
}

/**
 * Reset all data to factory default
 */
export function resetAllData() {
  setLocalStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE)
  setLocalStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS)
  setLocalStorage(STORAGE_KEYS.BUDGET, DEFAULT_BUDGET)
  setLocalStorage(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS)
  setLocalStorage(STORAGE_KEYS.GUESTS, DEFAULT_GUESTS)
  setLocalStorage(STORAGE_KEYS.TIMELINE, DEFAULT_TIMELINE)
  setLocalStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES)
  setLocalStorage(STORAGE_KEYS.SETTINGS, {
    theme: 'default',
    currency: 'IDR',
    language: 'id',
  })
}
