/**
 * Standardized icon sizes for the application in pixels
 * Note: Do not use rem() here as Mantine icon components handle unit conversion internally
 */
export const ICON_SIZES = {
  xs: 16,    // 1rem
  sm: 18,    // 1.125rem
  md: 20,    // 1.25rem
  lg: 24,    // 1.5rem
  xl: 32,    // 2rem
} as const;

/**
 * Default icon size for the application
 */
export const DEFAULT_ICON_SIZE = ICON_SIZES.sm;