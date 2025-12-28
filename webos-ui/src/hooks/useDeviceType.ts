import { useState, useEffect } from 'react'

type DeviceType = 'mobile' | 'desktop'

const MOBILE_BREAKPOINT = 768

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    if (typeof window === 'undefined') return 'desktop'
    return window.innerWidth < MOBILE_BREAKPOINT ? 'mobile' : 'desktop'
  })

  useEffect(() => {
    function handleResize() {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT
      setDeviceType(isMobile ? 'mobile' : 'desktop')
    }

    // Also check for touch capability
    function checkTouchDevice() {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT
      setDeviceType(hasTouch && isSmallScreen ? 'mobile' : 'desktop')
    }

    checkTouchDevice()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceType
}
