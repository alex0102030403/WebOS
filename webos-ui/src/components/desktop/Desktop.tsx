import { useState, useEffect } from 'react'
import { DesktopIcon } from './DesktopIcon'
import { Taskbar } from './Taskbar'
import { StartMenu } from './StartMenu'
import { DraggableWindow } from './DraggableWindow'
import { TaskManager } from '../task-manager/TaskManager'
import { Terminal } from '../terminal/Terminal'
import { Settings } from '../settings/Settings'
import { FileExplorer } from '../file-explorer/FileExplorer'
import { ChromeBrowser } from '../chrome/ChromeBrowser'
import { Notepad } from '../notepad/Notepad'
import { CVViewer } from '../cv-viewer/CVViewer'
import { useSettings } from '../../context/SettingsContext'
import { fetchFileNodes, fetchBootConfig } from '../../api'
import type { FileNode, BootConfig, OpenApp, RecentApp } from '../../types'

const DEFAULT_WALLPAPER = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80'

const APP_CONFIG: Record<string, { name: string; icon: string; width: number; height: number }> = {
  terminal: { name: 'Terminal', icon: '💻', width: 700, height: 450 },
  taskmanager: { name: 'Task Manager', icon: '📊', width: 600, height: 400 },
  settings: { name: 'Settings', icon: '⚙️', width: 500, height: 550 },
  fileexplorer: { name: 'File Explorer', icon: '📂', width: 700, height: 500 },
  chrome: { name: 'Chrome', icon: '🌐', width: 900, height: 600 },
  notepad: { name: 'Notepad', icon: '📝', width: 600, height: 450 },
  cvviewer: { name: 'CV Viewer', icon: '📄', width: 650, height: 700 },
}

interface DesktopProps {
  onRestart: () => void
  onShutdown: () => void
  recentApps: RecentApp[]
  onAddRecentApp: (app: Omit<RecentApp, 'timestamp'>) => void
}

