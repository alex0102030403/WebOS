import { useState } from 'react'
import { BiosSequence } from './components/bios/BiosSequence'
import { Desktop } from './components/desktop/Desktop'
import { SettingsProvider } from './context/SettingsContext'
import type { RecentApp } from './types'

function App() {
  const [isBooted, setIsBooted] = useState(false)
  const [recentApps, setRecentApps] = useState<RecentApp[]>([])

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

  return (
    <SettingsProvider>
      <div className="w-screen h-screen">
        <Desktop 
          onRestart={handleRestart}
          onShutdown={handleShutdown}
          recentApps={recentApps}
          onAddRecentApp={addRecentApp}
        />
      </div>
    </SettingsProvider>
  )
}

export default App
