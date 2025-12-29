import { useRef, useCallback, useState } from 'react'
import { MobileNavBar } from './MobileNavBar'
import { HomeIndicator } from './HomeIndicator'

interface MobileAppContainerProps {
  appId: string
  appName: string
  onClose: () => void
  children: React.ReactNode
}

// iOS design tokens
const IOS_NAV_BAR_HEIGHT = 44
const IOS_HOME_INDICATOR_HEIGHT = 34

// Swipe gesture configuration
const SWIPE_THRESHOLD = 100 // Minimum distance for swipe-up gesture to close
const SWIPE_VELOCITY_THRESHOLD = 0.5 // Minimum velocity (px/ms) for quick flick
const BOTTOM_EDGE_ZONE = 80 // Zone from bottom edge where swipe starts (px)

export function MobileAppContainer({ appId, appName, onClose, children }: MobileAppContainerProps) {
  const touchStartY = useRef<number | null>(null)
  const touchStartTime = useRef<number | null>(null)
  const [swipeProgress, setSwipeProgress] = useState(0)
  const isSwipeActive = useRef(false)

  // Handle swipe-up gesture from bottom edge to close app
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    const viewportHeight = window.innerHeight
    
    // Only track touches that start near the bottom edge
    if (touch.clientY > viewportHeight - BOTTOM_EDGE_ZONE) {
      touchStartY.current = touch.clientY
      touchStartTime.current = Date.now()
      isSwipeActive.current = true
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwipeActive.current || touchStartY.current === null) return

    const currentY = e.touches[0].clientY
    const deltaY = touchStartY.current - currentY

    // Only process upward swipes
    if (deltaY > 0) {
      // Calculate progress (0 to 1) for visual feedback
      const progress = Math.min(deltaY / SWIPE_THRESHOLD, 1)
      setSwipeProgress(progress)
      
      // Prevent scrolling when swiping up from bottom
      if (deltaY > 20) {
        e.preventDefault()
      }
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isSwipeActive.current || touchStartY.current === null || touchStartTime.current === null) {
      setSwipeProgress(0)
      return
    }

    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchStartY.current - touchEndY
    const deltaTime = Date.now() - touchStartTime.current
    const velocity = deltaTime > 0 ? deltaY / deltaTime : 0

    // Detect upward swipe: either distance threshold or velocity threshold
    const isDistanceSwipe = deltaY > SWIPE_THRESHOLD
    const isVelocitySwipe = deltaY > 40 && velocity > SWIPE_VELOCITY_THRESHOLD

    if (isDistanceSwipe || isVelocitySwipe) {
      onClose()
    }

    // Reset state
    touchStartY.current = null
    touchStartTime.current = null
    isSwipeActive.current = false
    setSwipeProgress(0)
  }, [onClose])

  const handleTouchCancel = useCallback(() => {
    touchStartY.current = null
    touchStartTime.current = null
    isSwipeActive.current = false
    setSwipeProgress(0)
  }, [])

  return (
    <div
      className="fixed inset-0 flex flex-col bg-black"
      style={{
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
        // Visual feedback: slight scale and opacity change during swipe
        transform: swipeProgress > 0 ? `scale(${1 - swipeProgress * 0.05})` : undefined,
        opacity: swipeProgress > 0 ? 1 - swipeProgress * 0.2 : 1,
        transition: swipeProgress === 0 ? 'transform 0.2s ease-out, opacity 0.2s ease-out' : undefined
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      data-testid="mobile-app-container"
      data-app-id={appId}
    >
      {/* Navigation bar at top */}
      <MobileNavBar appName={appName} onClose={onClose} />

      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-auto"
        style={{
          height: `calc(100vh - ${IOS_NAV_BAR_HEIGHT}px - ${IOS_HOME_INDICATOR_HEIGHT}px)`
        }}
        data-testid="mobile-app-content"
      >
        {children}
      </div>

      {/* Home indicator at bottom for swipe gesture */}
      <HomeIndicator onSwipeUp={onClose} visible={true} />
    </div>
  )
}
