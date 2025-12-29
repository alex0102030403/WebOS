import { useState, useCallback, useRef } from 'react'
import { useSettings } from '../../context/SettingsContext'
import { StatusBar } from './StatusBar'
import { AppGrid } from './AppGrid'
import { Dock } from './Dock'
import { HomeIndicator } from './HomeIndicator'
import { getGridApps, getDockApps } from './config'

interface HomeScreenProps {
  onAppTap: (appId: string) => void
  onSwipeUp?: () => void
}

// iOS design tokens
const APPS_PER_PAGE = 20 // 4 columns × 5 rows per page
const SWIPE_THRESHOLD = 50 // Minimum distance for horizontal swipe
const SWIPE_VELOCITY_THRESHOLD = 0.3 // Minimum velocity (px/ms) for quick flick

export function HomeScreen({ onAppTap, onSwipeUp }: HomeScreenProps) {
  const { settings } = useSettings()
  const [wigglingAppId, setWigglingAppId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [swipeOffset, setSwipeOffset] = useState(0)
  
  // Touch tracking refs
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchStartTime = useRef<number | null>(null)
  const isHorizontalSwipe = useRef<boolean | null>(null)

  const gridApps = getGridApps()
  const dockApps = getDockApps()
  
  // Calculate total pages
  const totalPages = Math.ceil(gridApps.length / APPS_PER_PAGE)
  
  // Get apps for current page
  const getAppsForPage = (pageIndex: number) => {
    const start = pageIndex * APPS_PER_PAGE
    const end = start + APPS_PER_PAGE
    return gridApps.slice(start, end)
  }

  const handleAppLongPress = useCallback((appId: string) => {
    setWigglingAppId(prev => prev === appId ? null : appId)
  }, [])

  const handleBackgroundTap = useCallback(() => {
    if (wigglingAppId) setWigglingAppId(null)
  }, [wigglingAppId])

  const handleSwipeUp = useCallback(() => {
    if (onSwipeUp) onSwipeUp()
  }, [onSwipeUp])

  // Handle horizontal swipe for page navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    touchStartTime.current = Date.now()
    isHorizontalSwipe.current = null
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const deltaX = currentX - touchStartX.current
    const deltaY = currentY - touchStartY.current

    // Determine swipe direction on first significant movement
    if (isHorizontalSwipe.current === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY)
    }

    // Only process horizontal swipes
    if (isHorizontalSwipe.current) {
      // Limit swipe offset based on current page
      let limitedOffset = deltaX
      
      // Add resistance at edges
      if (currentPage === 0 && deltaX > 0) {
        limitedOffset = deltaX * 0.3 // Resistance when swiping right on first page
      } else if (currentPage === totalPages - 1 && deltaX < 0) {
        limitedOffset = deltaX * 0.3 // Resistance when swiping left on last page
      }
      
      setSwipeOffset(limitedOffset)
      e.preventDefault()
    }
  }, [currentPage, totalPages])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartTime.current === null || !isHorizontalSwipe.current) {
      setSwipeOffset(0)
      touchStartX.current = null
      touchStartY.current = null
      touchStartTime.current = null
      isHorizontalSwipe.current = null
      return
    }

    const touchEndX = e.changedTouches[0].clientX
    const deltaX = touchEndX - touchStartX.current
    const deltaTime = Date.now() - touchStartTime.current
    const velocity = deltaTime > 0 ? Math.abs(deltaX) / deltaTime : 0

    // Determine if swipe should change page
    const isDistanceSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD
    const isVelocitySwipe = Math.abs(deltaX) > 30 && velocity > SWIPE_VELOCITY_THRESHOLD

    if (isDistanceSwipe || isVelocitySwipe) {
      if (deltaX > 0 && currentPage > 0) {
        // Swipe right - go to previous page
        setCurrentPage(prev => prev - 1)
      } else if (deltaX < 0 && currentPage < totalPages - 1) {
        // Swipe left - go to next page
        setCurrentPage(prev => prev + 1)
      }
    }

    // Reset state
    setSwipeOffset(0)
    touchStartX.current = null
    touchStartY.current = null
    touchStartTime.current = null
    isHorizontalSwipe.current = null
  }, [currentPage, totalPages])

  const handleTouchCancel = useCallback(() => {
    setSwipeOffset(0)
    touchStartX.current = null
    touchStartY.current = null
    touchStartTime.current = null
    isHorizontalSwipe.current = null
  }, [])

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${settings.wallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      onClick={handleBackgroundTap}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      data-testid="home-screen"
    >
      {/* StatusBar at top */}
      <StatusBar transparent />

      {/* Pages container with swipe animation */}
      <div
        className="flex-1 overflow-hidden relative"
        style={{ touchAction: 'pan-y' }}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(calc(-${currentPage * 100}% + ${swipeOffset}px))`,
            transition: swipeOffset === 0 ? 'transform 0.3s ease-out' : 'none',
            width: `${totalPages * 100}%`
          }}
        >
          {Array.from({ length: totalPages }, (_, pageIndex) => (
            <div
              key={pageIndex}
              className="h-full overflow-y-auto pb-32"
              style={{
                width: `${100 / totalPages}%`,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <AppGrid
                apps={getAppsForPage(pageIndex)}
                onAppTap={onAppTap}
                onAppLongPress={handleAppLongPress}
                wigglingAppId={wigglingAppId}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Page indicator dots */}
      {totalPages > 1 && (
        <div
          className="absolute flex justify-center gap-2 w-full"
          style={{ bottom: 130 }}
          data-testid="page-indicator"
        >
          {Array.from({ length: totalPages }, (_, index) => (
            <div
              key={index}
              className="rounded-full transition-all duration-200"
              style={{
                width: index === currentPage ? 8 : 6,
                height: index === currentPage ? 8 : 6,
                backgroundColor: index === currentPage ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)'
              }}
              data-testid={`page-dot-${index}`}
            />
          ))}
        </div>
      )}

      {/* Dock at bottom (above HomeIndicator) */}
      <Dock apps={dockApps} onAppTap={onAppTap} />

      {/* HomeIndicator at very bottom */}
      <HomeIndicator onSwipeUp={handleSwipeUp} visible />
    </div>
  )
}
