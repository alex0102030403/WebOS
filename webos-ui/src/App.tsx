import { useState } from 'react'
import { BiosSequence } from './components/bios/BiosSequence'
import { ResponsiveDesktop } from './components/scene'

function App() {
  const [isBooted, setIsBooted] = useState(false)

  if (!isBooted) {
    return <BiosSequence onComplete={() => setIsBooted(true)} />
  }

  return <ResponsiveDesktop />
}

export default App
