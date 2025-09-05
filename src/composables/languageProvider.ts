import { computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import englishTranslations from '@/locale/en.json'

// Keep English translations in their natural nested structure
const englishFallbacks = englishTranslations

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue(obj, 'dashboard.welcome') -> obj.dashboard.welcome
 */
const getNestedValue = (obj: any, path: string): string | undefined => {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (current && current[key] !== undefined) {
      current = current[key]
    } else {
      return undefined
    }
  }

  return current
}

// Debug: Log some sample keys in development
if (import.meta.env.DEV) {
  console.log('🔧 English fallbacks loaded:', {
    totalSections: Object.keys(englishFallbacks).length,
    sampleSections: Object.keys(englishFallbacks).slice(0, 5),
    dashboardWelcome: getNestedValue(englishFallbacks, 'dashboard.welcome'),
    commonCurrent: getNestedValue(englishFallbacks, 'common.current'),
  })
}

/**
 * Language Provider Composable
 *
 * Provides a clean interface for getting translations with automatic fallbacks
 * to English when translations are not available in the current locale.
 */
export function useCaptionProvider() {
  const languageStore = useLanguageStore()

  // Reactive state
  const isLoading = computed(() => languageStore.isLoading)
  const currentLocale = computed(() => languageStore.currentLocale)

  // Debug: Track translation usage statistics
  const translationStats = {
    storeHits: 0,
    fallbackHits: 0,
    missingKeys: 0,
  }

  // Log current state when composable is used
  if (import.meta.env.DEV) {
    console.log(`🎯 Caption Provider initialized for locale: ${languageStore.currentLocale}`)
  }

  /**
   * Get a caption/translation for a given key
   *
   * @param key - The translation key (e.g., 'dashboard.welcome')
   * @param fallback - Optional custom fallback text
   * @param params - Optional parameters for string interpolation
   * @returns The translated text or fallback
   */
  const caption = (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>,
  ): string => {
    try {
      let translation = ''
      let source = ''

      // First, try to get from the language store (loaded translations)
      const storeTranslation = getNestedValue(languageStore.messages, key)

      if (storeTranslation) {
        translation = storeTranslation
        source = `${languageStore.currentLocale.toUpperCase()} (Store)`
        translationStats.storeHits++
        console.log(`🌍 [${source}] "${key}" → "${translation}"`)
      } else {
        // If not found in store, try English fallbacks
        const fallbackTranslation = getNestedValue(englishFallbacks, key)

        if (fallbackTranslation) {
          translation = fallbackTranslation
          source = 'EN (Fallback)'
          translationStats.fallbackHits++
          console.log(`🔄 [${source}] "${key}" → "${translation}"`)
        } else {
          // If still not found, use provided fallback or return the key
          translation = fallback || key
          source = fallback ? 'Custom Fallback' : 'Key as Fallback'
          translationStats.missingKeys++
          console.warn(`⚠️ [${source}] "${key}" → "${translation}"`)
        }
      }

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        const originalTranslation = translation
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          translation = translation.replace(`{${paramKey}}`, String(paramValue))
        })

        if (originalTranslation !== translation) {
          console.log(
            `🔧 [${source}] Parameter interpolation: "${originalTranslation}" → "${translation}"`,
          )
        }
      }

      return translation
    } catch (error) {
      console.error(`❌ Error getting caption for key "${key}":`, error)
      return fallback || key
    }
  }

  /**
   * Check if a translation key exists in the current locale
   *
   * @param key - The translation key to check
   * @returns True if the key exists in current locale, false otherwise
   */
  const hasTranslation = (key: string): boolean => {
    const translation = getNestedValue(languageStore.messages, key)
    return translation !== undefined
  }

  /**
   * Get multiple captions at once
   *
   * @param keys - Array of translation keys
   * @returns Object with keys and their translations
   */
  const captions = (keys: string[]): Record<string, string> => {
    const result: Record<string, string> = {}
    keys.forEach((key) => {
      result[key] = caption(key)
    })
    return result
  }

  /**
   * Check if a specific section is loaded
   *
   * @param section - The section name (e.g., 'dashboard', 'settings')
   * @returns True if the section is loaded, false otherwise
   */
  const isSectionLoaded = (section: string): boolean => {
    return languageStore.isSectionLoaded(section)
  }

  /**
   * Load additional translation section
   *
   * @param section - The section name to load
   */
  const loadSection = async (section: string): Promise<void> => {
    try {
      await languageStore.loadAdditionalSection(section)
    } catch (error) {
      console.error(`Failed to load section "${section}":`, error)
    }
  }

  /**
   * Log translation statistics (development only)
   */
  const logTranslationStats = (): void => {
    if (import.meta.env.DEV) {
      const total =
        translationStats.storeHits + translationStats.fallbackHits + translationStats.missingKeys
      console.log(`📊 Translation Statistics:`, {
        total,
        storeHits: `${translationStats.storeHits} (${((translationStats.storeHits / total) * 100).toFixed(1)}%)`,
        fallbackHits: `${translationStats.fallbackHits} (${((translationStats.fallbackHits / total) * 100).toFixed(1)}%)`,
        missingKeys: `${translationStats.missingKeys} (${((translationStats.missingKeys / total) * 100).toFixed(1)}%)`,
        currentLocale: languageStore.currentLocale,
      })
    }
  }

  return {
    // State
    isLoading,
    currentLocale,

    // Methods
    caption,
    captions,
    hasTranslation,
    isSectionLoaded,
    loadSection,
    logTranslationStats,
  }
}

// Export type for better TypeScript support
export type CaptionProvider = ReturnType<typeof useCaptionProvider>
