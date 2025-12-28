/**
 * Settings Store - Handles persistence and validation of user settings
 * Requirements: 4.1, 4.2, 4.3, 4.4, 2.4, 2.5, 3.5
 */

export interface SettingsState {
  fontSize: number      // Range: 12-24, step: 2
  wallpaperUrl: string  // Valid URL string
}

export const SETTINGS_STORAGE_KEY = 'webos-settings'

export const DEFAULT_SETTINGS: SettingsState = {
  fontSize: 14,
  wallpaperUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80'
}

export const PRESET_WALLPAPERS: string[] = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
  'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80'
]

/**
 * Returns the default settings
 */
export function getDefaults(): SettingsState {
  return { ...DEFAULT_SETTINGS }
}

/**
 * Loads settings from localStorage with fallback to defaults
 * Requirements: 4.2, 4.3
 */
export function load(): SettingsState {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return getDefaults()
    
    const parsed = JSON.parse(stored) as SettingsState
    
    // Validate loaded settings, fallback to defaults for invalid values
    return {
      fontSize: isValidFontSize(parsed.fontSize) ? parsed.fontSize : DEFAULT_SETTINGS.fontSize,
      wallpaperUrl: typeof parsed.wallpaperUrl === 'string' ? parsed.wallpaperUrl : DEFAULT_SETTINGS.wallpaperUrl
    }
  } catch {
    return getDefaults()
  }
}

/**
 * Saves settings to localStorage as JSON
 * Requirements: 4.1, 4.4
 */
export function save(settings: SettingsState): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Fail silently if localStorage is unavailable
  }
}

/**
 * Validates font size is within range 12-24 with step 2
 * Requirements: 2.4, 2.5
 */
export function isValidFontSize(size: number): boolean {
  if (typeof size !== 'number' || !Number.isInteger(size)) return false
  return size >= 12 && size <= 24 && size % 2 === 0
}

/**
 * Validates URL has http or https protocol
 * Requirements: 3.5
 */
export function isValidUrl(url: string): boolean {
  if (typeof url !== 'string') return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
