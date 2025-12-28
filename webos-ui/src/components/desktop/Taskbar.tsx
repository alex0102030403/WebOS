import { useState } from 'react'

interface TaskbarProps {
  onStartClick: () => void
  isStartMenuOpen: boolean
}

export function Taskbar({ onStartClick, isStartMenuOpen }: TaskbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useState(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  })

  const timeString = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
  
  const dateString = currentTime.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric' 
  })

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/70 backdrop-blur-xl border-t border-white/10 flex items-center justify-center px-2">
      <div className="flex items-center gap-1">
        <button
          onClick={onStartClick}
          className={`
            p-2 rounded-md transition-all duration-150
            ${isStartMenuOpen 
              ? 'bg-white/20' 
              : 'hover:bg-white/10'
            }
          `}
          aria-label="Start menu"
        >
          <svg 
            className="w-6 h-6 text-white" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
          </svg>
        </button>
      </div>

      <div className="absolute right-2 flex items-center gap-3 text-white text-xs">
        <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 cursor-default">
          <span>🔊</span>
          <span>🌐</span>
          <span>🔋</span>
        </div>
        <div className="flex flex-col items-end px-2 py-1 rounded hover:bg-white/10 cursor-default">
          <span>{timeString}</span>
          <span className="text-white/70">{dateString}</span>
        </div>
      </div>
    </div>
  )
}
