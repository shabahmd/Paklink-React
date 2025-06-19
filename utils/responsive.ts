import { Dimensions, PixelRatio, Platform } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Based on iPhone 11 Pro dimensions as the design standard
const designWidth = 375;
const designHeight = 812;

/**
 * Converts design pixel values to responsive pixels based on screen width
 * @param px - The design size in pixels
 */
const widthPixel = (px: number): number => {
  return wp(`${(px / designWidth) * 100}%`);
};

/**
 * Converts design pixel values to responsive pixels based on screen height
 * @param px - The design size in pixels
 */
const heightPixel = (px: number): number => {
  return hp(`${(px / designHeight) * 100}%`);
};

/**
 * Converts design pixel values to responsive font sizes
 * @param px - The font size in pixels based on design
 */
const fontPixel = (px: number): number => {
  return wp(`${(px / designWidth) * 100}%`);
};

/**
 * Scale pixel values for responsive sizing with minimum scale
 * @param size - The size to scale
 */
const scale = (size: number): number => {
  const scale = SCREEN_WIDTH / designWidth;
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

/**
 * Get padding or margin value based on screen width percentage
 * @param value - Value between 1-100
 */
const getWidthPercent = (value: number): number => {
  return (value / 100) * SCREEN_WIDTH;
};

/**
 * Get padding or margin value based on screen height percentage
 * @param value - Value between 1-100
 */
const getHeightPercent = (value: number): number => {
  return (value / 100) * SCREEN_HEIGHT;
};

/**
 * Responsive sizing based on screen dimensions
 */
export const metrics = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  wp,
  hp,
  widthPixel,
  heightPixel,
  fontPixel,
  scale,
  getWidthPercent,
  getHeightPercent,
};

/**
 * Responsive spacing values
 */
export const spacing = {
  xs: widthPixel(4),
  s: widthPixel(8),
  m: widthPixel(16),
  l: widthPixel(24),
  xl: widthPixel(32),
  xxl: widthPixel(40),
};

/**
 * Responsive font sizes
 */
export const fontSize = {
  xs: fontPixel(12),
  s: fontPixel(14),
  m: fontPixel(16),
  l: fontPixel(18),
  xl: fontPixel(20),
  xxl: fontPixel(24),
  xxxl: fontPixel(32),
};

/**
 * Responsive border radius values
 */
export const borderRadius = {
  xs: widthPixel(4),
  s: widthPixel(8),
  m: widthPixel(12),
  l: widthPixel(16),
  xl: widthPixel(20),
  round: widthPixel(50),
};

export default {
  metrics,
  spacing,
  fontSize,
  borderRadius,
}; 