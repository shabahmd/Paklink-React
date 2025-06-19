import { ImageSourcePropType } from 'react-native';

export function getImageSource(src: string | number | undefined): ImageSourcePropType | undefined {
  if (!src) return undefined;
  if (typeof src === 'string') return { uri: src };
  return src;
} 