export function Desktop({ onRestart, onShutdown, recentApps, onAddRecentApp }: DesktopProps) {
  const { settings } = useSettings()
  const [icons, setIcons] = useState<FileNode[]>([])
  const [bootConfig, setBootConfig] = useState<BootConfig | null>(null)
  const [selectedIcon, setSelectedIcon] = useState<FileNode | null>(null)
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openApps, setOpenApps] = useState<OpenApp[]>([])
  const [focusedApp, setFocusedApp] = useState<string | null>(null)

  // Apply font size to root element when settings change
  useEffect(() => {
    document.documentElement.style.setProperty('--webos-font-size', `${settings.fontSize}px`)
  }, [settings.fontSize])

  useEffect(() => {
    async function loadDesktop() {
      try {
        setIsLoading(true)
        const [nodes, config] = await Promise.all([
          fetchFileNodes('desktop'),
          fetchBootConfig()
        ])
        setIcons(nodes)
        setBootConfig(config)
      } catch (err) {
        console.error('Failed to load desktop:', err)
        setError('Failed to connect to backend. Using demo mode.')
        setIcons(DEMO_ICONS)
        setBootConfig(DEMO_CONFIG)
      } finally {
        setIsLoading(false)
      }
    }
    loadDesktop()
  }, [])

  function openApp(appId: string, file?: FileNode) {
    const config = APP_CONFIG[appId]
    if (!config) return
    
    onAddRecentApp({ id: appId, name: config.name, icon: config.icon })
    
    // For notepad, allow multiple instances with different files
    if (appId === 'notepad' && file) {
      const instanceId = `notepad-${file.id}`
      if (openApps.some(app => app.id === instanceId)) {
        setFocusedApp(instanceId)
        return
      }
      setOpenApps(prev => [...prev, { 
        id: instanceId, 
        name: `${file.name} - Notepad`,
        icon: config.icon,
        file 
      }])
      setFocusedApp(instanceId)
      return
    }
    
    if (openApps.some(app => app.id === appId)) {
      setFocusedApp(appId)
      return
    }
    setOpenApps(prev => [...prev, { id: appId, ...config }])
    setFocusedApp(appId)
  }

  function handleIconClick(node: FileNode) {
    if (node.type === 'SHORTCUT' && node.content?.startsWith('http')) {
      window.open(node.content, '_blank')
    } else if (node.type === 'SHORTCUT' && node.content?.startsWith('/')) {
      // Open local files (like PDFs) in new tab
      window.open(node.content, '_blank')
    } else if (node.type === 'SHORTCUT' && node.content?.startsWith('app:')) {
      const appName = node.content.replace('app:', '')
      openApp(appName)
    } else if (node.type === 'DIRECTORY') {
      openApp('fileexplorer')
    } else if (node.type === 'FILE') {
      // Open text files in Notepad
      openApp('notepad', node)
    }
  }

  function closeApp(appId: string) {
    setOpenApps(prev => prev.filter(app => app.id !== appId))
  }

  function handleAppClick(appId: string) {
    setFocusedApp(appId)
  }

  function getZIndex(appId: string): number {
    return focusedApp === appId ? 20 : 10
  }

  function handleDesktopClick() {
    setSelectedIcon(null)
    setIsStartMenuOpen(false)
  }

  // Use settings wallpaper, fallback to bootConfig, then default
  const wallpaperUrl = settings.wallpaperUrl || bootConfig?.wallpaperUrl || DEFAULT_WALLPAPER
  const username = bootConfig?.username || 'Visitor'
  const isAppOpen = (appId: string) => openApps.some(app => app.id === appId)

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundImage: `url(${wallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontSize: `${settings.fontSize}px`
      }}
      onClick={handleDesktopClick}
    >
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative p-4 pb-16 h-full overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 content-start">
            {icons.map((node) => (
              <DesktopIcon
                key={node.id}
                node={node}
                onClick={handleIconClick}
                isSelected={selectedIcon?.id === node.id}
                onSelect={setSelectedIcon}
              />
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="absolute top-4 right-4 bg-yellow-500/90 text-black px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <StartMenu 
        isOpen={isStartMenuOpen} 
        onClose={() => setIsStartMenuOpen(false)}
        username={username}
      />

      {isAppOpen('taskmanager') && (
        <DraggableWindow
          initialX={50}
          initialY={30}
          width={APP_CONFIG.taskmanager.width}
          height={APP_CONFIG.taskmanager.height}
          zIndex={getZIndex('taskmanager')}
          onFocus={() => setFocusedApp('taskmanager')}
        >
          <TaskManager 
            onClose={() => closeApp('taskmanager')} 
            openApps={openApps}
            onCloseApp={closeApp}
          />
        </DraggableWindow>
      )}

      {isAppOpen('terminal') && (
        <DraggableWindow
          initialX={100}
          initialY={60}
          width={APP_CONFIG.terminal.width}
          height={APP_CONFIG.terminal.height}
          zIndex={getZIndex('terminal')}
          onFocus={() => setFocusedApp('terminal')}
        >
          <Terminal onClose={() => closeApp('terminal')} />
        </DraggableWindow>
      )}

      {isAppOpen('settings') && (
        <DraggableWindow
          initialX={150}
          initialY={90}
          width={APP_CONFIG.settings.width}
          height={APP_CONFIG.settings.height}
          zIndex={getZIndex('settings')}
          onFocus={() => setFocusedApp('settings')}
        >
          <Settings onClose={() => closeApp('settings')} />
        </DraggableWindow>
      )}

      {isAppOpen('fileexplorer') && (
        <DraggableWindow
          initialX={120}
          initialY={50}
          width={APP_CONFIG.fileexplorer.width}
          height={APP_CONFIG.fileexplorer.height}
          zIndex={getZIndex('fileexplorer')}
          onFocus={() => setFocusedApp('fileexplorer')}
        >
          <FileExplorer onClose={() => closeApp('fileexplorer')} onOpenApp={openApp} />
        </DraggableWindow>
      )}

      {isAppOpen('chrome') && (
        <DraggableWindow
          initialX={80}
          initialY={40}
          width={APP_CONFIG.chrome.width}
          height={APP_CONFIG.chrome.height}
          zIndex={getZIndex('chrome')}
          onFocus={() => setFocusedApp('chrome')}
        >
          <ChromeBrowser onClose={() => closeApp('chrome')} />
        </DraggableWindow>
      )}

      {/* Render all notepad instances */}
      {openApps
        .filter(app => app.id.startsWith('notepad'))
        .map((app, index) => (
          <DraggableWindow
            key={app.id}
            initialX={140 + index * 30}
            initialY={70 + index * 30}
            width={APP_CONFIG.notepad.width}
            height={APP_CONFIG.notepad.height}
            zIndex={getZIndex(app.id)}
            onFocus={() => setFocusedApp(app.id)}
          >
            <Notepad 
              onClose={() => closeApp(app.id)} 
              file={app.file}
            />
          </DraggableWindow>
        ))
      }

      {isAppOpen('cvviewer') && (
        <DraggableWindow
          initialX={100}
          initialY={30}
          width={APP_CONFIG.cvviewer.width}
          height={APP_CONFIG.cvviewer.height}
          zIndex={getZIndex('cvviewer')}
          onFocus={() => setFocusedApp('cvviewer')}
        >
          <CVViewer onClose={() => closeApp('cvviewer')} />
        </DraggableWindow>
      )}

      <Taskbar 
        onStartClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
        isStartMenuOpen={isStartMenuOpen}
        openApps={openApps}
        onReorderApps={setOpenApps}
        onAppClick={handleAppClick}
        onOpenApp={openApp}
        onRestart={onRestart}
        onShutdown={onShutdown}
        recentApps={recentApps}
        onAddRecentApp={onAddRecentApp}
      />
    </div>
  )
}

const DEMO_CONFIG: BootConfig = {
  osVersion: '1.0.0',
  theme: 'dark',
  wallpaperUrl: DEFAULT_WALLPAPER,
  username: 'Visitor'
}

const DEMO_ICONS: FileNode[] = [
  { id: 'cv', parentId: 'desktop', name: 'My CV', type: 'SHORTCUT', content: 'app:cvviewer' },
  { id: 'github', parentId: 'desktop', name: 'GitHub', type: 'SHORTCUT', content: 'https://github.com' },
  { id: 'about', parentId: 'desktop', name: 'About Me.txt', type: 'FILE', content: 'About me content' },
  { id: 'projects', parentId: 'desktop', name: 'Projects', type: 'DIRECTORY', content: null },
  { id: 'terminal', parentId: 'desktop', name: 'Terminal', type: 'SHORTCUT', content: 'app:terminal' },
  { id: 'task-manager', parentId: 'desktop', name: 'Task Manager', type: 'SHORTCUT', content: 'app:taskmanager' },
  { id: 'settings', parentId: 'desktop', name: 'Settings', type: 'SHORTCUT', content: 'app:settings' },
  { id: 'file-explorer', parentId: 'desktop', name: 'File Explorer', type: 'SHORTCUT', content: 'app:fileexplorer' },
  { id: 'chrome', parentId: 'desktop', name: 'Chrome', type: 'SHORTCUT', content: 'app:chrome' },
]
