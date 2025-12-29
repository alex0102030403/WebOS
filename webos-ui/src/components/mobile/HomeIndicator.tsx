import { useRef, useCallback } from 'react'

interface HomeIndicatorProps {
  onSwipeUp: () => void
  visible?: boolean
}

// iOS design tokens
const IOS_HOME_INDICATOR_HEIGHT = 34
const SWIPE_THRESHOLD = 50 // Minimum distance for swipe detection

export function HomeIndicator({ onSwipeUp, visible = true }: HomeIndicatorProps) {
  const touchStartY = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return

    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchStartY.current - touchEndY

    // Detect upward swipe (positive deltaY means swipe up)
    if (deltaY > SWIPE_THRESHOLD) {
      onSwipeUp()
    }

    touchStartY.current = null
  }, [onSwipeUp])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex items-end justify-center pb-2"
      style={{ height: IOS_HOME_INDICATOR_HEIGHT }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      data-testid="home-indicator"
    >
      <div
        className="rounded-full bg-white/80"
        style={{
          width: 134,
          height: 5,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        }}
        data-testid="home-indicator-bar"
      />
    </div>
  )
}
