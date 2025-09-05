import { defineStore } from 'pinia'
import { loadLanguage } from '@/services/languageService'
import { Capacitor } from '@capacitor/core'
import { Device } from '@capacitor/device'

interface LanguageState {
  currentLocale: string
  messages: any
  supportedLocales: string[]
  isLoading: boolean
}

export const useLanguageStore = defineStore('language', {
  state(): LanguageState {
    return {
      currentLocale: 'en',
      messages: {},
      supportedLocales: ['en', 'es', 'fr'],
      isLoading: false,
    }
  },
  actions: {
    async setAndLoadLanguage(locale: string, uiSection?: string) {
      this.isLoading = true

      try {
        const allMessages = await loadLanguage(locale)

        // Default sections that are always loaded
        const defaultSections = ['common', 'error', 'footer']

        // Determine which sections to include
        const sectionsToLoad = [...defaultSections]
        if (uiSection && !defaultSections.includes(uiSection)) {
          sectionsToLoad.push(uiSection)
        }

        // Filter messages to only include the required sections (keep nested structure)
        const filteredMessages: any = {}

        for (const section of sectionsToLoad) {
          if (allMessages[section]) {
            filteredMessages[section] = allMessages[section]
          }
        }

        this.messages = filteredMessages
        this.currentLocale = locale
        localStorage.setItem('user-language', locale)
        document.documentElement.lang = locale

        console.log(`Loaded sections: ${sectionsToLoad.join(', ')} for locale: ${locale}`)
      } catch (error) {
        console.error('Error loading language:', error)
        this.messages = {}
      } finally {
        this.isLoading = false
      }
    },

    async initializeLanguage() {
      let initialLocale = localStorage.getItem('user-language') || 'en'
      if (Capacitor.isNativePlatform()) {
        try {
          const langCode = (await Device.getLanguageCode()).value.substring(0, 2)
          if (this.supportedLocales.includes(langCode)) {
            initialLocale = localStorage.getItem('user-language') || langCode
          }
        } catch (e) {
          console.error('Could not get device language', e)
        }
      }
      await this.setAndLoadLanguage(initialLocale)
    },

    // Helper method to load additional sections dynamically
    async loadAdditionalSection(sectionName: string) {
      if (this.currentLocale === 'en') return

      this.isLoading = true
      try {
        const allMessages = await loadLanguage(this.currentLocale)

        // Add the new section to existing messages (keep nested structure)
        if (allMessages[sectionName]) {
          this.messages = { ...this.messages, [sectionName]: allMessages[sectionName] }
        }

        console.log(`Loaded additional section: ${sectionName} for locale: ${this.currentLocale}`)
      } catch (error) {
        console.error(`Error loading section ${sectionName}:`, error)
      } finally {
        this.isLoading = false
      }
    },

    // Helper method to check if section is loaded
    isSectionLoaded(section: string): boolean {
      return this.messages[section] !== undefined
    },

    // Helper method to clear language cache
    async clearLanguageCache() {
      const { languageDB } = await import('@/services/db')
      await languageDB.clear()
      console.log('🗑️ Language cache cleared')
    },
  },
})
