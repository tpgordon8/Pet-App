import { watch, onMounted, onUnmounted } from 'vue'
import { usePetsStore } from '@/stores/pets'

/**
 * Theme Colors Palette
 * Carefully curated colors that work well in both light and dark modes
 */
export const THEME_COLORS = {
  sage: {
    name: 'Sage Green',
    primary: '#8B9A7D',
    light: '#b4bfa3',
    dark: '#6d7e60',
    gradient: 'linear-gradient(135deg, #8B9A7D 0%, #b4bfa3 100%)'
  },
  purple: {
    name: 'Lavender Purple',
    primary: '#a78bfa',
    light: '#c4b5fd',
    dark: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)'
  },
  pink: {
    name: 'Rose Pink',
    primary: '#f472b6',
    light: '#f9a8d4',
    dark: '#ec4899',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #f9a8d4 100%)'
  },
  orange: {
    name: 'Sunset Orange',
    primary: '#fb923c',
    light: '#fdba74',
    dark: '#f97316',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #fdba74 100%)'
  },
  teal: {
    name: 'Ocean Teal',
    primary: '#2dd4bf',
    light: '#5eead4',
    dark: '#14b8a6',
    gradient: 'linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%)'
  },
  blue: {
    name: 'Sky Blue',
    primary: '#60a5fa',
    light: '#93c5fd',
    dark: '#3b82f6',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)'
  },
  emerald: {
    name: 'Emerald Green',
    primary: '#10b981',
    light: '#34d399',
    dark: '#059669',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
  },
  amber: {
    name: 'Warm Amber',
    primary: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
  },
  rose: {
    name: 'Rose Red',
    primary: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
  },
  indigo: {
    name: 'Deep Indigo',
    primary: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)'
  }
}

/**
 * useTheme Composable
 * Manages dynamic theme colors based on selected pet
 */
export function useTheme() {
  const petsStore = usePetsStore()

  /**
   * Apply theme to document root
   */
  function applyTheme(themeColor) {
    const theme = THEME_COLORS[themeColor] || THEME_COLORS.sage
    const root = document.documentElement

    // Set CSS custom properties for dynamic theming
    root.style.setProperty('--theme-primary', theme.primary)
    root.style.setProperty('--theme-light', theme.light)
    root.style.setProperty('--theme-dark', theme.dark)
    root.style.setProperty('--theme-gradient', theme.gradient)

    // Add transition class for smooth color changes
    root.classList.add('theme-transitioning')
    setTimeout(() => {
      root.classList.remove('theme-transitioning')
    }, 300)
  }

  /**
   * Reset to default sage theme
   */
  function resetTheme() {
    applyTheme('sage')
  }

  /**
   * Get theme for a specific pet
   */
  function getPetTheme(petId) {
    const pet = petsStore.pets.find(p => p.id === petId)
    return pet?.themeColor || 'sage'
  }

  /**
   * Get all available theme colors
   */
  function getThemeColors() {
    return Object.entries(THEME_COLORS).map(([key, value]) => ({
      key,
      ...value
    }))
  }

  // Watch for pet selection changes and apply theme
  const stopWatcher = watch(
    () => petsStore.selectedPet,
    (newPet) => {
      if (newPet && newPet.themeColor) {
        applyTheme(newPet.themeColor)
      } else {
        resetTheme()
      }
    },
    { immediate: true }
  )

  // Initialize theme on mount
  onMounted(() => {
    const currentPet = petsStore.selectedPet
    if (currentPet && currentPet.themeColor) {
      applyTheme(currentPet.themeColor)
    } else {
      resetTheme()
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopWatcher()
  })

  return {
    applyTheme,
    resetTheme,
    getPetTheme,
    getThemeColors,
    THEME_COLORS
  }
}
