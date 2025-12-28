/**
 * Settings Context - Provides settings state and update functions to all components
 * Requirements: 2.2, 2.3, 3.3, 3.4, 5.2, 1.2
 */

import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { 
  load, 
  save, 
  getDefaults, 
  isValidFontSize, 
  isValidUrl 
} from '../store/settings'
import type { SettingsState } from '../store/settings'

export interface SettingsContextValue {
  settings: SettingsState
  updateFontSize: (size: number) => void
  updateWallpaper: (url: string) => void
  resetToDefaults: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SettingsState>(() => load())

  // Auto-save to store when settings change
  useEffect(() => {
    save(settings)
  }, [settings])

  function updateFontSize(size: number) {
    if (!isValidFontSize(size)) return
    setSettings(prev => ({ ...prev, fontSize: size }))
  }

  function updateWallpaper(url: string) {
    if (!isValidUrl(url)) return
    setSettings(prev => ({ ...prev, wallpaperUrl: url }))
  }

  function resetToDefaults() {
    setSettings(getDefaults())
  }

  const value: SettingsContextValue = {
    settings,
    updateFontSize,
    updateWallpaper,
    resetToDefaults
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

/**
 * Hook for consuming settings context
 * Throws error if used outside SettingsProvider
 * Requirements: 1.2
 */
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
