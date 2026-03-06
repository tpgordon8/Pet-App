// 🎨 Modern, soft color palette for PetLog

export const colors = {
  light: {
    background: '#F8F9FA',
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    primary: '#6366F1',
    primaryLight: '#818CF8',
    text: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    divider: '#F3F4F6',
    shadow: 'rgba(0, 0, 0, 0.05)',

    // Activity colors (soft, muted)
    activity: {
      poop: { bg: '#FEF3C7', icon: '#92400E', text: '#78350F' },
      pee: { bg: '#DBEAFE', icon: '#1E40AF', text: '#1E3A8A' },
      food: { bg: '#FED7AA', icon: '#C2410C', text: '#9A3412' },
      sleep: { bg: '#E9D5FF', icon: '#7C3AED', text: '#6B21A8' },
      meds: { bg: '#D1FAE5', icon: '#059669', text: '#047857' },
      vet: { bg: '#FCE7F3', icon: '#DB2777', text: '#BE185D' },
      vaccine: { bg: '#FEE2E2', icon: '#DC2626', text: '#B91C1C' },
      weight: { bg: '#E0E7FF', icon: '#4F46E5', text: '#4338CA' },
    }
  },

  dark: {
    background: '#0F172A',
    card: '#1E293B',
    cardBorder: '#334155',
    primary: '#818CF8',
    primaryLight: '#A5B4FC',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    border: '#334155',
    divider: '#1E293B',
    shadow: 'rgba(0, 0, 0, 0.3)',

    // Activity colors (adjusted for dark mode)
    activity: {
      poop: { bg: '#422006', icon: '#FCD34D', text: '#FDE68A' },
      pee: { bg: '#1E3A8A', icon: '#93C5FD', text: '#BFDBFE' },
      food: { bg: '#7C2D12', icon: '#FDBA74', text: '#FED7AA' },
      sleep: { bg: '#5B21B6', icon: '#C4B5FD', text: '#DDD6FE' },
      meds: { bg: '#064E3B', icon: '#6EE7B7', text: '#A7F3D0' },
      vet: { bg: '#831843', icon: '#F9A8D4', text: '#FBCFE8' },
      vaccine: { bg: '#7F1D1D', icon: '#FCA5A5', text: '#FECACA' },
      weight: { bg: '#3730A3', icon: '#A5B4FC', text: '#C7D2FE' },
    }
  }
};

// Activity type definitions
export const activityTypes = {
  poop: { label: 'Poop', icon: 'droplet' },
  pee: { label: 'Pee', icon: 'droplets' },
  food: { label: 'Food', icon: 'utensils-crossed' },
  sleep: { label: 'Sleep', icon: 'moon' },
  meds: { label: 'Meds', icon: 'pill' },
};

// Typography
export const typography = {
  fontFamily: {
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
};

// Spacing (following 8px grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
};

// Border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
