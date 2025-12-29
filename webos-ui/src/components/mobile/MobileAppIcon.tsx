import { useState, useRef, useCallback } from 'react'
import type { MobileApp } from '../../types'

interface MobileAppIconProps {
  app: MobileApp
  onTap: () => void
  onLongPress: () => void
  isWiggling?: boolean
}

// iOS design tokens
const IOS_ICON_SIZE = 60
const IOS_ICON_RADIUS = 13
const LONG_PRESS_DURATION = 500

export function MobileAppIcon({ app, onTap, onLongPress, isWiggling = false }: MobileAppIconProps) {
  const [isPressed, setIsPressed] = useState(false)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLongPressTriggeredRef = useRef(false)

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const handlePressStart = useCallback(() => {
    setIsPressed(true)
    isLongPressTriggeredRef.current = false
    
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true
      onLongPress()
    }, LONG_PRESS_DURATION)
  }, [onLongPress])

  const handlePressEnd = useCallback(() => {
    setIsPressed(false)
    clearLongPressTimer()
    
    // Only trigger tap if long press wasn't triggered
    if (!isLongPressTriggeredRef.current) {
      onTap()
    }
  }, [onTap, clearLongPressTimer])

  const handlePressCancel = useCallback(() => {
    setIsPressed(false)
    clearLongPressTimer()
  }, [clearLongPressTimer])

  // Determine if icon is an emoji or image URL
  const isImageUrl = app.icon.startsWith('http') || app.icon.startsWith('/')

  return (
    <div
      className="flex flex-col items-center gap-1 select-none"
      style={{
        animation: isWiggling ? 'wiggle 0.3s ease-in-out infinite' : undefined
      }}
    >
      {/* Icon container */}
      <div
        className="flex items-center justify-center cursor-pointer transition-transform duration-100"
        style={{
          width: IOS_ICON_SIZE,
          height: IOS_ICON_SIZE,
          borderRadius: IOS_ICON_RADIUS,
          background: app.iconBackground || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          transform: isPressed ? 'scale(0.9)' : 'scale(1)'
        }}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressCancel}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressCancel}
      >
        {isImageUrl ? (
          <img
            src={app.icon}
            alt={app.name}
            className="w-8 h-8 object-contain"
            draggable={false}
          />
        ) : (
          <span className="text-3xl" role="img" aria-label={app.name}>
            {app.icon}
          </span>
        )}
      </div>

      {/* App name label */}
      <span
        className="text-white text-center font-medium truncate w-16"
        style={{
          fontSize: '11px',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
        }}
      >
        {app.name}
      </span>

      {/* Wiggle animation keyframes */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
      `}</style>
    </div>
  )
}
