import { openDB, type DBSchema } from 'idb'

interface LanguageDB extends DBSchema {
  translations: { key: string; value: any }
}

const dbPromise = openDB<LanguageDB>('language-store', 1, {
  upgrade(db) {
    db.createObjectStore('translations')
  },
})

export const languageDB = {
  async get(locale: string) {
    const db = await dbPromise
    const currentLanguage = localStorage.getItem('user-language') || 'en'

    // Only return translations if they match the requested locale
    if (currentLanguage === locale) {
      return db.get('translations', 'current')
    }
    return undefined
  },

  async set(locale: string, translations: any) {
    const db = await dbPromise
    const currentLanguage = localStorage.getItem('user-language') || 'en'

    // If switching to a different language, clear existing data
    if (currentLanguage && currentLanguage !== locale) {
      console.log(`🗑️ Clearing previous language (${currentLanguage}) from IndexedDB`)
      await db.clear('translations')
    }

    // Store new translations (language tracking is handled by localStorage)
    await db.put('translations', translations, 'current')

    console.log(`💾 Stored ${locale} translations in IndexedDB (single language mode)`)
  },

  async clear() {
    const db = await dbPromise
    await db.clear('translations')
    console.log('🗑️ Cleared all language data from IndexedDB')
  },

  getCurrentLanguage() {
    return localStorage.getItem('user-language') || 'en'
  },
}
