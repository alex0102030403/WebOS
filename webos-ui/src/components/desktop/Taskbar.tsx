import { useState, useRef, useEffect } from 'react'
import { PowerMenu } from './PowerMenu'
import { SearchPanel } from './SearchPanel'
import { AppIcon } from './AppIcon'
import type { OpenApp, RecentApp } from '../../types'

interface TaskbarProps {
  onStartClick?: () => void
  isStartMenuOpen?: boolean
  openApps: OpenApp[]
  onReorderApps: (apps: OpenApp[]) => void
  onAppClick: (appId: string) => void
  onOpenApp: (appId: string) => void
  onCloseApp: (appId: string) => void
  onRestart: () => void
  onShutdown: () => void
  recentApps: RecentApp[]
  onAddRecentApp: (app: Omit<RecentApp, 'timestamp'>) => void
}

export function Taskbar({ openApps, onReorderApps, onAppClick, onOpenApp, onCloseApp, onRestart, onShutdown, recentApps, onAddRecentApp }: TaskbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false)
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isVolumeOpen, setIsVolumeOpen] = useState(false)
  const [isTrayOpen, setIsTrayOpen] = useState(false)
  const [volume, setVolume] = useState(80)
  const dragNodeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsPowerMenuOpen(false)
        setIsSearchPanelOpen(false)
        setIsCalendarOpen(false)
        setIsVolumeOpen(false)
        setIsTrayOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleDragStart(e: React.DragEvent<HTMLButtonElement>, index: number) {
    setDraggedIndex(index)
    dragNodeRef.current = e.currentTarget
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    setTimeout(() => {
      if (dragNodeRef.current) dragNodeRef.current.style.opacity = '0.4'
    }, 0)
  }

  function handleDragEnd() {
    if (dragNodeRef.current) dragNodeRef.current.style.opacity = '1'
    setDraggedIndex(null)
    setDragOverIndex(null)
    dragNodeRef.current = null
  }

  function handleDragOver(e: React.DragEvent<HTMLButtonElement>, index: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && index !== draggedIndex) setDragOverIndex(index)
  }

  function handleDragLeave() {
    setDragOverIndex(null)
  }

  function handleDrop(e: React.DragEvent<HTMLButtonElement>, dropIndex: number) {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return
    const reordered = [...openApps]
    const [removed] = reordered.splice(draggedIndex, 1)
    reordered.splice(dropIndex, 0, removed)
    onReorderApps(reordered)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  function handleWindowsIconClick(e: React.MouseEvent) {
    e.stopPropagation()
    setIsPowerMenuOpen(!isPowerMenuOpen)
    setIsSearchPanelOpen(false)
  }

  function handleSearchBarClick(e: React.MouseEvent) {
    e.stopPropagation()
    setIsSearchPanelOpen(!isSearchPanelOpen)
    setIsPowerMenuOpen(false)
  }

  function handleSearchAppClick(appId: string) {
    onOpenApp(appId)
    setIsSearchPanelOpen(false)
  }

  function handleCalendarClick(e: React.MouseEvent) {
    e.stopPropagation()
    setIsCalendarOpen(!isCalendarOpen)
    setIsVolumeOpen(false)
    setIsPowerMenuOpen(false)
    setIsSearchPanelOpen(false)
  }

  function handleVolumeClick(e: React.MouseEvent) {
    e.stopPropagation()
    setIsVolumeOpen(!isVolumeOpen)
    setIsCalendarOpen(false)
    setIsPowerMenuOpen(false)
    setIsSearchPanelOpen(false)
    setIsTrayOpen(false)
  }

  function handleTrayClick(e: React.MouseEvent) {
    e.stopPropagation()
    setIsTrayOpen(!isTrayOpen)
    setIsVolumeOpen(false)
    setIsCalendarOpen(false)
    setIsPowerMenuOpen(false)
    setIsSearchPanelOpen(false)
  }

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateString = currentTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#1c1c1c]/90 backdrop-blur-2xl flex items-center justify-center px-3">
      {/* Center container with taskbar items */}
      <div className="flex items-center gap-1 bg-[#2d2d2d]/60 rounded-lg px-2 py-1">
        {/* Windows Start Button */}
        <TaskbarButton
          onClick={handleWindowsIconClick}
          isActive={isPowerMenuOpen}
          title="Start"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h8.5v8.5H3V3zm9.5 0H21v8.5h-8.5V3zM3 12.5h8.5V21H3v-8.5zm9.5 0H21V21h-8.5v-8.5z"/>
          </svg>
        </TaskbarButton>

        {/* Search Bar */}
        <div 
          onClick={handleSearchBarClick}
          className={`flex items-center gap-2 bg-[#3d3d3d]/50 hover:bg-[#4d4d4d]/50 rounded-full px-3 py-1.5 mx-1 cursor-pointer transition-colors ${isSearchPanelOpen ? 'bg-[#4d4d4d]/50' : ''}`}
        >
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-white/50 text-sm">Search</span>
        </div>

        {/* Pinned/Open Apps */}
        {openApps.map((app, index) => (
          <TaskbarButton
            key={app.id}
            onClick={() => onAppClick(app.id)}
            title={app.name}
            isActive={true}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            isDragOver={dragOverIndex === index}
          >
            <AppIcon name={app.name} fallbackEmoji={app.icon} size="sm" />
          </TaskbarButton>
        ))}
      </div>

      {/* System Tray - Right side */}
      <div className="absolute right-2 flex items-center gap-1 text-white text-xs">
        <div 
          onClick={handleTrayClick}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-white/10 cursor-pointer transition-colors ${isTrayOpen ? 'bg-white/10' : ''}`}
        >
          <span className="text-sm">^</span>
        </div>
        <div 
          onClick={handleVolumeClick}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 cursor-pointer transition-colors ${isVolumeOpen ? 'bg-white/10' : ''}`}
        >
          <VolumeIcon volume={volume} />
          <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
          </svg>
          <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 18h-2v-2h2v2zm0-4h-2V9h2v5z"/>
          </svg>
        </div>
        <div 
          onClick={handleCalendarClick}
          className={`flex flex-col items-end px-3 py-1 rounded-md hover:bg-white/10 cursor-pointer transition-colors ${isCalendarOpen ? 'bg-white/10' : ''}`}
        >
          <span className="text-[11px] text-white/90">{timeString}</span>
          <span className="text-[11px] text-white/70">{dateString}</span>
        </div>
      </div>

      {/* Power Menu */}
      <PowerMenu
        isOpen={isPowerMenuOpen}
        onClose={() => setIsPowerMenuOpen(false)}
        onRestart={onRestart}
        onShutdown={onShutdown}
      />

      {/* Search Panel */}
      <SearchPanel
        isOpen={isSearchPanelOpen}
        onClose={() => setIsSearchPanelOpen(false)}
        recentApps={recentApps}
        onAppClick={handleSearchAppClick}
        onAddRecentApp={onAddRecentApp}
      />

      {/* Calendar Popup */}
      <CalendarPopup 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)}
        currentDate={currentTime}
      />

      {/* Volume Popup */}
      <VolumePopup
        isOpen={isVolumeOpen}
        onClose={() => setIsVolumeOpen(false)}
        volume={volume}
        onVolumeChange={setVolume}
      />

      {/* System Tray Popup */}
      <SystemTrayPopup
        isOpen={isTrayOpen}
        onClose={() => setIsTrayOpen(false)}
        openApps={openApps}
        onCloseApp={onCloseApp}
      />
    </div>
  )
}

