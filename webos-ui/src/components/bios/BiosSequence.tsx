import { useState, useEffect, useCallback } from 'react'

interface BiosSequenceProps {
  onComplete: () => void
}

interface BiosLine {
  text: string
  delay: number
  isStatus?: boolean
}

const BIOS_LINES: BiosLine[] = [
  { text: 'WebOS BIOS v1.0.0', delay: 0 },
  { text: 'Copyright (C) 2025 WebOS Corporation', delay: 100 },
  { text: '', delay: 200 },
  { text: 'Initializing system...', delay: 300 },
  { text: '', delay: 400 },
  { text: 'CPU: Intel Core i9-13900K @ 5.8GHz', delay: 500 },
  { text: 'Detecting CPU...', delay: 600, isStatus: true },
  { text: '', delay: 900 },
  { text: 'Memory Test: 32768 MB OK', delay: 1000 },
  { text: 'Testing RAM...', delay: 1100, isStatus: true },
  { text: '', delay: 1600 },
  { text: 'Primary Master: Samsung 990 PRO 2TB NVMe', delay: 1700 },
  { text: 'Detecting storage...', delay: 1800, isStatus: true },
  { text: '', delay: 2200 },
  { text: 'GPU: NVIDIA GeForce RTX 4090', delay: 2300 },
  { text: 'Initializing graphics...', delay: 2400, isStatus: true },
  { text: '', delay: 2800 },
  { text: 'Network: Intel I225-V 2.5GbE', delay: 2900 },
  { text: '', delay: 3100 },
  { text: 'All systems operational.', delay: 3200 },
  { text: '', delay: 3400 },
  { text: 'Loading WebOS...', delay: 3500 },
]

const BOOT_DURATION = 4500

export function BiosSequence({ onComplete }: BiosSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const [statusText, setStatusText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  const skipBoot = useCallback(() => {
    onComplete()
  }, [onComplete])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    BIOS_LINES.forEach((line) => {
      const timer = setTimeout(() => {
        if (line.isStatus) {
          setStatusText(line.text)
          setTimeout(() => setStatusText(''), 400)
        } else {
          setVisibleLines((prev) => [...prev, line.text])
        }
      }, line.delay)
      timers.push(timer)
    })

    const completeTimer = setTimeout(onComplete, BOOT_DURATION)
    timers.push(completeTimer)

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        skipBoot()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [skipBoot])

  return (
    <div 
      className="w-full h-full bg-black text-green-400 font-mono text-sm p-6 overflow-hidden cursor-pointer"
      onClick={skipBoot}
    >
      <div className="max-w-3xl">
        {visibleLines.map((line, index) => (
          <div key={index} className="leading-6">
            {line || '\u00A0'}
          </div>
        ))}
        
        {statusText && (
          <div className="text-yellow-400 animate-pulse">
            {statusText}
          </div>
        )}
        
        <span className={`inline-block w-2 h-4 bg-green-400 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
      </div>
      
      <div className="absolute bottom-6 right-6 text-gray-500 text-xs">
        Press any key to skip...
      </div>
    </div>
  )
}
