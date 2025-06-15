export const colors = {
  greenPrimary: '#2E7D32',
  greenDark: '#1B5E20',
  white: '#FFFFFF',
  // Additional colors for UI elements
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  black: '#000000',
  // Action colors
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  info: '#1976D2',
} as const;

export type AppColors = typeof colors; 