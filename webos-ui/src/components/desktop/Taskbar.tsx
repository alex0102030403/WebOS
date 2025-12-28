import { useState, useRef, useEffect } from 'react'
import { PowerMenu } from './PowerMenu'
import { SearchPanel } from './SearchPanel'
import type { OpenApp, RecentApp } from '../../types'

interface TaskbarProps {
  onStartClick?: () => void
  isStartMenuOpen?: boolean
  openApps: OpenApp[]
  onReorderApps: (apps: OpenApp[]) => void
  onAppClick: (appId: string) => void
  onOpenApp: (appId: string) => void
  onRestart: () => void
  onShutdown: () => void
  recentApps: RecentApp[]
  onAddRecentApp: (app: Omit<RecentApp, 'timestamp'>) => void
}

export function Taskbar({ openApps, onReorderApps, onAppClick, onOpenApp, onRestart, onShutdown, recentApps, onAddRecentApp }: TaskbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false)
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false)
  const dragNodeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
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
            <span className="text-xl">{app.icon}</span>
          </TaskbarButton>
        ))}
      </div>

      {/* System Tray - Right side */}
      <div className="absolute right-2 flex items-center gap-1 text-white text-xs">
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-white/10 cursor-default transition-colors">
          <span className="text-sm">^</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 cursor-default transition-colors">
          <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
          </svg>
          <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 18h-2v-2h2v2zm0-4h-2V9h2v5z"/>
          </svg>
        </div>
        <div className="flex flex-col items-end px-3 py-1 rounded-md hover:bg-white/10 cursor-default transition-colors">
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
