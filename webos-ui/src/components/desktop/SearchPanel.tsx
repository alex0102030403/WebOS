import { useState } from 'react'
import type { RecentApp } from '../../types'

interface SearchPanelProps {
  isOpen: boolean
  onClose: () => void
  recentApps: RecentApp[]
  onAppClick: (appId: string) => void
  onAddRecentApp: (app: Omit<RecentApp, 'timestamp'>) => void
}

const TOP_APPS = [
  { id: 'game-bar', name: 'Game Bar', icon: '🎮' },
  { id: 'league', name: 'League of Legends', icon: '🎯' },
  { id: 'snipping-tool', name: 'Snipping Tool', icon: '✂️' },
  { id: 'file-explorer', name: 'File Explorer', icon: '📁' },
  { id: 'chrome', name: 'Google Chrome', icon: '🌐' },
  { id: 'terminal', name: 'Terminal', icon: '💻' },
]

const QUICK_SEARCHES = [
  'Focus settings',
  'Sound settings',
  'Bluetooth & devices',
  'Display settings',
  'Color settings',
  'Search settings',
]

export function SearchPanel({ isOpen, onClose, recentApps, onAppClick, onAddRecentApp }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value)
  }

  function handleAppClick(appId: string) {
    onAppClick(appId)
    onClose()
  }

  function handleTopAppClick(app: typeof TOP_APPS[number]) {
    onAddRecentApp({ id: app.id, name: app.name, icon: app.icon })
    onAppClick(app.id)
    onClose()
  }

  function handleQuickSearchClick(search: string) {
    // Placeholder action for quick search
    console.log('Quick search clicked:', search)
  }

  // Filter apps based on search query (case-insensitive)
  const filteredRecentApps = recentApps
    .filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5)

  const filteredTopApps = TOP_APPS.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div 
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
    >
      {/* Search Panel positioned centered above taskbar */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[640px] bg-[#2d2d2d]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 bg-[#3d3d3d]/60 rounded-lg px-4 py-2.5">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search for apps, settings, and documents"
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1 bg-transparent text-white text-sm placeholder-white/50 outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex p-4 gap-6 max-h-[400px]">
          {/* Left column - Recent Apps */}
          <div className="w-1/2">
            <RecentAppsSection 
              apps={filteredRecentApps} 
              onAppClick={handleAppClick}
              isEmpty={recentApps.length === 0}
            />
          </div>

          {/* Right column - Quick searches + Top apps */}
          <div className="w-1/2 flex flex-col gap-4">
            <QuickSearchSection 
              searches={QUICK_SEARCHES} 
              onSearchClick={handleQuickSearchClick} 
            />
            <TopAppsSection 
              apps={filteredTopApps} 
              onAppClick={handleTopAppClick} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface RecentAppsSectionProps {
  apps: RecentApp[]
  onAppClick: (appId: string) => void
  isEmpty: boolean
}

function RecentAppsSection({ apps, onAppClick, isEmpty }: RecentAppsSectionProps) {
  return (
    <div>
      <h3 className="text-white/60 text-xs font-medium mb-3">Recent</h3>
      {isEmpty ? (
        <p className="text-white/40 text-sm">No recent apps</p>
      ) : apps.length === 0 ? (
        <p className="text-white/40 text-sm">No apps found</p>
      ) : (
        <div className="space-y-1">
          {apps.map(app => (
            <button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">{app.icon}</span>
              <span className="text-white/90 text-sm">{app.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface QuickSearchSectionProps {
  searches: string[]
  onSearchClick: (search: string) => void
}

function QuickSearchSection({ searches, onSearchClick }: QuickSearchSectionProps) {
  return (
    <div>
      <h3 className="text-white/60 text-xs font-medium mb-3">Quick searches</h3>
      <div className="flex flex-wrap gap-2">
        {searches.map(search => (
          <button
            key={search}
            onClick={() => onSearchClick(search)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#3d3d3d]/60 hover:bg-[#4d4d4d]/60 rounded-full text-white/80 text-xs transition-colors"
          >
            <SettingsIcon />
            <span>{search}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

interface TopAppsSectionProps {
  apps: typeof TOP_APPS
  onAppClick: (app: typeof TOP_APPS[number]) => void
}

function TopAppsSection({ apps, onAppClick }: TopAppsSectionProps) {
  return (
    <div>
      <h3 className="text-white/60 text-xs font-medium mb-3">Top apps</h3>
      <div className="grid grid-cols-3 gap-2">
        {apps.slice(0, 6).map(app => (
          <button
            key={app.id}
            onClick={() => onAppClick(app)}
            className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="text-2xl">{app.icon}</span>
            <span className="text-white/80 text-xs text-center truncate w-full">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
