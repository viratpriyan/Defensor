export const COLORS = {
  // Brand Colors (Deep Indigo & Navy)
  primary: '#6366F1',     // Indigo
  secondary: '#4F46E5',   // Deep Indigo
  accent: '#0EA5E9',      // Sky Blue

  // Status Colors (Semantic)
  success: '#10B981',     // Emerald (Safety/Positive)
  danger: '#EF4444',      // Rose Red (Threat/Negative)
  warning: '#F59E0B',     // Amber (Caution)
  info: '#3B82F6',        // Royal Blue (Info)

  // Neutrals (Professional Multi-layer palette)
  background: '#F8FAFC',  // Slate 50 (Screen Bg)
  surface: '#FFFFFF',     // White (Card Bg)
  darkSurface: '#0F172A', // Slate 900 (Dark Accents/Header)
  darkGlass: 'rgba(15, 23, 42, 0.8)',

  // Text
  text: '#0F172A',        // Deepest Slate
  textSecondary: '#64748B', // Slate subtext
  textDark: '#1E293B',    // Navy text
  white: '#FFFFFF',

  // Borders
  border: '#E2E8F0',      // Slate border
};

export const GRADIENTS = {
  // Primary Brand
  primary: ['#6366F1', '#4F46E5'],
  secondary: ['#0EA5E9', '#3B82F6'],

  // Safety & Success (Green)
  safety: ['#10B981', '#059669'],

  // Danger & Threat (Red)
  danger: ['#EF4444', '#B91C1C'],

  // Professional Dark (Black/Navy)
  dark: ['#1E293B', '#0F172A'],

  // Soft/Glass
  glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
};

export const SHADOWS = {
  soft: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  danger: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  }
};

export const ROUTES = {
  SPLASH: 'Splash',
  AUTH: 'Auth',
  LOGIN: 'Login',
  REGISTER: 'Register',
  OTP: 'Otp',
  HOME: 'Home',
  DASHBOARD: 'Dashboard',
  NAVIGATION: 'Navigation',
  SAFE_ROUTE: 'SafeRoute',
  EMERGENCY: 'Emergency',
  SOS: 'Sos',
  CONTACTS: 'Contacts',
  PROFILE: 'Profile',
  SAFE_ZONES: 'SafeZones',
  LIVE_TRACKING: 'LiveTracking',
};
