import { rem } from '@mantine/core';

/**
 * Standardized icon sizes for the application
 */
export const ICON_SIZES = {
  xs: rem(16),    // 1rem
  sm: rem(20),    // 1.25rem
  md: rem(24),    // 1.5rem
  lg: rem(32),    // 2rem
  xl: rem(40),    // 2.5rem
} as const;

/**
 * Default icon size for the application
 */
export const DEFAULT_ICON_SIZE = ICON_SIZES.sm;