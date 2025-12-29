import { useState } from 'react'
import { BiosSequence } from './components/bios/BiosSequence'
import { Desktop } from './components/desktop/Desktop'
import { MobilePhone } from './components/mobile/MobilePhone'
import { SettingsProvider } from './context/SettingsContext'
import { useDeviceType } from './hooks/useDeviceType'
import type { RecentApp } from './types'

function App() {
  const [isBooted, setIsBooted] = useState(false)
  const [recentApps, setRecentApps] = useState<RecentApp[]>([])
  const deviceType = useDeviceType()

  function handleRestart() {
    setRecentApps([])
    setIsBooted(false)
  }

  function handleShutdown() {
    window.close()
  }

  function addRecentApp(app: Omit<RecentApp, 'timestamp'>) {
    setRecentApps(prev => {
      const filtered = prev.filter(a => a.id !== app.id)
      const newApp: RecentApp = { ...app, timestamp: Date.now() }
      const updated = [newApp, ...filtered]
      return updated.slice(0, 5)
    })
  }

  if (!isBooted) {
    return <BiosSequence onComplete={() => setIsBooted(true)} />
  }

  const sharedProps = {
    onRestart: handleRestart,
    onShutdown: handleShutdown,
    recentApps,
    onAddRecentApp: addRecentApp
  }

  return (
    <SettingsProvider>
      <div className="w-screen h-screen">
        {deviceType === 'mobile' ? (
          <MobilePhone {...sharedProps} />
        ) : (
          <Desktop {...sharedProps} />
        )}
      </div>
    </SettingsProvider>
  )
}

export default App
