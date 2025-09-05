<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useCaptionProvider } from '@/composables/languageProvider'

const router = useRouter()
const languageStore = useLanguageStore()
const { caption, currentLocale, isLoading } = useCaptionProvider()

// Reactive state
const isChangingLanguage = ref(false)

// Computed properties
const supportedLocales = computed(() => languageStore.supportedLocales)

// Language options with display names
const languageOptions = computed(() =>
  [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
  ].filter((lang) => supportedLocales.value.includes(lang.code)),
)

// Methods
const changeLanguage = async (locale: string) => {
  if (locale === currentLocale.value || isChangingLanguage.value) return

  isChangingLanguage.value = true
  try {
    await languageStore.setAndLoadLanguage(locale, 'settings')
    console.log(`Language changed to: ${locale}`)
  } catch (error) {
    console.error('Error changing language:', error)
  } finally {
    isChangingLanguage.value = false
  }
}

const goBack = () => {
  router.push({ name: 'home' })
}

const loadAdditionalSection = async (section: string) => {
  try {
    await languageStore.loadAdditionalSection(section)
  } catch (error) {
    console.error(`Error loading section ${section}:`, error)
  }
}
</script>

<template>
  <div class="language-switcher-container">
    <!-- Header -->
    <header class="header">
      <button @click="goBack" class="back-btn">← {{ caption('common.back') }}</button>
      <h1 class="title">{{ caption('settings.language') }}</h1>
      <div class="current-locale">{{ currentLocale.toUpperCase() }}</div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Language Selection -->
      <section class="language-section">
        <h2>{{ caption('settings.language') }}</h2>
        <p class="description">Choose your preferred language for the application interface.</p>

        <div class="language-grid">
          <div
            v-for="lang in languageOptions"
            :key="lang.code"
            class="language-option"
            :class="{
              active: lang.code === currentLocale,
              loading: isChangingLanguage && lang.code !== currentLocale,
            }"
            @click="changeLanguage(lang.code)"
          >
            <div class="language-info">
              <h3>{{ lang.nativeName }}</h3>
              <p>{{ lang.name }}</p>
            </div>
            <div class="language-status">
              <span v-if="lang.code === currentLocale" class="current-badge">
                {{ caption('common.current') }}
              </span>
              <span v-else-if="isChangingLanguage" class="loading-spinner">⟳</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Additional Settings -->
      <section class="settings-section">
        <h2>{{ caption('settings.appearance') }}</h2>

        <div class="setting-item">
          <label class="setting-label">
            {{ caption('settings.theme') }}
          </label>
          <select class="setting-select">
            <option value="light">{{ caption('settings.lightMode') }}</option>
            <option value="dark">{{ caption('settings.darkMode') }}</option>
          </select>
        </div>

        <div class="setting-item">
          <label class="setting-checkbox">
            <input type="checkbox" />
            <span class="checkmark"></span>
            {{ caption('settings.enablePush') }}
          </label>
        </div>

        <div class="setting-item">
          <label class="setting-checkbox">
            <input type="checkbox" />
            <span class="checkmark"></span>
            {{ caption('settings.enableEmail') }}
          </label>
        </div>
      </section>

      <!-- Debug Section -->
      <section class="debug-section">
        <h3>Debug Information</h3>
        <div class="debug-info">
          <p><strong>Current Locale:</strong> {{ currentLocale }}</p>
          <p><strong>Loaded Sections:</strong></p>
          <ul>
            <li v-if="languageStore.isSectionLoaded('common')">✓ Common</li>
            <li v-if="languageStore.isSectionLoaded('error')">✓ Error</li>
            <li v-if="languageStore.isSectionLoaded('footer')">✓ Footer</li>
            <li v-if="languageStore.isSectionLoaded('settings')">✓ Settings</li>
            <li v-if="languageStore.isSectionLoaded('dashboard')">✓ Dashboard</li>
          </ul>
        </div>

        <div class="debug-actions">
          <button
            @click="loadAdditionalSection('navigation')"
            class="btn btn-small"
            :disabled="isLoading"
          >
            Load Navigation Section
          </button>
          <button
            @click="loadAdditionalSection('forms')"
            class="btn btn-small"
            :disabled="isLoading"
          >
            Load Forms Section
          </button>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>{{ caption('footer.copyright') }}</p>
    </footer>
  </div>
</template>

<style scoped>
.language-switcher-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.header {
  background: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #f0f0f0;
}

.title {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.current-locale {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.language-section,
.settings-section,
.debug-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.language-section h2,
.settings-section h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.description {
  color: #666;
  margin-bottom: 2rem;
}

.language-grid {
  display: grid;
  gap: 1rem;
}

.language-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.language-option:hover {
  border-color: #1976d2;
  background: #f8f9ff;
}

.language-option.active {
  border-color: #1976d2;
  background: #e3f2fd;
}

.language-option.loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.language-info h3 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1.2rem;
}

.language-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.current-badge {
  background: #4caf50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.loading-spinner {
  font-size: 1.2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.setting-item {
  margin-bottom: 1.5rem;
}

.setting-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.setting-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.setting-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #333;
}

.setting-checkbox input {
  margin-right: 0.75rem;
}

.debug-section {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.debug-section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.debug-info {
  margin-bottom: 1rem;
  font-family: monospace;
  font-size: 0.9rem;
}

.debug-info ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.debug-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  background: #1976d2;
  color: white;
}

.btn:hover:not(:disabled) {
  background: #1565c0;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.footer {
  background: white;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.footer p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .main-content {
    padding: 1rem;
  }

  .language-section,
  .settings-section,
  .debug-section {
    padding: 1.5rem;
  }

  .debug-actions {
    flex-direction: column;
  }
}
</style>
