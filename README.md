# Vue 3 + Localazy + Capacitor i18n Demo

A practical example showing how to implement dynamic internationalization (i18n) in Vue 3 applications that work seamlessly across web and mobile platforms using Localazy CDN and Capacitor.

## What This Demo Shows

This project demonstrates a real-world approach to building multilingual applications that can:

- Switch languages instantly without page reloads
- Load only the translation sections you actually need
- Work on both web browsers and mobile devices
- Cache translations for offline use
- Gracefully handle missing translations with fallbacks
- Fetch translations from a CDN while keeping everything fast

## How It's Built

The demo uses a straightforward stack that works well together:

- **Vue 3** with Composition API for the frontend
- **Pinia** for managing language state and translations
- **Vue Router** for navigation
- **Capacitor** for mobile app functionality
- **IndexedDB** for storing translations locally
- **Localazy CDN** for delivering translations

### Project Structure

The code is organized into logical sections:

```
src/
├── composables/
│   └── languageProvider.ts     # Main translation logic with fallbacks
├── locale/
│   └── en.json                 # English translations (fallback)
├── router/
│   └── index.ts                # Basic routing setup
├── services/
│   ├── db.ts                   # IndexedDB wrapper for caching
│   └── languageService.ts      # Handles CDN fetching
├── stores/
│   └── language.ts             # Pinia store for language state
├── views/
│   ├── HomeView.vue            # Main dashboard page
│   └── LanguageSwitcher.vue    # Language selection component
└── App.vue                     # Root component
```

## Main Features

### Dynamic Language Switching

Users can switch languages instantly without any page reloads. The app remembers your language choice and shows a nice loading state while switching.

### Smart Lazy Loading

Instead of loading all translations at once, the app only loads what you need:

- Common translations (buttons, errors, etc.) load first
- Dashboard translations load when you visit the home page
- Settings translations load when you go to the language page
- Additional sections load on-demand as needed

### Intelligent Caching

The app uses IndexedDB to cache translations locally:

- First time you visit, it fetches from the CDN
- Next time, it loads from local cache (much faster)
- Works offline once cached
- Automatically handles updates when translations change

### Fallback System

When translations are missing, the app gracefully falls back:

1. Try the current language
2. Fall back to English
3. Use custom fallbacks you define
4. Show the translation key as last resort

### Cross-Platform Support

- Works perfectly in web browsers
- Mobile apps use Capacitor for native functionality
- Automatically detects device language on mobile
- Responsive design works on all screen sizes

## How It Works Under the Hood

### Language Store (Pinia)

The `useLanguageStore` keeps track of everything related to languages:

```typescript
interface LanguageState {
  currentLocale: string
  messages: Record<string, string>
  supportedLocales: string[]
  isLoading: boolean
}
```

Main methods you'll use:

- `setAndLoadLanguage()` - Switch languages and load what's needed
- `loadAdditionalSection()` - Load more translations when required
- `initializeLanguage()` - Set up the initial language (detects device language on mobile)

### Translation Service

The `languageService.ts` handles all the CDN communication and caching:

```typescript
export const loadLanguage = async (locale: string): Promise<Record<string, string>>
```

Here's what happens when you load a language:

1. Check if we have it cached in IndexedDB
2. If not, fetch it from the Localazy CDN
3. Convert nested JSON to flat dot notation (easier to work with)
4. Cache the flattened version locally
5. Return the translations ready to use

### Language Provider Composable

The `useCaptionProvider` gives you a clean way to use translations in your components:

```typescript
const { caption, isLoading, currentLocale } = useCaptionProvider()

// In your template:
{
  {
    caption('dashboard.welcome', undefined, { name: userName })
  }
}
```

This composable handles:

- Automatic fallback when translations are missing
- Parameter interpolation (like the `{name}` above)
- Loading states
- Translation statistics for debugging

### IndexedDB Integration

The `db.ts` service wraps IndexedDB to make it easier to work with:

```typescript
export const languageDB = {
  async get(locale: string): Promise<Record<string, string> | undefined>
  async set(locale: string, translations: Record<string, string>): Promise<void>
}
```

## Mobile Integration

### Capacitor Setup

The app uses Capacitor to work on mobile devices:

