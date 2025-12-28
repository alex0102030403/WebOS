import { useState, useEffect } from 'react'
import { DesktopIcon } from './DesktopIcon'
import { Taskbar } from './Taskbar'
import { StartMenu } from './StartMenu'
import { TaskManager } from '../task-manager/TaskManager'
import { Terminal } from '../terminal/Terminal'
import { fetchFileNodes, fetchBootConfig } from '../../api'
import type { FileNode, BootConfig } from '../../types'

const DEFAULT_WALLPAPER = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80'

export function Desktop() {
  const [icons, setIcons] = useState<FileNode[]>([])
  const [bootConfig, setBootConfig] = useState<BootConfig | null>(null)
  const [selectedIcon, setSelectedIcon] = useState<FileNode | null>(null)
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openApps, setOpenApps] = useState<Set<string>>(new Set())

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

  function handleIconClick(node: FileNode) {
    if (node.type === 'SHORTCUT' && node.content?.startsWith('http')) {
      window.open(node.content, '_blank')
    } else if (node.type === 'SHORTCUT' && node.content?.startsWith('app:')) {
      const appName = node.content.replace('app:', '')
      setOpenApps(prev => new Set(prev).add(appName))
    } else if (node.type === 'DIRECTORY') {
      console.log('Open directory:', node.id)
    } else {
      console.log('Open file:', node.name, node.content)
    }
  }

  function closeApp(appName: string) {
    setOpenApps(prev => {
      const next = new Set(prev)
      next.delete(appName)
      return next
    })
  }

  function handleDesktopClick() {
    setSelectedIcon(null)
    setIsStartMenuOpen(false)
  }

  const wallpaperUrl = bootConfig?.wallpaperUrl || DEFAULT_WALLPAPER
  const username = bootConfig?.username || 'Visitor'

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundImage: `url(${wallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
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

      {openApps.has('taskmanager') && (
        <div 
          className="absolute top-8 left-1/2 -translate-x-1/2 w-[600px] h-[400px] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <TaskManager onClose={() => closeApp('taskmanager')} />
        </div>
      )}

      {openApps.has('terminal') && (
        <div 
          className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[450px] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Terminal onClose={() => closeApp('terminal')} />
        </div>
      )}

      <Taskbar 
        onStartClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
        isStartMenuOpen={isStartMenuOpen}
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
  { id: 'resume', parentId: 'desktop', name: 'Resume.pdf', type: 'FILE', content: 'My Resume' },
  { id: 'github', parentId: 'desktop', name: 'GitHub', type: 'SHORTCUT', content: 'https://github.com' },
  { id: 'about', parentId: 'desktop', name: 'About Me.txt', type: 'FILE', content: 'About me content' },
  { id: 'projects', parentId: 'desktop', name: 'Projects', type: 'DIRECTORY', content: null },
  { id: 'terminal', parentId: 'desktop', name: 'Terminal', type: 'SHORTCUT', content: 'app:terminal' },
  { id: 'task-manager', parentId: 'desktop', name: 'Task Manager', type: 'SHORTCUT', content: 'app:taskmanager' },
]
