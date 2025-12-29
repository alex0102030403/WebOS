import { useState, useEffect, useCallback, useRef } from 'react'
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
import { Paint } from '../paint/Paint'
import { JShellStudio } from '../jshell-studio/JShellStudio'
import { Minesweeper } from '../minesweeper/Minesweeper'
import { ImageViewer } from '../image-viewer/ImageViewer'
import { useSettings } from '../../context/SettingsContext'
import { fetchFileNodes, fetchBootConfig } from '../../api'
import type { FileNode, BootConfig, OpenApp, RecentApp } from '../../types'

const DEFAULT_WALLPAPER = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80'
const GRID_SIZE = 90
const ICON_POSITIONS_KEY = 'desktop-icon-positions'
const ICON_SIZE = 80

interface IconPosition {
  x: number
  y: number
}

interface SelectionBox {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

function loadIconPositions(): Record<string, IconPosition> {
  try {
    const saved = localStorage.getItem(ICON_POSITIONS_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function saveIconPositions(positions: Record<string, IconPosition>) {
  localStorage.setItem(ICON_POSITIONS_KEY, JSON.stringify(positions))
}

function getDefaultPosition(index: number, containerHeight: number): IconPosition {
  const iconsPerColumn = Math.floor((containerHeight - 60) / GRID_SIZE) || 8
  const col = Math.floor(index / iconsPerColumn)
  const row = index % iconsPerColumn
  return { x: col * GRID_SIZE, y: row * GRID_SIZE }
}

function getSelectionRect(box: SelectionBox) {
  return {
    left: Math.min(box.startX, box.currentX),
    top: Math.min(box.startY, box.currentY),
    width: Math.abs(box.currentX - box.startX),
    height: Math.abs(box.currentY - box.startY),
  }
}

function isIconInSelection(iconPos: IconPosition, selectionRect: { left: number; top: number; width: number; height: number }): boolean {
  const iconRight = iconPos.x + ICON_SIZE
  const iconBottom = iconPos.y + ICON_SIZE
  const selRight = selectionRect.left + selectionRect.width
  const selBottom = selectionRect.top + selectionRect.height

  return !(iconRight < selectionRect.left || 
           iconPos.x > selRight || 
           iconBottom < selectionRect.top || 
           iconPos.y > selBottom)
}

function positionKey(x: number, y: number): string {
  return `${x},${y}`
}

function findNearestEmptyCell(
  targetX: number, 
  targetY: number, 
  _occupiedPositions: Set<string>,
  excludeIds: Set<string>,
  allPositions: Record<string, IconPosition>
): IconPosition {
  // Build set of occupied cells excluding the icons being moved
  const occupied = new Set<string>()
  for (const [id, pos] of Object.entries(allPositions)) {
    if (!excludeIds.has(id)) {
      occupied.add(positionKey(pos.x, pos.y))
    }
  }

  // If target is empty, use it
  const targetKey = positionKey(targetX, targetY)
  if (!occupied.has(targetKey)) {
    return { x: targetX, y: targetY }
  }

  // Search in expanding rings for nearest empty cell
  for (let radius = 1; radius < 20; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue
        
        const checkX = targetX + dx * GRID_SIZE
        const checkY = targetY + dy * GRID_SIZE
        
        if (checkX < 0 || checkY < 0) continue
        
        const key = positionKey(checkX, checkY)
        if (!occupied.has(key)) {
          return { x: checkX, y: checkY }
        }
      }
    }
  }

  return { x: targetX, y: targetY }
}

const APP_CONFIG: Record<string, { name: string; icon: string; width: number; height: number }> = {
  terminal: { name: 'Terminal', icon: '💻', width: 700, height: 450 },
  taskmanager: { name: 'Task Manager', icon: '📊', width: 600, height: 400 },
  settings: { name: 'Settings', icon: '⚙️', width: 750, height: 750 },
  fileexplorer: { name: 'File Explorer', icon: '📂', width: 700, height: 500 },
  chrome: { name: 'Chrome', icon: '🌐', width: 900, height: 600 },
  notepad: { name: 'Notepad', icon: '📝', width: 600, height: 450 },
  cvviewer: { name: 'CV Viewer', icon: '📄', width: 650, height: 700 },
  paint: { name: 'Paint', icon: '🎨', width: 900, height: 700 },
  jshellstudio: { name: 'JShell Studio', icon: '☕', width: 800, height: 600 },
  minesweeper: { name: 'Minesweeper', icon: '💣', width: 350, height: 450 },
  imageviewer: { name: 'Image Viewer', icon: '🖼️', width: 600, height: 500 },
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
  const [iconPositions, setIconPositions] = useState<Record<string, IconPosition>>({})
  const [bootConfig, setBootConfig] = useState<BootConfig | null>(null)
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set())
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openApps, setOpenApps] = useState<OpenApp[]>([])
  const [focusedApp, setFocusedApp] = useState<string | null>(null)
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null)
  const [fileSystemRefreshTrigger, setFileSystemRefreshTrigger] = useState(0)
  const desktopRef = useRef<HTMLDivElement>(null)

  // Apply font size to root element when settings change
  useEffect(() => {
    document.documentElement.style.setProperty('--webos-font-size', `${settings.fontSize}px`)
  }, [settings.fontSize])

  // Refresh desktop icons while preserving existing positions
  const refreshDesktop = useCallback(async () => {
    try {
      const nodes = await fetchFileNodes('desktop')
      setIcons(nodes)
      
      // Preserve existing positions, add defaults for new nodes
      const savedPositions = loadIconPositions()
      const containerHeight = window.innerHeight
      setIconPositions(prev => {
        const updated = { ...prev }
        nodes.forEach((node, index) => {
          if (!updated[node.id]) {
            updated[node.id] = savedPositions[node.id] || getDefaultPosition(index, containerHeight)
          }
        })
        // Remove positions for deleted nodes
        const nodeIds = new Set(nodes.map(n => n.id))
        Object.keys(updated).forEach(id => {
          if (!nodeIds.has(id)) delete updated[id]
        })
        saveIconPositions(updated)
        return updated
      })
    } catch (err) {
      console.error('Failed to refresh desktop:', err)
    }
    // Increment trigger to refresh FileExplorer
    setFileSystemRefreshTrigger(prev => prev + 1)
  }, [])

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
        
        // Initialize positions from localStorage or defaults
        const savedPositions = loadIconPositions()
        const containerHeight = window.innerHeight
        const positions: Record<string, IconPosition> = {}
        nodes.forEach((node, index) => {
          positions[node.id] = savedPositions[node.id] || getDefaultPosition(index, containerHeight)
        })
        setIconPositions(positions)
      } catch (err) {
        console.error('Failed to load desktop:', err)
        setError('Failed to connect to backend. Using demo mode.')
        setIcons(DEMO_ICONS)
        setBootConfig(DEMO_CONFIG)
        
        const savedPositions = loadIconPositions()
        const containerHeight = window.innerHeight
        const positions: Record<string, IconPosition> = {}
        DEMO_ICONS.forEach((node, index) => {
          positions[node.id] = savedPositions[node.id] || getDefaultPosition(index, containerHeight)
        })
        setIconPositions(positions)
      } finally {
        setIsLoading(false)
      }
    }
    loadDesktop()
  }, [])

  const handleIconPositionChange = useCallback((nodeId: string, position: IconPosition) => {
    setIconPositions(prev => {
      const updated = { ...prev, [nodeId]: position }
      saveIconPositions(updated)
      return updated
    })
  }, [])

  const handleIconSelect = useCallback((node: FileNode, addToSelection: boolean) => {
    if (addToSelection) {
      setSelectedIcons(prev => {
        const newSet = new Set(prev)
        if (newSet.has(node.id)) {
          newSet.delete(node.id)
        } else {
          newSet.add(node.id)
        }
        return newSet
      })
    } else {
      setSelectedIcons(new Set([node.id]))
    }
  }, [])

  // Store initial positions when multi-drag starts
  const dragStartPositions = useRef<Record<string, IconPosition>>({})

  const handleMultiDrag = useCallback((deltaX: number, deltaY: number) => {
    // On first drag, capture starting positions
    if (Object.keys(dragStartPositions.current).length === 0) {
      selectedIcons.forEach(id => {
        dragStartPositions.current[id] = iconPositions[id] || { x: 0, y: 0 }
      })
    }

    setIconPositions(prev => {
      const updated = { ...prev }
      selectedIcons.forEach(id => {
        const startPos = dragStartPositions.current[id]
        if (startPos) {
          updated[id] = {
            x: Math.max(0, startPos.x + deltaX),
            y: Math.max(0, startPos.y + deltaY)
          }
        }
      })
      saveIconPositions(updated)
      return updated
    })
  }, [selectedIcons, iconPositions])

  // Finalize positions with collision detection
  const handleDragEnd = useCallback(() => {
    setIconPositions(prev => {
      const updated = { ...prev }
      const movingIds = selectedIcons.size > 0 ? selectedIcons : new Set<string>()
      
      // Process each moving icon
      movingIds.forEach(id => {
        const currentPos = updated[id]
        if (currentPos) {
          const finalPos = findNearestEmptyCell(
            currentPos.x,
            currentPos.y,
            new Set(),
            movingIds,
            updated
          )
          updated[id] = finalPos
        }
      })
      
      saveIconPositions(updated)
      return updated
    })
    dragStartPositions.current = {}
  }, [selectedIcons])

  // Reset drag start positions when mouse is released
  useEffect(() => {
    function handleMouseUp() {
      dragStartPositions.current = {}
    }
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const didMarqueeSelect = useRef(false)

  function handleDesktopMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest('[data-icon]')) return
    
    const rect = desktopRef.current?.getBoundingClientRect()
    if (!rect) return

    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top

    setSelectionBox({ startX, startY, currentX: startX, currentY: startY })
    didMarqueeSelect.current = false

    const rectCopy = rect

    function handleMouseMove(moveEvent: MouseEvent) {
      const currentX = moveEvent.clientX - rectCopy.left
      const currentY = moveEvent.clientY - rectCopy.top
      setSelectionBox(prev => prev ? { ...prev, currentX, currentY } : null)

      // Update selected icons based on selection box
      const box = { startX, startY, currentX, currentY }
      const selRect = getSelectionRect(box)
      
      // Only start selecting if we've moved enough
      if (selRect.width > 5 || selRect.height > 5) {
        didMarqueeSelect.current = true
        const newSelected = new Set<string>()
        
        icons.forEach(icon => {
          const pos = iconPositions[icon.id]
          if (pos && isIconInSelection(pos, selRect)) {
            newSelected.add(icon.id)
          }
        })
        setSelectedIcons(newSelected)
      }
    }

    function handleMouseUp() {
      setSelectionBox(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  function handleDesktopClick(e: React.MouseEvent) {
    // Don't clear selection if we just did a marquee select
    if (didMarqueeSelect.current) {
      didMarqueeSelect.current = false
      return
    }
    // Don't clear if clicking on an icon
    if ((e.target as HTMLElement).closest('[data-icon]')) return
    
    setSelectedIcons(new Set())
    setIsStartMenuOpen(false)
  }

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

    // For imageviewer, allow multiple instances with different files
    if (appId === 'imageviewer' && file) {
      const instanceId = `imageviewer-${file.id}`
      if (openApps.some(app => app.id === instanceId)) {
        setFocusedApp(instanceId)
        return
      }
      setOpenApps(prev => [...prev, { 
        id: instanceId, 
        name: `${file.name} - Image Viewer`,
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
      // Open image files in ImageViewer, others in Notepad
      if (node.name.toLowerCase().endsWith('.png') || 
          node.name.toLowerCase().endsWith('.jpg') || 
          node.name.toLowerCase().endsWith('.jpeg')) {
        openApp('imageviewer', node)
      } else {
        openApp('notepad', node)
      }
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

      <div 
        ref={desktopRef}
        className="relative p-4 pb-16 h-full overflow-hidden"
        onMouseDown={handleDesktopMouseDown}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg">Loading...</div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {icons.map((node) => (
              <DesktopIcon
                key={node.id}
                node={node}
                onClick={handleIconClick}
                isSelected={selectedIcons.has(node.id)}
                onSelect={handleIconSelect}
                position={iconPositions[node.id] || { x: 0, y: 0 }}
                onPositionChange={handleIconPositionChange}
                onMultiDrag={handleMultiDrag}
                onDragEnd={handleDragEnd}
                gridSize={GRID_SIZE}
                selectedCount={selectedIcons.size}
              />
            ))}
          </div>
        )}

        {/* Selection box */}
        {selectionBox && (
          <div
            className="absolute border border-blue-400 bg-blue-400/20 pointer-events-none"
            style={{
              left: Math.min(selectionBox.startX, selectionBox.currentX),
              top: Math.min(selectionBox.startY, selectionBox.currentY),
              width: Math.abs(selectionBox.currentX - selectionBox.startX),
              height: Math.abs(selectionBox.currentY - selectionBox.startY),
            }}
          />
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
          <Terminal onClose={() => closeApp('terminal')} onFileSystemChange={refreshDesktop} />
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
          <FileExplorer onClose={() => closeApp('fileexplorer')} onOpenApp={openApp} refreshTrigger={fileSystemRefreshTrigger} />
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
              onFileSaved={refreshDesktop}
            />
          </DraggableWindow>
        ))
      }

      {/* Render all imageviewer instances */}
      {openApps
        .filter(app => app.id.startsWith('imageviewer'))
        .map((app, index) => (
          <DraggableWindow
            key={app.id}
            initialX={160 + index * 30}
            initialY={80 + index * 30}
            width={APP_CONFIG.imageviewer.width}
            height={APP_CONFIG.imageviewer.height}
            zIndex={getZIndex(app.id)}
            onFocus={() => setFocusedApp(app.id)}
          >
            <ImageViewer 
              onClose={() => closeApp(app.id)} 
              file={app.file!}
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

      {isAppOpen('paint') && (
        <DraggableWindow
          initialX={60}
          initialY={40}
          width={APP_CONFIG.paint.width}
          height={APP_CONFIG.paint.height}
          zIndex={getZIndex('paint')}
          onFocus={() => setFocusedApp('paint')}
        >
          <Paint onClose={() => closeApp('paint')} onFileSaved={refreshDesktop} />
        </DraggableWindow>
      )}

      {isAppOpen('jshellstudio') && (
        <DraggableWindow
          initialX={90}
          initialY={50}
          width={APP_CONFIG.jshellstudio.width}
          height={APP_CONFIG.jshellstudio.height}
          zIndex={getZIndex('jshellstudio')}
          onFocus={() => setFocusedApp('jshellstudio')}
        >
          <JShellStudio onClose={() => closeApp('jshellstudio')} />
        </DraggableWindow>
      )}

      {isAppOpen('minesweeper') && (
        <DraggableWindow
          initialX={200}
          initialY={80}
          width={APP_CONFIG.minesweeper.width}
          height={APP_CONFIG.minesweeper.height}
          zIndex={getZIndex('minesweeper')}
          onFocus={() => setFocusedApp('minesweeper')}
        >
          <Minesweeper onClose={() => closeApp('minesweeper')} />
        </DraggableWindow>
      )}

      <Taskbar 
        onStartClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
        isStartMenuOpen={isStartMenuOpen}
        openApps={openApps}
        onReorderApps={setOpenApps}
        onAppClick={handleAppClick}
        onOpenApp={openApp}
        onCloseApp={closeApp}
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
  { id: 'paint', parentId: 'desktop', name: 'Paint', type: 'SHORTCUT', content: 'app:paint' },
  { id: 'jshell-studio', parentId: 'desktop', name: 'JShell Studio', type: 'SHORTCUT', content: 'app:jshellstudio' },
  { id: 'minesweeper', parentId: 'desktop', name: 'Minesweeper', type: 'SHORTCUT', content: 'app:minesweeper' },
]
