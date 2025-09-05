import { languageDB } from './db'

const CDN_BASE_URL = import.meta.env.VITE_LOCALAZY_BASE_URL

export const loadLanguage = async (locale: string): Promise<any> => {
  if (locale === 'en') return Promise.resolve({})

  // Check if we have cached translations for this specific locale
  const cached = await languageDB.get(locale)

  if (cached) {
    console.log(`✅ Loaded ${locale} from IndexedDB (single language mode)`)
    return cached
  }

  try {
    console.log(`🌐 Fetching ${locale} from CDN (no cache or different language)`)
    console.log(`🔧 CDN_BASE_URL: "${CDN_BASE_URL}"`)

    const url = `${CDN_BASE_URL}/${locale}/en.json`
    console.log(`📡 Constructed URL: "${url}"`)

    const response = await fetch(url)
    console.log(`📊 Response status: ${response.status}`)
    console.log(`📊 Response ok: ${response.ok}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Response error text:`, errorText)
      throw new Error(
        `Failed to fetch translations for ${locale}: ${response.status} - ${errorText}`,
      )
    }

    const translations = await response.json()
    console.log(`📦 Received translations:`, Object.keys(translations).length, 'sections')

    // Save translations to IndexedDB (will clear previous language if different)
    await languageDB.set(locale, translations)

    return translations
  } catch (error) {
    console.error(`❌ Error loading translations for ${locale}:`, error)
    console.error(`❌ Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cdnBaseUrl: CDN_BASE_URL,
      locale,
    })
    return {}
  }
}
