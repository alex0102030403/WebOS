/**
 * Settings - Main settings app component
 * Requirements: 1.2, 5.1, 6.1, 6.2
 */

import { useState } from 'react'
import { useSettings } from '../../context/SettingsContext'
import { FontSizeSlider } from './FontSizeSlider'
import { WallpaperPicker } from './WallpaperPicker'

interface SettingsProps {
  onClose: () => void
}

export function Settings({ onClose }: SettingsProps) {
  const { settings, updateFontSize, updateWallpaper, resetToDefaults } = useSettings()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  function handleReset() {
    resetToDefaults()
    setShowResetConfirm(false)
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white rounded-lg overflow-hidden">
      <div 
        data-window-header
        className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">⚙️</span>
          <span className="text-sm font-medium">Settings</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <FontSizeSlider 
          value={settings.fontSize} 
          onChange={updateFontSize} 
        />
        
        <div className="border-t border-gray-700" />
        
        <WallpaperPicker 
          currentUrl={settings.wallpaperUrl} 
          onSelect={updateWallpaper} 
        />

        <div className="border-t border-gray-700" />

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Reset</label>
          {showResetConfirm ? (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg space-y-3">
              <p className="text-sm text-gray-300">
                Are you sure you want to reset all settings to defaults?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
