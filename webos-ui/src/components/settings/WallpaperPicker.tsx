/**
 * WallpaperPicker - UI component for selecting and previewing background images
 * Requirements: 3.1, 3.2, 3.5, 3.6
 */

import { useState } from 'react'
import { PRESET_WALLPAPERS, isValidUrl } from '../../store/settings'

interface WallpaperPickerProps {
  currentUrl: string
  onSelect: (url: string) => void
}

export function WallpaperPicker({ currentUrl, onSelect }: WallpaperPickerProps) {
  const [customUrl, setCustomUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState(currentUrl)

  function handlePresetClick(url: string) {
    setUrlError(null)
    setImageError(null)
    setPreviewUrl(url)
    onSelect(url)
  }

  function handleCustomUrlSubmit() {
    if (!customUrl.trim()) {
      setUrlError('Please enter a URL')
      return
    }
    
    if (!isValidUrl(customUrl)) {
      setUrlError('Invalid URL. Must start with http:// or https://')
      return
    }
    
    setUrlError(null)
    setImageError(null)
    setPreviewUrl(customUrl)
    onSelect(customUrl)
    setCustomUrl('')
  }

  function handleImageError() {
    setImageError('Failed to load wallpaper image')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCustomUrlSubmit()
  }

  return (
    <div className="space-y-6">
      <label className="text-sm font-medium text-gray-300">Wallpaper</label>
      
      <div className="grid grid-cols-2 gap-5">
        {PRESET_WALLPAPERS.map((url, index) => (
          <button
            key={index}
            onClick={() => handlePresetClick(url)}
            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
              currentUrl === url 
                ? 'border-blue-500 ring-2 ring-blue-500/50' 
                : 'border-gray-700 hover:border-gray-500'
            }`}
          >
            <img
              src={url}
              alt={`Wallpaper ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <label className="text-xs text-gray-400">Custom URL</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleCustomUrlSubmit}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
        {urlError && <p className="text-xs text-red-400">{urlError}</p>}
      </div>

      <div className="space-y-3">
        <label className="text-xs text-gray-400">Preview</label>
        <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
          {imageError ? (
            <div className="flex items-center justify-center h-full text-red-400 text-sm">
              {imageError}
            </div>
          ) : (
            <img
              src={previewUrl}
              alt="Wallpaper preview"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
        </div>
      </div>
    </div>
  )
}
