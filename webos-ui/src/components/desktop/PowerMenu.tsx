interface PowerMenuProps {
  isOpen: boolean
  onClose: () => void
  onRestart: () => void
  onShutdown: () => void
}

export function PowerMenu({ isOpen, onClose, onRestart, onShutdown }: PowerMenuProps) {
  if (!isOpen) return null

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleRestart() {
    onRestart()
    onClose()
  }

  function handleShutdown() {
    onShutdown()
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
    >
      {/* Power Menu positioned above Windows icon */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#2d2d2d]/95 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl overflow-hidden min-w-[200px]">
        <div className="p-1">
          <PowerMenuItem
            icon={<RestartIcon />}
            label="Restart"
            onClick={handleRestart}
          />
          <PowerMenuItem
            icon={<ShutdownIcon />}
            label="Shut down"
            onClick={handleShutdown}
          />
        </div>
      </div>
    </div>
  )
}

interface PowerMenuItemProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

function PowerMenuItem({ icon, label, onClick }: PowerMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-white/90 hover:bg-white/10 transition-colors text-sm"
    >
      <span className="w-5 h-5 flex items-center justify-center text-white/70">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  )
}

function RestartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
      />
    </svg>
  )
}

function ShutdownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9" 
      />
    </svg>
  )
}