interface TaskbarButtonProps {
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  isActive?: boolean
  title?: string
  draggable?: boolean
  onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void
  onDragEnd?: () => void
  onDragOver?: (e: React.DragEvent<HTMLButtonElement>) => void
  onDragLeave?: () => void
  onDrop?: (e: React.DragEvent<HTMLButtonElement>) => void
  isDragOver?: boolean
}

function TaskbarButton({ 
  children, 
  onClick, 
  isActive, 
  title,
  draggable,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver
}: TaskbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        relative p-2.5 rounded-md transition-all duration-150 text-white
        hover:bg-white/10
        ${isActive ? 'bg-white/10' : ''}
        ${isDragOver ? 'ring-2 ring-blue-400' : ''}
        ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
    >
      {children}
      {isActive && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-400 rounded-full" />
      )}
    </button>
  )
}

interface CalendarPopupProps {
  isOpen: boolean
  onClose: () => void
  currentDate: Date
}

function CalendarPopup({ isOpen, onClose, currentDate }: CalendarPopupProps) {
  if (!isOpen) return null

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = currentDate.getDate()
  
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="fixed inset-0 z-50" onClick={handleBackdropClick}>
      <div className="absolute bottom-14 right-2 w-72 bg-[#2d2d2d]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl p-4">
        <div className="text-white text-lg font-medium mb-4">{monthName}</div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-white/50 py-1">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {days.map((day, i) => (
            <div
              key={i}
              className={`py-1.5 rounded-full ${
                day === today 
                  ? 'bg-blue-500 text-white' 
                  : day 
                    ? 'text-white/80 hover:bg-white/10 cursor-pointer' 
                    : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface VolumePopupProps {
  isOpen: boolean
  onClose: () => void
  volume: number
  onVolumeChange: (volume: number) => void
}

function VolumePopup({ isOpen, onClose, volume, onVolumeChange }: VolumePopupProps) {
  if (!isOpen) return null

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    onVolumeChange(Number(e.target.value))
  }

  return (
    <div className="fixed inset-0 z-50" onClick={handleBackdropClick}>
      <div className="absolute bottom-14 right-24 w-72 bg-[#2d2d2d]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl p-4">
        <div className="text-white text-sm font-medium mb-4">Volume Mixer</div>
        <div className="flex items-center gap-3">
          <VolumeIcon volume={volume} />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-white/80 text-sm w-8">{volume}%</span>
        </div>
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center gap-3 text-white/60 text-xs">
            <span>🔊</span>
            <span>System Sounds</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface VolumeIconProps {
  volume: number
}

function VolumeIcon({ volume }: VolumeIconProps) {
  if (volume === 0) return (
    <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    </svg>
  )
  if (volume < 50) return (
    <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
    </svg>
  )
  return (
    <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  )
}

interface SystemTrayPopupProps {
  isOpen: boolean
  onClose: () => void
  openApps: OpenApp[]
  onCloseApp: (appId: string) => void
}

function SystemTrayPopup({ isOpen, onClose, openApps, onCloseApp }: SystemTrayPopupProps) {
  const [contextMenu, setContextMenu] = useState<{ appId: string; x: number; y: number } | null>(null)

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      setContextMenu(null)
      onClose()
    }
  }

  function handleRightClick(e: React.MouseEvent, appId: string) {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ appId, x: e.clientX, y: e.clientY })
  }

  function handleCloseApp(appId: string) {
    onCloseApp(appId)
    setContextMenu(null)
  }

  function handlePopupClick(e: React.MouseEvent) {
    e.stopPropagation()
    setContextMenu(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" onClick={handleBackdropClick}>
      <div 
        className="absolute bottom-14 right-44 w-64 bg-[#2d2d2d]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl p-3"
        onClick={handlePopupClick}
      >
        <div className="text-white/60 text-xs mb-2">Running Apps</div>
        {openApps.length === 0 ? (
          <div className="text-white/40 text-sm py-2">No apps running</div>
        ) : (
          <div className="space-y-1">
            {openApps.map(app => (
              <div
                key={app.id}
                onContextMenu={(e) => handleRightClick(e, app.id)}
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/10 cursor-context-menu transition-colors"
              >
                <AppIcon name={app.name} fallbackEmoji={app.icon} size="sm" />
                <span className="text-white/90 text-sm flex-1 truncate">{app.name}</span>
                <div className="w-2 h-2 bg-green-400 rounded-full" />
              </div>
            ))}
          </div>
        )}
      </div>

      {contextMenu && (
        <div 
          className="fixed bg-[#2d2d2d] border border-white/20 rounded-lg shadow-xl py-1 z-[60]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleCloseApp(contextMenu.appId)}
            className="w-full px-4 py-2 text-left text-sm text-white/90 hover:bg-white/10 transition-colors"
          >
            Close window
          </button>
        </div>
      )}
    </div>
  )
}
