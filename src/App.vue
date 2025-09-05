<script setup lang="ts">
import { onMounted, ref, computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useLanguageStore } from '@/stores/language'

const route = useRoute()
const languageStore = useLanguageStore()

// App-level state
const isAppInitialized = ref(false)
const initializationError = ref<string | null>(null)

// Computed properties
const isLoading = computed(() => !isAppInitialized.value)
const hasError = computed(() => !!initializationError.value)
const isDevelopment = computed(() => import.meta.env.DEV)

// Provide the language store to all child components
provide('languageStore', languageStore)

// Helper functions
const reloadPage = () => {
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

const getUserAgent = () => {
  if (typeof navigator !== 'undefined') {
    return navigator.userAgent
  }
  return 'Unknown'
}

// Initialize the application
onMounted(async () => {
  try {
    console.log('🚀 Initializing i18n Demo App...')

    // Initialize language system
    await languageStore.initializeLanguage()

    // Mark app as initialized
    isAppInitialized.value = true

    console.log('✅ App initialized successfully')
    console.log(`📍 Current locale: ${languageStore.currentLocale}`)
    console.log(`🗂️ Supported locales: ${languageStore.supportedLocales.join(', ')}`)
  } catch (error) {
    console.error('❌ Failed to initialize app:', error)
    initializationError.value =
      error instanceof Error ? error.message : 'Unknown initialization error'
    isAppInitialized.value = true // Still mark as initialized to show error state
  }
})

// Error recovery function
const retryInitialization = async () => {
  initializationError.value = null
  isAppInitialized.value = false

  // Wait a bit before retrying
  await new Promise((resolve) => setTimeout(resolve, 500))

  try {
    await languageStore.initializeLanguage()
    isAppInitialized.value = true
    console.log('✅ App initialization retry successful')
  } catch (error) {
    console.error('❌ Retry failed:', error)
    initializationError.value = error instanceof Error ? error.message : 'Retry failed'
    isAppInitialized.value = true
  }
}
</script>

<template>
  <div id="app">
    <!-- Loading State -->
    <div v-if="isLoading" class="app-loading">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <h2>Loading i18n Demo App...</h2>
        <p>Initializing language system and loading translations</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="app-error">
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h2>Initialization Error</h2>
        <p class="error-message">{{ initializationError }}</p>
        <div class="error-actions">
          <button @click="retryInitialization" class="retry-btn">Retry Initialization</button>
          <button @click="reloadPage" class="reload-btn">Reload Page</button>
        </div>
        <details class="error-details">
          <summary>Technical Details</summary>
          <div class="tech-info">
            <p><strong>Current Locale:</strong> {{ languageStore.currentLocale }}</p>
            <p>
              <strong>Supported Locales:</strong> {{ languageStore.supportedLocales.join(', ') }}
            </p>
            <p>
              <strong>Messages Loaded:</strong> {{ Object.keys(languageStore.messages).length }}
            </p>
            <p><strong>User Agent:</strong> {{ getUserAgent() }}</p>
          </div>
        </details>
      </div>
    </div>

    <!-- Main Application -->
    <div v-else class="app-content">
      <!-- Global Loading Overlay -->
      <Transition name="fade">
        <div v-if="languageStore.isLoading" class="global-loading-overlay">
          <div class="global-loading-content">
            <div class="loading-spinner small"></div>
            <span>{{ languageStore.getTranslation('common.loading', 'Loading...') }}</span>
          </div>
        </div>
      </Transition>

      <!-- Router View -->
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>

      <!-- Development Info (only in development) -->
      <div v-if="isDevelopment" class="dev-info">
        <details>
          <summary>🔧 Dev Info</summary>
          <div class="dev-content">
            <p><strong>Route:</strong> {{ route.path }}</p>
            <p><strong>Locale:</strong> {{ languageStore.currentLocale }}</p>
            <p><strong>Loaded Sections:</strong></p>
            <ul>
              <li v-if="languageStore.isSectionLoaded('common')">✓ Common</li>
              <li v-if="languageStore.isSectionLoaded('error')">✓ Error</li>
              <li v-if="languageStore.isSectionLoaded('footer')">✓ Footer</li>
              <li v-if="languageStore.isSectionLoaded('dashboard')">✓ Dashboard</li>
              <li v-if="languageStore.isSectionLoaded('settings')">✓ Settings</li>
              <li v-if="languageStore.isSectionLoaded('navigation')">✓ Navigation</li>
              <li v-if="languageStore.isSectionLoaded('forms')">✓ Forms</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Global App Styles */
#app {
  min-height: 100vh;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

/* Loading State */
.app-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.loading-container {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.loading-container h2 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.loading-container p {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

/* Loading Spinner */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Error State */
.app-error {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 2rem;
}

.error-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-container h2 {
  color: #dc3545;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.error-message {
  color: #666;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.9rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.retry-btn,
.reload-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.retry-btn {
  background: #007bff;
  color: white;
}

.retry-btn:hover {
  background: #0056b3;
}

.reload-btn {
  background: #6c757d;
  color: white;
}

.reload-btn:hover {
  background: #545b62;
}

.error-details {
  text-align: left;
  margin-top: 1rem;
}

.error-details summary {
  cursor: pointer;
  color: #007bff;
  font-weight: 500;
}

.tech-info {
  margin-top: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.875rem;
}

.tech-info p {
  margin: 0.25rem 0;
}

/* Main App Content */
.app-content {
  position: relative;
  min-height: 100vh;
}

/* Global Loading Overlay */
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.global-loading-content {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

/* Development Info */
.dev-info {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  z-index: 1000;
  max-width: 250px;
}

.dev-info summary {
  cursor: pointer;
  font-weight: 500;
}

.dev-content {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.dev-content p {
  margin: 0.25rem 0;
}

.dev-content ul {
  margin: 0.5rem 0;
  padding-left: 1rem;
}

.dev-content li {
  margin: 0.125rem 0;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .error-actions {
    flex-direction: column;
  }

  .dev-info {
    bottom: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
  }

  .global-loading-content {
    margin: 1rem;
    padding: 1rem 1.5rem;
  }
}
</style>
