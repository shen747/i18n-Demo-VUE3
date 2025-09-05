<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useCaptionProvider } from '@/composables/languageProvider'

const router = useRouter()
const languageStore = useLanguageStore()
const { caption, isLoading, currentLocale, logTranslationStats } = useCaptionProvider()

// Make stats function available in dev console
if (import.meta.env.DEV) {
  ;(window as any).logTranslationStats = logTranslationStats
}

// Load dashboard section when component mounts
onMounted(async () => {
  await languageStore.setAndLoadLanguage(languageStore.currentLocale, 'dashboard')
})

// Navigation function
const goToLanguageSwitcher = () => {
  router.push({ name: 'language-switcher' })
}

// Sample user data
const userName = 'John Doe'
</script>

<template>
  <div class="home-container">
    <!-- Header -->
    <header class="header">
      <h1 class="title">
        {{ caption('dashboard.welcome', undefined, { name: userName }) }}
      </h1>
      <div class="header-actions">
        <span class="locale-indicator">{{ currentLocale.toUpperCase() }}</span>
        <button @click="goToLanguageSwitcher" class="language-btn" :disabled="isLoading">
          {{ caption('settings.language') }}
        </button>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      {{ caption('common.loading') }}
    </div>

    <!-- Dashboard Content -->
    <main v-else class="dashboard">
      <!-- Dashboard Cards -->
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>{{ caption('dashboard.salesOverview') }}</h3>
          <p class="metric">$24,500</p>
          <span class="metric-label">{{ caption('dashboard.monthlyRevenue') }}</span>
        </div>

        <div class="dashboard-card">
          <h3>{{ caption('dashboard.newUsers') }}</h3>
          <p class="metric">156</p>
          <span class="metric-label">+12% from last week</span>
        </div>

        <div class="dashboard-card">
          <h3>{{ caption('dashboard.performanceMetrics') }}</h3>
          <p class="metric">94.2%</p>
          <span class="metric-label">System uptime</span>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <section class="recent-activity">
        <h2>{{ caption('dashboard.recentActivity') }}</h2>
        <div class="activity-list">
          <div class="activity-item">
            <span class="activity-time">2 hours ago</span>
            <span class="activity-text">New order received from customer #1234</span>
          </div>
          <div class="activity-item">
            <span class="activity-time">4 hours ago</span>
            <span class="activity-text">System backup completed successfully</span>
          </div>
          <div class="activity-item">
            <span class="activity-time">6 hours ago</span>
            <span class="activity-text">User registration spike detected</span>
          </div>
        </div>
      </section>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="btn btn-primary">
          {{ caption('common.viewDetails') }}
        </button>
        <button class="btn btn-secondary">
          {{ caption('navigation.analytics') }}
        </button>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <p>{{ caption('footer.copyright') }}</p>
      <div class="footer-links">
        <a href="#">{{ caption('footer.aboutUs') }}</a>
        <a href="#">{{ caption('footer.contact') }}</a>
        <a href="#">{{ caption('footer.privacyPolicy') }}</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home-container {
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

.title {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.locale-indicator {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.language-btn {
  background: #1976d2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.language-btn:hover:not(:disabled) {
  background: #1565c0;
}

.language-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #666;
}

.dashboard {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-card h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.metric {
  font-size: 2rem;
  font-weight: bold;
  color: #1976d2;
  margin: 0.5rem 0;
}

.metric-label {
  color: #666;
  font-size: 0.875rem;
}

.recent-activity {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.recent-activity h2 {
  margin: 0 0 1rem 0;
  color: #333;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.activity-time {
  color: #666;
  font-size: 0.875rem;
  min-width: 100px;
}

.activity-text {
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.footer {
  background: white;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  color: #1976d2;
  text-decoration: none;
  font-size: 0.875rem;
}

.footer-links a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .dashboard {
    padding: 1rem;
  }

  .footer {
    flex-direction: column;
    text-align: center;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
