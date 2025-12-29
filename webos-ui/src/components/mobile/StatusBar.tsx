import { useState, useEffect } from 'react'

interface StatusBarProps {
  transparent?: boolean
}

// Format time as HH:MM
export function formatTime(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return `${hours}:${minutes.toString().padStart(2, '0')}`
}

function SignalBars() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
      <rect x="0" y="8" width="3" height="4" rx="0.5" />
      <rect x="4" y="5" width="3" height="7" rx="0.5" />
      <rect x="8" y="2" width="3" height="10" rx="0.5" />
      <rect x="12" y="0" width="3" height="12" rx="0.5" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
      <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
      <path d="M4.5 7.5c1.9-1.9 5.1-1.9 7 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M2 5c3.3-3.3 8.7-3.3 12 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

interface BatteryIconProps {
  percentage: number
}

function BatteryIcon({ percentage }: BatteryIconProps) {
  const fillWidth = Math.max(0, Math.min(100, percentage)) * 0.2
  
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
      <rect x="0" y="0" width="22" height="12" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="2" y="2" width={fillWidth} height="8" rx="1" />
      <rect x="22" y="3" width="3" height="6" rx="1" />
    </svg>
  )
}

export function StatusBar({ transparent = true }: StatusBarProps) {
  const [time, setTime] = useState(new Date())
  const [batteryPercentage, setBatteryPercentage] = useState(100)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Try to get actual battery status if available
    if ('getBattery' in navigator) {
      (navigator as Navigator & { getBattery: () => Promise<{ level: number; addEventListener: (event: string, handler: () => void) => void }> })
        .getBattery()
        .then(battery => {
          setBatteryPercentage(Math.round(battery.level * 100))
          battery.addEventListener('levelchange', () => {
            setBatteryPercentage(Math.round(battery.level * 100))
          })
        })
        .catch(() => {
          // Battery API not available, use default
        })
    }
  }, [])

  return (
    <div
      className="flex items-center justify-between px-6 py-2 text-white"
      style={{
        height: '44px',
        backgroundColor: transparent ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      {/* Left side - Signal and WiFi */}
      <div className="flex items-center gap-2">
        <SignalBars />
        <WifiIcon />
      </div>

      {/* Center - Time */}
      <div className="absolute left-1/2 transform -translate-x-1/2 font-semibold text-sm">
        {formatTime(time)}
      </div>

      {/* Right side - Battery */}
      <div className="flex items-center gap-1">
        <span className="text-xs">{batteryPercentage}%</span>
        <BatteryIcon percentage={batteryPercentage} />
      </div>
    </div>
  )
}
