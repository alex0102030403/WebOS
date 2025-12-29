/**
 * MobileSettings - Mobile-optimized Settings wrapper
 * Requirements: 8.2 - Scrollable list format, touch-friendly controls
 */

import { useState } from 'react'
import { useSettings } from '../../context/SettingsContext'

interface MobileSettingsProps {
  onClose: () => void
}

// Wallpaper options
const WALLPAPER_OPTIONS = [
  { id: 'gradient-1', name: 'Ocean Blue', url: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-2', name: 'Sunset', url: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'gradient-3', name: 'Forest', url: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'gradient-4', name: 'Night Sky', url: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
  { id: 'gradient-5', name: 'Peach', url: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { id: 'gradient-6', name: 'Aurora', url: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
]

export function MobileSettings({ onClose }: MobileSettingsProps) {
  const { settings, updateFontSize, updateWallpaper, resetToDefaults } = useSettings()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Suppress unused variable warning
  void onClose

  function handleReset() {
    resetToDefaults()
    setShowResetConfirm(false)
  }

  function toggleSection(section: string) {
    setActiveSection(activeSection === section ? null : section)
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Scrollable settings list */}
      <div className="flex-1 overflow-auto">
        {/* Display Settings Section */}
        <div className="bg-white mb-2">
          <button
            onClick={() => toggleSection('display')}
            className="w-full flex items-center justify-between px-5 py-4 active:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🖥️</span>
              <div className="text-left">
                <div className="text-base font-medium text-gray-900">Display</div>
                <div className="text-sm text-gray-500">Font size, brightness</div>
              </div>
            </div>
            <span className={`text-gray-400 transition-transform ${activeSection === 'display' ? 'rotate-90' : ''}`}>
              ›
            </span>
          </button>
          
          {activeSection === 'display' && (
            <div className="px-5 pb-4 border-t border-gray-100">
              <div className="py-4">
                <label className="text-sm font-medium text-gray-700 block mb-3">
                  Font Size: {settings.fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => updateFontSize(Number(e.target.value))}
                  className="w-full h-8 accent-blue-500"
                  style={{ touchAction: 'none' }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wallpaper Settings Section */}
        <div className="bg-white mb-2">
          <button
            onClick={() => toggleSection('wallpaper')}
            className="w-full flex items-center justify-between px-5 py-4 active:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🎨</span>
              <div className="text-left">
                <div className="text-base font-medium text-gray-900">Wallpaper</div>
                <div className="text-sm text-gray-500">Background theme</div>
              </div>
            </div>
            <span className={`text-gray-400 transition-transform ${activeSection === 'wallpaper' ? 'rotate-90' : ''}`}>
              ›
            </span>
          </button>
          
          {activeSection === 'wallpaper' && (
            <div className="px-5 pb-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-3 py-4">
                {WALLPAPER_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    onClick={() => updateWallpaper(option.url)}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden ${
                      settings.wallpaperUrl === option.url 
                        ? 'ring-3 ring-blue-500 ring-offset-2' 
                        : ''
                    }`}
                    style={{ background: option.url }}
                  >
                    {settings.wallpaperUrl === option.url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="text-white text-xl">✓</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 right-1 text-xs text-white text-center font-medium drop-shadow-lg">
                      {option.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="bg-white mb-2">
          <button
            onClick={() => toggleSection('about')}
            className="w-full flex items-center justify-between px-5 py-4 active:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">ℹ️</span>
              <div className="text-left">
                <div className="text-base font-medium text-gray-900">About</div>
                <div className="text-sm text-gray-500">System information</div>
              </div>
            </div>
            <span className={`text-gray-400 transition-transform ${activeSection === 'about' ? 'rotate-90' : ''}`}>
              ›
            </span>
          </button>
          
          {activeSection === 'about' && (
            <div className="px-5 pb-4 border-t border-gray-100">
              <div className="py-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version</span>
                  <span className="text-gray-900">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform</span>
                  <span className="text-gray-900">WebOS Mobile</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Developer</span>
                  <span className="text-gray-900">Alexandru Man</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reset Section */}
        <div className="bg-white mb-2">
          <button
            onClick={() => toggleSection('reset')}
            className="w-full flex items-center justify-between px-5 py-4 active:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🔄</span>
              <div className="text-left">
                <div className="text-base font-medium text-gray-900">Reset</div>
                <div className="text-sm text-gray-500">Restore default settings</div>
              </div>
            </div>
            <span className={`text-gray-400 transition-transform ${activeSection === 'reset' ? 'rotate-90' : ''}`}>
              ›
            </span>
          </button>
          
          {activeSection === 'reset' && (
            <div className="px-5 pb-4 border-t border-gray-100">
              <div className="py-4">
                {showResetConfirm ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                    <p className="text-sm text-gray-700">
                      Are you sure you want to reset all settings to defaults?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleReset}
                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium active:bg-red-600"
                      >
                        Yes, Reset
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium active:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium active:bg-gray-300"
                  >
                    Reset to Defaults
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
