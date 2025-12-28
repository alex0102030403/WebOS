import { useState } from 'react'
import { BiosSequence } from './components/bios/BiosSequence'
import { Desktop } from './components/desktop/Desktop'

function App() {
  const [isBooted, setIsBooted] = useState(false)

  if (!isBooted) {
    return <BiosSequence onComplete={() => setIsBooted(true)} />
  }

  return (
    <div className="w-screen h-screen">
      <Desktop />
    </div>
  )
}

export default App
