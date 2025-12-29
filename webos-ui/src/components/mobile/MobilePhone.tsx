import { useState, useCallback } from 'react'
import { HomeScreen } from './HomeScreen'
import { MobileAppContainer } from './MobileAppContainer'
import { MOBILE_APP_CONFIG } from './config'
import { MobileTerminal } from './MobileTerminal'
import { MobileSettings } from './MobileSettings'
import { MobileFileExplorer } from './MobileFileExplorer'
import { ChromeBrowser } from '../chrome/ChromeBrowser'
import { Notepad } from '../notepad/Notepad'
import { Paint } from '../paint/Paint'
import { JShellStudio } from '../jshell-studio/JShellStudio'
import { Minesweeper } from '../minesweeper/Minesweeper'
import { CVViewer } from '../cv-viewer/CVViewer'
import { TaskManager } from '../task-manager/TaskManager'
import type { RecentApp, OpenApp } from '../../types'

interface MobilePhoneProps {
  onRestart: () => void
  onShutdown: () => void
  recentApps: RecentApp[]
  onAddRecentApp: (app: Omit<RecentApp, 'timestamp'>) => void
}

export function MobilePhone({ 
  onRestart, 
  onShutdown, 
  recentApps, 
  onAddRecentApp 
}: MobilePhoneProps) {
  const [currentApp, setCurrentApp] = useState<string | null>(null)
  // Control center state - reserved for future implementation (Task 7.2)
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false)
  
  // These props are available for future features (restart/shutdown from mobile, recent apps display)
  void onRestart
  void onShutdown
  void recentApps
  void isControlCenterOpen

  // Handle opening an app
  const handleAppOpen = useCallback((appId: string) => {
    const appConfig = MOBILE_APP_CONFIG[appId]
    if (!appConfig) return

    // Add to recent apps
    onAddRecentApp({ id: appId, name: appConfig.name, icon: appConfig.icon })
    
    // Set current app to show in full screen
    setCurrentApp(appId)
  }, [onAddRecentApp])

  // Handle closing an app (back to home screen)
  const handleAppClose = useCallback(() => {
    setCurrentApp(null)
  }, [])

  // Handle swipe up from home screen (could open control center or other actions)
  const handleHomeSwipeUp = useCallback(() => {
    // For now, this could toggle control center in future
    setIsControlCenterOpen(prev => !prev)
  }, [])

  // Get app name for the nav bar
  function getAppName(appId: string): string {
    return MOBILE_APP_CONFIG[appId]?.name || appId
  }

  // Render the appropriate app content
  function renderAppContent(appId: string) {
    // Create a dummy close handler that does nothing (nav bar handles close)
    const noopClose = () => {}
    
    // Create open apps array for TaskManager
    const openApps: OpenApp[] = currentApp 
      ? [{ id: currentApp, name: getAppName(currentApp), icon: MOBILE_APP_CONFIG[currentApp]?.icon || '📱' }]
      : []

    switch (appId) {
      case 'terminal':
        return <MobileTerminal onClose={noopClose} />
      case 'settings':
        return <MobileSettings onClose={noopClose} />
      case 'fileexplorer':
        return <MobileFileExplorer onClose={noopClose} onOpenApp={handleAppOpen} />
      case 'chrome':
        return <ChromeBrowser onClose={noopClose} />
      case 'notepad':
        return <Notepad onClose={noopClose} />
      case 'paint':
        return <Paint onClose={noopClose} />
      case 'jshellstudio':
        return <JShellStudio onClose={noopClose} />
      case 'minesweeper':
        return <Minesweeper onClose={noopClose} />
      case 'cvviewer':
        return <CVViewer onClose={noopClose} />
      case 'taskmanager':
        return (
          <TaskManager 
            onClose={noopClose} 
            openApps={openApps}
            onCloseApp={handleAppClose}
          />
        )
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-900 text-white">
            <p>App not available</p>
          </div>
        )
    }
  }

  // Render home screen when no app is open
  if (currentApp === null) {
    return (
      <div 
        className="w-full h-full"
        data-testid="mobile-phone"
      >
        <HomeScreen 
          onAppTap={handleAppOpen} 
          onSwipeUp={handleHomeSwipeUp}
        />
      </div>
    )
  }

  // Render full-screen app container when an app is open
  return (
    <div 
      className="w-full h-full"
      data-testid="mobile-phone"
      data-current-app={currentApp}
    >
      <MobileAppContainer
        appId={currentApp}
        appName={getAppName(currentApp)}
        onClose={handleAppClose}
      >
        {renderAppContent(currentApp)}
      </MobileAppContainer>
    </div>
  )
}