```typescript
import { Capacitor } from '@capacitor/core'
import { Device } from '@capacitor/device'

// Detect device language on mobile
if (Capacitor.isNativePlatform()) {
  const langCode = (await Device.getLanguageCode()).value.substring(0, 2)
  // Use device language if we support it
}
```

### Mobile Features

- Automatically detects the user's device language
- Runs with native app performance
- Works offline once translations are cached
- Handles mobile-specific UI considerations

## CDN Integration

### Localazy Configuration

The app fetches translations from Localazy CDN:

```typescript
const CDN_BASE_URL = import.meta.env.VITE_LOCALAZY_BASE_URL
const url = `${CDN_BASE_URL}/${locale}/en.json`
```

### How Translations Are Structured

Your translations start as nested JSON (easier to organize):

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "dashboard": {
    "welcome": "Welcome back, {name}!",
    "salesOverview": "Sales Overview"
  }
}
```

But the app flattens them to dot notation for faster lookups:

```json
{
  "common.save": "Save",
  "common.cancel": "Cancel",
  "dashboard.welcome": "Welcome back, {name}!",
  "dashboard.salesOverview": "Sales Overview"
}
```

## User Experience

### Loading States

The app provides clear feedback during different loading scenarios:

- Shows a spinner when the app first starts up
- Displays a loading overlay when switching languages
- Smooth transitions when loading additional translation sections

### Error Handling

When things go wrong, the app handles it gracefully:

- Network issues? Falls back to cached translations
- Missing translations? Falls back to English or your custom fallbacks
- Initialization problems? Retries with helpful error messages

### Development Features

For debugging and development, the app includes:

- Translation statistics (cache hits, fallbacks, missing keys)
- Debug information showing loaded sections and current state
- Detailed console logging to track the translation flow

## Getting Started

### What You Need

- Node.js 20.19.0+ or 22.12.0+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd i18n-Demo-VUE3

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and set VITE_LOCALAZY_BASE_URL to your Localazy CDN URL
```

### Development

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Run tests
npm run test:unit
```

### Building for Production

```bash
# Build for web
npm run build

# Preview production build
npm run preview
```

### Mobile Development

```bash
# Add mobile platforms
npx cap add android
npx cap add ios

# Build and sync
npm run build
npx cap sync

# Open in native IDEs
npx cap open android
npx cap open ios
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_LOCALAZY_BASE_URL=https://delivery.localazy.com/your-project-id
```

### Supported Languages

The demo currently supports:

- **English (en)** - Default fallback language
- **Spanish (es)** - Full translation support
- **French (fr)** - Full translation support

To add more languages:

1. Add the locale code to the `supportedLocales` array in `language.ts`
2. Add the language option to `languageOptions` in `LanguageSwitcher.vue`
3. Make sure translations exist in your Localazy CDN

## Performance Optimizations

### Lazy Loading Benefits

- Smaller initial bundle size (only loads what you need)
- Faster app startup (minimal translation data on first load)
- Better memory usage (loads translations as needed)

### Caching Strategy

- Translations survive app restarts (stored in IndexedDB)
- Reduces CDN requests (cached locally)
- Works offline once cached

### Bundle Optimization

- Tree shaking removes unused translation sections
- Translation loading is asynchronous (doesn't block the UI)
- Lightweight implementation with minimal dependencies

## Testing

The project includes a comprehensive testing setup:

```bash
# Run unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit -- --watch

# Run tests with coverage
npm run test:unit -- --coverage
```

### What's Tested

- Language store functionality
- Translation service logic
- Composable behavior
- Component rendering

## Debugging

### Development Tools

- **Vue DevTools**: Inspect component state and language store
- **Console Logging**: Detailed translation flow logging
- **Translation Statistics**: Track cache performance
- **Debug Panel**: Built-in development information

### Common Issues and Solutions

1. **Missing Translations**: Check console for missing key warnings
2. **CDN Errors**: Verify your `VITE_LOCALAZY_BASE_URL` configuration
3. **Cache Issues**: Clear IndexedDB in browser dev tools
4. **Mobile Issues**: Make sure Capacitor plugins are properly installed

---

This demo should help you understand how to implement dynamic i18n in your Vue 3 applications. Feel free to use it as a reference for your own projects.
