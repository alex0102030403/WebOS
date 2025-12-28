/**
 * FontSizeSlider - UI component for adjusting system-wide font size
 * Requirements: 2.1, 2.4
 */

import { isValidFontSize } from '../../store/settings'

interface FontSizeSliderProps {
  value: number
  onChange: (size: number) => void
}

export function FontSizeSlider({ value, onChange }: FontSizeSliderProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newSize = parseInt(e.target.value, 10)
    if (isValidFontSize(newSize)) {
      onChange(newSize)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">Font Size</label>
        <span className="text-sm text-blue-400">{value}px</span>
      </div>
      
      <input
        type="range"
        min={12}
        max={24}
        step={2}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>12px</span>
        <span>24px</span>
      </div>
      
      <div 
        className="p-3 bg-gray-800 rounded-lg border border-gray-700"
        style={{ fontSize: `${value}px` }}
      >
        <p className="text-gray-300">Preview text at {value}px</p>
      </div>
    </div>
  )
}
